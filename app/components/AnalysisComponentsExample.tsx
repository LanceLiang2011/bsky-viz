"use client";

// Example usage of extracted analysis components
// This file demonstrates how to use the components independently

import {
  KeyInsights,
  MostActiveTime,
  TopInteractions,
} from "./analysis-components";
import type {
  InsightsData,
  MostActiveTimeData,
  InteractionData,
} from "./analysis-components";

// Example data - this would typically come from your data source
const sampleInsights: InsightsData = {
  totalPosts: 1245,
  totalReplies: 567,
  totalReposts: 89,
  averagePostLength: 142,
};

const sampleMostActiveTime: MostActiveTimeData = {
  mostActiveHour: 14, // 2 PM UTC
  mostActiveDay: "2024-12-01",
};

const sampleInteractions: InteractionData[] = [
  {
    did: "did:plc:example1",
    handle: "alice.bsky.social",
    displayName: "Alice Johnson",
    count: 45,
  },
  {
    did: "did:plc:example2",
    handle: "bob.bsky.social",
    displayName: "Bob Smith",
    count: 32,
  },
  {
    did: "did:plc:example3",
    handle: "charlie.bsky.social",
    displayName: "Charlie Brown",
    count: 28,
  },
];

export default function AnalysisComponentsExample() {
  // This would be calculated based on user's timezone
  const localizedMostActiveHour = 16; // 4 PM local time

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analysis Components Example</h1>

      {/* Key Insights Example */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Key Insights Component</h2>
        <KeyInsights insights={sampleInsights} />
      </section>

      {/* Most Active Time Example */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Most Active Time Component
        </h2>
        <MostActiveTime
          data={sampleMostActiveTime}
          localizedMostActiveHour={localizedMostActiveHour}
        />
      </section>

      {/* Top Interactions Example */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Top Interactions Component
        </h2>
        <TopInteractions
          interactions={sampleInteractions}
          maxHeight="max-h-40"
        />
      </section>

      {/* Custom styling example */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Custom Styled Components</h2>
        <div className="space-y-4">
          <KeyInsights
            insights={sampleInsights}
            className="border border-blue-200 rounded-lg p-4"
          />
          <TopInteractions
            interactions={sampleInteractions}
            className="shadow-lg"
            maxHeight="max-h-32"
          />
        </div>
      </section>
    </div>
  );
}
