---
name: nextjs-react-expert
description: React and Next.js performance optimization — 57 rules prioritized by impact. Waterfall elimination, bundle optimization, server components.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Next.js & React Performance Expert

> **57 optimization rules prioritized by impact.**
> **Philosophy:** Eliminate waterfalls first, optimize bundles second, then micro-optimize.

---

## 🎯 Selective Reading Rule (MANDATORY)

**Read ONLY sections relevant to your task!** Check the content map below and load what you need.

> 🔴 **For performance reviews: Start with CRITICAL sections (1-2), then move to HIGH/MEDIUM.**

---

## 📑 Content Map

| Section | Impact | Rules | When to Read |
|---------|--------|-------|--------------|
| 1 — Eliminating Waterfalls | 🔴 **CRITICAL** | 5 rules | Slow page loads, sequential API calls |
| 2 — Bundle Size Optimization | 🔴 **CRITICAL** | 5 rules | Large bundle, slow TTI |
| 3 — Server-Side Performance | 🟠 **HIGH** | 7 rules | Slow SSR, API route issues |
| 4 — Client-Side Data Fetching | 🟡 **MEDIUM-HIGH** | 4 rules | SWR patterns, deduplication |
| 5 — Re-render Optimization | 🟡 **MEDIUM** | 12 rules | Excessive re-renders, memoization |
| 6 — Rendering Performance | 🟡 **MEDIUM** | 9 rules | Virtualization, image optimization |
| 7 — JavaScript Performance | ⚪ **LOW-MEDIUM** | 12 rules | Micro-optimizations, caching |
| 8 — Advanced Patterns | 🔵 **VARIABLE** | 3 rules | useLatest, init-once |

**Total: 57 rules across 8 categories**

---

## 🚀 Quick Decision Tree

```
🐌 Slow page loads / Long Time to Interactive
  → Section 1: Eliminating Waterfalls
  → Section 2: Bundle Size Optimization

📦 Large bundle size (> 200KB)
  → Section 2: Bundle Size Optimization
  → Check: Dynamic imports, barrel imports, tree-shaking

🖥️ Slow Server-Side Rendering
  → Section 3: Server-Side Performance
  → Check: Parallel data fetching, streaming

🔄 Too many re-renders / UI lag
  → Section 5: Re-render Optimization
  → Check: React.memo, useMemo, useCallback

🎨 Rendering performance issues
  → Section 6: Rendering Performance
  → Check: Virtualization, layout thrashing

🌐 Client-side data fetching problems
  → Section 4: Client-Side Data Fetching
  → Check: SWR deduplication, localStorage
```

---

## 📊 Impact Priority Guide

```
1️⃣ CRITICAL (Biggest Gains - Do First):
   ├─ Section 1: Eliminating Waterfalls
   │  └─ Each waterfall adds full network latency (100-500ms+)
   └─ Section 2: Bundle Size Optimization
      └─ Affects Time to Interactive and Largest Contentful Paint

2️⃣ HIGH (Significant Impact - Do Second):
   └─ Section 3: Server-Side Performance
      └─ Eliminates server-side waterfalls, faster response times

3️⃣ MEDIUM (Moderate Gains - Do Third):
   ├─ Section 4: Client-Side Data Fetching
   ├─ Section 5: Re-render Optimization
   └─ Section 6: Rendering Performance

4️⃣ LOW (Polish - Do Last):
   ├─ Section 7: JavaScript Performance
   └─ Section 8: Advanced Patterns
```

---

## Core Principles

### 1. Eliminating Waterfalls (CRITICAL)

**Impact:** Each waterfall adds 100-500ms+ latency.

| Pattern | Problem | Solution |
|---------|---------|----------|
| Sequential `await` | Adds latency per call | `Promise.all()` for independent calls |
| Parent→child fetch | Child waits for parent | Parallel fetching + Suspense |
| Layout-triggered fetch | Data loads after render | Prefetch / preload data |

```typescript
// ❌ Waterfall
const user = await fetchUser(id);
const posts = await fetchPosts(user.id);

// ✅ Parallel
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
```

### 2. Bundle Size Optimization (CRITICAL)

| Technique | Impact |
|-----------|--------|
| **Dynamic imports** | Load heavy components on demand |
| **Direct imports** | `import { x } from 'lib/x'` not `from 'lib'` |
| **No barrel exports** | Barrel `index.ts` re-exports break tree-shaking |
| **Analyze bundle** | Use `@next/bundle-analyzer` |

### 3. Server Components (HIGH)

| Rule | Rationale |
|------|-----------|
| **Server by default** | Less JS shipped to client |
| **Client only when needed** | Interactivity, browser APIs, hooks |
| **Streaming with Suspense** | Progressive loading |

---

## ✅ Performance Review Checklist

**Critical (Must Fix):**
- [ ] No sequential data fetching (waterfalls eliminated)
- [ ] Bundle size < 200KB for main bundle
- [ ] No barrel imports in app code
- [ ] Dynamic imports used for large components
- [ ] Parallel data fetching where possible

**High Priority:**
- [ ] Server components used where appropriate
- [ ] API routes optimized (no N+1 queries)
- [ ] Suspense boundaries for data fetching
- [ ] Static generation used where possible

**Medium Priority:**
- [ ] Expensive computations memoized
- [ ] List rendering virtualized (if > 100 items)
- [ ] Images optimized with `next/image`
- [ ] No unnecessary re-renders

---

## ❌ Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Sequential `await` for independent ops | `Promise.all()` |
| Import entire libraries | Direct imports: `import { x } from 'lib/x'` |
| Barrel exports in app code | Import from source modules |
| Skip dynamic imports for heavy components | `dynamic(() => import('./Heavy'))` |
| Fetch in `useEffect` without deduplication | Use SWR or React Query |
| Client components when server works | Default to Server Components |
| Optimize without measuring | Profile first with DevTools |

---

## 🎓 Best Practices Summary

**Golden Rules:**
1. **Measure first** — Use React DevTools Profiler, Chrome DevTools
2. **Biggest impact first** — Waterfalls → Bundle → Server → Micro
3. **Don't over-optimize** — Focus on real bottlenecks
4. **Use platform features** — Next.js has optimizations built-in
5. **Think about users** — Real-world conditions matter

**Performance Mindset:**
- Every `await` in sequence = potential waterfall
- Every `import` = potential bundle bloat
- Every re-render = wasted computation (if unnecessary)
- Server components = less JavaScript to ship
- Measure, don't guess

---

> **Source:** Adapted from Vercel Engineering optimization principles.
