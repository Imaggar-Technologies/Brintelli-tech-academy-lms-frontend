import { API_BASE_URL } from '../api/constant';

/**
 * Extract S3 key from S3 URL
 * @param {string} url - S3 URL (e.g., https://bucket.s3.region.amazonaws.com/folder/file.pdf)
 * @returns {string|null} - S3 key or null if not an S3 URL
 */
export const extractS3Key = (url) => {
  if (!url) return null;
  
  // Check if it's an S3 URL
  if (url.includes('s3.amazonaws.com')) {
    const urlParts = url.split('/');
    const s3Index = urlParts.findIndex(part => part.includes('.amazonaws.com'));
    if (s3Index !== -1 && s3Index < urlParts.length - 1) {
      return urlParts.slice(s3Index + 1).join('/');
    }
  }
  
  // Check if it's a CloudFront URL
  if (url.includes('cloudfront.net')) {
    const urlParts = url.split('/');
    const cfIndex = urlParts.findIndex(part => part.includes('cloudfront.net'));
    if (cfIndex !== -1 && cfIndex < urlParts.length - 1) {
      return urlParts.slice(cfIndex + 1).join('/');
    }
  }
  
  return null;
};

/**
 * Get proxy URL for S3 file (bypasses CORS)
 * @param {string|null|undefined} url - Original URL (S3 or local)
 * @param {string|null|undefined} fileKey - Optional S3 file key
 * @returns {string} - Proxy URL or original URL
 */
export const getProxyUrl = (url, fileKey = null) => {
  // If no URL and no fileKey, return empty string
  if (!url && !fileKey) {
    return '';
  }
  
  // If we have a fileKey, use it directly
  if (fileKey) {
    return `${API_BASE_URL}/api/upload/proxy/${encodeURIComponent(fileKey)}`;
  }
  
  // If no URL, return empty string
  if (!url) {
    return '';
  }
  
  // Try to extract S3 key from URL
  const s3Key = extractS3Key(url);
  if (s3Key) {
    return `${API_BASE_URL}/api/upload/proxy/${encodeURIComponent(s3Key)}`;
  }
  
  // For local URLs, return as-is
  if (url.startsWith('http://localhost') || url.startsWith('https://localhost') || url.startsWith('/uploads')) {
    return url;
  }
  
  // For other URLs, return as-is (external links)
  return url;
};

/**
 * Check if URL is from S3
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isS3Url = (url) => {
  if (!url) return false;
  return url.includes('s3.amazonaws.com') || url.includes('cloudfront.net');
};

