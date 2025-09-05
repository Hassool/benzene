// src/app/api/balance/route.js
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const equation = searchParams.get("equation");

  if (!equation) {
    return NextResponse.json({ 
      success: false, 
      error: "No equation provided" 
    }, { status: 400 });
  }

  // Validate equation format (basic check)
  if (!equation.includes("=")) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid equation format. Must contain '=' symbol." 
    }, { status: 400 });
  }

  // URL encode the equation properly
  const encoded = equation
    .replace(/\+/g, "%2B")    // Plus signs
    .replace(/=/g, "%3D")     // Equals sign
    .replace(/ /g, "+")       // Spaces
    .replace(/\(/g, "%28")    // Opening parenthesis
    .replace(/\)/g, "%29");   // Closing parenthesis

  const url = `https://www.webqc.org/balance.php?reaction=${encoded}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.webqc.org/'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Check if the page indicates an error or invalid equation
    if (html.includes("Invalid equation") || html.includes("Error")) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid chemical equation format" 
      }, { status: 400 });
    }

    const $ = cheerio.load(html);

    // Method 1: Look for "Balanced equation:" text
    let balanced = null;
    
    $("*").each((_, el) => {
      const text = $(el).text();
      if (text.includes("Balanced equation:")) {
        const match = text.match(/Balanced equation:\s*(.+?)(?:\n|$)/);
        if (match) {
          balanced = match[1].trim();
        }
      }
    });

    // Method 2: Alternative parsing if first method fails
    if (!balanced) {
      const bodyText = $("body").text();
      const match = bodyText.match(/Balanced equation:\s*([^\n\r]+)/i);
      if (match) {
        balanced = match[1].trim();
      }
    }

    // Method 3: Look for patterns in the HTML structure
    if (!balanced) {
      $("b, strong").each((_, el) => {
        const $el = $(el);
        if ($el.text().toLowerCase().includes("balanced equation")) {
          const nextText = $el.parent().text();
          const match = nextText.match(/balanced equation:\s*([^\n\r]+)/i);
          if (match) {
            balanced = match[1].trim();
          }
        }
      });
    }

    if (balanced) {
      // Clean up the result
      balanced = balanced
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/^\s*:\s*/, '') // Remove leading colon
        .trim();

      return NextResponse.json({ 
        success: true, 
        balanced,
        original: equation 
      });
    }

    // If no balanced equation found, try to extract any chemistry-related content
    const pageTitle = $("title").text();
    if (pageTitle.includes("balanced chemical equation")) {
      const titleMatch = pageTitle.match(/^([^-]+)/);
      if (titleMatch) {
        balanced = titleMatch[1].trim();
        return NextResponse.json({ 
          success: true, 
          balanced,
          original: equation,
          source: "title"
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: "Could not parse balanced equation from response",
      debug: process.env.NODE_ENV === 'development' ? { url, htmlLength: html.length } : undefined
    }, { status: 422 });

  } catch (err) {
    console.error("Balance API Error:", err);
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to balance equation: ${err.message}`,
      debug: process.env.NODE_ENV === 'development' ? { url, originalError: err.toString() } : undefined
    }, { status: 500 });
  }
}

// Optional: Add POST support for more complex equations
export async function POST(req) {
  try {
    const { equation } = await req.json();
    
    if (!equation) {
      return NextResponse.json({ 
        success: false, 
        error: "No equation provided in request body" 
      }, { status: 400 });
    }

    // Redirect to GET method
    const url = new URL(req.url);
    url.searchParams.set('equation', equation);
    
    return GET({ url: url.toString() });
    
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: "Invalid JSON in request body" 
    }, { status: 400 });
  }
}