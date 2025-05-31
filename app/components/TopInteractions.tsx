import InteractionsContainer from "./InteractionsContainer";
import type { InteractionData, TopInteractionsProps } from "./analysis-types";

export type { InteractionData, TopInteractionsProps };

/**
 * TopInteractions component - Server-side data processing wrapper
 *
 * This component processes interaction data on the server-side and passes
 * optimized data to the InteractionsContainer for rendering.
 */
export default function TopInteractions({
  interactions,
  currentUser,
  className = "",
  maxHeight = "max-h-60",
}: TopInteractionsProps) {
  // Debug logging to see what data we receive
  console.log("🔍 TopInteractions Debug:");
  console.log("  Raw interactions received:", interactions?.length || 0);
  console.log("  Sample interactions:", interactions?.slice(0, 3));
  console.log("  Current user:", currentUser);

  // Process data on server-side for optimal performance
  // Filter out any interactions without required fields
  const validInteractions = interactions.filter(
    (interaction) => interaction.did && interaction.handle
  );

  console.log(
    "  Valid interactions after filtering:",
    validInteractions.length
  );

  // Sort by interaction count and limit for performance
  const processedInteractions = validInteractions
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Limit to top 50 for better performance

  console.log("  Final processed interactions:", processedInteractions.length);

  return (
    <InteractionsContainer
      interactions={processedInteractions}
      currentUser={currentUser}
      className={className}
      maxHeight={maxHeight}
      maxItems={30}
    />
  );
}
