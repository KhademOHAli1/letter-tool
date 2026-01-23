/**
 * Canadian policy demands for Iran accountability letters
 * Adapted for Canadian political/legal context and existing policy landscape
 */

export interface DemandCA {
	id: string;
	title: {
		en: string;
		fr: string;
	};
	description: {
		en: string;
		fr: string;
	};
	/** Text optimized for use in the letter body */
	briefText: {
		en: string;
		fr: string;
	};
	/** Relevant ministry or department */
	jurisdiction: string;
}

/**
 * Priority-ordered list of demands for Canadian MPs
 * Context: Canada has already listed IRGC under s. 83.05 (June 2024)
 * Focus now on: R2P, implementation, Magnitsky sanctions, ICC support, internet freedom
 */
export const DEMANDS_CA: DemandCA[] = [
	{
		id: "r2p",
		title: {
			en: "Invoke Responsibility to Protect (R2P)",
			fr: "Invoquer la Responsabilité de Protéger (R2P)",
		},
		description: {
			en: "With over 18,000 killed since September 2025 and systematic crimes against humanity, Canada must invoke the Responsibility to Protect doctrine at the UN - including preparation for measures under Article 42 of the UN Charter.",
			fr: "Avec plus de 18 000 morts depuis septembre 2025, le Canada doit invoquer la doctrine de la Responsabilité de Protéger aux Nations Unies.",
		},
		briefText: {
			en: "I urge you to advocate for invoking the Responsibility to Protect. With over 18,000 dead and ongoing crimes against humanity, all Article 41 measures are exhausted. Canada must lead at the UN Security Council in preparing further action under Article 42 of the UN Charter.",
			fr: "Je vous exhorte à plaider pour l'invocation de la Responsabilité de Protéger. Avec plus de 18 000 morts, le Canada doit agir au Conseil de sécurité de l'ONU.",
		},
		jurisdiction: "Global Affairs Canada / PM",
	},
	{
		id: "regime-delegitimization",
		title: {
			en: "Declare the Regime Illegitimate",
			fr: "Déclarer le régime illégitime",
		},
		description: {
			en: "The Iranian regime has lost all legitimacy by massacring its own people. Canada must publicly declare it illegitimate and stop treating it as a legitimate negotiating partner on the world stage.",
			fr: "Le régime iranien a perdu toute légitimité en massacrant son propre peuple. Le Canada doit le déclarer publiquement illégitime.",
		},
		briefText: {
			en: "Call on the government to publicly state what is obvious: this regime has lost all legitimacy. A government that massacres 18,000 of its own citizens cannot be treated as a legitimate partner. Canada must lead the international community in formal delegitimization.",
			fr: "Appelez le gouvernement à déclarer publiquement ce régime illégitime. Un gouvernement qui massacre son propre peuple ne peut pas être traité comme un partenaire légitime.",
		},
		jurisdiction: "Global Affairs Canada / PM",
	},
	{
		id: "irgc-enforcement",
		title: {
			en: "Full Enforcement of IRGC Terrorist Listing",
			fr: "Application intégrale de la désignation terroriste du CGRI",
		},
		description: {
			en: "Canada listed the IRGC as a terrorist entity in June 2024. Now the government must ensure full enforcement: prosecute known IRGC members in Canada, ban all front organizations, and freeze assets.",
			fr: "Le Canada a inscrit le CGRI sur la liste des entités terroristes en juin 2024. Le gouvernement doit maintenant assurer son application intégrale: poursuivre les membres connus du CGRI au Canada, interdire toutes les organisations de façade et geler les avoirs.",
		},
		briefText: {
			en: "Urge the government to fully enforce the IRGC terrorist listing: prosecute IRGC members operating in Canada, ban front organizations like the Islamic Centre of Hamburg's Canadian branches, and ensure all IRGC-linked assets are frozen. The listing means nothing without enforcement.",
			fr: "Exhortez le gouvernement à appliquer pleinement la désignation terroriste du CGRI: poursuivre les membres du CGRI opérant au Canada et geler tous les avoirs liés au CGRI.",
		},
		jurisdiction: "Public Safety / RCMP",
	},
	{
		id: "magnitsky-sanctions",
		title: {
			en: "Expand Magnitsky Sanctions Against Regime Officials",
			fr: "Élargir les sanctions Magnitsky contre les responsables du régime",
		},
		description: {
			en: "Canada's Justice for Victims of Corrupt Foreign Officials Act (Magnitsky Law) allows targeted sanctions. The government must add every identified torturer, executioner, and IRGC commander to the list.",
			fr: "La Loi sur la justice pour les victimes de dirigeants étrangers corrompus (loi Magnitsky) du Canada permet des sanctions ciblées. Le gouvernement doit ajouter chaque tortionnaire et commandant du CGRI identifié à la liste.",
		},
		briefText: {
			en: "Call on Global Affairs Canada to immediately expand Magnitsky sanctions to include IRGC commanders, Revolutionary Court judges, and prison officials responsible for torture and executions. Canada sanctioned only 134 individuals – there are thousands more documented perpetrators.",
			fr: "Demandez à Affaires mondiales Canada d'élargir immédiatement les sanctions Magnitsky pour inclure les commandants du CGRI et les juges des tribunaux révolutionnaires responsables de torture et d'exécutions.",
		},
		jurisdiction: "Global Affairs Canada",
	},
	{
		id: "expel-ambassador",
		title: {
			en: "Expel Iranian Regime Diplomats",
			fr: "Expulser les diplomates du régime iranien",
		},
		description: {
			en: "Iranian diplomats in Canada represent a regime committing crimes against humanity. Canada expelled most Iranian diplomats in 2012 but some consular presence remains. Complete the break.",
			fr: "Les diplomates iraniens au Canada représentent un régime commettant des crimes contre l'humanité. Le Canada a expulsé la plupart des diplomates iraniens en 2012, mais une présence consulaire subsiste. Complétez la rupture.",
		},
		briefText: {
			en: "Urge the government to sever all remaining diplomatic ties with the Iranian regime. No representative of a government that massacres its own people, takes Canadian hostages, and shoots down Canadian planes should be welcome in Ottawa.",
			fr: "Exhortez le gouvernement à rompre tous les liens diplomatiques restants avec le régime iranien. Aucun représentant d'un gouvernement qui massacre son propre peuple ne devrait être le bienvenu à Ottawa.",
		},
		jurisdiction: "Global Affairs Canada",
	},
	{
		id: "icc-referral",
		title: {
			en: "Support ICC Investigation Into Iran",
			fr: "Soutenir l'enquête de la CPI sur l'Iran",
		},
		description: {
			en: "Canada should join and lead the coalition requesting the International Criminal Court to investigate Iranian regime crimes. Build on Canada's ICC commitment and universal jurisdiction traditions.",
			fr: "Le Canada devrait rejoindre et diriger la coalition demandant à la Cour pénale internationale d'enquêter sur les crimes du régime iranien.",
		},
		briefText: {
			en: "Advocate for Canada to lead an international coalition supporting ICC investigation into Iranian regime crimes. Canada has strong ICC traditions – now is the time to use them for the Iranian people facing systematic murder and torture.",
			fr: "Plaider pour que le Canada dirige une coalition internationale soutenant l'enquête de la CPI sur les crimes du régime iranien.",
		},
		jurisdiction: "Global Affairs Canada / Justice",
	},
	{
		id: "ps752-justice",
		title: {
			en: "Justice for PS752 Victims",
			fr: "Justice pour les victimes du vol PS752",
		},
		description: {
			en: "The IRGC shot down Ukraine International Airlines Flight 752 on January 8, 2020, killing 176 people including 55 Canadian citizens and 30 permanent residents. Canada must pursue full accountability through the ICJ and domestic courts.",
			fr: "Le CGRI a abattu le vol 752 de Ukraine International Airlines le 8 janvier 2020, tuant 176 personnes dont 55 citoyens canadiens. Le Canada doit poursuivre une responsabilité complète.",
		},
		briefText: {
			en: "Demand continued pursuit of justice for the 176 souls murdered by the IRGC on Flight PS752. Canada must use every legal mechanism available – the ICJ case, domestic terrorism lawsuits, and Interpol notices – until the perpetrators face trial.",
			fr: "Exigez la poursuite de la justice pour les 176 âmes assassinées par le CGRI sur le vol PS752. Le Canada doit utiliser tous les mécanismes juridiques disponibles jusqu'à ce que les auteurs soient jugés.",
		},
		jurisdiction: "Transport / Justice / Global Affairs",
	},
	{
		id: "internet-freedom",
		title: {
			en: "Fund Internet Access for Iranians",
			fr: "Financer l'accès à Internet pour les Iraniens",
		},
		description: {
			en: "The regime uses internet blackouts to hide massacres. Canada should fund Starlink terminals, VPN infrastructure, and secure communication tools for Iranian civil society and protestors.",
			fr: "Le régime utilise les coupures d'Internet pour cacher les massacres. Le Canada devrait financer des terminaux Starlink et des outils de communication sécurisés pour les manifestants iraniens.",
		},
		briefText: {
			en: "Call on the government to fund internet freedom tools for the Iranian people. When the regime blacks out communications to hide its crimes, Canada can provide Starlink terminals and VPN access. Every connection is a lifeline for the resistance.",
			fr: "Appelez le gouvernement à financer des outils de liberté sur Internet pour le peuple iranien. Chaque connexion est une bouée de sauvetage pour la résistance.",
		},
		jurisdiction: "Global Affairs Canada / CRTC",
	},
	{
		id: "refugee-protection",
		title: {
			en: "Fast-Track Protection for Iranian Refugees",
			fr: "Protection accélérée pour les réfugiés iraniens",
		},
		description: {
			en: "Iranians fleeing persecution face long wait times. Canada must establish a dedicated stream for Iranian human rights defenders, journalists, and activists at immediate risk.",
			fr: "Les Iraniens fuyant la persécution font face à de longs délais d'attente. Le Canada doit établir une voie dédiée pour les défenseurs des droits humains iraniens à risque immédiat.",
		},
		briefText: {
			en: "Urge IRCC to create an expedited refugee pathway for Iranians facing persecution. Human rights defenders, journalists, and activists who showed their faces at protests are now targets. Canada must open its doors faster.",
			fr: "Exhortez IRCC à créer une voie de réfugié accélérée pour les Iraniens persécutés. Les défenseurs des droits humains qui ont manifesté sont maintenant des cibles. Le Canada doit ouvrir ses portes plus rapidement.",
		},
		jurisdiction: "IRCC",
	},
	{
		id: "asset-seizure",
		title: {
			en: "Seize Regime Assets for Victims",
			fr: "Saisir les avoirs du régime pour les victimes",
		},
		description: {
			en: "Regime officials have hidden billions in Western countries. Canada should identify and seize these assets under proceeds of crime and terrorism financing laws, then use them to support victims.",
			fr: "Les responsables du régime ont caché des milliards dans les pays occidentaux. Le Canada devrait identifier et saisir ces avoirs, puis les utiliser pour soutenir les victimes.",
		},
		briefText: {
			en: "Press for aggressive enforcement to identify and seize hidden assets of Iranian regime officials in Canada. The money stolen from the Iranian people – hidden in real estate and shell companies – should be returned to support victims and the democratic movement.",
			fr: "Faites pression pour une application agressive afin d'identifier et de saisir les avoirs cachés des responsables du régime iranien au Canada. L'argent devrait être rendu pour soutenir les victimes.",
		},
		jurisdiction: "Finance / Public Safety / FINTRAC",
	},
];

/** Get demands in a specific language */
export function getDemandsCA(locale: "en" | "fr" = "en"): Array<{
	id: string;
	title: string;
	description: string;
	briefText: string;
	jurisdiction: string;
}> {
	return DEMANDS_CA.map((d) => ({
		id: d.id,
		title: d.title[locale],
		description: d.description[locale],
		briefText: d.briefText[locale],
		jurisdiction: d.jurisdiction,
	}));
}

/** Get a specific demand by ID */
export function getDemandByIdCA(
	id: string,
	locale: "en" | "fr" = "en",
): {
	id: string;
	title: string;
	description: string;
	briefText: string;
	jurisdiction: string;
} | null {
	const demand = DEMANDS_CA.find((d) => d.id === id);
	if (!demand) return null;
	return {
		id: demand.id,
		title: demand.title[locale],
		description: demand.description[locale],
		briefText: demand.briefText[locale],
		jurisdiction: demand.jurisdiction,
	};
}
