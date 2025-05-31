# Analysis Components Documentation

This document describes the extracted analysis components that were refactored from the original `AnalysisResults.tsx` component to improve reusability and maintainability.

## Components Overview

The following components have been extracted:

### 1. KeyInsights Component

**File**: `app/components/KeyInsights.tsx`

A reusable component that displays key statistics in a grid layout.

#### Props

```typescript
interface KeyInsightsProps {
  insights: InsightsData;
  className?: string;
}

interface InsightsData {
  totalPosts: number;
  totalReplies: number;
  totalReposts: number;
  averagePostLength: number;
}
```

#### Usage

```tsx
import { KeyInsights } from "./components/analysis-components";

<KeyInsights insights={processedFeed.insights} className="custom-class" />;
```

### 2. MostActiveTime Component

**File**: `app/components/MostActiveTime.tsx`

Displays the most active hour and day in a formatted layout.

#### Props

```typescript
interface MostActiveTimeProps {
  data: MostActiveTimeData;
  localizedMostActiveHour: number;
  className?: string;
}

interface MostActiveTimeData {
  mostActiveHour: number;
  mostActiveDay: string;
}
```

#### Usage

```tsx
import { MostActiveTime } from "./components/analysis-components";

<MostActiveTime
  data={processedFeed.insights}
  localizedMostActiveHour={localizedMostActiveHour}
  className="custom-class"
/>;
```

### 3. TopInteractions Component

**File**: `app/components/TopInteractions.tsx`

Shows a list of top interactions with user handles and interaction counts.

#### Props

```typescript
interface TopInteractionsProps {
  interactions: InteractionData[];
  className?: string;
  maxHeight?: string;
}

interface InteractionData {
  did: string;
  handle: string;
  displayName: string;
  count: number;
}
```

#### Usage

```tsx
import { TopInteractions } from "./components/analysis-components";

<TopInteractions
  interactions={processedFeed.topInteractions}
  className="custom-class"
  maxHeight="max-h-80"
/>;
```

## Design Principles

### 1. **Type Safety**

- All components use TypeScript interfaces for props
- Shared types are defined in `analysis-types.ts`
- Type exports are available through `analysis-components.ts`

### 2. **Reusability**

- Each component is standalone and can be used independently
- Customizable through className prop
- Configurable styling options where appropriate

### 3. **Internationalization**

- All components use `useTranslations()` hook
- Translation keys follow the existing pattern (`analysis.*`)
- No hardcoded strings

### 4. **Accessibility**

- Semantic HTML structure
- Responsive design with mobile-first approach
- Proper heading hierarchy

### 5. **Performance**

- Minimal dependencies
- No unnecessary re-renders
- Efficient data rendering patterns

## File Structure

```
app/components/
├── analysis-types.ts          # Shared TypeScript interfaces
├── analysis-components.ts     # Component exports and re-exports
├── KeyInsights.tsx           # Key statistics component
├── MostActiveTime.tsx        # Active time display component
├── TopInteractions.tsx       # Top interactions list component
└── AnalysisResults.tsx       # Main container (now uses extracted components)
```

## Import Patterns

### Individual Component Imports

```typescript
import KeyInsights from "./components/KeyInsights";
import MostActiveTime from "./components/MostActiveTime";
import TopInteractions from "./components/TopInteractions";
```

### Centralized Imports (Recommended)

```typescript
import {
  KeyInsights,
  MostActiveTime,
  TopInteractions,
} from "./components/analysis-components";
```

### Type Imports

```typescript
import type {
  InsightsData,
  KeyInsightsProps,
  MostActiveTimeData,
  InteractionData,
} from "./components/analysis-components";
```

## Migration Benefits

1. **Better Maintainability**: Each component can be maintained independently
2. **Improved Testability**: Components can be unit tested in isolation
3. **Enhanced Reusability**: Components can be used in other parts of the application
4. **Cleaner Code Structure**: Separation of concerns and reduced file complexity
5. **Type Safety**: Shared interfaces prevent type mismatches
6. **Easier Debugging**: Smaller, focused components are easier to debug

## Future Enhancements

These components are designed to be easily extensible:

- Add theming support through props
- Implement custom styling variants
- Add animation and transition effects
- Support for different data formats
- Add click handlers and interaction callbacks
- Implement loading states
- Add error boundaries

## Best Practices

1. **Always use the centralized import** from `analysis-components.ts`
2. **Pass className props** for custom styling when needed
3. **Use TypeScript interfaces** when extending or modifying components
4. **Follow existing translation patterns** for new text content
5. **Test components in isolation** before integrating into larger views
6. **Maintain responsive design** principles in any modifications
