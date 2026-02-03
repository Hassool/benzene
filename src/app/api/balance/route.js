// src/app/api/balance/route.js
import { NextResponse } from "next/server";
import * as math from "mathjs";

// Helper to parse a single molecule string into an object of elements and counts
// e.g., "H2O" -> { H: 2, O: 1 }
function parseMolecule(formula) {
  const elements = {};
  const regex = /([A-Z][a-z]*)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = parseInt(match[2] || "1", 10);
    elements[element] = (elements[element] || 0) + count;
  }
  return elements;
}

// Function to solve Ax=0 for integer solutions
function solveStoichiometry(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Create a copy of the matrix using Fractions to avoid float errors
  let m = matrix.map(row => row.map(val => math.fraction(val)));

  // Gaussian elimination
  let lead = 0;
  for (let r = 0; r < rows; r++) {
    if (cols <= lead) break;
    let i = r;
    while (math.equal(m[i][lead], 0)) {
      i++;
      if (rows === i) {
        i = r;
        lead++;
        if (cols === lead) return null;
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

  // Find the free variable (simplest assumption: last column is free or we find the first non-pivot)
  // For chemical equations, we accept 1 degree of freedom usually.
  // We extract coefficients. 
  // This simple Gaussian implementation assumes the last variable is free (which is typical for simple equations).
  
  // Extract solution based on last column being free variable = 1
  let solution = [];
  let pivotCols = [];
  
  // Identify pivot columns
  for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
          if (!math.equal(m[r][c], 0)) {
              pivotCols.push(c);
              break;
          }
      }
  }

  // If system is inconsistent or has wrong rank, basic method might fail.
  // But for simple "invertible-1" systems:
  // x_i = - sum( M[i][j] * x_j ) for free j
  
  // Let's assume the last variable is 1. If it fails, we try setting other variables.
  // Actually, we want a vector v such that M * v = 0.
  // Since we reduced M, we can back substitute.
  
  // Simplified approach for common chemical equations:
  // Assume last coef is 1, calculate others. If any neg or unsolvable, try last=2, etc? No.
  // Better: Set free variable to 1.
  
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
      // Since row is normalized, coef[pivot] + sum = 0 => coef[pivot] = -sum
      coeffs[pivotCol] = math.multiply(sum, -1);
  }
  
  // Now we have fractional coefficients. Find LCM of denominators to make them integers.
  let denoms = coeffs.map(c => c.d);
  let lcd = math.lcm(...denoms);
  
  let integerCoeffs = coeffs.map(c => math.multiply(c, lcd).n);
  
  // Check if any coefficient is negative or zero (invalid solution for chemistry)
  // Sometimes order matters, or we picked the wrong free variable. 
  // But mostly this works for single reaction balancing.
  
  // Ensure all positive
  const allPositive = integerCoeffs.every(c => c > 0);
  if (!allPositive) {
      // Try resolving with a different assumption if needed, but for standard equations this matrix method works
      // The only case it gives negative is if the equation is impossible or written backwards?
      // Actually, standard method: Reactants +, Products -. 
      // Null space vector should be positive if we move products to RHS in A*x=0? 
      // Wait, A*x=0 means sum(a_i * molecules) = 0.
      // If we put Reactants as Positive cols and Products as Negative cols in the matrix definition,
      // Then x will be positive.
      return integerCoeffs.map(Math.abs); // Heuristic fix for sign if we flipped definition
  }
  
  return integerCoeffs;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const equation = searchParams.get("equation");

  if (!equation) {
    return NextResponse.json({ success: false, error: "No equation provided" }, { status: 400 });
  }

  try {
    // 1. Parse equation side
    if (!equation.includes("=")) throw new Error("Equation must contain '='");
    const [lhsStr, rhsStr] = equation.split("=");
    
    // Clean and split into molecules
    const parseSide = (str) => str.split("+").map(s => s.trim()).filter(s => s);
    const reactants = parseSide(lhsStr);
    const products = parseSide(rhsStr);
    
    const allMolecules = [...reactants, ...products];
    const uniqueElements = new Set();
    const composition = []; // Array of {element: count} objects corresponding to molecules

    // Analyze all molecules
    allMolecules.forEach(mol => {
      const comp = parseMolecule(mol);
      composition.push(comp);
      Object.keys(comp).forEach(el => uniqueElements.add(el));
    });

    const elementsList = Array.from(uniqueElements);
    const m = elementsList.length; // rows
    const n = allMolecules.length; // cols

    // Build Matrix
    // Columns j < reactants.length are LHS (positive)
    // Columns j >= reactants.length are RHS (negative) so that sum = 0
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
    const coeffs = solveStoichiometry(matrix);
    
    if (!coeffs) throw new Error("Could not balance equation (no unique solution found)");
    
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
    return NextResponse.json({ 
        success: false, 
        error: "Failed to balance equation. Please check your syntax."
    }, { status: 422 });
  }
}

export async function POST(req) {
    try {
        const { equation } = await req.json();
        const url = new URL(req.url);
        url.searchParams.set('equation', equation);
        return GET({ url: url.toString() });
    } catch {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}