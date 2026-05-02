import { StarIcon, Heart } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const { image_base_url, fetchFavoriteMovies } = useAppContext()
  const { getToken } = useAuth()

  const goToDetails = () => {
    navigate(`/movies/${movie._id}`)
    scrollTo(0, 0)
  }

  // ❤️ Handle Favorite Toggle
  const handleFavorite = async () => {
    try {
      const token = await getToken();

      await axios.post(
        "/api/user/update-favorite",
        { movieId: movie._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFavoriteMovies(); // refresh favorites after update
    } catch (error) {
      console.error("Favorite error:", error);
    }
  }

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
      
      <img
        onClick={goToDetails}
        src={image_base_url + movie.backdrop_path}
        className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer'
        alt={movie.title}
      />

      <p className='font-semibold mt-2 truncate'>{movie.title}</p>

      <p className='text-sm text-gray-400 mt-2'>
        {new Date(movie.release_date).getFullYear()} •{' '}
        {movie.genres.slice(0, 2).map(g => g.name).join(' | ')} •{' '}
        {timeFormat(movie.runtime)}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        
        <button
          onClick={goToDetails}
          className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
        >
          Buy Tickets
        </button>

        <div className="flex items-center gap-3">
          
          <p className='flex items-center gap-1 text-sm text-gray-400 pr-1'>
            <StarIcon className='w-4 h-4 text-primary fill-primary' />
            {movie.vote_average.toFixed(1)}
          </p>

          {/* ❤️ Favorite Button */}
          <Heart
            onClick={handleFavorite}
            className="w-5 h-5 cursor-pointer text-red-500 hover:scale-110 transition"
          />
        </div>
      </div>
    </div>
  )
}

export default MovieCard