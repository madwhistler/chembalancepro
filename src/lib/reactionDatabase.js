export const reactionDatabase = [
    {
        name: "Photosynthesis",
        reactants: ["CO2", "H2O"],
        products: ["C6H12O6", "O2"],
        enthalpy: "Endothermic",
        catalysts: "Chlorophyll, Sunlight (Photons)",
        uses: "Natural energy conversion in plants. Removes CO2 from the atmosphere and produces breathable oxygen."
    },
    {
        name: "Cellular Respiration",
        reactants: ["C6H12O6", "O2"],
        products: ["CO2", "H2O"],
        enthalpy: "Exothermic",
        catalysts: "Enzymes",
        uses: "Metabolic pathway in living cells that converts biochemical energy from nutrients into ATP."
    },
    {
        name: "Haber-Bosch Process",
        reactants: ["N2", "H2"],
        products: ["NH3"],
        enthalpy: "Exothermic",
        catalysts: "Iron (Fe) with promoters like K2O, CaO",
        uses: "Industrial production of ammonia, primarily for creating agricultural fertilizers."
    },
    {
        name: "Thermite Reaction",
        reactants: ["Fe2O3", "Al"],
        products: ["Fe", "Al2O3"],
        enthalpy: "Highly Exothermic",
        catalysts: "Requires a high activation energy (often a Magnesium ribbon ignition).",
        uses: "Welding railway tracks and use in incendiary devices."
    },
    {
        name: "Combustion of Methane",
        reactants: ["CH4", "O2"],
        products: ["CO2", "H2O"],
        enthalpy: "Exothermic",
        catalysts: "None (Requires ignition spark/heat)",
        uses: "Natural gas combustion used globally for residential heating and cooking."
    },
    {
        name: "Combustion of Propane",
        reactants: ["C3H8", "O2"],
        products: ["CO2", "H2O"],
        enthalpy: "Exothermic",
        catalysts: "None (Requires ignition)",
        uses: "Fuel for gas grills, camping stoves, and residential heating."
    },
    {
        name: "Decomposition of Hydrogen Peroxide",
        reactants: ["H2O2"],
        products: ["H2O", "O2"],
        enthalpy: "Exothermic",
        catalysts: "Manganese dioxide (MnO2), Potassium Iodide (KI), or Catalase (enzyme)",
        uses: "Antiseptic cleaning, hair bleaching, and historically as a rocket propellant."
    },
    {
        name: "Electrolysis of Water",
        reactants: ["H2O"],
        products: ["H2", "O2"],
        enthalpy: "Endothermic",
        catalysts: "Requires an electrolyte (e.g., H2SO4) and a direct electrical current.",
        uses: "Production of pure hydrogen and oxygen gases."
    },
    {
        name: "Synthesis of Water",
        reactants: ["H2", "O2"],
        products: ["H2O"],
        enthalpy: "Exothermic",
        catalysts: "Platinum (Pt) or ignition spark",
        uses: "Primary reaction in hydrogen fuel cells to generate electricity."
    }
];

/**
 * Normalizes an array of molecules by sorting them so order doesn't matter.
 * @param {string[]} molecules
 * @returns {string}
 */
const serializeMolecules = (molecules) => {
    return [...molecules].sort().join(',');
};

/**
 * Searches the static database for information matching the parsed equation.
 * It ignores coefficients by taking the raw parsed string arrays (e.g., ["H2", "O2"] and ["H2O"]).
 * @param {Object} parsedEquation 
 * @returns {Object | null}
 */
export function findReactionInfo(parsedEquation) {
    if (!parsedEquation) return null;

    const targetReactants = serializeMolecules(parsedEquation.reactants);
    const targetProducts = serializeMolecules(parsedEquation.products);

    for (const rxn of reactionDatabase) {
        const rxnReactants = serializeMolecules(rxn.reactants);
        const rxnProducts = serializeMolecules(rxn.products);

        if (rxnReactants === targetReactants && rxnProducts === targetProducts) {
            return rxn;
        }
    }

    return null;
}
