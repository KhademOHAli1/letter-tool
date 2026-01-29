/**
 * US policy demands for Iran accountability letters
 * Adapted for US political/legal context - targeting Congress and Senate
 *
 * Death toll source: Iran International, January 2026
 * https://www.iranintl.com/en/202601277218
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
 * strong Congressional oversight, key P5+1 member, military capabilities
 * Focus: Maximum pressure, military intervention, IRGC enforcement
 */
export const DEMANDS_US: DemandUS[] = [
	{
		id: "maximum-pressure",
		title: { en: "Maximum Pressure: Total Economic Isolation" },
		description: {
			en: "The US must maintain and massively expand the maximum pressure sanctions campaign. With over 36,500 Iranians killed by the regime, there can be no sanctions relief, no diplomacy, no deals until the regime falls.",
		},
		briefText: {
			en: "I urge you to support total economic isolation of the Iranian regime. With over 36,500 killed, there must be no sanctions relief, no unfreezing of assets, no new agreements, and no diplomatic outreach. Maximum pressure must mean maximum pressure - every dollar denied is a weapon taken from the regime's hands.",
		},
		jurisdiction: "Treasury / State / Congress",
	},
	{
		id: "military-intervention",
		title: { en: "Prepare Military Options Under R2P" },
		description: {
			en: "With over 36,500 dead and systematic crimes against humanity, all diplomatic measures have failed. The United States must prepare credible military options under the Responsibility to Protect doctrine, including no-fly zones, targeted strikes on IRGC facilities, and support for armed resistance.",
		},
		briefText: {
			en: "I urge you to advocate for preparing military options under the Responsibility to Protect. With over 36,500 dead, all Article 41 measures are exhausted. The United States must prepare credible military responses including no-fly zones over population centers, targeted strikes on IRGC command structures, and material support for resistance forces.",
		},
		jurisdiction: "DOD / White House / Congress",
	},
	{
		id: "regime-delegitimization",
		title: { en: "Declare the Regime Illegitimate" },
		description: {
			en: "The Iranian regime has lost all legitimacy by massacring over 36,500 of its own people. The United States must formally declare it an illegitimate criminal enterprise and recognize the right of the Iranian people to self-defense.",
		},
		briefText: {
			en: "Call on the Administration to formally declare the Iranian regime illegitimate. A government that has killed over 36,500 of its own citizens is not a negotiating partner - it is a criminal enterprise. The US must recognize the Iranian people's inherent right to self-defense and regime change.",
		},
		jurisdiction: "State Department / White House",
	},
	{
		id: "irgc-enforcement",
		title: { en: "Full Enforcement of IRGC FTO Designation" },
		description: {
			en: "The US designated the IRGC as a Foreign Terrorist Organization in 2019. Congress must ensure full enforcement: prosecute all IRGC members in the US, ban all front organizations, deny visas to anyone with IRGC ties, and designate IRGC-affiliated businesses worldwide.",
		},
		briefText: {
			en: "Push for maximum enforcement of the IRGC's FTO designation: prosecute all IRGC members and affiliates in the US, shut down every front organization, deny visas to anyone with any IRGC connection, and pursue IRGC assets globally. Zero tolerance, zero exceptions.",
		},
		jurisdiction: "DOJ / DHS / State / Treasury",
	},
	{
		id: "magnitsky-sanctions",
		title: { en: "Massive Expansion of Magnitsky Sanctions" },
		description: {
			en: "The Global Magnitsky Act and CAATSA must be used to sanction every identified regime official. Congress must push for adding thousands of torturers, executioners, IRGC commanders, and their families to the sanctions list.",
		},
		briefText: {
			en: "Call for aggressive expansion of Global Magnitsky and CAATSA sanctions to include every IRGC commander, Revolutionary Court judge, prison warden, and regime official responsible for the death of 36,500 Iranians. Their families and associates must also be sanctioned. No safe haven anywhere.",
		},
		jurisdiction: "Treasury OFAC / State Department",
	},
	{
		id: "arm-resistance",
		title: { en: "Support Iranian Resistance Forces" },
		description: {
			en: "The Iranian people have the right to defend themselves. The United States should provide material and intelligence support to organized resistance forces fighting the regime.",
		},
		briefText: {
			en: "Advocate for providing material support to Iranian resistance forces. When a regime kills 36,500 of its own people, the population has the inherent right to armed self-defense. The US should provide intelligence, communications, and material support to organized resistance.",
		},
		jurisdiction: "CIA / DOD / Congress",
	},
	{
		id: "internet-freedom",
		title: { en: "Guarantee Internet Access for Iranians" },
		description: {
			en: "The regime uses internet blackouts to hide massacres. The US must ensure Iranians have uncensored satellite internet access through Starlink and other technologies, funded at scale.",
		},
		briefText: {
			en: "Massively increase funding for internet freedom. Deploy Starlink terminals at scale, fund secure VPN infrastructure, and ensure Iranians can document regime crimes and coordinate resistance. The regime blacks out the internet to kill in darkness - we must keep the lights on.",
		},
		jurisdiction: "Congress / USAGM / SpaceX",
	},
	{
		id: "expel-agents",
		title: { en: "Expel All Regime Agents from US Soil" },
		description: {
			en: "Iranian regime intelligence agents operate in the US surveilling and threatening Iranian-Americans. They must all be expelled and prosecuted.",
		},
		briefText: {
			en: "Demand the expulsion of all Iranian regime agents and the complete restriction of the UN mission. Prosecute those who threaten Iranian-Americans. The regime that has killed 36,500 Iranians must not be allowed to export its terror to American soil.",
		},
		jurisdiction: "FBI / State Department / DHS",
	},
	{
		id: "asylum-protection",
		title: { en: "Protect Iranian Refugees" },
		description: {
			en: "Iranians fleeing the regime's mass murder campaign must be protected. The US should grant immediate TPS and expedite asylum for all Iranians.",
		},
		briefText: {
			en: "Grant Temporary Protected Status (TPS) for all Iranians immediately. Expedite asylum processing for those fleeing persecution. No deportations to Iran under any circumstances. Those fleeing a regime that has killed 36,500 people deserve America's protection.",
		},
		jurisdiction: "DHS / Congress",
	},
	{
		id: "congressional-action",
		title: { en: "Pass the MAHSA Act and Iran Human Rights Legislation" },
		description: {
			en: "Congress must pass comprehensive Iran human rights legislation mandating sanctions, supporting the Iranian people, and holding the regime accountable.",
		},
		briefText: {
			en: "Co-sponsor and pass the MAHSA Act and comprehensive Iran human rights legislation. Mandate sanctions on all regime officials, fund internet freedom, support Iranian civil society, and ensure accountability for the over 36,500 killed. Congressional action must match the scale of the atrocities.",
		},
		jurisdiction: "House / Senate",
	},
];
