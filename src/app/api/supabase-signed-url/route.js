// src/app/api/supabase-signed-url/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client using service key for server-side operations
const supabase = createClient(
  /*process.env.NEXT_PUBLIC_SUPABASE_URL*/'https://zyxlnqalmpafyijulfuv.storage.supabase.co/storage/v1/s3',
  process.env.SUPABASE_SERVICE_KEY
);

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if it's a Supabase URL
    const isSupabaseUrl = url.includes('supabase.co');
    
    if (!isSupabaseUrl) {
      return NextResponse.json({ 
        signedUrl: url,
        isSupabase: false 
      });
    }

    // Extract the path from the URL
    let path = '';
    try {
      const urlObj = new URL(url);
      // Get the path after bucket name
      const pathParts = urlObj.pathname.split('/');
      // Remove empty parts and bucket name
      const filteredParts = pathParts.filter(part => part !== '' && !part.includes('storage'));
      path = filteredParts.join('/');
    } catch (error) {
      console.error('Error parsing URL:', error);
      return NextResponse.json({ 
        error: 'Invalid URL format',
        url
      }, { status: 400 });
    }

    // Create signed URL for viewing (valid for 24 hours)
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME)
      .createSignedUrl(path, 86400); // 24 hours expiration
    
    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      signedUrl: data.signedUrl,
      path,
      isSupabase: true,
      expiresIn: 86400
    });

  } catch (error) {
    console.error('Signed URL API error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate signed URL',
      message: error.message
    }, { status: 500 });
  }
}

// GET method for testing
export async function GET(request) {
  return NextResponse.json({ 
    message: 'Supabase Signed URL API is working. Use POST method with { url: "supabase-url" } to generate signed URLs for viewing.',
    supabaseConfigured: !!(/*process.env.NEXT_PUBLIC_SUPABASE_URL*/'https://zyxlnqalmpafyijulfuv.storage.supabase.co/storage/v1/s3' && process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY),
    timestamp: new Date().toISOString()
  });
}