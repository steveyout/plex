import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Try to import fallback data for demo mode
import {
  fallbackMovies,
  fallbackShows,
  allFallbackItems,
  getFallbackEpisodes
} from './src/data/fallbackData.ts';

import { getBrandConfig } from './src/utils/brand.ts';

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// In-memory cache for TMDB sitemap generation
let sitemapMediaCache: any[] = [];
let sitemapLastFetch = 0;

async function getSitemapMedia() {
  const now = Date.now();
  if (sitemapMediaCache.length > 0 && now - sitemapLastFetch < 3600000) {
    return sitemapMediaCache;
  }

  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey || tmdbKey === 'YOUR_TMDB_API_KEY' || tmdbKey.trim() === '') {
    return [...fallbackMovies, ...fallbackShows];
  }

  try {
    const endpoints = [
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/trending/tv/day?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/tv/popular?api_key=${tmdbKey}`,
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${tmdbKey}`
    ];

    const results = await Promise.allSettled(
      endpoints.map((url) => fetch(url).then((r) => (r.ok ? r.json() : { results: [] })))
    );

    const seen = new Set<string>();
    const items: any[] = [];

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled' && res.value?.results) {
        const defaultType = idx < 2 || idx === 4 || idx === 6 ? 'movie' : 'tv';
        for (const item of res.value.results) {
          const type = item.media_type || defaultType;
          const key = `${type}_${item.id}`;
          if (!seen.has(key) && item.id && (item.title || item.name)) {
            seen.add(key);
            items.push({
              id: item.id,
              media_type: type,
              title: item.title || item.name,
              original_title: item.original_title || item.original_name,
              release_date: item.release_date || item.first_air_date,
              overview: item.overview || '',
            });
          }
        }
      }
    });

    if (items.length > 0) {
      sitemapMediaCache = items;
      sitemapLastFetch = now;
      return items;
    }
  } catch (err) {
    console.warn('[Sitemap] Failed to fetch live TMDB items:', err);
  }

  return [...fallbackMovies, ...fallbackShows];
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON request parser
  app.use(express.json());

  // Configuration check for client-side display
  app.get('/api/config', (req, res) => {
    const key = process.env.TMDB_API_KEY;
    const isDemo = !key || key === 'YOUR_TMDB_API_KEY' || key.trim() === '';
    res.json({ isDemo });
  });

  // TMDB proxy middleware
  app.get('/api/tmdb/*', async (req: any, res: any) => {
    const subpath = req.params[0] || '';
    const tmdbKey = process.env.TMDB_API_KEY;

    // Use TMDB API if key exists and isn't placeholder
    if (tmdbKey && tmdbKey !== 'YOUR_TMDB_API_KEY' && tmdbKey.trim() !== '') {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query)) {
        if (value !== undefined) {
          queryParams.set(key, String(value));
        }
      }
      queryParams.set('api_key', tmdbKey);

      const tmdbUrl = `https://api.themoviedb.org/3/${subpath}?${queryParams.toString()}`;
      try {
        const response = await fetch(tmdbUrl);
        if (response.ok) {
          const data = await response.json();
          return res.json(data);
        } else {
          const errText = await response.text();
          console.warn(`[TMDB REAL] Error ${response.status}: ${errText}. Falling back...`);
        }
      } catch (e: any) {
        console.error(`[TMDB REAL] Connection failed. Error: ${e.message}. Falling back...`);
      }
    }

    // Fallback/Demo Mode Interceptors
    const query = (req.query.query as string || '').toLowerCase();

    // 1. Trending / Discover Lists
    if (subpath.startsWith('trending/') || subpath.startsWith('discover/')) {
      const isMovie = subpath.includes('movie');
      const isTv = subpath.includes('tv');

      let results = [];
      if (isMovie) {
        results = fallbackMovies;
      } else if (isTv) {
        results = fallbackShows;
      } else {
        results = [...fallbackMovies, ...fallbackShows];
      }
      return res.json({
        page: 1,
        results,
        total_pages: 1,
        total_results: results.length
      });
    }

    // 2. Genre Lists
    if (subpath.includes('genre/movie/list')) {
      return res.json({
        genres: [
          { id: 28, name: "Action" },
          { id: 12, name: "Adventure" },
          { id: 16, name: "Animation" },
          { id: 35, name: "Comedy" },
          { id: 80, name: "Crime" },
          { id: 18, name: "Drama" },
          { id: 878, name: "Science Fiction" }
        ]
      });
    }
    if (subpath.includes('genre/tv/list')) {
      return res.json({
        genres: [
          { id: 18, name: "Drama" },
          { id: 80, name: "Crime" },
          { id: 10759, name: "Action & Adventure" },
          { id: 10765, name: "Sci-Fi & Fantasy" },
          { id: 9648, name: "Mystery" }
        ]
      });
    }

    // 3. Multi-Search / Movie-Search / TV-Search
    if (subpath.startsWith('search/')) {
      let results = allFallbackItems;
      if (query) {
        results = allFallbackItems.filter((item: any) => {
          const namePart = (item.title || item.name || '').toLowerCase();
          const origPart = (item.original_title || item.original_name || '').toLowerCase();
          return namePart.includes(query) || origPart.includes(query);
        });
      }
      return res.json({
        page: 1,
        results,
        total_pages: 1,
        total_results: results.length
      });
    }

    // 4. TV Season Info (e.g. tv/1399/season/1)
    const seasonMatch = subpath.match(/^tv\/(\d+)\/season\/(\d+)/);
    if (seasonMatch) {
      const showId = parseInt(seasonMatch[1]);
      const seasonNum = parseInt(seasonMatch[2]);
      return res.json(getFallbackEpisodes(showId, seasonNum));
    }

    // 5. Individual Movie Details (e.g. movie/157336)
    const movieMatch = subpath.match(/^movie\/(\d+)/);
    if (movieMatch) {
      const movieId = parseInt(movieMatch[1]);
      const movie = fallbackMovies.find(m => m.id === movieId);
      if (movie) {
        const response = { ...movie };
        (response as any).recommendations = {
          results: fallbackMovies.filter(m => m.id !== movieId)
        };
        return res.json(response);
      }
    }

    // 6. Individual TV Show Details (e.g. tv/1399)
    const tvMatch = subpath.match(/^tv\/(\d+)/);
    if (tvMatch) {
      const tvId = parseInt(tvMatch[1]);
      const show = fallbackShows.find(s => s.id === tvId);
      if (show) {
        const response = { ...show };
        (response as any).recommendations = {
          results: fallbackShows.filter(s => s.id !== tvId)
        };
        return res.json(response);
      }
    }

    // Safe default fallback response for details request
    return res.json({
      id: 99999,
      title: "Unknown Media Node",
      overview: "Mock metadata node placeholder for details page query.",
      poster_path: "/placeholder.jpg",
      backdrop_path: "/placeholder_back.jpg",
      genres: [],
      vote_average: 7.0,
      credits: { cast: [] },
      recommendations: { results: [] }
    });
  });

  // Dynamic robots.txt generation based on brand domain
  app.get('/robots.txt', (req, res) => {
    const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const brand = getBrandConfig(rawHost);

    const robots = `# robots.txt for ${brand.name} (${brand.domain})
# Optimized for Googlebot, Bingbot, YandexBot, Applebot

User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /api/

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Disallow: /api/

User-agent: Applebot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: GPTBot
Allow: /
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /api/

Host: ${brand.canonicalUrl}
Sitemap: ${brand.canonicalUrl}/sitemap.xml
`;

    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  });

  // Dynamic sitemap.xml generation based on brand domain and live TMDB catalog
  app.get('/sitemap.xml', async (req, res) => {
    const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const brand = getBrandConfig(rawHost);
    const baseUrl = brand.canonicalUrl;
    
    // Format current date as YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. Core Pages
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>always</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;
    
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?tab=movies</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?tab=tv</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?tab=watchlist</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;

    // 2. Fetch live & fallback media items
    const mediaItems = await getSitemapMedia();

    mediaItems.forEach((item: any) => {
      const type = item.media_type === 'tv' ? 'tv' : 'movie';
      const title = item.title || item.name || item.original_title || 'media';
      const slug = slugify(title);
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?watch=${type}_${item.id}_${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;
    
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.send(xml);
  });

  // Dynamic favicon & icon generator/router based on hostname
  app.get(['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon.png'], (req, res) => {
    const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
    const brand = getBrandConfig(rawHost);

    let svg = '';

    if (brand.domain.includes('plexmovies')) {
      // Golden yellow play button with a dotted circular progress track
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#080808" stroke="#E5A00D" stroke-width="4"/>
  <polygon points="40,30 75,50 40,70" fill="#E5A00D"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#E5A00D" stroke-width="2" stroke-dasharray="6,4"/>
</svg>`;
    } else if (brand.domain.includes('hexa')) {
      // High-tech deep indigo geometric hexagon with play triangle
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#0c0d10" stroke="#4f46e5" stroke-width="4"/>
  <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" fill="none" stroke="#4f46e5" stroke-width="3"/>
  <polygon points="43,35 68,50 43,65" fill="#4f46e5"/>
</svg>`;
    } else if (brand.domain.includes('flixer')) {
      // Flixer vibrant red film badge with play arrow
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#0f0709" stroke="#ef4444" stroke-width="4"/>
  <path d="M30 25 L70 25 L70 37 L44 37 L44 46 L64 46 L64 58 L44 58 L44 75 L30 75 Z" fill="#ef4444"/>
  <polygon points="56,58 78,70 56,82" fill="#ef4444"/>
</svg>`;
    } else {
      // CinemaOS: Crimson red cinematic movie reel style
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#080808" stroke="#e11d48" stroke-width="4"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#e11d48" stroke-width="5"/>
  <circle cx="50" cy="50" r="18" fill="none" stroke="#e11d48" stroke-width="3" stroke-dasharray="5,3"/>
  <polygon points="45,38 65,50 45,62" fill="#e11d48"/>
</svg>`;
    }

    res.header('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // Vite middleware setup vs Production SSR injection
  const distPath = path.join(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files without automatically serving index.html, since our wildcard route below handles the injection
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      const rawHost = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
      const brand = getBrandConfig(rawHost);
      const indexPath = path.join(distPath, 'index.html');
      
      try {
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          
          let pageTitle = brand.title;
          let pageDesc = brand.description;
          let pageCanonical = brand.canonicalUrl;
          const watchParam = req.query.watch as string | undefined;

          if (watchParam) {
            // Format: movie_157336_interstellar or tv_1399_game-of-thrones
            const parts = watchParam.split('_');
            const mediaType = parts[0] === 'tv' ? 'TV Series' : 'Movie';
            const rawTitle = parts.slice(2).join(' ').replace(/-/g, ' ');
            const formattedTitle = rawTitle
              ? rawTitle.replace(/\b\w/g, (c) => c.toUpperCase())
              : 'Movie';

            pageTitle = `Watch ${formattedTitle} Online Free HD | ${brand.name}`;
            pageDesc = `Stream ${formattedTitle} ${mediaType.toLowerCase()} online for free in full 1080p and 4K HD on ${brand.name} (${brand.domain}). Zero ads, subtitles included.`;
            pageCanonical = `${brand.canonicalUrl}/?watch=${encodeURIComponent(watchParam)}`;
          }

          // Replace title tag
          html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);
          
          // Schema.org JSON-LD
          const schemas = [
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: brand.name,
              alternateName: [brand.shortName, brand.domain],
              url: brand.canonicalUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${brand.canonicalUrl}/?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: brand.name,
              url: brand.canonicalUrl,
              logo: `${brand.canonicalUrl}/favicon.svg`,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: brand.name,
              applicationCategory: 'EntertainmentApplication',
              genre: 'Movies & TV',
              operatingSystem: 'All',
              description: brand.description,
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '1620',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: brand.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ];

          // Generate meta tags & dynamic favicons
          const metaTags = `
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    <meta name="keywords" content="${escapeHtml(brand.keywords)}" />
    <meta name="theme-color" content="${brand.accentColor}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${pageCanonical}" />
    <link rel="alternate" hrefLang="x-default" href="${brand.canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageCanonical}" />
    <meta property="og:site_name" content="${escapeHtml(brand.name)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDesc)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <script type="application/ld+json">${JSON.stringify(schemas)}</script>
          `;
          
          // Inject meta tags into head
          html = html.replace(/<head>/i, `<head>${metaTags}`);

          // Inject server-rendered semantic SEO section for search crawlers before </body>
          const faqCrawlerHtml = brand.faqs
            .map((f) => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`)
            .join('');

          const crawlerSection = `
    <section class="sr-only" aria-label="${escapeHtml(brand.name)} Overview & Catalog">
      <h1>${escapeHtml(brand.headingText)}</h1>
      <p>${escapeHtml(brand.introText)}</p>
      <h2>Frequently Asked Questions about ${escapeHtml(brand.name)}</h2>
      ${faqCrawlerHtml}
    </section>
          `;

          html = html.replace(/<\/body>/i, `${crawlerSection}</body>`);
          
          res.send(html);
        } else {
          res.sendFile(indexPath);
        }
      } catch (err) {
        console.error('Error serving index.html with server-side SEO tags:', err);
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
