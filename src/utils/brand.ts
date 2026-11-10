import { useState, useEffect } from 'react';

export interface BrandFaqItem {
  question: string;
  answer: string;
}

export interface BrandConfig {
  name: string;
  shortName: string;
  domain: string;
  canonicalUrl: string;
  competitor: string;
  title: string;
  description: string;
  keywords: string;
  headingText: string;
  introText: string;
  faqs: BrandFaqItem[];
  accentColor: string; // Hex color for inline styles if needed
  textAccent: string; // Tailwind class
  bgAccent: string; // Tailwind class
  borderAccent: string; // Tailwind class
  hoverTextAccent: string; // Tailwind class
  hoverBgAccent: string; // Tailwind class
  hoverBorderAccent: string; // Tailwind class
  fillAccent: string; // Tailwind class
  shadowAccent: string; // Tailwind class
  focusRingAccent: string; // Tailwind class
  loaderBorderColor: string; // Tailwind class
  badgeBg: string; // Tailwind class
}

export function getBrandConfig(rawHost: string): BrandConfig {
  const hostname = (rawHost || '').toLowerCase().split(':')[0].trim();

  if (hostname.includes('hexa')) {
    return {
      name: 'Hexa Watch',
      shortName: 'Hexa',
      domain: 'hexa.video',
      canonicalUrl: 'https://hexa.video',
      competitor: 'https://hexa.su/',
      title: 'Hexa Watch — Watch Free Movies & TV Shows Online in Full HD | Official Hexa Alternative',
      description: 'Watch thousands of full movies, anime, and trending TV series online for free on Hexa Watch (hexa.video). Engineered as the ultra-fast, ad-free alternative to hexa.su with 4K/1080p playback, multi-language subtitles, and zero signup.',
      keywords: 'Hexa, Hexa Watch, hexa.su, hexa.video, hexa watch movies, hexa tv, watch movies on hexa, hexa streaming, free movies online, watch series online free, full hd streaming, hexa alternative, anime streaming, movie aggregator',
      headingText: 'Watch Free Movies & TV Shows Online in Full HD on Hexa Watch',
      introText: 'Welcome to Hexa Watch (hexa.video), the premier high-speed free streaming platform for movies, anime, and television series. As the leading ad-free alternative to hexa.su, Hexa delivers crystal-clear 1080p and 4K playback, buffer-free servers, multi-language closed captions, and complete season binge-watching with zero registration or subscription fees.',
      faqs: [
        {
          question: 'What is Hexa Watch?',
          answer: 'Hexa Watch (hexa.video) is a free movie, TV show, and anime streaming platform providing thousands of titles in HD with zero popup ads and no account registration required.',
        },
        {
          question: 'How does Hexa Watch compare to hexa.su?',
          answer: 'Hexa Watch on hexa.video provides modern high-speed server nodes, a clean dark-mode interface, multi-language subtitles, and zero intrusive ads or redirects, making it the superior alternative to hexa.su.',
        },
        {
          question: 'Is Hexa Watch completely free?',
          answer: 'Yes, Hexa Watch is 100% free with no hidden charges, premium subscriptions, or credit card requirements.',
        },
        {
          question: 'What video quality is supported on Hexa?',
          answer: 'Hexa supports 720p, 1080p Full HD, and 4K resolution depending on the title, with automatic adaptive bitrate streaming for buffer-free playback.',
        },
        {
          question: 'Can I watch Hexa on mobile and smart TVs?',
          answer: 'Yes, Hexa Watch is fully responsive across desktop browsers, Android, iOS, tablets, and smart TVs.',
        },
        {
          question: 'How often is the Hexa catalog updated?',
          answer: 'Our catalog synchronizes continuously with TMDB to feature new box office releases, trending streaming originals, and new TV episodes as soon as they air.',
        },
      ],
      accentColor: '#4f46e5',
      textAccent: 'text-[#4f46e5]',
      bgAccent: 'bg-[#4f46e5]',
      borderAccent: 'border-[#4f46e5]',
      hoverTextAccent: 'hover:text-[#4f46e5]',
      hoverBgAccent: 'hover:bg-[#4f46e5]',
      hoverBorderAccent: 'hover:border-[#4f46e5]',
      fillAccent: 'fill-[#4f46e5]',
      shadowAccent: 'shadow-[#4f46e5]/50',
      focusRingAccent: 'focus:ring-[#4f46e5]',
      loaderBorderColor: 'border-[#4f46e5]',
      badgeBg: 'bg-[#4f46e5]/10 text-[#4f46e5] border-[#4f46e5]/30',
    };
  } else if (hostname.includes('flixer')) {
    return {
      name: 'Flixer',
      shortName: 'Flixer',
      domain: 'flixer.ink',
      canonicalUrl: 'https://flixer.ink',
      competitor: 'https://flixer.gd/',
      title: 'Flixer — Stream Movies & TV Series Online Free in Full HD | Official Flixer',
      description: 'Stream over 10,000+ full movies and complete TV series online for free on Flixer (flixer.ink). The official, buffer-free alternative to flixer.gd with 1080p HD streams, multiple server sources, subtitles, and zero ads.',
      keywords: 'Flixer, flixer.gd, flixer.ink, theflixer, the flixer, flixer movies, flixer tv, watch movies on flixer, flixer free streaming, watch series online free, full hd movies, stream movies no signup, flixer alternative, free movie streaming',
      headingText: 'Stream Movies & TV Series Online Free in Full HD on Flixer',
      introText: 'Flixer (flixer.ink) is your ultimate entertainment hub to stream full-length movies and TV shows for free in HD. Engineered as the premier safe alternative to flixer.gd, Flixer gives you instant access to box office blockbusters, trending TV series, and cinema classics with zero intrusive ads, fast cloud servers, and no signup needed.',
      faqs: [
        {
          question: 'What is Flixer?',
          answer: 'Flixer (flixer.ink) is a premier free movie and TV show streaming website where you can watch full movies and series online in full HD without ads or registration.',
        },
        {
          question: 'How is Flixer different from flixer.gd?',
          answer: 'Flixer at flixer.ink features faster streaming connections, zero pop-up redirects, responsive mobile controls, and multi-language subtitles, serving as a modern, reliable alternative to flixer.gd.',
        },
        {
          question: 'Is Flixer really free with no payment required?',
          answer: 'Yes, Flixer is completely free forever. You can watch any movie or episode without paying fees or entering payment info.',
        },
        {
          question: 'Do I need to create an account on Flixer?',
          answer: 'No account or signup is required. Simply search or choose a movie and start streaming immediately.',
        },
        {
          question: 'Does Flixer have subtitles in multiple languages?',
          answer: 'Yes, Flixer supports multi-language subtitles and closed captions across international cinema and TV shows.',
        },
        {
          question: 'How often are new movies and series added to Flixer?',
          answer: 'Our movie and TV library is updated daily with the latest theatrical releases and television episodes.',
        },
      ],
      accentColor: '#ef4444',
      textAccent: 'text-[#ef4444]',
      bgAccent: 'bg-[#ef4444]',
      borderAccent: 'border-[#ef4444]',
      hoverTextAccent: 'hover:text-[#ef4444]',
      hoverBgAccent: 'hover:bg-[#ef4444]',
      hoverBorderAccent: 'hover:border-[#ef4444]',
      fillAccent: 'fill-[#ef4444]',
      shadowAccent: 'shadow-[#ef4444]/50',
      focusRingAccent: 'focus:ring-[#ef4444]',
      loaderBorderColor: 'border-[#ef4444]',
      badgeBg: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30',
    };
  } else if (hostname.includes('plexmovies')) {
    return {
      name: 'PlexMovies',
      shortName: 'PlexMovies',
      domain: 'plexmovies.online',
      canonicalUrl: 'https://plexmovies.online',
      competitor: 'https://plexmovies.online/',
      title: 'PlexMovies — Stream Free Movies & TV Shows Online in Full HD | Official PlexMovies',
      description: 'Stream thousands of free movies and full season TV series in premium HD quality on PlexMovies (plexmovies.online). Your ultimate free personal media library with multiple high-speed server links and zero ads.',
      keywords: 'PlexMovies, plex movies, plexmovies online, free movies, watch tv series, free streaming, hd movies, media server, stream movies online free',
      headingText: 'Stream Free Movies & TV Shows Online in Premium HD on PlexMovies',
      introText: 'PlexMovies (plexmovies.online) is your ultimate free personal media library. Experience seamless 1080p streaming, multi-server redundancy, curated movie collections, and TV series with zero ads and no subscription fees.',
      faqs: [
        {
          question: 'What is PlexMovies?',
          answer: 'PlexMovies (plexmovies.online) is a free web-based media library offering thousands of movies and TV shows in full HD.',
        },
        {
          question: 'Is PlexMovies free?',
          answer: 'Yes, PlexMovies is 100% free with no subscription or credit card required.',
        },
        {
          question: 'Can I watch on mobile devices?',
          answer: 'Yes, PlexMovies works seamlessly across all mobile browsers, tablets, and desktops.',
        },
      ],
      accentColor: '#E5A00D',
      textAccent: 'text-[#E5A00D]',
      bgAccent: 'bg-[#E5A00D]',
      borderAccent: 'border-[#E5A00D]',
      hoverTextAccent: 'hover:text-[#E5A00D]',
      hoverBgAccent: 'hover:bg-[#E5A00D]',
      hoverBorderAccent: 'hover:border-[#E5A00D]',
      fillAccent: 'fill-[#E5A00D]',
      shadowAccent: 'shadow-[#E5A00D]/50',
      focusRingAccent: 'focus:ring-[#E5A00D]',
      loaderBorderColor: 'border-[#E5A00D]',
      badgeBg: 'bg-[#E5A00D]/10 text-[#E5A00D] border-[#E5A00D]/30',
    };
  } else {
    // Default: CinemaOS (cinemaos.online)
    return {
      name: 'CinemaOS',
      shortName: 'CinemaOS',
      domain: 'cinemaos.online',
      canonicalUrl: 'https://cinemaos.online',
      competitor: 'https://cinemaos.live/',
      title: 'CinemaOS — Watch Free Movies, Anime & TV Shows Online in HD | Official CinemaOS',
      description: 'CinemaOS (cinemaos.online) is the ultimate cinematic entertainment aggregator. Watch full movies, trending TV series, anime, and drama online for free in 1080p/4K HD. The official, high-speed alternative to cinemaos.live.',
      keywords: 'CinemaOS, cinemaos.live, cinemaos.online, cinema os, cinemaos movies, cinemaos anime, watch cinemaos, cinemaos streaming, free movies online, watch anime free, watch drama online, content aggregator, cinemaos alternative, HD movie streaming',
      headingText: 'Watch Free Movies, Anime & TV Shows Online in Full HD on CinemaOS',
      introText: 'CinemaOS (cinemaos.online) is an advanced cinematic content aggregator and streaming system. Crafted as the official, modern alternative to cinemaos.live, CinemaOS combines an immersive dark-mode cinema interface with high-speed playback nodes, anime streaming, drama, and thousands of blockbuster movies with zero ads and no subscription.',
      faqs: [
        {
          question: 'What is CinemaOS?',
          answer: 'CinemaOS (cinemaos.online) is an advanced entertainment system and streaming aggregator where you can watch movies, TV series, anime, and drama for free in full HD.',
        },
        {
          question: 'What makes CinemaOS different from cinemaos.live?',
          answer: 'CinemaOS on cinemaos.online features optimized high-performance servers, a frosted-glass cinematic interface, zero popup ads, and real-time TMDB synchronization, outperforming cinemaos.live.',
        },
        {
          question: 'Is CinemaOS free to stream?',
          answer: 'Yes, CinemaOS is 100% free with no monthly subscriptions or hidden charges.',
        },
        {
          question: 'Does CinemaOS offer anime and international dramas?',
          answer: 'Yes, CinemaOS features a massive library of anime, Asian drama, and global cinema alongside Hollywood blockbusters.',
        },
        {
          question: 'What playback features are available on CinemaOS?',
          answer: 'CinemaOS offers 1080p/4K HD video, multiple server mirrors, subtitle selection, watchlists, and playback history.',
        },
        {
          question: 'How do I find content on CinemaOS?',
          answer: 'Use our instant search overlay or browse curated categories including trending movies, popular series, and genre filters.',
        },
      ],
      accentColor: '#e11d48',
      textAccent: 'text-[#e11d48]',
      bgAccent: 'bg-[#e11d48]',
      borderAccent: 'border-[#e11d48]',
      hoverTextAccent: 'hover:text-[#e11d48]',
      hoverBgAccent: 'hover:bg-[#e11d48]',
      hoverBorderAccent: 'hover:border-[#e11d48]',
      fillAccent: 'fill-[#e11d48]',
      shadowAccent: 'shadow-[#e11d48]/50',
      focusRingAccent: 'focus:ring-[#e11d48]',
      loaderBorderColor: 'border-[#e11d48]',
      badgeBg: 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/30',
    };
  }
}

export function useBrand() {
  const [brand, setBrand] = useState<BrandConfig>(() => {
    if (typeof window !== 'undefined') {
      return getBrandConfig(window.location.hostname);
    }
    return getBrandConfig('cinemaos.online');
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrand(getBrandConfig(window.location.hostname));
    }
  }, []);

  return brand;
}
