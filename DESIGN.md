---
name: RetroStamp PRO
description: "Authentic retro photo timestamp burner"
colors:
  primary: "#fc6405"
  neutral-bg: "#0a0b0d"
  neutral-text: "#e4e6eb"
  neutral-muted: "#a0a5b1"
  light-bg: "#f4f5f8"
  light-text: "#1a1c22"
  light-muted: "#5a606e"
  solid-white: "#ffffff"
  solid-black: "#111111"
  status-error: "#ff3366"
  hover-orange: "#ff7518"
  ambient-purple: "#6432ff"
typography:
  display:
    fontFamily: "Orbitron, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "13px"
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "11px"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xxl: "16px"
  max: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
---


# Design System: RetroStamp PRO

## 1. Overview
**Creative North Star: "Dual Theme Viewport"**

RetroStamp PRO is designed for high legibility and usability across both light and dark environments. The visual tokens are structured as custom properties that dynamically adapt when toggling between the themes.

## 2. Colors
Colors adapt dynamically based on the active theme class (`.light-theme` vs default).

### Primary
- **Nikon Orange** (#fc6405): Core accent color used for primary actions and active highlights in both modes.

### Neutral (Dark Theme)
- **Deep Slate Base** (#0a0b0d): Core background.
- **Silver Halide Text** (#e4e6eb): Clear high-contrast text.
- **Muted Steel** (#a0a5b1): Secondary labels.

### Neutral (Light Theme)
- **Soft Light Base** (#f4f5f8): Core background.
- **Carbon Text** (#1a1c22): Clear high-contrast text.
- **Muted Carbon** (#5a606e): Secondary labels.

### Named Rules:
**The Contrast Rule.** The body text must always maintain at least a 4.5:1 contrast ratio against the background container in both dark and light modes.

## 3. Typography
**Display Font:** Orbitron (with fallback sans-serif)
**Body Font:** Outfit (with fallback sans-serif)

## 4. Elevation
Both themes use a flat and layered model. Depth is indicated by border colors and solid backgrounds.

## 5. Components

### Buttons
- **Primary**: Solid Nikon Orange (#fc6405) with white text.
- **Secondary**: Light background hover states conforming to the active theme.

## 6. Do's and Don'ts

### Do:
- **Do** map all background and borders to CSS custom properties that adapt to theme classes.
- **Do** maintain a visible focus indicator on all interactive inputs.

### Don't:
- **Don't** use fixed hardcoded color literals for generic layout backgrounds.
