---
name: seo
description: Search engine optimization — Core Web Vitals, metadata, structured data, sitemaps, robots.txt, and technical SEO.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# SEO — Search Engine Optimization

> Make your content discoverable. Technical SEO is the foundation for everything else.

---

## 1. Technical SEO Fundamentals

### Core Principles

| Principle | Application |
|-----------|-------------|
| **Crawlable** | Search engines can access and parse all pages |
| **Indexable** | Pages are allowed and worthy of indexing |
| **Fast** | Core Web Vitals in "Good" range |
| **Mobile-first** | Google indexes mobile version first |
| **Structured** | Clear hierarchy, semantic HTML |

### Crawlability Checklist

- [ ] `robots.txt` allows important pages
- [ ] `sitemap.xml` includes all canonical URLs
- [ ] No orphan pages (every page linked from somewhere)
- [ ] Internal linking structure is logical
- [ ] No redirect chains (max 1 redirect hop)
- [ ] HTTP → HTTPS redirect in place

---

## 2. Core Web Vitals for SEO

### Metrics That Affect Ranking

| Metric | Target | SEO Impact |
|--------|--------|-----------|
| **LCP** | < 2.5s | Direct ranking signal |
| **INP** | < 200ms | Direct ranking signal |
| **CLS** | < 0.1 | Direct ranking signal |
| **TTFB** | < 800ms | Indirect (affects LCP) |
| **Mobile-friendliness** | Pass | Direct ranking signal |

### Quick Wins

| Issue | Fix |
|-------|-----|
| Large images | Compress, use WebP/AVIF, lazy-load below fold |
| Render-blocking CSS/JS | Inline critical CSS, defer scripts |
| Layout shifts | Set explicit dimensions on images/embeds |
| Slow server | CDN, caching, server-side rendering |

---

## 3. Metadata

### Essential Meta Tags

```html
<head>
  <title>Page Title — Brand Name</title>
  <meta name="description" content="Concise page description, 150-160 chars" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="canonical" href="https://example.com/page" />

  <!-- Open Graph -->
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Description for social sharing" />
  <meta property="og:image" content="https://example.com/image.jpg" />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Page Title" />
  <meta name="twitter:description" content="Description" />
</head>
```

### Meta Tag Rules

| Rule | Rationale |
|------|-----------|
| **Unique title per page** | 50-60 characters, keyword near front |
| **Unique description per page** | 150-160 characters, include CTA |
| **Canonical URL** | Prevent duplicate content issues |
| **Open Graph tags** | Control social sharing appearance |
| **No duplicate titles** | Each page must be distinguishable |

---

## 4. Structured Data (JSON-LD)

### Common Schema Types

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Optimize SEO",
  "author": { "@type": "Person", "name": "Author Name" },
  "datePublished": "2025-01-15",
  "image": "https://example.com/image.jpg"
}
</script>
```

| Schema Type | Use Case |
|-------------|----------|
| **Article** | Blog posts, news articles |
| **Product** | E-commerce product pages |
| **FAQ** | Frequently asked questions |
| **BreadcrumbList** | Navigation breadcrumbs |
| **Organization** | Company information |
| **LocalBusiness** | Physical business locations |

---

## 5. Sitemap & Robots.txt

### sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

### Rules

| Rule | Rationale |
|------|-----------|
| **Include all indexable pages** in sitemap | Helps crawlers discover content |
| **Update `lastmod` accurately** | Signals freshness |
| **Block API/admin routes** | Don't waste crawl budget |
| **Reference sitemap in robots.txt** | Crawlers look here first |

---

## 6. Content & URL Structure

### URL Best Practices

| Rule | Example |
|------|---------|
| **Descriptive** | `/blog/seo-optimization-guide` |
| **Lowercase** | `/about-us` not `/About-Us` |
| **Hyphens** | `/my-page` not `/my_page` |
| **Short** | Remove unnecessary words |
| **No parameters** for content | `/products/shoes` not `/products?id=123` |

### Heading Hierarchy

```html
<h1>One per page — main topic</h1>
  <h2>Major sections</h2>
    <h3>Subsections</h3>
  <h2>Next major section</h2>
```

---

## 7. Next.js SEO Integration

### App Router Metadata

```typescript
// app/page.tsx
export const metadata = {
  title: 'Home — My Site',
  description: 'Welcome to my site',
  openGraph: {
    title: 'Home — My Site',
    description: 'Welcome to my site',
    images: ['/og-image.jpg'],
  },
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Duplicate titles across pages | Unique, descriptive title per page |
| Block important pages in robots.txt | Only block admin/API routes |
| Use JavaScript for critical content | Server-render for SEO |
| Ignore mobile experience | Mobile-first design and testing |
| Stuff keywords | Write naturally for users |
| Use redirect chains | Direct redirects (one hop) |
| Skip structured data | Add JSON-LD for rich results |
| Forget canonical URLs | Set canonical on every page |

---

> **Remember:** SEO is about making great content accessible to search engines. Technical SEO removes barriers; content quality drives rankings.
