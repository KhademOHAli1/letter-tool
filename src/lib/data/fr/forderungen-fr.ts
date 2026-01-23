/**
 * Demandes politiques françaises pour les lettres de responsabilité Iran
 * Adaptées au contexte politique/juridique français et à la politique étrangère existante
 *
 * Contexte France :
 * - Membre permanent P5 du Conseil de sécurité de l'ONU
 * - Membre fondateur de l'UE avec influence sur la politique étrangère commune
 * - Participante aux négociations nucléaires (P5+1/JCPOA)
 * - A des lois sur les crimes contre l'humanité (compétence universelle limitée)
 * - A déjà des sanctions contre certains membres du régime
 */

export interface DemandFR {
	id: string;
	title: {
		fr: string;
		en: string;
	};
	description: {
		fr: string;
		en: string;
	};
	/** Texte optimisé pour utilisation dans le corps de la lettre */
	briefText: {
		fr: string;
		en: string;
	};
	/** Ministère ou institution concernée */
	jurisdiction: string;
}

/**
 * Liste des demandes prioritaires pour les députés français
 * Contexte : France membre P5, partenaire E3 avec Allemagne/UK, sanctions UE existantes
 * Focus : R2P, régime illégitime, CGRI sur liste terroriste UE, poursuites, soutien CPI
 */
export const DEMANDS_FR: DemandFR[] = [
	{
		id: "r2p",
		title: {
			fr: "Invoquer la Responsabilité de Protéger (R2P)",
			en: "Invoke Responsibility to Protect (R2P)",
		},
		description: {
			fr: "Avec plus de 18 000 morts depuis septembre 2025 et des crimes contre l'humanité systématiques, la France doit invoquer la doctrine de la Responsabilité de Protéger à l'ONU - y compris la préparation de mesures au titre de l'article 42 de la Charte.",
			en: "With over 18,000 killed since September 2025 and systematic crimes against humanity, France must invoke the Responsibility to Protect doctrine at the UN - including preparation for measures under Article 42 of the UN Charter.",
		},
		briefText: {
			fr: "Je vous demande de plaider pour l'invocation de la Responsabilité de Protéger. Avec plus de 18 000 morts et des crimes contre l'humanité en cours, toutes les mesures de l'article 41 sont épuisées. La France, membre permanent du Conseil de sécurité, doit préparer des actions supplémentaires au titre de l'article 42 de la Charte des Nations Unies.",
			en: "I urge you to advocate for invoking the Responsibility to Protect. With over 18,000 dead and ongoing crimes against humanity, all Article 41 measures are exhausted. France, as a permanent Security Council member, must prepare further action under Article 42 of the UN Charter.",
		},
		jurisdiction: "Quai d'Orsay / Élysée",
	},
	{
		id: "regime-delegitimization",
		title: {
			fr: "Déclarer le régime illégitime",
			en: "Declare the Regime Illegitimate",
		},
		description: {
			fr: "Le régime iranien a perdu toute légitimité en massacrant son propre peuple. La France doit le déclarer publiquement illégitime et cesser de le traiter comme un partenaire de négociation légitime.",
			en: "The Iranian regime has lost all legitimacy by massacring its own people. France must publicly declare it illegitimate and cease treating it as a legitimate negotiating partner.",
		},
		briefText: {
			fr: "Je vous demande d'appeler le gouvernement à affirmer ce qui est évident : ce régime a perdu toute légitimité. Un gouvernement qui massacre 18 000 de ses propres citoyens ne peut être traité comme un partenaire légitime. La France doit mener la communauté internationale vers une délégitimation formelle.",
			en: "Call on the government to publicly state what is obvious: this regime has lost all legitimacy. A government that massacres 18,000 of its own citizens cannot be treated as a legitimate partner. France must lead the international community in formal delegitimization.",
		},
		jurisdiction: "Quai d'Orsay / Élysée",
	},
	{
		id: "cgri-liste-terroriste",
		title: {
			fr: "Inscrire le CGRI sur la liste terroriste de l'UE",
			en: "Put the IRGC on the EU Terror List",
		},
		description: {
			fr: "Le Corps des Gardiens de la Révolution Islamique est une organisation terroriste. La France doit pousser pour son inscription intégrale sur la liste des organisations terroristes de l'UE.",
			en: "The Islamic Revolutionary Guard Corps is a terrorist organization. France must push for its full listing on the EU terrorist organizations list.",
		},
		briefText: {
			fr: "Je vous demande de défendre l'inscription du CGRI comme organisation terroriste au niveau européen. Le Parlement européen l'exige depuis 2023. Le Canada a inscrit le CGRI en juin 2024. Quand la France agira-t-elle pour que l'UE suive ?",
			en: "Advocate for listing the IRGC as a terrorist organization at EU level. The European Parliament has demanded this since 2023. Canada listed the IRGC in June 2024. When will France act to ensure the EU follows suit?",
		},
		jurisdiction: "Quai d'Orsay / Affaires européennes",
	},
	{
		id: "sanctions-gel-avoirs",
		title: {
			fr: "Élargir les sanctions et geler les avoirs",
			en: "Expand Sanctions and Freeze Assets",
		},
		description: {
			fr: "La France doit élargir les sanctions européennes à tous les responsables identifiés - commandants du CGRI, juges des tribunaux révolutionnaires, et responsables de prison impliqués dans la torture.",
			en: "France must expand EU sanctions to all identified perpetrators - IRGC commanders, Revolutionary Court judges, and prison officials involved in torture.",
		},
		briefText: {
			fr: "Je vous demande de plaider pour l'élargissement immédiat des sanctions européennes à tous les commandants du CGRI, juges des tribunaux révolutionnaires et responsables de prison responsables de torture et d'exécutions. Il y a des milliers de bourreaux documentés ; la France doit pousser l'UE à tous les sanctionner.",
			en: "Call for the immediate expansion of EU sanctions to include all IRGC commanders, Revolutionary Court judges, and prison officials responsible for torture and executions. There are thousands of documented perpetrators; France must push the EU to sanction all of them.",
		},
		jurisdiction: "Quai d'Orsay / Bercy",
	},
	{
		id: "expulsion-diplomates",
		title: {
			fr: "Expulser les diplomates et agents du régime",
			en: "Expel Regime Diplomats and Agents",
		},
		description: {
			fr: "Les diplomates et agents du régime iranien opèrent librement en France, surveillant les communautés de la diaspora et orchestrant des menaces. Ils doivent être expulsés.",
			en: "Iranian regime diplomats and intelligence agents operate freely in France, surveilling diaspora communities and orchestrating threats. They must be expelled.",
		},
		briefText: {
			fr: "Je vous demande d'appeler à l'expulsion immédiate des diplomates iraniens engagés dans des opérations de renseignement contre les citoyens français et la diaspora. L'ambassade du régime à Paris est liée à la surveillance et à l'intimidation des Iraniens en France.",
			en: "Call for the immediate expulsion of Iranian regime diplomats engaged in intelligence operations against French citizens and the diaspora. The regime's embassy in Paris has been linked to surveillance and intimidation of Iranians in France.",
		},
		jurisdiction: "Quai d'Orsay / Place Beauvau",
	},
	{
		id: "soutien-cpi",
		title: {
			fr: "Soutien total à l'enquête de la CPI",
			en: "Full Support for ICC Investigation",
		},
		description: {
			fr: "La Cour Pénale Internationale a ouvert une enquête sur les crimes contre l'humanité en Iran. La France doit fournir un soutien politique, renseignement et financier complet.",
			en: "The International Criminal Court has opened an investigation into crimes against humanity in Iran. France must provide full political, intelligence, and financial support.",
		},
		briefText: {
			fr: "Je vous demande d'assurer que la France fournisse un soutien maximum à l'enquête de la CPI sur l'Iran, y compris le partage de renseignements, le soutien politique et un financement additionnel. La France doit également soutenir la saisine du Conseil de sécurité pour élargir la compétence de la CPI.",
			en: "Ensure France provides maximum support to the ICC investigation into Iran, including sharing of intelligence, political backing, and additional funding. France must also support referring the situation to the Security Council to expand the ICC's jurisdiction.",
		},
		jurisdiction: "Quai d'Orsay / Garde des Sceaux",
	},
	{
		id: "liberte-internet",
		title: {
			fr: "Soutenir la liberté d'internet pour les Iraniens",
			en: "Support Internet Freedom for Iranians",
		},
		description: {
			fr: "Le régime bloque systématiquement l'accès à internet pour empêcher la documentation des atrocités et isoler les manifestants. La France doit soutenir les efforts technologiques et diplomatiques pour rétablir la connectivité.",
			en: "The regime systematically blocks internet access to prevent documentation of atrocities and to isolate protesters. France must support technological and diplomatic efforts to restore connectivity.",
		},
		briefText: {
			fr: "Je vous demande de plaider pour un financement accru des outils de contournement et des technologies satellitaires permettant aux Iraniens d'accéder à internet. La France doit également porter des résolutions à l'ONU condamnant les coupures d'internet comme violations des droits humains.",
			en: "Advocate for increased funding for circumvention tools and satellite technologies to allow Iranians to access the internet. France must also champion UN resolutions condemning internet shutdowns as human rights violations.",
		},
		jurisdiction: "Quai d'Orsay / Secrétariat d'État au Numérique",
	},
	{
		id: "protection-diaspora",
		title: {
			fr: "Protéger la diaspora iranienne en France",
			en: "Protect the Iranian Diaspora in France",
		},
		description: {
			fr: "Les Iraniens en France sont surveillés, menacés et harcelés par des agents du régime. La France doit démanteler ces réseaux et protéger les dissidents et activistes.",
			en: "Iranians in France are surveilled, threatened, and harassed by regime agents. France must dismantle these networks and protect dissidents and activists.",
		},
		briefText: {
			fr: "Je vous demande d'assurer que la DGSI enquête activement sur les réseaux de surveillance du régime ciblant les Iraniens en France, et que des mesures de protection soient fournies aux activistes menacés. Les opérations de la République islamique contre les dissidents sur le sol français sont inacceptables.",
			en: "Ensure that the DGSI actively investigates regime surveillance networks targeting Iranians in France, and that protective measures are provided to threatened activists. The Islamic Republic's operations against dissidents on French soil are unacceptable.",
		},
		jurisdiction: "Place Beauvau / DGSI",
	},
	{
		id: "accueil-refugies",
		title: {
			fr: "Faciliter l'asile pour les Iraniens en danger",
			en: "Facilitate Asylum for At-Risk Iranians",
		},
		description: {
			fr: "Les Iraniens fuyant les persécutions font face à de longs délais et des procédures complexes. La France doit accélérer et simplifier les procédures d'asile pour les Iraniens menacés.",
			en: "Iranians fleeing persecution face long delays and complex procedures. France must expedite and simplify asylum procedures for at-risk Iranians.",
		},
		briefText: {
			fr: "Je vous demande de plaider pour des procédures d'asile accélérées pour les Iraniens fuyant les persécutions, en particulier les femmes, les militants des droits humains et les journalistes. La France a une longue tradition d'accueil des réfugiés politiques ; elle doit être à la hauteur de cette tradition.",
			en: "Advocate for expedited asylum procedures for Iranians fleeing persecution, particularly women, human rights activists, and journalists. France has a long tradition of welcoming political refugees; it must live up to this tradition.",
		},
		jurisdiction: "Place Beauvau / OFPRA",
	},
	{
		id: "commission-enquete",
		title: {
			fr: "Commission d'enquête parlementaire",
			en: "Parliamentary Inquiry Commission",
		},
		description: {
			fr: "L'Assemblée nationale doit créer une commission d'enquête sur les crimes du régime iranien et les moyens d'action de la France.",
			en: "The National Assembly must create an inquiry commission on the Iranian regime's crimes and France's means of action.",
		},
		briefText: {
			fr: "Je vous demande de soutenir la création d'une commission d'enquête parlementaire sur les crimes contre l'humanité en Iran et les moyens d'action de la France. Cette commission permettrait d'auditionner des experts, des témoins et des responsables, et de formuler des recommandations concrètes.",
			en: "Support the creation of a parliamentary inquiry commission on crimes against humanity in Iran and France's means of action. This commission would hear from experts, witnesses, and officials, and formulate concrete recommendations.",
		},
		jurisdiction: "Assemblée nationale",
	},
];

export type DemandIdFR = (typeof DEMANDS_FR)[number]["id"];
