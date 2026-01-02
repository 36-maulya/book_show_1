import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { CheckIcon, DeleteIcon, StarIcon } from 'lucide-react'
import { kConverter } from '../../lib/kConverter'
import { toast ,ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@clerk/clerk-react'

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const { getToken } = useAuth(); 
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false)

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/show/now-playing');
      if (data.success) {
        setNowPlayingMovies(data.movies);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load movies from server");
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };

 const handleSubmit = async () => {
    console.log("Submit Process Started");
    
    // Ensure all data is present
    if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
      return toast.error("Please select a movie, a price, and at least one time slot.");
    }

    try {
      setAddingShow(true);
      const token = await getToken();
      
      const showsInput = [];
      Object.entries(dateTimeSelection).forEach(([date, times]) => {
        times.forEach(time => {
          showsInput.push({ date, time });
        });
      });

      const payload = {
        movieId: selectedMovie, // The TMDB ID
        showsInput,
        showPrice: Number(showPrice)
      };

      console.log("Sending Request to Backend...", payload);

      const { data } = await axios.post('http://localhost:3000/api/show/add', payload, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });

      if (data.success) {
        toast.success("Show has been added successfully!");
        setDateTimeSelection({});
        setShowPrice("");
        setSelectedMovie(null);
      } else {
        toast.error(data.message || "Failed to add show");
      }
    } catch (error) {
      console.error("Request Error:", error);
      toast.error(error.response?.data?.message || "Internal Server Error");
    } finally {
      setAddingShow(false);
    }
  }

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  return nowPlayingMovies.length > 0 ? (
    <div className="pb-20">
      <ToastContainer theme="dark" position="top-right" />
      <Title text1="Add" text2="Shows" />
      <p className='mt-10 text-lg font-medium text-white'>Now Playing Movies</p>
      
      <div className='overflow-x-auto pb-4'>
        <div className='group flex flex-wrap gap-4 mt-4 w-max'>
          {nowPlayingMovies.map((movie) => (
            <div key={movie._id} 
                 className={`relative max-w-40 cursor-pointer hover:-translate-y-1 transition duration-300 ${selectedMovie && selectedMovie !== movie._id ? 'opacity-40' : 'opacity-100'}`} 
                 onClick={() => setSelectedMovie(movie._id)}>
              
              <div className={`relative rounded-lg overflow-hidden border-2 ${selectedMovie === movie._id ? 'border-primary' : 'border-transparent'}`}>
                <img src={movie.poster_path} alt={movie.title} className='w-full object-cover brightness-90' />
                <div className='text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                  <p className='flex items-center gap-1 text-gray-400'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary' />
                    {movie.vote_average.toFixed(1)}
                  </p>
                </div>
              </div>

              {selectedMovie === movie._id && (
                <div className='absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded shadow-lg'>
                  <CheckIcon className='w-4 h-4 text-white' strokeWidth={3} />
                </div>
              )}
              <p className='font-medium truncate mt-2 text-white'>{movie.title}</p>
              <p className='text-gray-400 text-sm'>{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-8'>
        <label className='block text-sm font-medium mb-2 text-white'>Show Price</label>
        <div className='inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md'>
          <p className='text-gray-400 text-sm'>{currency}</p>
          <input min={0} type='number' value={showPrice} onChange={(e) => setShowPrice(e.target.value)} placeholder='Enter price' className='outline-none bg-transparent text-white' />
        </div>
      </div>

      <div className='mt-6'>
        <label className='block text-sm font-medium mb-2 text-white'>Select Date and Time</label>
        <div className='inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg'>
          <input type='datetime-local' value={dateTimeInput} onChange={(e) => setDateTimeInput(e.target.value)} className='outline-none rounded-md bg-transparent text-white' />
          <button onClick={handleDateTimeAdd} className='bg-primary text-white px-4 py-2 text-sm rounded-lg hover:bg-opacity-80 transition-all'>Add Slot</button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className='mt-6 bg-gray-900/50 p-4 rounded-lg border border-gray-800'>
          <h2 className='mb-3 font-medium text-white'>Selected Schedule</h2>
          <ul className='space-y-4'>
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date} className="border-l-2 border-primary pl-4">
                <div className='font-bold text-primary'>{date}</div>
                <div className='flex flex-wrap gap-2 mt-2 text-sm'>
                  {times.map((time) => (
                    <div key={time} className='bg-gray-800 border border-gray-700 px-3 py-1 flex items-center rounded-full text-white'>
                      <span>{time}</span>
                      <DeleteIcon onClick={() => handleRemoveTime(date, time)} width={14} className='ml-2 text-red-500 hover:text-red-400 cursor-pointer' />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={handleSubmit} 
        disabled={addingShow} 
        className={`bg-primary text-white px-12 py-3 mt-10 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg ${addingShow ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}
      >
        {addingShow ? 'Adding Show...' : 'Confirm & Add Show'}
      </button>
    </div>
  ) : <Loading />
}

export default AddShows