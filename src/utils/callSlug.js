/**
 * Utility functions for generating and parsing call slugs for better URLs
 * Uses base64url encoding to make ObjectIds shorter and URL-friendly
 */

/**
 * Encode ObjectId to base64url (URL-safe base64)
 * @param {string} objectId - MongoDB ObjectId (24 hex characters)
 * @returns {string} - Base64url encoded string
 */
function encodeObjectId(objectId) {
  if (!objectId) return null;
  
  // Convert hex string to Buffer, then to base64url
  const buffer = Buffer.from(objectId, 'hex');
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); // Remove padding
}

/**
 * Decode base64url back to ObjectId
 * @param {string} encoded - Base64url encoded string
 * @returns {string|null} - ObjectId or null if invalid
 */
function decodeObjectId(encoded) {
  if (!encoded) return null;
  
  try {
    // Add padding if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const buffer = Buffer.from(base64, 'base64');
    return buffer.toString('hex');
  } catch (error) {
    return null;
  }
}

/**
 * Generate a readable slug from call data
 * Format: {base64url} or {leadName}-{base64url}
 * @param {string} callId - The full MongoDB ObjectId
 * @param {object} call - Optional call object with lead information
 * @returns {string} - A readable slug
 */
export function generateCallSlug(callId, call = null) {
  if (!callId) return null;

  // Encode ObjectId to base64url (much shorter: 24 hex chars -> 16 base64url chars)
  const encodedId = encodeObjectId(callId.toString());
  if (!encodedId) return callId; // Fallback to original if encoding fails

  // If we have call data with lead information, create a more descriptive slug
  if (call?.leadId && call?.lead) {
    const leadName = call.lead.name || call.lead.email || 'lead';
    // Convert to URL-friendly slug
    const leadSlug = leadName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30); // Limit length
    
    return `${leadSlug}-${encodedId}`;
  }

  // Default format: just the encoded ID (shorter and cleaner)
  return encodedId;
}

/**
 * Extract the callId from a slug
 * Handles both old format (full ObjectId) and new slug format
 * @param {string} slug - The slug from the URL
 * @returns {string|null} - The callId or null if invalid
 */
export function parseCallSlug(slug) {
  if (!slug) return null;

  // If it's already a full ObjectId (24 hex characters), return it
  if (slug.length === 24 && /^[0-9a-fA-F]{24}$/.test(slug)) {
    return slug;
  }

  // Try to decode from base64url
  // If slug contains a hyphen, extract the last part (the encoded ID)
  if (slug.includes('-')) {
    const parts = slug.split('-');
    const encodedId = parts[parts.length - 1];
    const decoded = decodeObjectId(encodedId);
    if (decoded && decoded.length === 24) {
      return decoded;
    }
  } else {
    // No hyphen, try to decode the whole slug
    const decoded = decodeObjectId(slug);
    if (decoded && decoded.length === 24) {
      return decoded;
    }
  }

  // If decoding failed, return the slug as-is (might be an old format)
  return slug;
}

/**
 * Get a display-friendly URL for a call
 * @param {string} callId - The full MongoDB ObjectId
 * @param {object} call - Optional call object
 * @returns {string} - The URL path
 */
export function getCallUrl(callId, call = null) {
  const slug = generateCallSlug(callId, call);
  return `/sales/calls/${slug}`;
}

