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
  // Process data on server-side for optimal performance
  // Filter out any interactions without required fields
  const validInteractions = interactions.filter(
    (interaction) => interaction.did && interaction.handle
  );

  // Sort by interaction count and limit for performance
  const processedInteractions = validInteractions
    .sort((a, b) => b.count - a.count)
    .slice(0, 50); // Limit to top 50 for better performance

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
