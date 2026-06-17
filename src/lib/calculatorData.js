// Datos del subsidio DU 004-2026 (Enered)

export const SUBSIDIO_GL = 4.0; // S/ por galón
export const MESES = 2; // junio y julio 2026

export const VEHICLE_CATEGORIES = [
  { id: "M2", label: "Minibús / combi", tope: 674.65 },
  { id: "M3", label: "Bus grande", tope: 1915.41 },
  { id: "N1", label: "Camioneta de carga", tope: 552.52 },
  { id: "N2", label: "Camión mediano", tope: 888.45 },
  { id: "N3", label: "Camión grande / tracto", tope: 1412.54 },
];

export const ELIGIBILITY_QUESTIONS = [
  {
    key: "ambito",
    title: "¿Qué tipo de servicio prestas?",
    hint: "El subsidio cubre transporte regular de personas y de mercancías",
    options: [
      { value: "nacional", text: "Transporte de personas — ámbito nacional", icon: "🚌" },
      { value: "regional", text: "Transporte de personas — ámbito regional", icon: "🚐" },
      { value: "provincial", text: "Transporte de personas — ámbito provincial", icon: "🚏" },
      { value: "mercancias", text: "Transporte público de mercancías (carga)", icon: "📦" },
    ],
  },
  {
    key: "autoridad",
    title: "¿Quién emitió tu autorización para operar?",
    hint: "Debe estar vigente a la fecha del decreto (28 mayo 2026)",
    options: [
      { value: "mtc", text: "Ministerio de Transportes (MTC)", icon: "🏛️" },
      { value: "regional", text: "Gobierno Regional", icon: "🏢" },
      { value: "provincial", text: "Municipalidad Provincial", icon: "🏘️" },
      { value: "atu", text: "ATU (Lima y Callao)", icon: "🚦" },
      { value: "sin", text: "No tengo autorización vigente", icon: "🚫" },
    ],
  },
  {
    key: "lima",
    title: "¿Tu servicio es urbano dentro de Lima y Callao bajo la ATU?",
    hint: "Los servicios urbanos de Lima/Callao tienen otro subsidio (DU 006-2026)",
    options: [
      { value: "no", text: "No — opero rutas nacionales, regionales o provinciales", icon: "🛣️" },
      { value: "si", text: "Sí — soy operador urbano de Lima/Callao bajo la ATU", icon: "🏙️" },
    ],
  },
  {
    key: "reqs",
    title: "¿Cumples con estos requisitos básicos?",
    hint: "Marca solo si cumples los tres",
    options: [
      { value: "si", text: "Sí: habilitación vigente + RUC activo/habido + compro diésel B5/B20 con comprobante electrónico", icon: "✅" },
      { value: "no", text: "No cumplo alguno de estos", icon: "⚠️" },
    ],
  },
];

// Devuelve { ok: true } o { ok: false, reason, alt? }
export function evaluateEligibility(answers, ambitoOtro) {
  if (answers.ambito === "otros") {
    return {
      ok: false,
      reason:
        "Tu actividad no encaja en los rubros cubiertos por el DU 004-2026: transporte regular de personas (nacional/regional/provincial) y transporte público de mercancías.",
      alt:
        ambitoOtro && ambitoOtro.trim()
          ? `Indicaste: "${ambitoOtro.trim()}". Si crees que califica, conversa con un asesor para revisar tu caso.`
          : "Si tu servicio es urbano de Lima/Callao bajo la ATU, revisa el DU 006-2026.",
    };
  }
  if (answers.autoridad === "sin") {
    return {
      ok: false,
      reason:
        "Para acceder al subsidio necesitas autorización vigente emitida por MTC, Gobierno Regional, Municipalidad Provincial o ATU al 28 de mayo de 2026.",
    };
  }
  if (answers.lima === "si") {
    return {
      ok: false,
      reason:
        "Los servicios urbanos de Lima y Callao bajo competencia de la ATU están excluidos de este subsidio (DU 004-2026).",
      alt: "Para ese caso aplica el DU 006-2026, dirigido específicamente al transporte urbano de Lima y Callao.",
    };
  }
  if (answers.reqs === "no") {
    return {
      ok: false,
      reason:
        "Debes cumplir los tres requisitos básicos: habilitación vigente, RUC activo y habido, y comprar diésel B5/B20 con comprobante electrónico.",
    };
  }
  // Cross-check: si dice servicio nacional y autoridad regional/provincial → advertir
  return { ok: true };
}

// Cálculo de subsidio
// vehicles: [{ categoryId, consumo, unidades }]
// precioDiesel: S/ por galón (referencia)
export function calculateSubsidy(vehicles, precioDiesel) {
  let totalSubsidy = 0;
  let totalGallonsRecognized = 0;
  let totalGallonsRaw = 0;
  let totalExpense = 0;

  const details = vehicles.map((v) => {
    const cat = VEHICLE_CATEGORIES.find((c) => c.id === v.categoryId);
    if (!cat) {
      return null;
    }
    const consumo = Number(v.consumo) || 0;
    const unidades = Number(v.unidades) || 0;
    const consumoPeriodoUnidad = consumo * MESES; // galones por unidad en 2 meses
    const reconocidosPorUnidad = Math.min(consumoPeriodoUnidad, cat.tope);
    const reconocidosGrupo = reconocidosPorUnidad * unidades;
    const galonesBrutosGrupo = consumoPeriodoUnidad * unidades;
    const subsidyGrupo = reconocidosGrupo * SUBSIDIO_GL;
    const gastoGrupo = galonesBrutosGrupo * precioDiesel;
    const capped = consumoPeriodoUnidad > cat.tope;

    totalSubsidy += subsidyGrupo;
    totalGallonsRecognized += reconocidosGrupo;
    totalGallonsRaw += galonesBrutosGrupo;
    totalExpense += gastoGrupo;

    return {
      categoryId: cat.id,
      categoryLabel: cat.label,
      tope: cat.tope,
      consumo,
      unidades,
      consumoPeriodoUnidad,
      reconocidosPorUnidad,
      reconocidosGrupo,
      galonesBrutosGrupo,
      subsidyGrupo,
      gastoGrupo,
      capped,
    };
  }).filter(Boolean);

  const coverage = totalExpense > 0 ? (totalSubsidy / totalExpense) * 100 : 0;

  return {
    totalSubsidy,
    totalGallonsRecognized,
    totalGallonsRaw,
    totalExpense,
    coverage,
    details,
  };
}

export const formatSoles = (n) =>
  `S/ ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatSolesInt = (n) =>
  `S/ ${Number(n || 0).toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;

export const formatGalones = (n) =>
  Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
