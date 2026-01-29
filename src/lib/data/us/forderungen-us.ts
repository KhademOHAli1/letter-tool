/**
 * US policy demands for Iran accountability letters
 * Adapted for US political/legal context - targeting Congress and Senate
 */

export interface DemandUS {
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
	/** Relevant committee or agency */
	jurisdiction: string;
}

/**
 * Priority-ordered list of demands for US Representatives and Senators
 * Context: US has designated IRGC as FTO (2019), extensive sanctions regime,
 * strong Congressional oversight, key P5+1 member
 * Focus: R2P, maximum pressure, Magnitsky/CAATSA enforcement, ICC support, internet freedom
 */
export const DEMANDS_US: DemandUS[] = [
	{
		id: "r2p",
		title: { en: "Invoke Responsibility to Protect (R2P)" },
		description: {
			en: "With over 18,000 killed since September 2025 and systematic crimes against humanity, the United States must invoke the Responsibility to Protect doctrine at the UN - including preparation for measures under Article 42 of the UN Charter.",
		},
		briefText: {
			en: "I urge you to advocate for invoking the Responsibility to Protect. With over 18,000 dead and ongoing crimes against humanity, all Article 41 measures are exhausted. The United States must lead at the UN Security Council in preparing further action under Article 42 of the UN Charter.",
		},
		jurisdiction: "State Department / White House",
	},
	{
		id: "regime-delegitimization",
		title: { en: "Declare the Regime Illegitimate" },
		description: {
			en: "The Iranian regime has lost all legitimacy by massacring its own people. The United States must publicly declare it illegitimate and cease treating it as a legitimate negotiating partner on the world stage.",
		},
		briefText: {
			en: "Call on the Administration to publicly state what is obvious: this regime has lost all legitimacy. A government that massacres 18,000 of its own citizens cannot be treated as a legitimate partner. The United States must lead the international community in formal delegitimization.",
		},
		jurisdiction: "State Department / White House",
	},
	{
		id: "maximum-pressure",
		title: { en: "Maintain and Expand Maximum Pressure Sanctions" },
		description: {
			en: "The US must maintain and expand the maximum pressure sanctions campaign against the Iranian regime, ensuring no sanctions relief until fundamental human rights improvements are verified.",
		},
		briefText: {
			en: "Urge continued and expanded maximum pressure sanctions on the Iranian regime. There must be no sanctions relief, no unfreezing of assets, and no new agreements while the regime massacres its own people. Every dollar released funds oppression.",
		},
		jurisdiction: "Treasury Department / Congress",
	},
	{
		id: "irgc-enforcement",
		title: { en: "Full Enforcement of IRGC FTO Designation" },
		description: {
			en: "The US designated the IRGC as a Foreign Terrorist Organization in 2019. Now Congress must ensure full enforcement: prosecute IRGC members in the US, ban all front organizations, and deny visas to anyone with IRGC ties.",
		},
		briefText: {
			en: "Push for full enforcement of the IRGC's FTO designation: prosecute IRGC members and affiliates in the US, ban front organizations, deny visas to anyone with IRGC connections, and ensure no waivers or exemptions are granted. The designation means nothing without rigorous enforcement.",
		},
		jurisdiction: "DOJ / DHS / State Department",
	},
	{
		id: "magnitsky-sanctions",
		title: { en: "Expand Magnitsky and CAATSA Sanctions" },
		description: {
			en: "The Global Magnitsky Act and CAATSA provide powerful tools for targeted sanctions. Congress must push for adding every identified torturer, executioner, and IRGC commander to the sanctions list.",
		},
		briefText: {
			en: "Call on the Treasury Department to immediately expand Global Magnitsky and CAATSA sanctions to include IRGC commanders, Revolutionary Court judges, and prison officials responsible for torture and executions. There are thousands of documented perpetrators who remain unsanctioned.",
		},
		jurisdiction: "Treasury OFAC / State Department",
	},
	{
		id: "expel-diplomats",
		title: { en: "Expel Iranian Regime Agents and Limit UN Mission" },
		description: {
			en: "Iranian regime intelligence agents operate in the US under diplomatic cover and through front organizations, surveilling and threatening the diaspora. Their activities must be curtailed.",
		},
		briefText: {
			en: "Call for restricting the Iranian UN mission to Manhattan, expelling regime agents operating outside diplomatic bounds, and prosecuting those who threaten or surveil Iranian-Americans. The regime should not be allowed to export its repression to American soil.",
		},
		jurisdiction: "State Department / FBI",
	},
	{
		id: "icc-support",
		title: { en: "Support International Accountability Mechanisms" },
		description: {
			en: "The International Criminal Court has opened an investigation into crimes against humanity in Iran. The US should support international accountability mechanisms and consider establishing a special tribunal.",
		},
		briefText: {
			en: "Support international accountability for Iranian regime officials through all available mechanisms. While the US is not an ICC member, it can support evidence gathering, witness protection, and the establishment of a special tribunal for crimes against humanity in Iran.",
		},
		jurisdiction: "State Department / DOJ",
	},
	{
		id: "internet-freedom",
		title: { en: "Fund Internet Freedom for Iranians" },
		description: {
			en: "The regime systematically blocks internet access to prevent documentation of atrocities and isolate protesters. The US must fund technologies and programs to restore connectivity.",
		},
		briefText: {
			en: "Increase funding for internet freedom programs through the Open Technology Fund and USAGM. Support satellite internet access, VPN distribution, and anti-censorship tools. Iranians documenting atrocities need secure, uncensored internet access.",
		},
		jurisdiction: "Congress / USAGM",
	},
	{
		id: "asylum-protection",
		title: { en: "Protect Iranian Refugees and Asylum Seekers" },
		description: {
			en: "Iranians fleeing persecution must be protected. The US should expedite asylum processing for Iranians, grant TPS, and ensure no deportations to Iran.",
		},
		briefText: {
			en: "Call for Temporary Protected Status (TPS) for Iranians, expedited asylum processing for those fleeing persecution, and an absolute bar on deportations to Iran. No one should be sent back to face torture or execution.",
		},
		jurisdiction: "DHS / Congress",
	},
	{
		id: "congressional-hearings",
		title: { en: "Hold Congressional Hearings on Iran Human Rights" },
		description: {
			en: "Congress must hold public hearings to document atrocities, hear from survivors, and hold the Administration accountable for its Iran policy.",
		},
		briefText: {
			en: "Request hearings in relevant committees to document ongoing atrocities in Iran, hear testimony from survivors and witnesses, and ensure robust Congressional oversight of US policy toward the Iranian regime.",
		},
		jurisdiction: "House Foreign Affairs / Senate Foreign Relations",
	},
];
