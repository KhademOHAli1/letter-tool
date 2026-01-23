/**
 * UK policy demands for Iran accountability letters
 * Adapted for UK political/legal context and existing policy landscape
 */

export interface DemandUK {
	id: string;
	title: {
		en: string;
	};
	description: {
		en: string;
	};
	/** Text optimized for use in the letter body */
	briefText: {
		en: string;
	};
	/** Relevant ministry or department */
	jurisdiction: string;
}

/**
 * Priority-ordered list of demands for UK MPs
 * Context: UK is P5+1 member, has IRGC partially proscribed, strong Magnitsky regime
 * Focus: Full IRGC proscription, R2P, Magnitsky expansion, ICC support, internet freedom
 */
export const DEMANDS_UK: DemandUK[] = [
	{
		id: "r2p",
		title: { en: "Invoke Responsibility to Protect (R2P)" },
		description: {
			en: "With over 18,000 killed since September 2025 and systematic crimes against humanity, the UK must invoke the Responsibility to Protect doctrine at the UN - including preparation for measures under Article 42 of the UN Charter.",
		},
		briefText: {
			en: "I urge you to advocate for invoking the Responsibility to Protect. With over 18,000 dead and ongoing crimes against humanity, all Article 41 measures are exhausted. The UK must lead at the UN Security Council in preparing further action under Article 42 of the UN Charter.",
		},
		jurisdiction: "FCDO / Prime Minister",
	},
	{
		id: "regime-delegitimization",
		title: { en: "Declare the Regime Illegitimate" },
		description: {
			en: "The Iranian regime has lost all legitimacy by massacring its own people. The UK must publicly declare it illegitimate and cease treating it as a legitimate negotiating partner on the world stage.",
		},
		briefText: {
			en: "Call on the government to publicly state what is obvious: this regime has lost all legitimacy. A government that massacres 18,000 of its own citizens cannot be treated as a legitimate partner. The UK must lead the international community in formal delegitimization.",
		},
		jurisdiction: "FCDO / Prime Minister",
	},
	{
		id: "full-irgc-proscription",
		title: { en: "Full Proscription of IRGC as Terrorist Organisation" },
		description: {
			en: "The UK has only partially sanctioned the IRGC. It must now fully proscribe the entire Islamic Revolutionary Guard Corps under the Terrorism Act 2000, following the lead of the US, Canada, and others.",
		},
		briefText: {
			en: "Urge the Home Secretary to fully proscribe the IRGC as a terrorist organisation under the Terrorism Act 2000. Canada listed the entire IRGC in June 2024. The UK's partial approach is inadequate - the IRGC is a single organisation responsible for terrorism, assassination plots on British soil, and mass murder of Iranians.",
		},
		jurisdiction: "Home Office",
	},
	{
		id: "magnitsky-sanctions",
		title: { en: "Expand Magnitsky Sanctions Against Regime Officials" },
		description: {
			en: "The UK's Global Human Rights Sanctions regime allows targeted sanctions. The government must add every identified torturer, executioner, and IRGC commander to the list.",
		},
		briefText: {
			en: "Call on the FCDO to immediately expand UK Global Human Rights Sanctions to include IRGC commanders, Revolutionary Court judges, and prison officials responsible for torture and executions. The UK has sanctioned too few individuals - there are thousands of documented perpetrators.",
		},
		jurisdiction: "FCDO",
	},
	{
		id: "expel-diplomats",
		title: { en: "Expel Iranian Regime Diplomats and Agents" },
		description: {
			en: "Iranian regime diplomats and intelligence agents operate freely in the UK, surveilling diaspora communities and orchestrating threats. They must be expelled.",
		},
		briefText: {
			en: "Call for the immediate expulsion of Iranian regime diplomats engaged in intelligence operations against British citizens and the diaspora. The regime's embassy in London has been linked to surveillance and intimidation of Iranians in the UK.",
		},
		jurisdiction: "FCDO / Home Office",
	},
	{
		id: "icc-support",
		title: { en: "Full Support for ICC Investigation" },
		description: {
			en: "The International Criminal Court has opened an investigation into crimes against humanity in Iran. The UK must provide full political, intelligence, and financial support.",
		},
		briefText: {
			en: "Ensure the UK provides maximum support to the ICC investigation into Iran, including sharing of intelligence, political backing, and additional funding. The UK must also support referring the situation to the Security Council to expand the ICC's jurisdiction.",
		},
		jurisdiction: "FCDO / Attorney General",
	},
	{
		id: "internet-freedom",
		title: { en: "Support Internet Freedom for Iranians" },
		description: {
			en: "The regime systematically blocks internet access to prevent documentation of atrocities and to isolate protesters. The UK must support technological and diplomatic efforts to restore connectivity.",
		},
		briefText: {
			en: "Support initiatives to maintain internet access for Iranians during crackdowns, including funding for circumvention tools, satellite internet access, and diplomatic pressure on companies providing shutdown technology to the regime.",
		},
		jurisdiction: "FCDO / DSIT",
	},
	{
		id: "asylum-protection",
		title: { en: "Protect Iranian Refugees and Asylum Seekers" },
		description: {
			en: "Iranians fleeing persecution face an uncertain asylum process in the UK. The government must ensure swift, fair processing and protection for Iranian refugees.",
		},
		briefText: {
			en: "Ensure that Iranians fleeing persecution receive fair and expedited asylum processing. The Home Office must recognise the systematic human rights violations as grounds for protection and stop removals to countries where Iranians face return to Iran.",
		},
		jurisdiction: "Home Office",
	},
	{
		id: "diaspora-protection",
		title: { en: "Protect the Iranian Diaspora from Transnational Repression" },
		description: {
			en: "The Iranian regime actively threatens, surveils, and intimidates Iranians living in the UK. The government must take action to protect diaspora communities.",
		},
		briefText: {
			en: "Call for enhanced protection for Iranian-British citizens and residents facing transnational repression. This includes investigating threats, prosecuting regime agents, and providing resources for those targeted by the regime's intimidation campaigns.",
		},
		jurisdiction: "Home Office / Security Services",
	},
	{
		id: "broadcasting",
		title: { en: "Expand Independent Broadcasting to Iran" },
		description: {
			en: "BBC Persian and other independent media are vital lifelines for Iranians. The government must ensure continued funding and protection for journalists.",
		},
		briefText: {
			en: "Ensure continued and expanded funding for BBC Persian Service and other independent broadcasting reaching Iran. Protect Iranian journalists in the UK from regime harassment and ensure their ability to report freely.",
		},
		jurisdiction: "DCMS / FCDO",
	},
];

/**
 * Get demand by ID
 */
export function getDemandById(id: string): DemandUK | undefined {
	return DEMANDS_UK.find((d) => d.id === id);
}

/**
 * Get all demands formatted for the letter prompt
 */
export function getDemandsForPrompt(): string {
	return DEMANDS_UK.map(
		(d, i) => `${i + 1}. ${d.title.en}: ${d.briefText.en}`,
	).join("\n\n");
}
