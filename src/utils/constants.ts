export const manualTypes = [
  { code: "IM", display: "Instruction Manual" },
  { code: "SM", display: "Service Manual" },
  { code: "PM", display: "Parts Manual" },
  { code: "SPL", display: "Spare Parts List" },
  { code: "WP", display: "Wiring Plan" },
  { code: "TI", display: "Technical Information" },
] as const;

export const manualLanguages = [
  { code: "ma-NY", display: "All Languages" },
  { code: "en-GB", display: "English (UK)" },
  { code: "sv-SE", display: "Swedish" },
  { code: "de-DE", display: "German" },
  { code: "da-DK", display: "Danish" },
  { code: "es-ES", display: "Spanish" },
  { code: "fi-FI", display: "Finnish" },
  { code: "fr-FR", display: "French" },
  { code: "el-GR", display: "Greek" },
  { code: "it-IT", display: "Italian" },
  { code: "nl-NL", display: "Dutch" },
  { code: "no-NO", display: "Norwegian" },
  { code: "pt-PT", display: "Portuguese" },
] as const;

export type ManualTypeCode = (typeof manualTypes)[number]["code"];
export type LanguageCode = (typeof manualLanguages)[number]["code"];

export const productCategories = [
  { code: "arc", display: "Welding Equipment" },
  { code: "gas", display: "Gas Equipment" },
  { code: "wel", display: "Welding Automation" },
  { code: "pls", display: "Manual Plasma Cutting" },
  { code: "cut", display: "Cutting Automation" },
  { code: "ppe", display: "PPE / Safety" },
  { code: "aac", display: "Accessories and Consumables" },
  { code: "rob", display: "Robotics" },
  { code: "arx", display: "Carbon Arc Gouging / Exothermic Cutting" },
] as const;

export type ProductCategoryCode = (typeof productCategories)[number]["code"];

export const marketRegions = {
  EU: "Europe",
  NA: "North America",
  SA: "South America",
  ME: "Middle East",
  AS: "Asia",
  AU: "Australia",
  IN: "India",
} as const;

export type MarketRegionCode = keyof typeof marketRegions;
