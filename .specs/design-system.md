u# AMP Report Design System Specification

## Overview
This design system follows modern UI trends with glassmorphism effects and comprehensive dark mode support for the multifamily property tenant profiling application.

## Color System

### Base Colors
```json
{
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "200": "#bae6fd",
      "300": "#7dd3fc",
      "400": "#38bdf8",
      "500": "#0ea5e9",
      "600": "#0284c7",
      "700": "#0369a1",
      "800": "#075985",
      "900": "#0c4a6e",
      "950": "#082f49"
    },
    "secondary": {
      "50": "#fdf4ff",
      "100": "#fae8ff",
      "200": "#f5d0fe",
      "300": "#f0abfc",
      "400": "#e879f9",
      "500": "#d946ef",
      "600": "#c026d3",
      "700": "#a21caf",
      "800": "#86198f",
      "900": "#701a75",
      "950": "#4a044e"
    },
    "neutral": {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "300": "#d4d4d4",
      "400": "#a3a3a3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0a0a0a"
    }
  }
}
```

### Dark Mode Colors
```json
{
  "darkMode": {
    "background": {
      "primary": "#0a0a0a",
      "secondary": "#171717",
      "tertiary": "#262626",
      "glassmorphism": "rgba(255, 255, 255, 0.05)"
    },
    "text": {
      "primary": "#fafafa",
      "secondary": "#d4d4d4",
      "tertiary": "#a3a3a3",
      "muted": "#737373"
    },
    "border": {
      "default": "rgba(255, 255, 255, 0.1)",
      "hover": "rgba(255, 255, 255, 0.2)",
      "active": "rgba(255, 255, 255, 0.3)"
    }
  }
}
```

### Light Mode Colors
```json
{
  "lightMode": {
    "background": {
      "primary": "#ffffff",
      "secondary": "#f5f5f5",
      "tertiary": "#fafafa",
      "glassmorphism": "rgba(255, 255, 255, 0.7)"
    },
    "text": {
      "primary": "#171717",
      "secondary": "#404040",
      "tertiary": "#525252",
      "muted": "#737373"
    },
    "border": {
      "default": "rgba(0, 0, 0, 0.1)",
      "hover": "rgba(0, 0, 0, 0.2)",
      "active": "rgba(0, 0, 0, 0.3)"
    }
  }
}
```

## Typography System

### Font Families
```json
{
  "typography": {
    "fontFamilies": {
      "sans": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      "mono": "'JetBrains Mono', 'Fira Code', Consolas, monospace"
    },
    "fontSizes": {
      "xs": "0.75rem",     // 12px
      "sm": "0.875rem",    // 14px
      "base": "1rem",      // 16px
      "lg": "1.125rem",    // 18px
      "xl": "1.25rem",     // 20px
      "2xl": "1.5rem",     // 24px
      "3xl": "1.875rem",   // 30px
      "4xl": "2.25rem",    // 36px
      "5xl": "3rem",       // 48px
      "6xl": "3.75rem",    // 60px
      "7xl": "4.5rem",     // 72px
      "8xl": "6rem",       // 96px
      "9xl": "8rem"        // 128px
    },
    "fontWeights": {
      "thin": 100,
      "extralight": 200,
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800,
      "black": 900
    },
    "lineHeights": {
      "none": 1,
      "tight": 1.25,
      "snug": 1.375,
      "normal": 1.5,
      "relaxed": 1.625,
      "loose": 2
    },
    "letterSpacing": {
      "tighter": "-0.05em",
      "tight": "-0.025em",
      "normal": "0em",
      "wide": "0.025em",
      "wider": "0.05em",
      "widest": "0.1em"
    }
  }
}
```

### Typography Scales
```json
{
  "headings": {
    "h1": {
      "fontSize": "4xl",
      "fontWeight": "bold",
      "lineHeight": "tight",
      "letterSpacing": "tight"
    },
    "h2": {
      "fontSize": "3xl",
      "fontWeight": "semibold",
      "lineHeight": "tight",
      "letterSpacing": "tight"
    },
    "h3": {
      "fontSize": "2xl",
      "fontWeight": "semibold",
      "lineHeight": "snug"
    },
    "h4": {
      "fontSize": "xl",
      "fontWeight": "medium",
      "lineHeight": "snug"
    },
    "h5": {
      "fontSize": "lg",
      "fontWeight": "medium",
      "lineHeight": "normal"
    },
    "h6": {
      "fontSize": "base",
      "fontWeight": "medium",
      "lineHeight": "normal"
    }
  },
  "body": {
    "large": {
      "fontSize": "lg",
      "lineHeight": "relaxed"
    },
    "base": {
      "fontSize": "base",
      "lineHeight": "normal"
    },
    "small": {
      "fontSize": "sm",
      "lineHeight": "normal"
    },
    "tiny": {
      "fontSize": "xs",
      "lineHeight": "normal"
    }
  }
}
```

## Spacing System
```json
{
  "spacing": {
    "0": "0px",
    "px": "1px",
    "0.5": "0.125rem",   // 2px
    "1": "0.25rem",      // 4px
    "1.5": "0.375rem",   // 6px
    "2": "0.5rem",       // 8px
    "2.5": "0.625rem",   // 10px
    "3": "0.75rem",      // 12px
    "3.5": "0.875rem",   // 14px
    "4": "1rem",         // 16px
    "5": "1.25rem",      // 20px
    "6": "1.5rem",       // 24px
    "7": "1.75rem",      // 28px
    "8": "2rem",         // 32px
    "9": "2.25rem",      // 36px
    "10": "2.5rem",      // 40px
    "11": "2.75rem",     // 44px
    "12": "3rem",        // 48px
    "14": "3.5rem",      // 56px
    "16": "4rem",        // 64px
    "20": "5rem",        // 80px
    "24": "6rem",        // 96px
    "28": "7rem",        // 112px
    "32": "8rem",        // 128px
    "36": "9rem",        // 144px
    "40": "10rem",       // 160px
    "44": "11rem",       // 176px
    "48": "12rem",       // 192px
    "52": "13rem",       // 208px
    "56": "14rem",       // 224px
    "60": "15rem",       // 240px
    "64": "16rem",       // 256px
    "72": "18rem",       // 288px
    "80": "20rem",       // 320px
    "96": "24rem"        // 384px
  }
}
```

## Border Radius
```json
{
  "borderRadius": {
    "none": "0px",
    "sm": "0.125rem",    // 2px
    "base": "0.25rem",   // 4px
    "md": "0.375rem",    // 6px
    "lg": "0.5rem",      // 8px
    "xl": "0.75rem",     // 12px
    "2xl": "1rem",       // 16px
    "3xl": "1.5rem",     // 24px
    "full": "9999px"
  }
}
```

## Shadows
```json
{
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    "none": "none"
  },
  "darkShadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    "base": "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)"
  }
}
```

## Glassmorphism Effects
```json
{
  "glassmorphism": {
    "light": {
      "background": "rgba(255, 255, 255, 0.7)",
      "backdropFilter": "blur(10px) saturate(180%)",
      "webkitBackdropFilter": "blur(10px) saturate(180%)",
      "border": "1px solid rgba(255, 255, 255, 0.3)",
      "boxShadow": "0 8px 32px 0 rgba(31, 38, 135, 0.15)"
    },
    "dark": {
      "background": "rgba(17, 25, 40, 0.75)",
      "backdropFilter": "blur(10px) saturate(180%)",
      "webkitBackdropFilter": "blur(10px) saturate(180%)",
      "border": "1px solid rgba(255, 255, 255, 0.125)",
      "boxShadow": "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
    },
    "variants": {
      "subtle": {
        "background": "rgba(255, 255, 255, 0.25)",
        "backdropFilter": "blur(5px)",
        "border": "1px solid rgba(255, 255, 255, 0.18)"
      },
      "intense": {
        "background": "rgba(255, 255, 255, 0.9)",
        "backdropFilter": "blur(20px) saturate(200%)",
        "border": "1px solid rgba(255, 255, 255, 0.5)"
      },
      "colored": {
        "background": "rgba(14, 165, 233, 0.15)",
        "backdropFilter": "blur(10px) saturate(180%)",
        "border": "1px solid rgba(14, 165, 233, 0.3)"
      }
    }
  }
}
```

## Transitions & Animations
```json
{
  "transitions": {
    "durations": {
      "fast": "150ms",
      "base": "200ms",
      "slow": "300ms",
      "slower": "500ms"
    },
    "timingFunctions": {
      "ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
      "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
      "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)",
      "sharp": "cubic-bezier(0.4, 0, 0.6, 1)"
    },
    "properties": {
      "all": "all",
      "colors": "background-color, border-color, color, fill, stroke",
      "opacity": "opacity",
      "shadow": "box-shadow",
      "transform": "transform"
    }
  },
  "animations": {
    "fadeIn": {
      "from": { "opacity": 0 },
      "to": { "opacity": 1 }
    },
    "slideIn": {
      "from": { "transform": "translateY(10px)", "opacity": 0 },
      "to": { "transform": "translateY(0)", "opacity": 1 }
    },
    "pulse": {
      "0%, 100%": { "opacity": 1 },
      "50%": { "opacity": 0.5 }
    },
    "shimmer": {
      "0%": { "backgroundPosition": "-200% center" },
      "100%": { "backgroundPosition": "200% center" }
    }
  }
}
```

## Breakpoints
```json
{
  "breakpoints": {
    "xs": "475px",
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

## Z-Index Scale
```json
{
  "zIndex": {
    "base": 0,
    "dropdown": 10,
    "sticky": 20,
    "fixed": 30,
    "modalBackdrop": 40,
    "modal": 50,
    "popover": 60,
    "tooltip": 70,
    "notification": 80,
    "max": 999
  }
}
```