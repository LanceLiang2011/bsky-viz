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

## 📖 Typography & Readability Guidelines

### Enhanced Font Properties for Maximum Readability

When creating text-heavy components (especially content like summaries, articles, or long descriptions), follow these typography best practices:

**Responsive Font Sizing:**

```tsx
// ✅ Progressive scaling for optimal reading
className = "text-base sm:text-lg lg:text-xl";

// ✅ Responsive titles
className = "text-xl sm:text-2xl lg:text-3xl";
```

**Line Height & Spacing:**

```tsx
// ✅ Enhanced line spacing for readability
className = "leading-relaxed sm:leading-loose lg:leading-loose";

// ✅ Letter spacing for character definition
className = "tracking-wide";
```

**Text Color & Contrast:**

```tsx
// ✅ High contrast for body text
className = "text-foreground/90";

// ✅ Standard contrast for UI text
className = "text-foreground";

// ✅ Muted text for secondary content
className = "text-muted-foreground";
```

**Content Spacing:**

```tsx
// ✅ Generous padding for comfortable reading
className = "px-6 sm:px-8 pb-8";

// ✅ Proper vertical rhythm
className = "pb-6"; // for headers
className = "pt-0"; // for content sections
```

### Global Text Rendering Enhancements

The following CSS properties are applied globally for improved text rendering:

```css
body {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

These settings provide:

- **Better kerning** and character spacing
- **Smoother font rendering** on all devices
- **Improved legibility** especially for smaller text sizes

### Component Example: OpenAISummaryCard

The `OpenAISummaryCard` serves as the gold standard for readable typography:

```tsx
// Title with progressive scaling
<CardTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">

// Body text optimized for reading
<div className="text-foreground/90 whitespace-pre-line text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose lg:leading-loose font-normal tracking-wide">
```

**Key Features:**

- 📱 **Mobile-first responsive** - starts at comfortable base size
- 💻 **Tablet optimized** - scales up for medium screens
- 🖥️ **Desktop enhanced** - maximum size for large displays
- 👁️ **High contrast** - 90% opacity for optimal readability
- 📏 **Generous spacing** - loose line height prevents cramped text
- 🔤 **Enhanced kerning** - tracking-wide for better character definition

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
- `BackgroundGradient.tsx` - **NEW** Animated gradient background component with dark mode support

**Total Fixed**: 45+ hardcoded color instances across 12+ components

### ✅ Already Compliant

- `BackButton.tsx` - No hardcoded colors found
- `WordCloud.tsx` - Uses semantic color classes
- `ChineseWordCloud.tsx` - Uses semantic color classes

## 🌈 BackgroundGradient Component

### Overview

The `BackgroundGradient` component provides beautiful animated gradient backgrounds that are fully compatible with dark mode. It features:

- **Smooth animations** using Framer Motion
- **Three gradient presets** - default, subtle, vibrant
- **Dark mode compatibility** with theme-aware backgrounds
- **Customizable animation** - can be disabled for static gradients
- **Optimized performance** - hardware-accelerated animations

### Usage

```tsx
import { BackgroundGradient } from "./ui/background-gradient";

// Basic usage
<BackgroundGradient>
  <Card>Your content here</Card>
</BackgroundGradient>

// With gradient options
<BackgroundGradient
  gradientColors="subtle"
  animate={true}
  className="rounded-[22px]"
>
  <Card>Your content here</Card>
</BackgroundGradient>
```

### Gradient Options

- **`"default"`** - Balanced colors for general use
- **`"subtle"`** - Softer colors for text-heavy content (recommended for OpenAISummaryCard)
- **`"vibrant"`** - Bold colors for attention-grabbing elements

### Implementation Example: OpenAISummaryCard

```tsx
<BackgroundGradient
  className="rounded-[22px] bg-background dark:bg-zinc-900"
  gradientColors="subtle"
  animate={true}
>
  <Card className="bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border-border/50 shadow-xl">
    {/* Card content */}
  </Card>
</BackgroundGradient>
```

**Key Features:**

- Uses `bg-background/95` for semi-transparent overlay
- `backdrop-blur-sm` for modern glass effect
- `dark:bg-zinc-900/95` for dark mode compatibility
- `shadow-xl` for enhanced depth perception

### Dependencies

- `motion` - For smooth animations
- `@tabler/icons-react` - For additional icons (if needed)

### Best Practices

1. **Choose appropriate gradients** - Use "subtle" for text content, "vibrant" for CTAs
2. **Maintain readability** - Always test text contrast over gradients
3. **Performance** - Set `animate={false}` for components that don't need animation
4. **Dark mode** - Always include dark mode background overrides

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
