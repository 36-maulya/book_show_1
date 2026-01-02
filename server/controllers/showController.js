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
    const { movieId, dateTimeSelection, showPrice } = req.body;

    if (!movieId || !dateTimeSelection || !showPrice) {
      return res.json({
        success: false,
        message: "Missing required fields",
      });
    }

    let movie = await Movie.findById(movieId);

    /**
     * If movie not in DB → fetch from TMDB & save
     */
    if (!movie) {
      const [movieDetailsRes, movieCreditsRes] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          params: { api_key: process.env.TMDB_API_KEY },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          params: { api_key: process.env.TMDB_API_KEY },
        }),
      ]);

      const movieData = movieDetailsRes.data;
      const creditsData = movieCreditsRes.data;

      movie = await Movie.create({
        _id: movieId,
        title: movieData.title,
        overview: movieData.overview,
        poster_path: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`,
        genres: movieData.genres,
        casts: creditsData.cast,
        release_date: movieData.release_date,
        original_language: movieData.original_language,
        tagline: movieData.tagline || "",
        vote_average: movieData.vote_average,
        runtime: movieData.runtime,
      });
    }

    /**
     * Convert dateTimeSelection → shows array
     */
    const showsToCreate = [];

    Object.entries(dateTimeSelection).forEach(([date, times]) => {
      times.forEach((time) => {
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(`${date}T${time}`),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show added successfully" });
  } catch (error) {
    console.error("Add Show Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add show",
    });
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
