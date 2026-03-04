/**
 * Parses and classifies the reaction type based on its reactants and products.
 *
 * Classes supported:
 * - Synthesis: A + B -> AB
 * - Decomposition: AB -> A + B
 * - Combustion: CxHy(Oz) + O2 -> CO2 + H2O
 * - Single Replacement: A + BC -> B + AC
 * - Double Replacement: AB + CD -> AD + CB
 *
 * @param {Object} parsedEquation - `{ reactants: string[], products: string[] }`
 * @returns {string | null}
 */
export function classifyReactionType(parsedEquation) {
    if (!parsedEquation) return null;

    const rCount = parsedEquation.reactants.length;
    const pCount = parsedEquation.products.length;

    // Synthesis
    if (rCount > 1 && pCount === 1) {
        return 'Synthesis';
    }

    // Decomposition
    if (rCount === 1 && pCount > 1) {
        return 'Decomposition';
    }

    // Helper: check if a molecule is purely O2
    const isO2 = (moleculeStr) => moleculeStr === 'O2';

    // Helper: check if a molecule is CO2 or H2O
    const isCO2 = (moleculeStr) => moleculeStr === 'CO2';
    const isH2O = (moleculeStr) => moleculeStr === 'H2O';

    // Helper: check if a molecule contains Carbon and Hydrogen (and optionally Oxygen)
    const isHydrocarbonOrCarbohydrate = (moleculeStr) => {
        return moleculeStr.includes('C') && moleculeStr.includes('H');
    };

    // Combustion (specifically hydrocarbon combustion)
    if (rCount === 2 && pCount >= 1) {
        const hasO2 = parsedEquation.reactants.some(isO2);
        const hasFuel = parsedEquation.reactants.some(isHydrocarbonOrCarbohydrate);
        const producesCO2 = parsedEquation.products.some(isCO2);
        const producesH2O = parsedEquation.products.some(isH2O);

        // Some simple combustion reactions might just produce CO2 or just H2O (e.g., C + O2 -> CO2)
        // but typically we mean Hydrocarbon combustion -> CO2 + H2O
        if (hasO2 && hasFuel && producesCO2 && producesH2O) {
            return 'Combustion';
        }
    }

    // Simplified heuristic for Single & Double Replacement
    // A true single/double replacement requires ionic charge analysis,
    // but we can guess based on molecule count.
    if (rCount === 2 && pCount === 2) {
        // If one reactant is an element (no lowercase or only one capital letter)
        // and one is a compound.
        const isElement = (moleculeStr) => {
            // Basic element check: only 1 capital letter, maybe 1 lowercase, maybe a number.
            // E.g., Al, Cl2, O2, Na
            const capitals = (moleculeStr.match(/[A-Z]/g) || []).length;
            return capitals === 1;
        };

        const r1Elem = isElement(parsedEquation.reactants[0]);
        const r2Elem = isElement(parsedEquation.reactants[1]);

        if ((r1Elem && !r2Elem) || (!r1Elem && r2Elem)) {
            return 'Single Replacement';
        }

        if (!r1Elem && !r2Elem) {
            return 'Double Replacement';
        }
    }

    return 'Complex / Other';
}
