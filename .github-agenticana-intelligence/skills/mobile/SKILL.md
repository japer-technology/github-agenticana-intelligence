---
name: mobile
description: React Native, Expo, cross-platform mobile development, responsive design, and mobile UX patterns.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Mobile Development

> Build once, run everywhere — but respect each platform's conventions.

---

## 1. Cross-Platform Principles

### React Native / Expo Approach

| Principle | Application |
|-----------|-------------|
| **Shared logic, platform UI** | Business logic shared; UI adapts per platform |
| **Expo first** | Use Expo managed workflow unless native modules required |
| **Platform conventions** | iOS and Android have different UX expectations |
| **Offline-first** | Mobile apps must work without network |
| **Performance-aware** | 60fps is the minimum — jank is a bug |

### When to Use What

| Approach | Use When |
|----------|----------|
| **Expo Managed** | Standard app, no custom native modules |
| **Expo Dev Client** | Need one or two native modules |
| **Bare React Native** | Heavy native integration |
| **Native (Swift/Kotlin)** | Maximum performance, platform-specific features |

---

## 2. Component Architecture

### Mobile-Specific Patterns

| Pattern | Application |
|---------|-------------|
| **Screen components** | One per navigation route, thin orchestrators |
| **Presentational components** | Pure UI, receive data via props |
| **Platform-specific files** | `Component.ios.tsx` / `Component.android.tsx` |
| **Hooks for logic** | Extract business logic into custom hooks |

### Navigation Patterns

```
Stack Navigator     → Linear flow (auth, onboarding)
Tab Navigator       → Main app sections
Drawer Navigator    → Settings, profile, secondary pages
Modal Stack         → Overlays (confirmations, forms)
```

---

## 3. Responsive Design

### Flexible Layouts

| Technique | Usage |
|-----------|-------|
| **Flexbox** | Primary layout system in React Native |
| **Dimensions API** | `useWindowDimensions()` for screen size |
| **Platform-specific spacing** | Adapt padding/margins per platform |
| **Safe area** | `SafeAreaView` for notches and system UI |
| **Breakpoints** | Tablet vs phone layout switching |

### Responsive Checklist

- [ ] Works on smallest supported phone (320px width)
- [ ] Works on tablets (landscape and portrait)
- [ ] Respects safe areas (notch, home indicator)
- [ ] Text scales with accessibility settings
- [ ] Touch targets are at least 44×44 points

---

## 4. Performance

### React Native Performance

| Area | Optimization |
|------|-------------|
| **List rendering** | Use `FlatList` with `getItemLayout`, never `ScrollView` for long lists |
| **Images** | Use `expo-image` or `FastImage`, proper sizing, caching |
| **Animations** | Use `Reanimated` / `react-native-reanimated` on UI thread |
| **Bridge calls** | Minimize JS ↔ Native bridge crossings |
| **Bundle** | Use Hermes engine, enable inline requires |

### Common Performance Issues

| Problem | Solution |
|---------|----------|
| **Slow list scrolling** | `FlatList` with `keyExtractor`, `windowSize` tuning |
| **Jank during animations** | Move to native thread with Reanimated |
| **Large bundle** | Code split, lazy load screens |
| **Memory leaks** | Clean up subscriptions in `useEffect` return |

---

## 5. Offline & Data

### Offline-First Architecture

```
App Layer → Local Cache → Sync Queue → API
    ↓           ↓            ↓
 UI State   AsyncStorage   Background Sync
```

| Strategy | Use Case |
|----------|----------|
| **Cache-first** | Show cached data, refresh in background |
| **Network-first** | Always fetch, fallback to cache |
| **Stale-while-revalidate** | Show stale, update behind the scenes |

### Local Storage Options

| Storage | Use Case |
|---------|----------|
| **AsyncStorage** | Simple key-value (settings, tokens) |
| **MMKV** | Fast key-value (high-frequency reads) |
| **SQLite** | Structured offline data |
| **Expo SecureStore** | Sensitive data (tokens, credentials) |

---

## 6. Mobile UX Patterns

### Platform Differences

| Element | iOS | Android |
|---------|-----|---------|
| **Back navigation** | Swipe from left edge | System back button |
| **Tab bar** | Bottom | Bottom (Material 3) |
| **Alerts** | Centered modal | Bottom sheet / snackbar |
| **Typography** | SF Pro | Roboto |

### Touch & Gesture

| Rule | Application |
|------|-------------|
| **44pt minimum** | Touch targets must be at least 44×44 |
| **Feedback** | Visual feedback on every touch (ripple, highlight) |
| **Gestures** | Swipe, long-press should feel natural |
| **Loading states** | Skeleton screens over spinners |

---

## 7. Testing Mobile Apps

### Test Strategy

| Type | Tool | Scope |
|------|------|-------|
| **Unit** | Jest | Business logic, utilities |
| **Component** | React Native Testing Library | UI components |
| **Integration** | Detox / Maestro | Full app flows |
| **Snapshot** | Jest | Catch unintended UI changes |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Use `ScrollView` for long lists | Use `FlatList` or `FlashList` |
| Ignore platform conventions | Adapt UI per platform |
| Store sensitive data in AsyncStorage | Use SecureStore |
| Animate on JS thread | Use Reanimated for native animations |
| Hard-code dimensions | Use Flexbox and responsive values |
| Skip offline support | Design for offline-first |
| Test only on one platform | Test on both iOS and Android |
| Ignore accessibility | Support screen readers, dynamic type |

---

> **Remember:** Mobile users are impatient, often offline, and on diverse devices. Build for the worst case and delight in the best.
