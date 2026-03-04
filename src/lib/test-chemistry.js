import { parseFormula, parseEquationString, processEquation } from './chemistry.js';

console.log("Testing parseFormula:");
console.log("H2O:", parseFormula("H2O"));
console.log("Ca(OH)2:", parseFormula("Ca(OH)2"));
console.log("Na2CO3:", parseFormula("Na2CO3"));
console.log("C6H12O6:", parseFormula("C6H12O6"));

console.log("\nTesting parseEquationString:");
console.log("H2 + O2 -> H2O", parseEquationString("H2 + O2 -> H2O"));

console.log("\nTesting processEquation:");
const testCases = [
    "H2 + O2 -> H2O",
    "CH4 + O2 -> CO2 + H2O",
    "Na + Cl2 -> NaCl",
    "C6H12O6 + O2 -> CO2 + H2O",
    "Fe + O2 -> Fe2O3",
    "N2 + H2 -> NH3",
    "KClO3 -> KCl + O2",
    "NaCl + F2 -> NaF + Cl2", // simple replacement
    "H2 + O2 -> H2O2", // peroxide
    "He -> He" // trivial
];

testCases.forEach(eq => {
    const result = processEquation(eq);
    console.log(`${eq.padEnd(30)} => ${result.balancedEq}`);
});
