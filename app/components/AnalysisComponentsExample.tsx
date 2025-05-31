"use client";

// Example usage of individual analysis components
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
    avatar: "https://example.com/avatar1.jpg",
    count: 45,
  },
  {
    did: "did:plc:example2",
    handle: "bob.bsky.social",
    displayName: "Bob Smith",
    avatar: "https://example.com/avatar2.jpg",
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
  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold mb-8">Analysis Components Example</h1>

      <div className="grid gap-6">
        {/* Key Insights Component */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Key Insights Component</h2>
          <KeyInsights insights={sampleInsights} />
        </div>

        {/* Most Active Time Component */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Most Active Time Component</h2>
          <MostActiveTime
            data={sampleMostActiveTime}
            localizedMostActiveHour={16} // 4 PM local time (example)
          />
        </div>

        {/* Top Interactions Component */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Top Interactions Component</h2>
          <TopInteractions interactions={sampleInteractions} />
        </div>

        {/* Custom styling examples */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">With Custom Styling</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <KeyInsights
              insights={sampleInsights}
              className="border-blue-200 bg-blue-50"
            />
            <TopInteractions
              interactions={sampleInteractions.slice(0, 2)}
              className="border-green-200 bg-green-50"
              maxHeight="max-h-32"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Notes:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Each component accepts custom className props for styling</li>
          <li>
            • TopInteractions component accepts maxHeight prop for scroll
            control
          </li>
          <li>• All components are fully typed with TypeScript</li>
          <li>• Components handle loading states and edge cases gracefully</li>
          <li>• Avatar images are loaded with fallback to initials</li>
        </ul>
      </div>
    </div>
  );
}
