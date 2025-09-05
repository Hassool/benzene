// src/app/api/convert/route.js

import { NextResponse } from "next/server";

const conversions = {
  length: {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    μm: 0.000001, // micrometer
    nm: 0.000000001, // nanometer
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.34,
    nmi: 1852, // nautical mile
    ly: 9.461e15, // light year
    au: 1.496e11, // astronomical unit
  },
  mass: {
    g: 1,
    kg: 1000,
    mg: 0.001,
    μg: 0.000001, // microgram
    t: 1000000, // metric ton
    lb: 453.592,
    oz: 28.3495,
    st: 6350.29, // stone
    ton: 907185, // US ton
  },
  volume: {
    L: 1,
    mL: 0.001,
    m3: 1000,
    cm3: 0.001,
    mm3: 0.000001,
    gal: 3.78541, // US gallon
    qt: 0.946353, // US quart
    pt: 0.473176, // US pint
    cup: 0.24,
    fl_oz: 0.0295735, // fluid ounce
    tbsp: 0.0147868, // tablespoon
    tsp: 0.00492892, // teaspoon
    bbl: 158.987, // barrel (oil)
    "gal_uk": 4.54609, // UK gallon
  },
  area: {
    m2: 1, // square meter (base)
    km2: 1000000, // square kilometer
    cm2: 0.0001, // square centimeter
    mm2: 0.000001, // square millimeter
    ha: 10000, // hectare
    acre: 4046.86, // acre
    ft2: 0.092903, // square foot
    in2: 0.00064516, // square inch
    yd2: 0.836127, // square yard
    mi2: 2590000, // square mile
  },
  speed: {
    "m/s": 1, // meters per second (base)
    "km/h": 0.277778, // kilometers per hour
    "mph": 0.44704, // miles per hour
    "ft/s": 0.3048, // feet per second
    knot: 0.514444, // nautical miles per hour
    "cm/s": 0.01, // centimeters per second
    mach: 343, // speed of sound (approximate)
  },
  pressure: {
    Pa: 1, // Pascal (base)
    kPa: 1000, // kilopascal
    MPa: 1000000, // megapascal
    bar: 100000, // bar
    atm: 101325, // atmosphere
    psi: 6894.76, // pounds per square inch
    torr: 133.322, // torr
    mmHg: 133.322, // millimeters of mercury
  },
  energy: {
    J: 1, // Joule (base)
    kJ: 1000, // kilojoule
    MJ: 1000000, // megajoule
    cal: 4.184, // calorie
    kcal: 4184, // kilocalorie
    Wh: 3600, // watt hour
    kWh: 3600000, // kilowatt hour
    BTU: 1055.06, // British thermal unit
    eV: 1.602e-19, // electron volt
  },
  power: {
    W: 1, // Watt (base)
    kW: 1000, // kilowatt
    MW: 1000000, // megawatt
    hp: 745.7, // horsepower
    BTU_h: 0.293071, // BTU per hour
    "ft·lb/s": 1.35582, // foot-pound per second
  },
  time: {
    s: 1, // second (base)
    ms: 0.001, // millisecond
    μs: 0.000001, // microsecond
    min: 60, // minute
    h: 3600, // hour
    day: 86400, // day
    week: 604800, // week
    month: 2629800, // month (average)
    year: 31557600, // year (average)
    decade: 315576000, // decade
    century: 3155760000, // century
  },
  angle: {
    rad: 1, // radian (base)
    deg: 0.0174533, // degree
    grad: 0.015708, // gradian
    rev: 6.28319, // revolution
    arcmin: 0.000290888, // arc minute
    arcsec: 0.00000484814, // arc second
  },
  frequency: {
    Hz: 1, // Hertz (base)
    kHz: 1000, // kilohertz
    MHz: 1000000, // megahertz
    GHz: 1000000000, // gigahertz
    rpm: 0.0166667, // revolutions per minute
  },
  data: {
    B: 1, // Byte (base)
    KB: 1024, // Kilobyte
    MB: 1048576, // Megabyte
    GB: 1073741824, // Gigabyte
    TB: 1099511627776, // Terabyte
    PB: 1125899906842624, // Petabyte
    bit: 0.125, // bit
    Kbit: 128, // Kilobit
    Mbit: 131072, // Megabit
    Gbit: 134217728, // Gigabit
  },
  temperature: "special", // handled separately
};

// Temperature conversion functions
function convertTemperature(value, from, to) {
  if (from === to) return value;
  
  let celsius;
  
  // Convert to Celsius first
  switch (from) {
    case "C": celsius = value; break;
    case "F": celsius = (value - 32) * 5 / 9; break;
    case "K": celsius = value - 273.15; break;
    case "R": celsius = (value - 491.67) * 5 / 9; break; // Rankine
    default: throw new Error(`Unsupported temperature unit: ${from}`);
  }
  
  // Convert from Celsius to target
  switch (to) {
    case "C": return celsius;
    case "F": return celsius * 9 / 5 + 32;
    case "K": return celsius + 273.15;
    case "R": return (celsius + 273.15) * 9 / 5; // Rankine
    default: throw new Error(`Unsupported temperature unit: ${to}`);
  }
}

// Get all available units for a category
function getUnitsForCategory(category) {
  if (category === "temperature") {
    return ["C", "F", "K", "R"];
  }
  return Object.keys(conversions[category] || {});
}

// Find which category a unit belongs to
function findUnitCategory(unit) {
  for (const [category, units] of Object.entries(conversions)) {
    if (category === "temperature" && ["C", "F", "K", "R"].includes(unit)) {
      return "temperature";
    }
    if (units !== "special" && units[unit]) {
      return category;
    }
  }
  return null;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const value = parseFloat(searchParams.get("value"));
  const list = searchParams.get("list"); // Optional: list available units

  // If list parameter is provided, return available conversions
  if (list === "true" || list === "categories") {
    const categories = Object.keys(conversions).map(cat => ({
      category: cat,
      units: getUnitsForCategory(cat)
    }));
    
    return NextResponse.json({
      success: true,
      categories,
      totalCategories: categories.length,
      totalUnits: categories.reduce((sum, cat) => sum + cat.units.length, 0)
    });
  }

  // Validate input parameters
  if (!from || !to) {
    return NextResponse.json({ 
      success: false, 
      error: "Missing 'from' or 'to' parameters" 
    }, { status: 400 });
  }

  if (isNaN(value)) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid or missing 'value' parameter" 
    }, { status: 400 });
  }

  try {
    // Handle temperature conversion
    if (["C", "F", "K", "R"].includes(from) && ["C", "F", "K", "R"].includes(to)) {
      const result = convertTemperature(value, from, to);
      return NextResponse.json({ 
        success: true, 
        result,
        from,
        to,
        originalValue: value,
        category: "temperature"
      });
    }

    // Find the category for the units
    const fromCategory = findUnitCategory(from);
    const toCategory = findUnitCategory(to);

    if (!fromCategory || !toCategory) {
      return NextResponse.json({ 
        success: false, 
        error: `Unsupported units: ${!fromCategory ? from : to}` 
      }, { status: 400 });
    }

    if (fromCategory !== toCategory) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot convert between different categories: ${fromCategory} and ${toCategory}` 
      }, { status: 400 });
    }

    // Perform the conversion
    const category = conversions[fromCategory];
    const baseValue = value * category[from]; // convert to base unit
    const result = baseValue / category[to]; // convert to target unit

    return NextResponse.json({ 
      success: true, 
      result,
      from,
      to,
      originalValue: value,
      category: fromCategory
    });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Conversion failed" 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { from, to, value, batch } = await req.json();

    // Handle batch conversions
    if (batch && Array.isArray(batch)) {
      const results = [];
      
      for (const conversion of batch) {
        const { from: bFrom, to: bTo, value: bValue } = conversion;
        
        // Create a mock request for each conversion
        const mockUrl = new URL('http://localhost');
        mockUrl.searchParams.set('from', bFrom);
        mockUrl.searchParams.set('to', bTo);
        mockUrl.searchParams.set('value', bValue.toString());
        
        const mockReq = { url: mockUrl.toString() };
        const response = await GET(mockReq);
        const data = await response.json();
        
        results.push({
          ...conversion,
          ...data
        });
      }
      
      return NextResponse.json({
        success: true,
        results,
        count: results.length
      });
    }

    // Single conversion via POST
    if (from && to && value !== undefined) {
      const mockUrl = new URL('http://localhost');
      mockUrl.searchParams.set('from', from);
      mockUrl.searchParams.set('to', to);
      mockUrl.searchParams.set('value', value.toString());
      
      const mockReq = { url: mockUrl.toString() };
      return GET(mockReq);
    }

    return NextResponse.json({ 
      success: false, 
      error: "Invalid POST data format" 
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid JSON in request body" 
    }, { status: 400 });
  }
}

// Health check and API info
export async function OPTIONS(req) {
  const categories = Object.keys(conversions);
  const totalUnits = categories.reduce((sum, cat) => {
    return sum + getUnitsForCategory(cat).length;
  }, 0);

  return NextResponse.json({
    status: "OK",
    methods: ["GET", "POST", "OPTIONS"],
    version: "2.0.0",
    description: "Universal Unit Conversion API",
    features: [
      "Multiple conversion categories",
      "Batch conversions",
      "Temperature conversions",
      "Unit listing"
    ],
    categories: categories.length,
    totalUnits,
    endpoints: {
      "GET": "?from=unit&to=unit&value=number",
      "GET (list)": "?list=true",
      "POST": "{ from, to, value } or { batch: [...] }"
    },
    examples: {
      length: "?from=m&to=ft&value=10",
      temperature: "?from=C&to=F&value=25",
      batch: "POST: { batch: [{ from: 'm', to: 'ft', value: 10 }] }"
    }
  });
}