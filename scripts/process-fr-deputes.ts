#!/usr/bin/env bun
/**
 * Script to process French Assemblée Nationale député data and generate
 * a JSON file for the letter-tools app.
 *
 * Data source: https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice
 * Download: AMO40_deputes_actifs_mandats_actifs_organes_divises.json.zip
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ACTEUR_DIR = "/tmp/fr-deputes/acteur";
const ORGANE_DIR = "/tmp/fr-deputes/organe";
const OUTPUT_FILE = join(
  import.meta.dir,
  "../src/lib/data/fr/depute-data.json"
);

interface Acteur {
  acteur: {
    uid: { "#text": string };
    etatCivil: {
      ident: {
        civ: string;
        prenom: string;
        nom: string;
      };
    };
    adresses?: {
      adresse: Array<{
        type: string;
        typeLibelle: string;
        valElec?: string;
      }>;
    };
    mandats?: {
      mandat: Array<{
        typeOrgane: string;
        dateFin: string | null;
        organes: { organeRef: string };
        election?: {
          lieu: {
            numDepartement: string;
            numCirco: string;
            departement: string;
          };
        };
      }>;
    };
  };
}

interface Organe {
  organe: {
    uid: string;
    codeType: string;
    libelle: string;
    libelleAbrege: string;
  };
}

interface Depute {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  departmentCode: string;
  constituency: number;
  party: string;
  partyShort: string;
}

// Load all organes (for party lookup)
const organes = new Map<string, Organe["organe"]>();
const organeFiles = readdirSync(ORGANE_DIR);
for (const file of organeFiles) {
  const content = readFileSync(join(ORGANE_DIR, file), "utf-8");
  const data = JSON.parse(content) as Organe;
  organes.set(data.organe.uid, data.organe);
}

console.log(`Loaded ${organes.size} organes`);

// Process all acteurs
const deputes: Depute[] = [];
const acteurFiles = readdirSync(ACTEUR_DIR);

for (const file of acteurFiles) {
  const content = readFileSync(join(ACTEUR_DIR, file), "utf-8");
  const data = JSON.parse(content) as Acteur;
  const acteur = data.acteur;

  // Get email
  const addresses = acteur.adresses?.adresse || [];
  const emailAddr = addresses.find((a) => a.type === "15" || a.typeLibelle === "Mèl");
  const email = emailAddr?.valElec || "";

  if (!email) {
    console.warn(`No email for ${acteur.etatCivil.ident.prenom} ${acteur.etatCivil.ident.nom}`);
    continue;
  }

  // Get mandates
  const mandats = acteur.mandats?.mandat || [];

  // Find active ASSEMBLEE mandate (current députe mandate)
  const assembleMandat = mandats.find(
    (m) => m.typeOrgane === "ASSEMBLEE" && m.dateFin === null
  );

  if (!assembleMandat?.election) {
    console.warn(`No active mandate for ${acteur.etatCivil.ident.prenom} ${acteur.etatCivil.ident.nom}`);
    continue;
  }

  // Find active GP (groupe parlementaire) mandate
  const gpMandat = mandats.find(
    (m) => m.typeOrgane === "GP" && m.dateFin === null
  );

  let party = "";
  let partyShort = "";
  if (gpMandat) {
    const gpOrgane = organes.get(gpMandat.organes.organeRef);
    if (gpOrgane) {
      party = gpOrgane.libelle;
      partyShort = gpOrgane.libelleAbrege;
    }
  }

  const lieu = assembleMandat.election.lieu;

  deputes.push({
    id: acteur.uid["#text"],
    name: `${acteur.etatCivil.ident.prenom} ${acteur.etatCivil.ident.nom}`,
    firstName: acteur.etatCivil.ident.prenom,
    lastName: acteur.etatCivil.ident.nom,
    email,
    department: lieu.departement,
    departmentCode: lieu.numDepartement,
    constituency: Number.parseInt(lieu.numCirco, 10),
    party,
    partyShort,
  });
}

// Sort by department code, then constituency
deputes.sort((a, b) => {
  const deptCompare = a.departmentCode.localeCompare(b.departmentCode, "fr", { numeric: true });
  if (deptCompare !== 0) return deptCompare;
  return a.constituency - b.constituency;
});

console.log(`Processed ${deputes.length} députés`);

// Write output
writeFileSync(OUTPUT_FILE, JSON.stringify(deputes, null, 2));
console.log(`Written to ${OUTPUT_FILE}`);

// Print some stats
const partyStats = new Map<string, number>();
for (const d of deputes) {
  const key = d.partyShort || "Non-inscrit";
  partyStats.set(key, (partyStats.get(key) || 0) + 1);
}
console.log("\nParty breakdown:");
for (const [party, count] of [...partyStats.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${party}: ${count}`);
}
