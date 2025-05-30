// Interface for Bluesky user search results
export interface BlueskyUser {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  followersCount?: number;
}

/**
 * Search for Bluesky users by handle/name
 * @param query - The search query (handle or display name)
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Promise with array of matching users
 */
export async function searchBlueskyUsers(
  query: string,
  limit: number = 10
): Promise<BlueskyUser[]> {
  try {
    // Clean the query - remove @ symbol and trim
    const cleanQuery = query.replace(/^@/, "").trim();

    if (cleanQuery.length < 2) {
      return [];
    }

    // Use Bluesky's public API to search for actors
    const searchUrl = `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActors?q=${encodeURIComponent(
      cleanQuery
    )}&limit=${limit}`;

    const response = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "bsky-viz/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to search users:",
        response.status,
        response.statusText
      );
      return [];
    }

    const data = await response.json();

    // Transform the response to our interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: BlueskyUser[] = (data.actors || []).map((actor: any) => ({
      did: actor.did,
      handle: actor.handle,
      displayName: actor.displayName,
      avatar: actor.avatar,
      description: actor.description,
      followersCount: actor.followersCount,
    }));

    return users;
  } catch (error) {
    console.error("Error searching Bluesky users:", error);
    return [];
  }
}
