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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSEOTags(host: string) {
  const isPlex = host.includes('plexmovies');
  const isHexa = host.includes('hexa');
  const isCinema = host.includes('cinemaos') || (!isPlex && !isHexa);

  if (isPlex) {
    return {
      title: 'PlexMovies - Stream Free Movies & TV Shows Online',
      description: 'Watch free movies, TV series, and live streaming streams in premium HD quality on PlexMovies. Your ultimate free media server library.',
      keywords: 'plexmovies, plex movies, free movies, watch tv series, free streaming, hd movies, media server',
      themeColor: '#E5A00D',
      siteName: 'PlexMovies'
    };
  } else if (isHexa) {
    return {
      title: 'Hexa Watch - Stream Movies & TV Shows Online',
      description: 'Watch your favorite movies and TV shows on Hexa Watch. Stream the latest releases and classic titles.',
      keywords: 'hexa, hexa watch, movie, series, free movies, watch tv series, free streaming, hd movies, watch series online, cinematic player, premium streams, cineby, yflix, flixhq',
      themeColor: '#4f46e5',
      siteName: 'Hexa Watch'
    };
  } else {
    // Default fallback
    return {
      title: 'Cinemaos - Stream Movies & TV Shows Online',
      description: 'Beautifully designed website where you can watch anime, drama, movies and read mangas for free. CinemaOS operates as a content aggregator',
      keywords: 'cinemaos, cinema os, cineby, yflix, flixhq, anime, watch anime, read manga, watch drama, free movies, watch tv series, entertainment system, streaming media, content aggregator',
      themeColor: '#e11d48',
      siteName: 'Cinemaos'
    };
  }
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
        console.log(`[TMDB REAL] Fetching ${subpath}`);
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
    console.log(`[TMDB MOCK] Handling subpath: ${subpath}`);
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

  // Dynamic sitemap.xml generation
  app.get('/sitemap.xml', (req, res) => {
    const host = req.headers.host || 'plexmovies.online';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const baseUrl = `${proto}://${host}`;
    
    // Format current date as YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. Core Pages
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;
    
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?tab=movies</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?tab=tv</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // 2. Movies from Cinema Catalog Node
    fallbackMovies.forEach((movie) => {
      const slug = slugify(movie.title || movie.original_title || 'movie');
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?watch=movie_${movie.id}_${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    // 3. TV Shows from Cinema Catalog Node
    fallbackShows.forEach((show) => {
      const slug = slugify(show.name || show.original_name || 'tv');
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?watch=tv_${show.id}_${slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  // Dynamic favicon & icon generator/router based on hostname
  app.get(['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png', '/icon.png'], (req, res) => {
    const host = req.headers.host || '';
    const isPlex = host.includes('plexmovies');
    const isHexa = host.includes('hexa');

    let svg = '';

    if (isPlex) {
      // Golden yellow play button with a dotted circular progress track
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#080808" stroke="#E5A00D" stroke-width="4"/>
  <polygon points="40,30 75,50 40,70" fill="#E5A00D"/>
  <circle cx="50" cy="50" r="44" fill="none" stroke="#E5A00D" stroke-width="2" stroke-dasharray="6,4"/>
</svg>`;
    } else if (isHexa) {
      // High-tech deep indigo geometric hexagon with play triangle
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="22" fill="#0c0d10" stroke="#4f46e5" stroke-width="4"/>
  <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" fill="none" stroke="#4f46e5" stroke-width="3"/>
  <polygon points="43,35 68,50 43,65" fill="#4f46e5"/>
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

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files without automatically serving index.html, since our wildcard route below handles the injection
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      const host = req.headers.host || '';
      const tags = getSEOTags(host);
      const indexPath = path.join(distPath, 'index.html');
      
      try {
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          
          // Replace title tag
          html = html.replace(/<title>.*?<\/title>/i, `<title>${tags.title}</title>`);
          
          // Generate meta tags & dynamic favicons
          const metaTags = `
    <meta name="description" content="${tags.description}" />
    <meta name="keywords" content="${tags.keywords}" />
    <meta name="theme-color" content="${tags.themeColor}" />
    <meta property="og:title" content="${tags.title}" />
    <meta property="og:description" content="${tags.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${tags.siteName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${tags.title}" />
    <meta name="twitter:description" content="${tags.description}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          `;
          
          // Inject meta tags into the head tag
          html = html.replace(/<head>/i, `<head>${metaTags}`);
          
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
