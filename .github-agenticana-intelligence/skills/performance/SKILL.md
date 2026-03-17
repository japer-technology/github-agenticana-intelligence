---
name: performance
description: Profiling, Core Web Vitals, Lighthouse auditing, bundle analysis, and latency optimization.
allowed-tools: Read, Glob, Grep, Bash
---

# Performance Optimization

> Measure first, optimize second. Every millisecond matters to users.

---

## 1. Core Web Vitals

### Metrics That Matter

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Loading performance |
| **INP** (Interaction to Next Paint) | < 200ms | Interactivity responsiveness |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |
| **TTFB** (Time to First Byte) | < 800ms | Server response time |
| **FCP** (First Contentful Paint) | < 1.8s | Perceived load speed |

### Impact on Users

```
Performance Impact:
├── 1s delay → 7% conversion drop
├── 3s load time → 53% mobile users abandon
├── 100ms improvement → measurable engagement lift
└── Core Web Vitals affect SEO ranking
```

---

## 2. Profiling Methodology

### Step-by-Step

```
1. BASELINE  — Measure current performance
2. IDENTIFY  — Find the bottleneck
3. HYPOTHESIZE — What change will help?
4. IMPLEMENT — Make ONE change
5. MEASURE   — Compare against baseline
6. REPEAT    — Next bottleneck
```

### Tools

| Tool | Use For |
|------|---------|
| **Lighthouse** | Overall audit (CI-friendly) |
| **Chrome DevTools Performance** | Runtime profiling |
| **React DevTools Profiler** | Component render analysis |
| **`@next/bundle-analyzer`** | Bundle composition |
| **`clinic.js`** | Node.js server profiling |
| **`0x`** | Node.js flame graphs |

---

## 3. Frontend Performance

### Critical Rendering Path

| Phase | Optimization |
|-------|-------------|
| **HTML parsing** | Minimize DOM depth, defer non-critical scripts |
| **CSS loading** | Inline critical CSS, async load the rest |
| **JavaScript** | Code-split, tree-shake, defer non-essential |
| **Images** | Lazy load, use modern formats (WebP/AVIF), size properly |
| **Fonts** | `font-display: swap`, preload critical fonts |

### Bundle Optimization

| Technique | Impact |
|-----------|--------|
| **Code splitting** | Load only what the page needs |
| **Tree shaking** | Remove unused exports |
| **Dynamic imports** | Lazy-load heavy components |
| **Direct imports** | `import { x } from 'lib/x'` |
| **Compression** | Brotli > gzip (30% smaller) |

### Image Optimization

| Format | Use Case |
|--------|----------|
| **WebP** | General photos, illustrations |
| **AVIF** | Best compression, newer browsers |
| **SVG** | Icons, logos, simple graphics |
| **PNG** | Transparency needed, lossless |

---

## 4. Backend Performance

### Server-Side Optimization

| Area | Technique |
|------|-----------|
| **Database** | Indexing, query optimization, connection pooling |
| **Caching** | Redis/Memcached for hot data, HTTP cache headers |
| **Computation** | Move heavy work to background jobs |
| **I/O** | Parallel requests with `Promise.all()` |
| **Serialization** | Stream large responses, paginate lists |

### Caching Strategy

```
Cache Hierarchy:
├── Browser cache (Cache-Control headers)
├── CDN edge cache (Cloudflare, Vercel Edge)
├── Application cache (Redis, in-memory)
├── Database query cache
└── Computed result cache
```

| Cache-Control | Use Case |
|---------------|----------|
| `public, max-age=31536000, immutable` | Static assets with hash |
| `public, s-maxage=60, stale-while-revalidate=300` | Dynamic pages |
| `no-store` | Sensitive data |

---

## 5. Lighthouse in CI

### Automated Auditing

```yaml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

### Budget Configuration

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "interactive": ["error", { "maxNumericValue": 3500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

---

## 6. Node.js Performance

### Event Loop Health

| Metric | Healthy | Degraded |
|--------|---------|----------|
| **Event loop lag** | < 10ms | > 100ms |
| **Active handles** | Stable | Growing |
| **Memory usage** | < 70% heap | > 85% heap |
| **GC pause** | < 10ms | > 100ms |

### Common Node.js Bottlenecks

| Problem | Solution |
|---------|----------|
| Blocking event loop | Offload to worker threads |
| Memory leaks | Profile with `--inspect`, use heap snapshots |
| Connection exhaustion | Pool connections, set timeouts |
| Unoptimized JSON | Stream large payloads |

---

## 7. Key Patterns

| Pattern | Application |
|---------|-------------|
| **Measure before optimizing** | No guessing — profile first |
| **Optimize the bottleneck** | 80/20 rule — find the 20% causing 80% of slowness |
| **Set performance budgets** | Automated enforcement in CI |
| **Progressive loading** | Show content incrementally |
| **Cache aggressively** | Cache at every layer |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Optimize without measuring | Profile first, then optimize |
| Micro-optimize before macro | Fix waterfalls before loop performance |
| Cache without invalidation strategy | Plan TTL and cache-busting |
| Load everything upfront | Lazy-load, code-split, defer |
| Ignore server response time | Optimize TTFB — it affects everything |
| Ship uncompressed assets | Enable Brotli/gzip compression |
| Use synchronous I/O in Node.js | Always use async/await |
| Skip performance budgets in CI | Automate with Lighthouse CI |

---

> **Remember:** Performance is a feature. Users notice when things are slow, even if they can't articulate why. Measure, optimize, enforce.
