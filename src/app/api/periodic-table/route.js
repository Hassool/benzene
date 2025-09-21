// app/api/periodic-table/route.js
import PeriodicTable from '@/data/PeriodicTable';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    
    // If symbol parameter is provided, return specific element
    if (symbol) {
      const element = PeriodicTable.find(
        el => el.symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (!element) {
        return NextResponse.json(
          { error: `Element with symbol '${symbol}' not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: element
      });
    }
    
    // Return all elements if no symbol specified
    return NextResponse.json({
      success: true,
      data: PeriodicTable,
      count: PeriodicTable.length
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}