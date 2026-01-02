import React, { useEffect, useState } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'

const Movies = () => {
  const {shows}=useAppContext()
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // This function fetches the LIVE data from your backend
  const fetchLiveMovies = async () => {
    try {
      // Ensure your server is running on localhost:3000
      const response = await axios.get('http://localhost:3000/api/show/now-playing');
      if (response.data.success) {
        setMovies(response.data.movies); // This will set Avatar, Zootopia, etc.
      }
    } catch (error) {
      console.error("Backend Connection Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMovies();
  }, []);

  if (loading) return <div className='h-screen flex items-center justify-center text-white'>Loading Live Movies...</div>;

  return movies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>
      <h1 className='text-lg font-medium my-4'>Now Showing</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {shows.map((movie) => (
          <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No Movies Available</h1>
      <p>Check if your backend is running and terminal says "Database connected"</p>
    </div>
  )
}

export default Movies