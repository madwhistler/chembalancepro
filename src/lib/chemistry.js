/**
 * Parses a chemical formula string into a map of elements and their counts.
 * e.g. "H2O" -> { "H": 2, "O": 1 }
 * e.g. "Ca(OH)2" -> { "Ca": 1, "O": 2, "H": 2 }
 * @param {string} formula
 * @returns {Record<string, number>}
 */
export function parseFormula(formula) {
  // Helper to multiply a molecule map
  const multiplyMap = (map, multiplier) => {
    Object.keys(map).forEach(key => {
      map[key] *= multiplier;
    });
    return map;
  };

  // Stack-based parsing for parentheses
  const stack = [{}];
  let i = 0;

  while (i < formula.length) {
    const char = formula[i];

    if (char === '(') {
      stack.push({});
      i++;
    } else if (char === ')') {
      i++;
      let multiplierStr = '';
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        multiplierStr += formula[i];
        i++;
      }
      const multiplier = multiplierStr === '' ? 1 : parseInt(multiplierStr, 10);
      const top = multiplyMap(stack.pop(), multiplier);
      // Merge into next top
      const targetMap = stack[stack.length - 1];
      Object.entries(top).forEach(([elem, count]) => {
        targetMap[elem] = (targetMap[elem] || 0) + count;
      });
    } else if (/[A-Z]/.test(char)) {
      let elem = char;
      i++;
      if (i < formula.length && /[a-z]/.test(formula[i])) {
        elem += formula[i];
        i++;
      }
      let countStr = '';
      while (i < formula.length && /[0-9]/.test(formula[i])) {
        countStr += formula[i];
        i++;
      }
      const count = countStr === '' ? 1 : parseInt(countStr, 10);
      const targetMap = stack[stack.length - 1];
      targetMap[elem] = (targetMap[elem] || 0) + count;
    } else {
      // Ignore spaces or other strange chars if they snuck in
      i++;
    }
  }

  return stack[0];
}

/**
 * Parses a full equation into reactants and products.
 * @param {string} equationStr - e.g. "H2 + O2 -> H2O"
 * @returns {{ reactants: string[], products: string[] } | null}
 */
export function parseEquationString(equationStr) {
  const sides = equationStr.split(/->|==?|=>/);
  if (sides.length !== 2) return null;

  const extractMolecules = (side) => {
    return side.split('+').map(t => t.trim()).filter(Boolean);
  };

  return {
    reactants: extractMolecules(sides[0]),
    products: extractMolecules(sides[1])
  };
}

/**
 * Calculates Greatest Common Divisor
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

/**
 * Calculates Least Common Multiple
 */
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Validates and balances a chemical equation if possible.
 * Returns null if invalid or impossible to balance.
 * Uses a basic Gaussian elimination method for linear systems.
 * @param {string} equationStr
 * @returns {{ balancedEq: string, state: 'balanced' | 'invalid' | 'impossible' }}
 */
export function processEquation(equationStr) {
  const parsed = parseEquationString(equationStr);
  if (!parsed) return { balancedEq: equationStr, state: 'invalid' };

  if (parsed.reactants.length === 0 || parsed.products.length === 0) {
    return { balancedEq: equationStr, state: 'invalid' };
  }

  // Check elements exist on both sides
  const reactElements = new Set();
  const prodElements = new Set();
  const reactMaps = parsed.reactants.map(m => {
    const p = parseFormula(m);
    Object.keys(p).forEach(k => reactElements.add(k));
    return p;
  });
  const prodMaps = parsed.products.map(m => {
    const p = parseFormula(m);
    Object.keys(p).forEach(k => prodElements.add(k));
    return p;
  });

  const checkTypo = () => {
    if (equationStr.includes('0')) return { balancedEq: equationStr, state: 'typo_zero' };
    return { balancedEq: equationStr, state: 'impossible' };
  };

  for (let elem of reactElements) {
    if (!prodElements.has(elem)) return checkTypo();
  }
  for (let elem of prodElements) {
    if (!reactElements.has(elem)) return checkTypo();
  }

  const allElements = Array.from(reactElements);

  // Matrix setup: Columns = [reactants] + [products]
  // Rows = [elements]
  // Coeffs: + for reactants, - for products
  const numReactants = parsed.reactants.length;
  const numProducts = parsed.products.length;
  const numCols = numReactants + numProducts;

  let matrix = allElements.map(elem => {
    let row = [];
    reactMaps.forEach(m => row.push(m[elem] || 0));
    prodMaps.forEach(m => row.push(-(m[elem] || 0)));
    return row;
  });

  // Basic row reduction
  let numRows = matrix.length;
  let lead = 0;
  for (let r = 0; r < numRows; r++) {
    if (numCols <= lead) break;
    let i = r;
    while (Math.abs(matrix[i][lead]) < 1e-9) {
      i++;
      if (numRows === i) {
        i = r;
        lead++;
        if (numCols === lead) {
          break;
        }
      }
    }
    if (numCols === lead) break;
    if (numCols > lead && matrix[i] && matrix[r]) {
      // Swap rows i and r
      let temp = matrix[i];
      matrix[i] = matrix[r];
      matrix[r] = temp;

      let val = matrix[r][lead];
      for (let j = 0; j < numCols; j++) {
        matrix[r][j] /= val;
      }
      for (let i2 = 0; i2 < numRows; i2++) {
        if (i2 !== r) {
          val = matrix[i2][lead];
          for (let j = 0; j < numCols; j++) {
            matrix[i2][j] -= val * matrix[r][j];
          }
        }
      }
      lead++;
    }
  }

  // Solve the reduced matrix.
  // Last column represents the free variable usually (for simple systems)
  // We assume 1 free variable since this is a balancing equation.
  // Let the last coefficient be 1, calculate other coefficients.
  // Then multiply by LCM of all denominators to get integers.
  let coeffs = new Array(numCols).fill(0);
  coeffs[numCols - 1] = 1; // set last product to 1

  // Back substitution for reduced row echelon form where last column is the right side
  // Actually, since it's A * x = 0, the last column coefficient is just expressing others in terms of it.
  for (let r = 0; r < numRows; r++) {
    // find the leading 1
    let leadCol = matrix[r].findIndex(val => Math.abs(val) > 1e-9);
    if (leadCol !== -1 && leadCol < numCols - 1) {
      // The coefficient of leadCol is -1 * sum of (other cols in row * their coefficients)
      // Since all other coeffs before last might be 0 in reduced form, and we set last to 1
      let sum = 0;
      for (let c = leadCol + 1; c < numCols; c++) {
        sum += matrix[r][c] * coeffs[c];
      }
      coeffs[leadCol] = -sum;
    }
  }

  // Clean float noise
  coeffs = coeffs.map(c => Math.round(c * 10000) / 10000);

  // If any coefficients are 0 or less, it means balancing failed or trivial sol.
  if (coeffs.some(c => c <= 0)) {
    if (equationStr.includes('0')) return { balancedEq: equationStr, state: 'typo_zero' };
    return { balancedEq: equationStr, state: 'impossible' };
  }

  // Convert floats to smallest integers
  // e.g. 0.5 -> 1/2 -> multiply all by 2.
  // A simple way is to find LCM of denominators of rational approx.
  const toFraction = (dec) => {
    let bestDen = 1;
    let minErr = 1;
    for (let d = 1; d <= 100; d++) {
      let err = Math.abs(Math.round(dec * d) - (dec * d));
      if (err < minErr) {
        minErr = err;
        bestDen = d;
      }
      if (err < 1e-5) break;
    }
    return bestDen;
  };

  let globalLcm = 1;
  coeffs.forEach(c => {
    let den = toFraction(c);
    globalLcm = lcm(globalLcm, den);
  });

  coeffs = coeffs.map(c => Math.round(c * globalLcm));

  // Assemble the balanced string
  const formatMolecules = (molecules, offset) => {
    return molecules.map((mol, idx) => {
      const c = coeffs[offset + idx];
      if (c === 1) return mol;
      return `${c}${mol}`;
    }).join(' + ');
  };

  const balancedReactants = formatMolecules(parsed.reactants, 0);
  const balancedProducts = formatMolecules(parsed.products, numReactants);

  return {
    balancedEq: `${balancedReactants} -> ${balancedProducts}`,
    state: 'balanced',
    coeffs: {
      reactants: coeffs.slice(0, numReactants),
      products: coeffs.slice(numReactants, numCols)
    }
  };
}
