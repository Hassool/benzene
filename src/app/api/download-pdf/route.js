// src/app/api/download-pdf/route.js - Fixed Supabase version
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client using service key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY  // Fixed: use the correct env var name
);

export async function POST(request) {
  try {
    const { url, filename } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if it's a Supabase URL
    const isSupabaseUrl = url.includes('supabase.co');
    
    if (!isSupabaseUrl) {
      // For non-Supabase URLs, just return the original URL
      return NextResponse.json({ 
        downloadUrl: url,
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

    // Get bucket name from environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME;
    
    if (!bucketName) {
      return NextResponse.json({ 
        error: 'NEXT_PUBLIC_SUPABASE_BUCKET_NAME environment variable is not set'
      }, { status: 500 });
    }

    // Create signed URL for download (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(bucketName)  // Fixed: use the correct bucket name variable
      .createSignedUrl(path, 3600); // 1 hour expiration
    
    if (error) {
      console.error('Supabase signed URL error:', error);
      if (error.message.includes('storage.buckets.not_found')) {
        return NextResponse.json({ 
          error: `Bucket "${bucketName}" not found. Please create it in your Supabase dashboard.`
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ 
      downloadUrl: data.signedUrl,
      path,
      isSupabase: true,
      expiresIn: 3600,
      bucketName  // Added for debugging
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URL',
      message: error.message
    }, { status: 500 });
  }
}

// GET method for testing
export async function GET(request) {
  return NextResponse.json({ 
    message: 'Download API is working with Supabase Storage. Use POST method with { url: "supabase-url", filename: "optional-filename" } to generate download URLs.',
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY),
    bucketName: process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME,
    timestamp: new Date().toISOString()
  });
}