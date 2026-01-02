import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

/**
 * ================================
 * GET NOW PLAYING MOVIES (TMDB)
 * ================================
 */

export const getNowPlayingMovies = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "en-US",
          page: 1,
        },
      }
    );

    const movies = response.data.results.map(movie => ({
      _id: movie.id, 
      title: movie.title,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      backdrop_path: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
      poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      genres: [], // Placeholder to prevent frontend mapping errors
      runtime: 0 
    }));

    res.json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};



/**
 * ================================
 * ADD SHOW
 * ================================
 */

export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    console.log("--- Add Show Process Started ---");
    console.log("Movie ID:", movieId);

    if (!movieId) {
      return res.json({ success: true, message: "Movie ID is required." });
    }

    // 1. Check for Movie
    let movie = await Movie.findById(movieId);
    
    if (!movie) {
      console.log("Movie not found. Fetching from TMDB...");
      const [movieDetailsRes, movieCreditsRes] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          params: { api_key: process.env.TMDB_API_KEY },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          params: { api_key: process.env.TMDB_API_KEY },
        }),
      ]);

      movie = await Movie.create({
        _id: movieId,
        title: movieDetailsRes.data.title,
        overview: movieDetailsRes.data.overview,
        poster_path: `https://image.tmdb.org/t/p/w500${movieDetailsRes.data.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${movieDetailsRes.data.backdrop_path}`,
        genres: movieDetailsRes.data.genres,
        casts: movieCreditsRes.data.cast,
        release_date: movieDetailsRes.data.release_date,
        original_language: movieDetailsRes.data.original_language,
        tagline: movieDetailsRes.data.tagline || "",
        vote_average: movieDetailsRes.data.vote_average,
        runtime: movieDetailsRes.data.runtime,
      });
      console.log("New movie created.");
    } else {
      console.log("Movie already exists. Skipping TMDB fetch.");
    }

    // --- IMPORTANT: SHOW LOGIC MUST BE OUTSIDE THE IF/ELSE ABOVE ---
    console.log("Preparing to create shows for input:", showsInput);

    const showsToCreate = showsInput.map((slot) => ({
      movie: movieId,
      showDateTime: new Date(`${slot.date}T${slot.time}`),
      showPrice: Number(showPrice),
      occupiedSeats: {},
    }));

    if (showsToCreate.length > 0) {
      const result = await Show.insertMany(showsToCreate);
      console.log("SUCCESS: Shows saved to MongoDB Atlas:", result.length);
      return res.json({ success: true, message: "Show added successfully!" });
    } 
    
    console.log("FAILED: No slots provided in showsInput.");
    return res.json({ success: false, message: "No slots selected" });

  } catch (error) {
    console.error("Add Show Error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
/**
 * ================================
 * GET ALL UPCOMING SHOWS (ADMIN)
 * ================================
 */
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMovies = Array.from(
      new Map(shows.map((s) => [s.movie._id, s.movie])).values()
    );
    console.log("Found shows:", shows.length);
    res.json({ success: true, shows: uniqueMovies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * ================================
 * GET SHOW DETAILS FOR A MOVIE
 * ================================
 */
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() },
    });

    const movie = await Movie.findById(movieId);

    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
