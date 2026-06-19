import express from 'express';
import path from 'path';
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

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5173', 10);

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

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
