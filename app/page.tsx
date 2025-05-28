import BlueskyAnalyzer from "./components/BlueskyAnalyzer";

export default function Home() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Bluesky User Analytics
          </h1>
          <p className="text-xl text-muted-foreground">
            Analyze any Bluesky user&apos;s activity and engagement patterns
          </p>
        </div>

        <BlueskyAnalyzer />
      </div>
    </div>
  );
}
