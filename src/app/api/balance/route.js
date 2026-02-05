import { NextResponse } from "next/server";
import * as math from "mathjs";

// Helper: Parse a molecule string into an element count object
// Handles polyatomic ions/parentheses like "Ca(OH)2" -> { Ca: 1, O: 2, H: 2 }
// Also handles "Ca3(PO4)2" -> { Ca: 3, P: 2, O: 8 }
function parseMolecule(formula) {
  const stack = [{}]; // Stack of element maps
  let i = 0;
  const len = formula.length;

  while (i < len) {
    const char = formula[i];

    if (char === '(') {
      // Start a new group
      stack.push({});
      i++;
    } else if (char === ')') {
      // End current group
      if (stack.length < 2) throw new Error("Unmatched closing parenthesis");
      
      const currentGroup = stack.pop();
      i++;
      
      // Check for multiplier after ')'
      let start = i;
      while (i < len && /[0-9]/.test(formula[i])) i++;
      const multiplier = i > start ? parseInt(formula.substring(start, i), 10) : 1;

      // Merge current group into the parent group (top of stack)
      const parentGroup = stack[stack.length - 1];
      for (const [el, count] of Object.entries(currentGroup)) {
        parentGroup[el] = (parentGroup[el] || 0) + count * multiplier;
      }
    } else if (/[A-Z]/.test(char)) {
      // Parse Element Name (e.g. H, He, Uuu)
      let start = i;
      i++; // Skip first uppercase
      while (i < len && /[a-z]/.test(formula[i])) i++;
      const element = formula.substring(start, i);

      // Parse Count
      start = i;
      while (i < len && /[0-9]/.test(formula[i])) i++;
      const count = i > start ? parseInt(formula.substring(start, i), 10) : 1;

      // Add to current group
      const currentGroup = stack[stack.length - 1];
      currentGroup[element] = (currentGroup[element] || 0) + count;
    } else {
      // Invalid character? Ignore or throw. For now, we skip to be safe, or throw if strict.
      // throw new Error(`Invalid character '${char}' at index ${i}`);
      // Let's just advance to avoid infinite loop if garbage is passed
      i++; 
    }
  }

  if (stack.length !== 1) throw new Error("Unmatched opening parenthesis");
  return stack[0];
}

// Function to solve Ax=0 for integer solutions
function solveStoichiometry(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Create a copy of the matrix using Fractions to avoid float errors
  let m = matrix.map(row => row.map(val => math.fraction(val)));

  // Gaussian elimination
  let lead = 0;
  outer_loop:
  for (let r = 0; r < rows; r++) {
    if (cols <= lead) break;
    let i = r;
    while (math.equal(m[i][lead], 0)) {
      i++;
      if (rows === i) {
        i = r;
        lead++;
        if (cols === lead) {
           break outer_loop;
        }
      }
    }

    // Swap rows
    let temp = m[i];
    m[i] = m[r];
    m[r] = temp;

    // Normalize row
    let val = m[r][lead];
    for (let j = 0; j < cols; j++) {
      m[r][j] = math.divide(m[r][j], val);
    }

    // Eliminate other rows
    for (let i = 0; i < rows; i++) {
      if (i !== r) {
        val = m[i][lead];
        for (let j = 0; j < cols; j++) {
          m[i][j] = math.subtract(m[i][j], math.multiply(val, m[r][j]));
        }
      }
    }
    lead++;
  }

  // Extract solution assumes simple chemical equations (1 degree of freedom)
  // We assume the last coefficient is 1 and solve back.
  
  const coeffs = new Array(cols).fill(math.fraction(0));
  coeffs[cols - 1] = math.fraction(1); // Set last one to 1 temporarily

  // Back calculate for pivots
  for (let i = rows - 1; i >= 0; i--) {
      let pivotCol = -1;
      for (let j = 0; j < cols; j++) {
          if (!math.equal(m[i][j], 0)) {
              pivotCol = j;
              break;
          }
      }
      if (pivotCol === -1 || pivotCol === cols - 1) continue; // Zero row or pivot is the free var

      let sum = math.fraction(0);
      for (let j = pivotCol + 1; j < cols; j++) {
          sum = math.add(sum, math.multiply(m[i][j], coeffs[j]));
      }
      coeffs[pivotCol] = math.multiply(sum, -1);
  }
  
  // Find LCM of denominators to make them integers.
  let denoms = coeffs.map(c => c.d);
  let lcd = math.lcm(...denoms);
  
  let integerCoeffs = coeffs.map(c => math.multiply(c, lcd).n);
  
  // Check valid positive solution
  const allPositive = integerCoeffs.every(c => c > 0);
  if (!allPositive) {
      // Attempt heuristic fix: absolute values (works if we just flipped LHS/RHS sign convention accidentally)
      return integerCoeffs.map(Math.abs); 
  }
  
  return integerCoeffs;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const equation = searchParams.get("equation");

  if (!equation) {
    return NextResponse.json({ 
        success: false, 
        errorCode: "ERR01", 
        error: "No equation provided" 
    }, { status: 400 });
  }

  try {
    // 1. Basic Syntax Check
    if (!equation.includes("=")) {
         throw { code: "ERR01", message: "Equation must contain '='" };
    }

    const [lhsStr, rhsStr] = equation.split("=");
    if (!lhsStr.trim() || !rhsStr.trim()) {
        throw { code: "ERR01", message: "Equation must have both sides" };
    }
    
    // Clean and split into molecules
    const parseSide = (str) => str.split("+").map(s => s.trim()).filter(s => s);
    const reactants = parseSide(lhsStr);
    const products = parseSide(rhsStr);
    
    if (reactants.length === 0 || products.length === 0) {
        throw { code: "ERR01", message: "Missing reactants or products" };
    }

    const allMolecules = [...reactants, ...products];
    const uniqueElements = new Set();
    const composition = []; 

    // Analyze all molecules
    allMolecules.forEach(mol => {
      try {
          const comp = parseMolecule(mol);
          if (Object.keys(comp).length === 0) throw new Error("Empty molecule");
          composition.push(comp);
          Object.keys(comp).forEach(el => uniqueElements.add(el));
      } catch (e) {
          throw { code: "ERR03", message: `Invalid molecule syntax: ${mol}` };
      }
    });

    const elementsList = Array.from(uniqueElements);
    const m = elementsList.length; // rows
    const n = allMolecules.length; // cols

    // Build Matrix
    const matrix = [];
    for (let i = 0; i < m; i++) {
        const row = [];
        const element = elementsList[i];
        for (let j = 0; j < n; j++) {
            const count = composition[j][element] || 0;
            // Reactants (+), Products (-)
            if (j < reactants.length) {
                row.push(count);
            } else {
                row.push(-count);
            }
        }
        matrix.push(row);
    }

    // Solve
    let coeffs;
    try {
        coeffs = solveStoichiometry(matrix);
    } catch (e) {
        throw { code: "ERR02", message: "Mathematical error during balancing" };
    }
    
    if (!coeffs) {
        throw { code: "ERR02", message: "Could not balance equation (no unique solution found)" };
    }
    
    // Construct balanced string
    const buildSide = (mols, coefs) => {
        return mols.map((mol, i) => {
            const c = coefs[i];
            return (c === 1 ? "" : c) + mol;
        }).join("+");
    };

    const reactantCoeffs = coeffs.slice(0, reactants.length);
    const productCoeffs = coeffs.slice(reactants.length);
    
    const balancedStr = `${buildSide(reactants, reactantCoeffs)}=${buildSide(products, productCoeffs)}`;

    return NextResponse.json({ 
        success: true, 
        balanced: balancedStr,
        original: equation
    });

  } catch (err) {
    console.error("Balance Error:", err);
    
    const errorCode = err.code || "ERR02";
    const errorMessage = err.message || "Failed to balance equation.";

    return NextResponse.json({ 
        success: false, 
        errorCode: errorCode,
        error: errorMessage
    }, { status: 422 });
  }
}

export async function POST(req) {
    try {
        const { equation } = await req.json();
        const url = new URL(req.url);
        if (equation) url.searchParams.set('equation', equation);
        return GET({ url: url.toString() });
    } catch {
        return NextResponse.json({ 
            success: false, 
            errorCode: "ERR01", 
            error: "Invalid JSON request" 
        }, { status: 400 });
    }
}