"use server";

import { getTranslations } from "next-intl/server";

export async function analyzeUser(formData: FormData) {
  const t = await getTranslations();
  const handle = formData.get("handle")?.toString()?.trim();

  if (!handle) {
    return { error: t("errors.noHandle") };
  }

  try {
    // Remove @ symbol if present and validate handle format
    let cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;

    // Remove any invisible/non-printable characters and extra whitespace
    cleanHandle = cleanHandle
      .replace(/[\u200B-\u200D\uFEFF\u202C\u202D\u202E]/g, "") // Remove zero-width and formatting characters
      .replace(/\s+/g, "") // Remove all whitespace
      .toLowerCase(); // Normalize to lowercase

    // Ensure handle has proper format (add .bsky.social if it's just a username)
    if (!cleanHandle.includes(".") && !cleanHandle.includes(":")) {
      cleanHandle = `${cleanHandle}.bsky.social`;
    }

    console.log(`Fetching data for handle: ${cleanHandle}`);

    // First try to fetch profile to validate the handle
    const profileUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(
      cleanHandle
    )}`;
    console.log(`Profile URL: ${profileUrl}`);

    const profileRes = await fetch(profileUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "bsky-viz/1.0",
      },
    });

    if (!profileRes.ok) {
      const errorText = await profileRes.text();
      console.error(
        `Profile fetch failed: ${profileRes.status} ${profileRes.statusText}`,
        errorText
      );
      return {
        error: `Failed to fetch profile: ${profileRes.status} ${profileRes.statusText}. Handle: "${cleanHandle}". Response: ${errorText}`,
      };
    }

    const profileData = await profileRes.json();

    // Now fetch the feed
    const feedUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
      cleanHandle
    )}&limit=100`;
    const feedRes = await fetch(feedUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "bsky-viz/1.0",
      },
    });

    if (!feedRes.ok) {
      const errorText = await feedRes.text();
      console.error(
        `Feed fetch failed: ${feedRes.status} ${feedRes.statusText}`,
        errorText
      );
      return {
        error: `Failed to fetch feed: ${feedRes.status} ${feedRes.statusText}. Response: ${errorText}`,
      };
    }

    const feedData = await feedRes.json();

    return {
      success: true,
      profile: profileData,
      feed: feedData,
    };
  } catch (err) {
    console.error("Error fetching Bluesky data:", err);
    return { error: t("errors.fetchFailed") };
  }
}
