export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
  recommendations?: {
    results: any[];
  };
}

export const fallbackMovies: TMDBItem[] = [
  {
    id: 157336,
    title: "Interstellar",
    original_title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2Qv6v36g1vR6f6Yv24gfsujB.jpg",
    backdrop_path: "/xJH6btv7vF8uS7g667iFFC6i4At.jpg",
    media_type: "movie",
    release_date: "2014-11-05",
    vote_average: 8.4,
    vote_count: 34320,
    runtime: 169,
    genres: [
      { id: 12, name: "Adventure" },
      { id: 18, name: "Drama" },
      { id: 878, name: "Science Fiction" }
    ],
    credits: {
      cast: [
        { id: 10297, name: "Matthew McConaughey", character: "Cooper", profile_path: "/vY6vGoatSbeI1S7gIu98zZkox6H.jpg" },
        { id: 1813, name: "Anne Hathaway", character: "Brand", profile_path: "/6O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 3895, name: "Jessica Chastain", character: "Murph", profile_path: "/3O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 3896, name: "Michael Caine", character: "Professor Brand", profile_path: "/bO07897gSbeI1S7gIu98zZkox6H.jpg" }
      ]
    }
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    original_title: "Dune: Part Two",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster_path: "/czemb7GEuYTyRREG6vOIIdgX89z.jpg",
    backdrop_path: "/xOM9Z6vKuAWUPao67Ap436content.jpg", // dynamic fallback will handle it
    media_type: "movie",
    release_date: "2024-02-27",
    vote_average: 8.2,
    vote_count: 4850,
    runtime: 166,
    genres: [
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    credits: {
      cast: [
        { id: 1190668, name: "Timothée Chalamet", character: "Paul Atreides", profile_path: "/BE6vGoatSbeI1S7gIu98zZkox6H.jpg" },
        { id: 505710, name: "Zendaya", character: "Chani", profile_path: "/9O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 1620, name: "Rebecca Ferguson", character: "Lady Jessica Atreides", profile_path: "/8O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 1373737, name: "Austin Butler", character: "Feyd-Rautha Harkonnen", profile_path: "/7O07897gSbeI1S7gIu98zZkox6H.jpg" }
      ]
    }
  },
  {
    id: 872585,
    title: "Oppenheimer",
    original_title: "Oppenheimer",
    overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv2gSjH0XD8g7vIB8gq046v22.jpg",
    backdrop_path: "/rM56vKuAWUPao67Ap436content.jpg",
    media_type: "movie",
    release_date: "2023-07-19",
    vote_average: 8.1,
    vote_count: 8400,
    runtime: 180,
    genres: [
      { id: 18, name: "Drama" },
      { id: 36, name: "History" }
    ],
    credits: {
      cast: [
        { id: 2037, name: "Cillian Murphy", character: "J. Robert Oppenheimer", profile_path: "/6O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 350, name: "Emily Blunt", character: "Kitty Oppenheimer", profile_path: "/5O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 2232, name: "Matt Damon", character: "Leslie Groves", profile_path: "/4O07897gSbeI1S7gIu98zZkox6H.jpg" },
        { id: 113, name: "Robert Downey Jr.", character: "Lewis Strauss", profile_path: "/3O07897gSbeI1S7gIu98zZkox6H.jpg" }
      ]
    }
  },
  {
    id: 27205,
    title: "Inception",
    original_title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    poster_path: "/o067vGv6v36content.jpg",
    backdrop_path: "/8s8vKuAWUPao67Ap436content.jpg",
    media_type: "movie",
    release_date: "2010-07-14",
    vote_average: 8.4,
    vote_count: 35600,
    runtime: 148,
    genres: [
      { id: 28, name: "Action" },
      { id: 878, name: "Science Fiction" },
      { id: 12, name: "Adventure" }
    ],
    credits: {
      cast: [
        { id: 6193, name: "Leonardo DiCaprio", character: "Cobb", profile_path: "/diCaprio.jpg" },
        { id: 41091, name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/levitt.jpg" },
        { id: 10246, name: "Elliot Page", character: "Ariadne", profile_path: "/page.jpg" },
        { id: 2524, name: "Tom Hardy", character: "Eames", profile_path: "/hardy.jpg" }
      ]
    }
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    original_title: "Spider-Man: Across the Spider-Verse",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. However, when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders.",
    poster_path: "/8VtBz7gSbeI1S7gIu98zZkox6H.jpg",
    backdrop_path: "/4VtBz7gSbeI1S7gIu98zZkox6H.jpg",
    media_type: "movie",
    release_date: "2023-05-31",
    vote_average: 8.4,
    vote_count: 6200,
    runtime: 140,
    genres: [
      { id: 16, name: "Animation" },
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 878, name: "Science Fiction" }
    ],
    credits: {
      cast: [
        { id: 1658428, name: "Shameik Moore", character: "Miles Morales (voice)", profile_path: "/shameik.jpg" },
        { id: 1251025, name: "Hailee Steinfeld", character: "Gwen Stacy (voice)", profile_path: "/hailee.jpg" },
        { id: 211027, name: "Oscar Isaac", character: "Miguel O'Hara (voice)", profile_path: "/oscar.jpg" },
        { id: 1118129, name: "Jake Johnson", character: "Peter B. Parker (voice)", profile_path: "/jake.jpg" }
      ]
    }
  }
];

export const fallbackShows: TMDBItem[] = [
  {
    id: 1399,
    name: "Breaking Bad",
    original_name: "Breaking Bad",
    overview: "Walter White, a chemistry teacher, discovers he has cancer and decides to get into the meth-making business to repay his medical debts. His priorities begin to change when he partners with Jesse Pinkman.",
    poster_path: "/ztkFORCo6v6v36content.jpg",
    backdrop_path: "/tsFORCo6v6v36content.jpg",
    media_type: "tv",
    first_air_date: "2008-01-20",
    vote_average: 8.9,
    vote_count: 14200,
    number_of_seasons: 5,
    number_of_episodes: 62,
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" }
    ],
    credits: {
      cast: [
        { id: 17419, name: "Bryan Cranston", character: "Walter White", profile_path: "/cranston.jpg" },
        { id: 84497, name: "Aaron Paul", character: "Jesse Pinkman", profile_path: "/aaron.jpg" },
        { id: 36135, name: "Anna Gunn", character: "Skyler White", profile_path: "/gunn.jpg" },
        { id: 41154, name: "Bob Odenkirk", character: "Saul Goodman", profile_path: "/bob.jpg" }
      ]
    }
  },
  {
    id: 66732,
    name: "Stranger Things",
    original_name: "Stranger Things",
    overview: "When a young boy vanishes, a town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    poster_path: "/49Y93gSbeI1S7gIu98zZkox6H.jpg",
    backdrop_path: "/39Y93gSbeI1S7gIu98zZkox6H.jpg",
    media_type: "tv",
    first_air_date: "2016-07-15",
    vote_average: 8.6,
    vote_count: 16700,
    number_of_seasons: 4,
    number_of_episodes: 34,
    genres: [
      { id: 18, name: "Drama" },
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 9648, name: "Mystery" }
    ],
    credits: {
      cast: [
        { id: 1356210, name: "Millie Bobby Brown", character: "Eleven", profile_path: "/millie.jpg" },
        { id: 1516246, name: "Finn Wolfhard", character: "Mike Wheeler", profile_path: "/finn.jpg" },
        { id: 94741, name: "Winona Ryder", character: "Joyce Byers", profile_path: "/winona.jpg" },
        { id: 57421, name: "David Harbour", character: "Jim Hopper", profile_path: "/david.jpg" }
      ]
    }
  },
  {
    id: 111453,
    name: "Shōgun",
    original_name: "Shōgun",
    overview: "In Japan in the year 1600, Lord Yoshii Toranaga fights for his life as his enemies on the Council of Regents unite against him, when a mysterious European ship is found marooned in a nearby fishing village.",
    poster_path: "/7E893gSbeI1S7gIu98zZkox6H.jpg",
    backdrop_path: "/6E893gSbeI1S7gIu98zZkox6H.jpg",
    media_type: "tv",
    first_air_date: "2024-02-27",
    vote_average: 8.7,
    vote_count: 950,
    number_of_seasons: 1,
    number_of_episodes: 10,
    genres: [
      { id: 18, name: "Drama" },
      { id: 10759, name: "Action & Adventure" },
      { id: 36, name: "History" }
    ],
    credits: {
      cast: [
        { id: 24343, name: "Hiroyuki Sanada", character: "Lord Yoshii Toranaga", profile_path: "/sanada.jpg" },
        { id: 1098553, name: "Cosmo Jarvis", character: "John Blackthorne", profile_path: "/jarvis.jpg" },
        { id: 1827618, name: "Anna Sawai", character: "Toda Mariko", profile_path: "/sawai.jpg" },
        { id: 26038, name: "Tadanobu Asano", character: "Kashigi Yabushige", profile_path: "/asano.jpg" }
      ]
    }
  }
];

// Combine all for multi-search mock results
export const allFallbackItems = [
  ...fallbackMovies,
  ...fallbackShows
];

// Helper to get mock seasons and episodes for TV Shows
export const getFallbackEpisodes = (showId: number, seasonNum: number) => {
  const episodesCount = showId === 1399 ? 13 : showId === 66732 ? 8 : 10;
  const episodes = [];
  for (let i = 1; i <= episodesCount; i++) {
    episodes.push({
      id: showId * 1000 + seasonNum * 100 + i,
      name: `Episode ${i}: The Quest Begins`,
      overview: `This is a compelling episode ${i} of season ${seasonNum}. Following the dramatic events of the previous chapter, our characters are pushed to their absolute limits as stakes reach an all-time high, culminating in a jaw-dropping final scene.`,
      episode_number: i,
      season_number: seasonNum,
      still_path: null,
      vote_average: 8.2 + (i % 3) * 0.2,
      runtime: 50 + (i % 4) * 5
    });
  }
  return {
    id: showId * 10 + seasonNum,
    name: `Season ${seasonNum}`,
    season_number: seasonNum,
    overview: `Season ${seasonNum} is packed with intense drama, stellar performances, and plot twists that keep you on the edge of your seat.`,
    episodes: episodes
  };
};
