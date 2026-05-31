# Liquid Glass — Reference Documentation

> Compiled from Apple Developer documentation, WWDC 2025 sessions, Apple Human Interface Guidelines (iOS 26), and the [`@callstack/liquid-glass`](https://github.com/callstack/liquid-glass) React Native library.

---

## Table of Contents

1. [What is Liquid Glass?](#1-what-is-liquid-glass)
2. [Apple Design System — HIG Principles](#2-apple-design-system--hig-principles)
3. [SwiftUI APIs](#3-swiftui-apis)
4. [React Native — `@callstack/liquid-glass`](#4-react-native--callstackliquid-glass)
   - [Installation](#installation)
   - [Requirements](#requirements)
   - [Components](#components)
   - [Props Reference](#props-reference)
   - [Usage Examples](#usage-examples)
5. [Best Practices](#5-best-practices)
6. [Accessibility](#6-accessibility)
7. [Performance Guidelines](#7-performance-guidelines)
8. [How We Use It in This App](#8-how-we-use-it-in-this-app)

---

## 1. What is Liquid Glass?

**Liquid Glass** is a new design language and material system introduced by Apple at **WWDC 2025** alongside **iOS 26**, iPadOS 26, macOS Tahoe, watchOS 26, tvOS 26, and visionOS 26.

It represents a shift away from flat design toward a more expressive, spatial-inspired aesthetic. Liquid Glass acts as a _digital meta-material_ that:

- **Refracts** content below it in real time (like a real glass lens).
- **Reflects** surrounding colours and ambient light.
- **Morphs** fluidly between shapes when nearby glass elements interact.
- **Adapts** its transparency, blur, and tint to the underlying content, ensuring legibility in all conditions.

Unlike traditional "glassmorphism" (static blur + opacity), Liquid Glass is a GPU-accelerated, physics-informed material that reacts to scroll, touch, and motion.

---

## 2. Apple Design System — HIG Principles

### When to Use It

| ✅ Appropriate use cases | ❌ Avoid |
|---|---|
| Navigation bars, tab bars, toolbars | Full-screen backgrounds |
| Floating action buttons / FABs | Content-heavy list rows |
| Search bars and input overlays | Every card or container on a page |
| Alert / menu overlays | Glass layered on top of glass |
| System chrome elements | Dense informational layouts |

### Core Design Principles

**Spatial Hierarchy**
Liquid Glass is intended to serve as a distinct _functional layer_ that floats _above_ content. It signals "interface chrome" — navigation, actions, controls — rather than being used to style content itself.

**Content-Aware Adaptivity**
The material automatically adjusts its blur radius, tint, and transparency based on what is rendered beneath it. Dark content below = lighter glass. Bright content = darker/tinted glass. This is handled by the system; developers should not manually set background colours on glass elements.

**Visual Physics (Lensing)**
At edges, Liquid Glass uses a subtle lensing effect — the outer rim has a slightly stronger distortion than the centre, matching the optical properties of real glass. This is built into the native component and cannot be customised.

**Shape Morphing**
When two glass elements move close to each other within a `GlassEffectContainer` / `LiquidGlassContainerView`, they merge their outlines into a single fluid shape — like two water droplets merging. This is one of the signature behaviours of the material.

**Geometry**
- Use **capsule** (fully rounded pill) shapes for interactive elements (buttons, pills, search bars).
- Use **rounded rectangles** with moderate corner radii (`borderRadius: 12–20`) for cards and panels.
- Avoid sharp corners — they break the physical metaphor.
- Align nested containers concentrically (inner radius = outer radius − padding).

---

## 3. SwiftUI APIs

### `glassEffect(_:in:)`

The primary modifier for applying Liquid Glass to a SwiftUI view.

```swift
// Minimal usage — applies default capsule glass
Text("Hello")
    .padding()
    .glassEffect()

// Full customisation
Text("Hello")
    .padding()
    .glassEffect(
        .regular            // Variant: .regular | .clear | .identity
            .tint(.blue)    // Optional colour overlay
            .interactive(), // Enables touch interaction glint
        in: .rect(cornerRadius: 16) // Shape: any SwiftUI Shape
    )
```

**Variants:**
- `.regular` — Standard frosted blur (most common, most opaque).
- `.clear` — Higher transparency with minimal blur.
- `.identity` — No effect (useful for programmatic toggling).

### `GlassEffectContainer`

Groups multiple glass views so they can **merge and morph** into each other.

```swift
GlassEffectContainer(spacing: 24) {
    HStack(spacing: 24) {
        Image(systemName: "star.fill")
            .padding()
            .glassEffect()

        Image(systemName: "heart.fill")
            .padding()
            .glassEffect()
    }
}
```

- `spacing`: The distance (in points) at which adjacent glass shapes begin to merge. Matches the gap between elements.

### `glassEffectID(_:in:)` + `@Namespace`

Enables smooth **morphing transitions** between different glass configurations.

```swift
@State private var isExpanded = false
@Namespace private var glassNamespace

GlassEffectContainer(spacing: 40) {
    HStack(spacing: 40) {
        Circle()
            .frame(width: 60, height: 60)
            .glassEffect()
            .glassEffectID("left", in: glassNamespace)

        if isExpanded {
            Circle()
                .frame(width: 60, height: 60)
                .glassEffect()
                .glassEffectID("right", in: glassNamespace)
        }
    }
}

Button("Toggle") {
    withAnimation(.easeInOut(duration: 0.4)) {
        isExpanded.toggle()
    }
}
```

**Rules:**
- Always wrap state changes in `withAnimation` to trigger the morph.
- Use consistent `spacing` in both the container and layout primitives (`HStack`, `VStack`).
- Assign unique IDs per view — reusing an ID causes unexpected behaviour.

### Tab Role Search (iOS 26 Bottom Search Bar)

In iOS 26, a search tab is placed at the bottom of the screen natively:

```swift
TabView {
    // ... other tabs

    Tab(role: .search) {
        SearchResultsView()
    }
}
```

The system automatically renders a liquid glass capsule at the bottom with a search icon. This is the _native_ search bar pattern this app aims to replicate.

---

## 4. React Native — `@callstack/liquid-glass`

Source: [github.com/callstack/liquid-glass](https://github.com/callstack/liquid-glass)  
npm: [`@callstack/liquid-glass`](https://www.npmjs.com/package/@callstack/liquid-glass) (v0.7.1 in this project)

### Installation

```bash
npm install @callstack/liquid-glass
# or
pnpm add @callstack/liquid-glass
```

> **Rebuild required** — This is a native module. After installing, you must rebuild the native app (run `expo prebuild` and recompile with Xcode). It will **crash** in Expo Go because Expo Go does not include the native binary.

### Requirements

| Requirement | Minimum |
|---|---|
| React Native | 0.80+ |
| Xcode | 26+ (Xcode 26 Beta) |
| iOS | 26+ (runtime) |
| Expo Go | ❌ Not supported |
| Android | ❌ Not supported (falls back to `View`) |

### Components

The library exports three things:

```typescript
import {
    LiquidGlassView,           // A single glass element
    LiquidGlassContainerView,  // Container that enables morphing between children
    isLiquidGlassSupported,    // Boolean — true on iOS 26+ with linked binary
} from '@callstack/liquid-glass';
```

#### `LiquidGlassView`

A single liquid glass surface. Works like a `View` but renders the glass material as its background.

#### `LiquidGlassContainerView`

Wraps multiple `LiquidGlassView` elements and enables them to merge when they move close together. The React Native equivalent of SwiftUI's `GlassEffectContainer`.

#### `isLiquidGlassSupported`

A compile-time boolean constant (resolved at native module load). Use it to conditionally apply fallback styles on unsupported platforms.

### Props Reference

#### `LiquidGlassView` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `effect` | `'regular' \| 'clear' \| 'none'` | `'regular'` | The glass variant. `'regular'` = frosted blur. `'clear'` = high transparency, minimal blur. `'none'` = disables the effect. |
| `interactive` | `boolean` | `false` | When `true`, the view grows slightly on touch and shows a shimmer/glint effect, matching system button behaviour. |
| `tintColor` | `ColorValue` | `transparent` | An RGBA colour overlay applied over the glass material. Useful for tinting (e.g., a blue-tinted filter button when active). |
| `colorScheme` | `'light' \| 'dark' \| 'system'` | `'system'` | Forces a specific appearance for the glass. Use `'system'` to follow the user's dark/light mode preference. |
| `style` | `ViewStyle` | — | Standard React Native styles. `borderRadius` controls the glass shape. `overflow: 'hidden'` is **required** for the borderRadius to clip the glass material correctly. |

#### `LiquidGlassContainerView` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `spacing` | `number` | `0` | The distance (in points) at which child glass views begin to merge their outlines. Set this to the gap between your elements. |
| `style` | `ViewStyle` | — | Standard React Native styles. |

### Usage Examples

#### Single Glass Card

```tsx
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { View, Text, StyleSheet } from 'react-native';

function GlassCard() {
    return (
        <LiquidGlassView
            style={[
                styles.card,
                // Fallback for Android / older iOS / Expo Go:
                !isLiquidGlassSupported && {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: StyleSheet.hairlineWidth,
                },
            ]}
            effect="regular"
        >
            <Text>Hello World</Text>
        </LiquidGlassView>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',      // Required for borderRadius clipping
        justifyContent: 'center',
        alignItems: 'center',
        // Drop shadow (visible on non-glass fallback)
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
});
```

#### Merging Dual-Pill (like a Floating Toolbar)

```tsx
import {
    LiquidGlassView,
    LiquidGlassContainerView,
    isLiquidGlassSupported,
} from '@callstack/liquid-glass';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function FloatingToolbar() {
    return (
        <LiquidGlassContainerView
            style={styles.container}
            spacing={12}  // Must match the gap between the two pills
        >
            {/* Left: Filter circle */}
            <LiquidGlassView
                style={styles.circle}
                effect="regular"
            >
                <Pressable style={styles.circleInner} hitSlop={15}>
                    {({ pressed }) => (
                        <Ionicons
                            name="funnel-outline"
                            size={18}
                            style={{ opacity: pressed ? 0.5 : 1 }}
                        />
                    )}
                </Pressable>
            </LiquidGlassView>

            {/* Right: Search circle */}
            <LiquidGlassView
                style={styles.circle}
                effect="regular"
            >
                <Pressable style={styles.circleInner} hitSlop={15}>
                    {({ pressed }) => (
                        <Ionicons
                            name="search-outline"
                            size={18}
                            style={{ opacity: pressed ? 0.5 : 1 }}
                        />
                    )}
                </Pressable>
            </LiquidGlassView>
        </LiquidGlassContainerView>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    circle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    circleInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
```

#### Safe Crash Guard (Dynamic Require)

The native module **throws synchronously** if the binary is not linked (e.g., in Expo Go or on an unlinked simulator build). Always use a `try/catch` dynamic `require()` to prevent crashes:

```typescript
let LiquidGlassView: any = View;
let LiquidGlassContainerView: any = View;
let isLiquidGlassSupported = false;

try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const LiquidGlass = require('@callstack/liquid-glass');
    if (LiquidGlass) {
        LiquidGlassView = LiquidGlass.LiquidGlassView || View;
        LiquidGlassContainerView = LiquidGlass.LiquidGlassContainerView || View;
        isLiquidGlassSupported = !!LiquidGlass.isLiquidGlassSupported;
    }
} catch {
    // Falls back to standard React Native Views silently
}
```

This pattern is **required** for any environment where the native binary may not be linked (Expo Go, CI runners, unbuilt simulators).

#### Auto-Adaptive Text Colour with `PlatformColor`

```tsx
import { PlatformColor, Text } from 'react-native';

// This colour automatically adapts to the background visible through the glass
<Text style={{ color: PlatformColor('label') }}>
    Label that adapts to glass background
</Text>
```

> **Note**: There is a known size limit above which automatic text colour adaptation through the glass may not work reliably. Keep glass surfaces compact.

---

## 5. Best Practices

### ✅ Do

- **Apply `overflow: 'hidden'`** on every `LiquidGlassView` — this is mandatory for `borderRadius` to clip the glass material.
- **Use capsule shapes** (borderRadius = height / 2) for interactive buttons and pills.
- **Place glass above content**, not as a content background. Use `position: 'absolute'` or as the floating toolbar.
- **Allow scroll-through** — let list content scroll underneath the glass to create the live refraction effect.
- **Add bottom `contentInset` padding** to `FlatList`/`ScrollView` so content is not permanently hidden behind the floating glass bar.
- **Use `isLiquidGlassSupported`** to conditionally provide fallback styles (background colour, border) for Android or Expo Go.
- **Wrap in `try/catch require()`** for crash safety in non-linked environments.
- **Keep it sparse** — use on 1–3 elements per screen at most.
- **Use `effect="clear"`** for overlays where the content beneath must remain legible (e.g., search input).
- **Use `effect="regular"`** for navigation chrome (tab bars, toolbars, FABs).
- **Set `colorScheme="system"`** (default) to respect the user's dark/light mode automatically.
- **Use `interactive={true}`** on tappable glass elements to get the native touch glint/grow feedback.

### ❌ Don't

- **Don't stack glass on glass** — avoid placing one `LiquidGlassView` on top of another. The compounding blur destroys contrast and performance.
- **Don't apply glass to full-screen or large-area backgrounds** — the GPU cost is too high and it undermines legibility.
- **Don't set solid `backgroundColor`** on a `LiquidGlassView` — it overrides the material and defeats the purpose.
- **Don't use glass for content rows** (list items, detail cards) — use it only for chrome.
- **Don't statically import the module** in files that may load in Expo Go — always use the dynamic `require()` crash guard.
- **Don't exceed 4 compositing layers** per screen.
- **Don't animate glass elements excessively** — real-time blur is GPU-intensive.

---

## 6. Accessibility

### Reduce Transparency

If the user has enabled **Reduce Transparency** in iOS Accessibility settings:
- The system automatically collapses the glass to a solid (or near-solid) colour.
- Your fallback `style` (set via `!isLiquidGlassSupported && { backgroundColor: ... }`) will be visible.
- Ensure the fallback provides sufficient contrast for all interactive elements.

### Contrast Requirements

Apple mandates a minimum **4.5:1** text-to-background contrast ratio _after_ the blur is applied. When using `tintColor`, verify that your text remains readable against the resulting composite colour.

Use `PlatformColor('label')` and `PlatformColor('secondaryLabel')` for text inside glass elements — iOS adjusts these automatically.

### Dynamic Type

Glass containers should not have a fixed height if they contain text that scales with Dynamic Type. Use `minHeight` with flexible padding instead.

---

## 7. Performance Guidelines

| Guideline | Limit |
|---|---|
| Max glass layers per screen | ≤ 4 |
| Max blur radius (iPhone) | ≤ 40pt |
| Max blur radius (iPad / Mac) | ≤ 60pt |
| Animation on glass elements | Use sparingly |
| Glass view re-renders | Memoize inner content with `React.memo` |

- Avoid placing glass over rapidly-changing animated content (e.g., a video player) — real-time refraction of moving content is GPU-heavy.
- If a glass element frequently moves (e.g., an animated floating toolbar), use `useNativeDriver: true` for any animations.

---

## 8. How We Use It in This App

This project uses `@callstack/liquid-glass` version `0.7.1`.

### Inbox Screen (`src/app/index.tsx`)

**Floating Dual-Button Toolbar**

| Element | Component | Effect | Notes |
|---|---|---|---|
| Outer container | `LiquidGlassContainerView` | n/a | Enables morphing between buttons; `spacing` set to gap |
| Filter circle/pill | `LiquidGlassView` | `"regular"` | Displays funnel icon; expands to labeled pill when filter active |
| Search circle | `LiquidGlassView` | `"regular"` | Displays search icon; tapping expands to full-width search bar |
| Expanded search bar | `LiquidGlassView` | `"regular"` | Full-width pill with `TextInput` inside |

The container uses `position: 'absolute'` with a `bottom` value derived from `useSafeAreaInsets()` to float above the home indicator.

**Crash Guard**: A `try/catch require()` block wraps the import, ensuring the app functions in Expo Go and unlinked simulators.

**Fallback**: When `isLiquidGlassSupported === false`, card backgrounds, borders, and hairline widths are applied via inline styles.

### Settings Screen (`src/app/settings.tsx`)

| Element | Component | Effect | Notes |
|---|---|---|---|
| Each settings section | `LiquidGlassView` | `"regular"` | Rounded card (`borderRadius: 12`) wrapping all rows in a section |
| Ambient background | Plain `View` (absolute) | n/a | Two soft coloured blobs behind the `ScrollView` to provide content for glass refraction |

The `SectionList` was replaced by a manual `ScrollView` + `.map()` to enable wrapping each entire section in a single `LiquidGlassView` card.

---

## References

- [callstack/liquid-glass on GitHub](https://github.com/callstack/liquid-glass)
- [npm: @callstack/liquid-glass](https://www.npmjs.com/package/@callstack/liquid-glass)
- [Apple Developer: Materials (HIG)](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple Developer: glassEffect modifier](https://developer.apple.com/documentation/swiftui/view/glasseffect(_:in:isenabled:))
- [Apple Developer: GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer)
- [WWDC 2025: Designing with Liquid Glass](https://developer.apple.com/wwdc25/)
- [Callstack blog post on Liquid Glass in React Native](https://callstack.com/blog/liquid-glass-in-react-native/)
