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
		es?: string;
	};
	description: {
		en: string;
		es?: string;
	};
	/** Text optimized for use in the letter body */
	briefText: {
		en: string;
		es?: string;
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
		title: {
			en: "Maximum Pressure: Total Economic Isolation",
			es: "Presión Máxima: Aislamiento Económico Total",
		},
		description: {
			en: "The US must maintain and massively expand the maximum pressure sanctions campaign. With over 36,500 Iranians killed by the regime, there can be no sanctions relief, no diplomacy, no deals until the regime falls.",
			es: "EE.UU. debe mantener y expandir masivamente la campaña de sanciones de máxima presión. Con más de 36,500 iraníes asesinados por el régimen, no puede haber alivio de sanciones, ni diplomacia, ni acuerdos hasta que el régimen caiga.",
		},
		briefText: {
			en: "I urge you to support total economic isolation of the Iranian regime. With over 36,500 killed, there must be no sanctions relief, no unfreezing of assets, no new agreements, and no diplomatic outreach. Maximum pressure must mean maximum pressure - every dollar denied is a weapon taken from the regime's hands.",
			es: "Le insto a apoyar el aislamiento económico total del régimen iraní. Con más de 36,500 muertos, no debe haber alivio de sanciones, ni descongelamiento de activos, ni nuevos acuerdos, ni acercamiento diplomático. Presión máxima debe significar presión máxima - cada dólar negado es un arma quitada de las manos del régimen.",
		},
		jurisdiction: "Treasury / State / Congress",
	},
	{
		id: "military-intervention",
		title: {
			en: "Prepare Military Options Under R2P",
			es: "Preparar Opciones Militares Bajo R2P",
		},
		description: {
			en: "With over 36,500 dead and systematic crimes against humanity, all diplomatic measures have failed. The United States must prepare credible military options under the Responsibility to Protect doctrine, including no-fly zones, targeted strikes on IRGC facilities, and support for armed resistance.",
			es: "Con más de 36,500 muertos y crímenes sistemáticos de lesa humanidad, todas las medidas diplomáticas han fracasado. Estados Unidos debe preparar opciones militares creíbles bajo la doctrina de Responsabilidad de Proteger, incluyendo zonas de exclusión aérea, ataques dirigidos a instalaciones del IRGC y apoyo a la resistencia armada.",
		},
		briefText: {
			en: "I urge you to advocate for preparing military options under the Responsibility to Protect. With over 36,500 dead, all Article 41 measures are exhausted. The United States must prepare credible military responses including no-fly zones over population centers, targeted strikes on IRGC command structures, and material support for resistance forces.",
			es: "Le insto a abogar por preparar opciones militares bajo la Responsabilidad de Proteger. Con más de 36,500 muertos, todas las medidas del Artículo 41 están agotadas. Estados Unidos debe preparar respuestas militares creíbles incluyendo zonas de exclusión aérea sobre centros poblados, ataques dirigidos a estructuras de comando del IRGC y apoyo material a fuerzas de resistencia.",
		},
		jurisdiction: "DOD / White House / Congress",
	},
	{
		id: "regime-delegitimization",
		title: {
			en: "Declare the Regime Illegitimate",
			es: "Declarar el Régimen Ilegítimo",
		},
		description: {
			en: "The Iranian regime has lost all legitimacy by massacring over 36,500 of its own people. The United States must formally declare it an illegitimate criminal enterprise and recognize the right of the Iranian people to self-defense.",
			es: "El régimen iraní ha perdido toda legitimidad al masacrar a más de 36,500 de su propia gente. Estados Unidos debe declararlo formalmente una empresa criminal ilegítima y reconocer el derecho del pueblo iraní a la autodefensa.",
		},
		briefText: {
			en: "Call on the Administration to formally declare the Iranian regime illegitimate. A government that has killed over 36,500 of its own citizens is not a negotiating partner - it is a criminal enterprise. The US must recognize the Iranian people's inherent right to self-defense and regime change.",
			es: "Pida a la Administración que declare formalmente ilegítimo al régimen iraní. Un gobierno que ha matado a más de 36,500 de sus propios ciudadanos no es un socio de negociación - es una empresa criminal. EE.UU. debe reconocer el derecho inherente del pueblo iraní a la autodefensa y al cambio de régimen.",
		},
		jurisdiction: "State Department / White House",
	},
	{
		id: "irgc-enforcement",
		title: {
			en: "Full Enforcement of IRGC FTO Designation",
			es: "Aplicación Total de la Designación FTO del IRGC",
		},
		description: {
			en: "The US designated the IRGC as a Foreign Terrorist Organization in 2019. Congress must ensure full enforcement: prosecute all IRGC members in the US, ban all front organizations, deny visas to anyone with IRGC ties, and designate IRGC-affiliated businesses worldwide.",
			es: "EE.UU. designó al IRGC como Organización Terrorista Extranjera en 2019. El Congreso debe asegurar la aplicación total: procesar a todos los miembros del IRGC en EE.UU., prohibir todas las organizaciones de fachada, negar visas a cualquiera con vínculos con el IRGC y designar negocios afiliados al IRGC a nivel mundial.",
		},
		briefText: {
			en: "Push for maximum enforcement of the IRGC's FTO designation: prosecute all IRGC members and affiliates in the US, shut down every front organization, deny visas to anyone with any IRGC connection, and pursue IRGC assets globally. Zero tolerance, zero exceptions.",
			es: "Impulse la aplicación máxima de la designación FTO del IRGC: procesar a todos los miembros y afiliados del IRGC en EE.UU., cerrar cada organización de fachada, negar visas a cualquiera con cualquier conexión con el IRGC y perseguir activos del IRGC globalmente. Cero tolerancia, cero excepciones.",
		},
		jurisdiction: "DOJ / DHS / State / Treasury",
	},
	{
		id: "magnitsky-sanctions",
		title: {
			en: "Massive Expansion of Magnitsky Sanctions",
			es: "Expansión Masiva de Sanciones Magnitsky",
		},
		description: {
			en: "The Global Magnitsky Act and CAATSA must be used to sanction every identified regime official. Congress must push for adding thousands of torturers, executioners, IRGC commanders, and their families to the sanctions list.",
			es: "La Ley Magnitsky Global y CAATSA deben usarse para sancionar a cada funcionario del régimen identificado. El Congreso debe impulsar agregar miles de torturadores, ejecutores, comandantes del IRGC y sus familias a la lista de sanciones.",
		},
		briefText: {
			en: "Call for aggressive expansion of Global Magnitsky and CAATSA sanctions to include every IRGC commander, Revolutionary Court judge, prison warden, and regime official responsible for the death of 36,500 Iranians. Their families and associates must also be sanctioned. No safe haven anywhere.",
			es: "Pida la expansión agresiva de sanciones Magnitsky Global y CAATSA para incluir a cada comandante del IRGC, juez del Tribunal Revolucionario, director de prisión y funcionario del régimen responsable de la muerte de 36,500 iraníes. Sus familias y asociados también deben ser sancionados. Sin refugio seguro en ningún lugar.",
		},
		jurisdiction: "Treasury OFAC / State Department",
	},
	{
		id: "arm-resistance",
		title: {
			en: "Support Iranian Resistance Forces",
			es: "Apoyar a las Fuerzas de Resistencia Iraníes",
		},
		description: {
			en: "The Iranian people have the right to defend themselves. The United States should provide material and intelligence support to organized resistance forces fighting the regime.",
			es: "El pueblo iraní tiene derecho a defenderse. Estados Unidos debe proporcionar apoyo material y de inteligencia a las fuerzas de resistencia organizadas que luchan contra el régimen.",
		},
		briefText: {
			en: "Advocate for providing material support to Iranian resistance forces. When a regime kills 36,500 of its own people, the population has the inherent right to armed self-defense. The US should provide intelligence, communications, and material support to organized resistance.",
			es: "Abogue por proporcionar apoyo material a las fuerzas de resistencia iraníes. Cuando un régimen mata a 36,500 de su propia gente, la población tiene el derecho inherente a la autodefensa armada. EE.UU. debe proporcionar inteligencia, comunicaciones y apoyo material a la resistencia organizada.",
		},
		jurisdiction: "CIA / DOD / Congress",
	},
	{
		id: "internet-freedom",
		title: {
			en: "Guarantee Internet Access for Iranians",
			es: "Garantizar Acceso a Internet para Iraníes",
		},
		description: {
			en: "The regime uses internet blackouts to hide massacres. The US must ensure Iranians have uncensored satellite internet access through Starlink and other technologies, funded at scale.",
			es: "El régimen usa apagones de internet para ocultar masacres. EE.UU. debe asegurar que los iraníes tengan acceso a internet satelital sin censura a través de Starlink y otras tecnologías, financiado a escala.",
		},
		briefText: {
			en: "Massively increase funding for internet freedom. Deploy Starlink terminals at scale, fund secure VPN infrastructure, and ensure Iranians can document regime crimes and coordinate resistance. The regime blacks out the internet to kill in darkness - we must keep the lights on.",
			es: "Aumente masivamente el financiamiento para la libertad de internet. Despliegue terminales Starlink a escala, financie infraestructura VPN segura y asegure que los iraníes puedan documentar crímenes del régimen y coordinar la resistencia. El régimen apaga el internet para matar en la oscuridad - debemos mantener las luces encendidas.",
		},
		jurisdiction: "Congress / USAGM / SpaceX",
	},
	{
		id: "expel-agents",
		title: {
			en: "Expel All Regime Agents from US Soil",
			es: "Expulsar a Todos los Agentes del Régimen de Suelo Estadounidense",
		},
		description: {
			en: "Iranian regime intelligence agents operate in the US surveilling and threatening Iranian-Americans. They must all be expelled and prosecuted.",
			es: "Agentes de inteligencia del régimen iraní operan en EE.UU. vigilando y amenazando a irano-estadounidenses. Todos deben ser expulsados y procesados.",
		},
		briefText: {
			en: "Demand the expulsion of all Iranian regime agents and the complete restriction of the UN mission. Prosecute those who threaten Iranian-Americans. The regime that has killed 36,500 Iranians must not be allowed to export its terror to American soil.",
			es: "Exija la expulsión de todos los agentes del régimen iraní y la restricción completa de la misión de la ONU. Procese a quienes amenacen a irano-estadounidenses. El régimen que ha matado a 36,500 iraníes no debe poder exportar su terror a suelo estadounidense.",
		},
		jurisdiction: "FBI / State Department / DHS",
	},
	{
		id: "asylum-protection",
		title: {
			en: "Protect Iranian Refugees",
			es: "Proteger a los Refugiados Iraníes",
		},
		description: {
			en: "Iranians fleeing the regime's mass murder campaign must be protected. The US should grant immediate TPS and expedite asylum for all Iranians.",
			es: "Los iraníes que huyen de la campaña de asesinatos masivos del régimen deben ser protegidos. EE.UU. debe otorgar TPS inmediato y agilizar el asilo para todos los iraníes.",
		},
		briefText: {
			en: "Grant Temporary Protected Status (TPS) for all Iranians immediately. Expedite asylum processing for those fleeing persecution. No deportations to Iran under any circumstances. Those fleeing a regime that has killed 36,500 people deserve America's protection.",
			es: "Otorgue Estatus de Protección Temporal (TPS) para todos los iraníes inmediatamente. Agilice el procesamiento de asilo para quienes huyen de la persecución. Sin deportaciones a Irán bajo ninguna circunstancia. Quienes huyen de un régimen que ha matado a 36,500 personas merecen la protección de Estados Unidos.",
		},
		jurisdiction: "DHS / Congress",
	},
	{
		id: "congressional-action",
		title: {
			en: "Pass the MAHSA Act and Iran Human Rights Legislation",
			es: "Aprobar la Ley MAHSA y Legislación de Derechos Humanos de Irán",
		},
		description: {
			en: "Congress must pass comprehensive Iran human rights legislation mandating sanctions, supporting the Iranian people, and holding the regime accountable.",
			es: "El Congreso debe aprobar legislación integral de derechos humanos de Irán que ordene sanciones, apoye al pueblo iraní y responsabilice al régimen.",
		},
		briefText: {
			en: "Co-sponsor and pass the MAHSA Act and comprehensive Iran human rights legislation. Mandate sanctions on all regime officials, fund internet freedom, support Iranian civil society, and ensure accountability for the over 36,500 killed. Congressional action must match the scale of the atrocities.",
			es: "Co-patrocine y apruebe la Ley MAHSA y legislación integral de derechos humanos de Irán. Ordene sanciones a todos los funcionarios del régimen, financie la libertad de internet, apoye a la sociedad civil iraní y asegure la rendición de cuentas por los más de 36,500 asesinados. La acción del Congreso debe igualar la escala de las atrocidades.",
		},
		jurisdiction: "House / Senate",
	},
];
