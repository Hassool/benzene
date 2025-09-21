import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // safe to expose
  api_key: process.env.CLOUDINARY_API_KEY,                   // keep server-side only
  api_secret: process.env.CLOUDINARY_API_SECRET,             // keep server-side only
});

/**
 * Determine Cloudinary resource type based on URL or file extension
 * @param {string} url - The Cloudinary URL
 * @returns {string} - The resource type: "image", "video", or "raw"
 */
const determineResourceType = (url) => {
  if (!url || typeof url !== 'string') return 'image'; // default fallback
  
  // Check for video indicators in the URL
  if (url.includes('/video/') || url.includes('_video/')) {
    return 'video';
  }
  
  // Check for image indicators in the URL
  if (url.includes('/image/') || url.includes('_image/')) {
    return 'image';
  }
  
  // Check file extension
  const urlLower = url.toLowerCase();
  
  // Video extensions
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp', '.ogv'];
  const hasVideoExt = videoExtensions.some(ext => urlLower.includes(ext));
  if (hasVideoExt) return 'video';
  
  // Image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff'];
  const hasImageExt = imageExtensions.some(ext => urlLower.includes(ext));
  if (hasImageExt) return 'image';
  
  // Audio extensions (for completeness)
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const hasAudioExt = audioExtensions.some(ext => urlLower.includes(ext));
  if (hasAudioExt) return 'video'; // Cloudinary treats audio as video resource type
  
  // Default to image if we can't determine
  return 'image';
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string} - The public ID
 */
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const filename = parts.pop(); // e.g. aifgein3xy5rd3z7bmmp.jpg
    const publicIdWithExt = filename.split(".")[0]; // aifgein3xy5rd3z7bmmp
    
    // Remove version part (e.g., v1757879249)
    let versionIndex = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].startsWith('v') && /^v\d+$/.test(parts[i])) {
        versionIndex = i;
        break;
      }
    }
    
    if (versionIndex !== -1) {
      parts.splice(versionIndex, 1);
    }
    
    // Find the upload index
    const uploadIndex = parts.findIndex(part => part === "upload");
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL - 'upload' not found");
    }
    
    // Get folder path after upload
    const folderParts = parts.slice(uploadIndex + 1);
    const folder = folderParts.join("/");
    
    const publicId = folder
      ? `${folder}/${publicIdWithExt}`
      : publicIdWithExt;
    
    return publicId;
  } catch (error) {
    throw new Error(`Failed to extract public ID from URL: ${error.message}`);
  }
};

/**
 * Delete any Cloudinary asset by its full URL.
 * Automatically detects whether it's an image, video, or other resource type.
 * @param {string} url - The Cloudinary URL of the asset
 * @param {string} [resourceType] - Optional: specify resource type ("image", "video", "raw"). If not provided, will auto-detect.
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export async function deleteFromUrl(url, resourceType = null) {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }
    
    // Verify this is a Cloudinary URL
    if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
      throw new Error('URL is not a Cloudinary URL');
    }
    
    const publicId = extractPublicId(url);
    const detectedType = resourceType || determineResourceType(url);
    
    console.log(`Deleting Cloudinary asset:`, {
      url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
      publicId,
      resourceType: detectedType
    });
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: detectedType,
    });
    
    console.log(`Cloudinary deletion result:`, {
      result: result.result,
      publicId,
      resourceType: detectedType
    });
    
    // Check if deletion was successful
    if (result.result === 'ok') {
      console.log(`Successfully deleted ${detectedType}: ${publicId}`);
    } else if (result.result === 'not found') {
      console.warn(`Asset not found for deletion: ${publicId} (${detectedType})`);
    } else {
      console.warn(`Unexpected deletion result: ${result.result} for ${publicId}`);
    }
    
    return result;
  } catch (err) {
    console.error("Error deleting Cloudinary asset:", {
      error: err.message,
      url: url?.substring(0, 100) + (url?.length > 100 ? '...' : ''),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    throw err;
  }
}

/**
 * Delete multiple Cloudinary assets by their URLs
 * @param {string[]} urls - Array of Cloudinary URLs
 * @returns {Promise<Object[]>} - Array of deletion results
 */
export async function deleteMultipleFromUrls(urls) {
  if (!Array.isArray(urls)) {
    throw new Error('URLs must be provided as an array');
  }
  
  console.log(`Deleting ${urls.length} Cloudinary assets...`);
  
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await deleteFromUrl(url);
      results.push({ url, success: true, result });
    } catch (error) {
      console.error(`Failed to delete ${url}:`, error.message);
      results.push({ url, success: false, error: error.message });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`Batch deletion completed: ${successful} successful, ${failed} failed`);
  
  return results;
}