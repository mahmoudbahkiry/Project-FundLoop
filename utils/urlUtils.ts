/**
 * URL Utility functions for extracting information from URLs
 */

/**
 * Extracts the domain from a URL
 * @param url The URL to extract the domain from
 * @returns The domain of the URL
 */
export const getDomain = (url: string): string => {
  try {
    // If URL doesn't have protocol, add it for URL parsing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Error parsing URL:', error);
    // Return original URL if parsing fails
    return url;
  }
};

/**
 * Checks if a URL is valid
 * @param url The URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // If URL doesn't have protocol, add it for URL parsing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }
    
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Formats a URL for display (removes http/https and trailing slash)
 * @param url The URL to format
 * @returns Formatted URL for display
 */
export const formatUrlForDisplay = (url: string): string => {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}; 