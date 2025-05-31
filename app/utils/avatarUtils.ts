/**
 * Utility functions for avatar handling
 * Ensures consistent fallback character generation between server and client
 */

/**
 * Safely extracts the first character for avatar fallback
 * Normalizes the string and handles edge cases to prevent hydration mismatches
 */
export function getAvatarFallbackChar(
  displayName?: string,
  handle?: string
): string {
  // Use displayName first, then handle as fallback
  const name = displayName || handle || "";

  // Normalize the string to ensure consistent encoding
  const normalized = name.normalize("NFC").trim();

  if (!normalized) {
    return "?"; // Default fallback
  }

  // Extract first character and ensure it's uppercase
  const firstChar = normalized.charAt(0);

  // Handle special cases - if first char is not a letter, try the next ones
  for (let i = 0; i < Math.min(normalized.length, 5); i++) {
    const char = normalized.charAt(i);
    if (/[a-zA-Z\u4e00-\u9fff]/.test(char)) {
      return char.toUpperCase();
    }
  }

  // If no letter found, return the first character uppercased, or default
  return firstChar ? firstChar.toUpperCase() : "?";
}

/**
 * Checks if avatar image is valid and should be displayed
 */
export function isValidAvatarUrl(url?: string): boolean {
  return Boolean(url && url.trim() && url.startsWith("http"));
}

// Default export for easier importing
const avatarUtils = {
  getAvatarFallbackChar,
  isValidAvatarUrl,
};

export default avatarUtils;
