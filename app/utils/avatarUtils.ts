/**
 * Utility functions for avatar handling
 * Ensures consistent fallback character generation between server and client
 */

/**
 * Safely extracts the first character for avatar fallback
 * Uses deterministic logic to prevent hydration mismatches
 */
export function getAvatarFallbackChar(
  displayName?: string,
  handle?: string
): string {
  // Use displayName first, then handle as fallback
  const name = displayName || handle || "";

  // Basic trim without normalization to avoid server/client differences
  const trimmed = name.trim();

  if (!trimmed) {
    return "?"; // Default fallback
  }

  // Find first letter character without using regex to avoid potential differences
  for (let i = 0; i < Math.min(trimmed.length, 5); i++) {
    const char = trimmed.charAt(i);
    const charCode = char.charCodeAt(0);

    // Check for ASCII letters (A-Z, a-z)
    if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    ) {
      return char.toUpperCase();
    }

    // Check for Chinese characters (common range)
    if (charCode >= 0x4e00 && charCode <= 0x9fff) {
      return char;
    }
  }

  // If no letter found, use first character or default
  const firstChar = trimmed.charAt(0);
  if (firstChar) {
    const charCode = firstChar.charCodeAt(0);
    // Only uppercase ASCII letters
    if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    ) {
      return firstChar.toUpperCase();
    }
    return firstChar;
  }

  return "?";
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
