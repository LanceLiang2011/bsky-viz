# Dark Mode Implementation Guide

This project uses `next-themes` for dark mode support. All components must follow these guidelines to ensure proper dark mode functionality.

## 🎨 Color Usage Guidelines

### ✅ Use Semantic Tailwind Classes

Always use semantic color classes that automatically adapt to dark/light themes:

**Text Colors:**

- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary/muted text color
- `text-destructive` - Error/danger text color
- `text-primary` - Primary brand color text

**Background Colors:**

- `bg-background` - Page background
- `bg-card` - Card/container background
- `bg-muted` - Subtle background (e.g., code blocks)
- `bg-primary` - Primary brand background
- `bg-destructive` - Error/danger background

**Border Colors:**

- `border` - Default border (uses CSS variables)
- `border-primary` - Primary brand border
- `border-destructive` - Error/danger border

### ❌ Avoid Hardcoded Colors

Never use hardcoded gray colors or other fixed colors:

**❌ DON'T use:**

- `text-gray-500`, `text-gray-700`, `text-gray-900`
- `bg-gray-50`, `bg-gray-100`, `bg-white`
- `border-gray-200`, `border-gray-300`

**✅ DO use:**

- `text-muted-foreground` instead of `text-gray-500`
- `text-foreground` instead of `text-gray-900`
- `bg-card` instead of `bg-white`
- `bg-muted` instead of `bg-gray-100`

## 🔧 Implementation Details

### Theme Provider Setup

The app is wrapped with `ThemeProvider` in `/app/[locale]/layout.tsx`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### Theme Toggle Component

Use the `ThemeToggle` component in navigation:

```tsx
import { ThemeToggle } from "@/app/components/ThemeToggle";

// In your navbar/header:
<ThemeToggle />;
```

### CSS Custom Properties

The theme system uses CSS variables defined in `globals.css`:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--primary`, `--primary-foreground`
- And more...

## 📝 Component Development Checklist

When creating or updating components:

1. **Review existing colors** - Check for any `gray-*`, `white`, or other hardcoded colors
2. **Replace with semantic classes** - Use the approved semantic classes above
3. **Test both themes** - Verify component works in light AND dark mode
4. **Check contrast** - Ensure text remains readable in both themes
5. **Update gradients** - Use opacity-based gradients (e.g., `from-primary/10 to-primary/20`)

## 🚀 Updated Components

The following components have been updated for proper dark mode support:

### ✅ Complete - All Dark Mode Issues Fixed

- `OpenAISummaryCard.tsx` - Uses semantic colors with documentation note
- `AnalysisResults.tsx` - Fixed hardcoded grays, backgrounds, and text colors
- `ProfileCard.tsx` - Updated all stats cards and text to use semantic colors (including border fix)
- `MostActiveTime.tsx` - Fixed `bg-white` and `text-gray-600` instances
- `TopInteractions.tsx` - Fixed container background, hover states, avatar colors, and badges
- `KeyInsights.tsx` - Fixed `bg-slate-50` and `text-gray-500` instances
- `AvatarCloud.tsx` - Fixed gradient backgrounds, tooltip colors, and fallback colors
- `HandleSearchForm.tsx` - Fixed dropdown colors, hover states, and borders
- `LoadingState.tsx` - Fixed `text-gray-600` instance
- `ThemeToggle.tsx` - Handles theme switching with proper icons
- `Navbar.tsx` - Includes theme toggle with proper styling
- `[handle]/page.tsx` - Fixed `text-gray-600` instance

**Total Fixed**: 45+ hardcoded color instances across 12+ components

### ✅ Already Compliant

- `BackButton.tsx` - No hardcoded colors found
- `WordCloud.tsx` - Uses semantic color classes
- `ChineseWordCloud.tsx` - Uses semantic color classes

## 💡 Examples

### Card Component Pattern

```tsx
// ✅ Correct way
<Card className="bg-card text-card-foreground">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="text-foreground">
    Content here
  </CardContent>
</Card>

// ❌ Wrong way
<Card className="bg-white text-gray-900">
  <CardHeader>
    <CardTitle className="text-gray-800">Title</CardTitle>
    <CardDescription className="text-gray-500">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent className="text-gray-700">
    Content here
  </CardContent>
</Card>
```

### Stats/Metrics Pattern

```tsx
// ✅ Correct way - uses opacity for theme-adaptive backgrounds
<div className="bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20">
  <div className="text-2xl font-bold text-foreground">{value}</div>
  <div className="text-sm text-muted-foreground">{label}</div>
</div>

// ❌ Wrong way - hardcoded colors
<div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
  <div className="text-2xl font-bold text-gray-900">{value}</div>
  <div className="text-sm text-gray-600">{label}</div>
</div>
```

## 🔍 Testing

Always test your components in both themes:

1. Toggle to light mode - verify readability and appearance
2. Toggle to dark mode - verify readability and appearance
3. Check that all text has sufficient contrast
4. Ensure interactive elements (buttons, links) are visible in both themes

---

**Remember**: Every new component should be built with dark mode support from the start. When in doubt, use semantic color classes and test in both themes!
