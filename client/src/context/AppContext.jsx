import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import axios from "axios"
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

axios.defaults.baseURL=import.meta.env.VITE_BASE_URL

export const AppContext=createContext();

export const AppProvider=({children})=>{
    const [isAdmin,setIsAdmin]=useState(false)
    const [shows,setShows]=useState([])
    
    const [favoriteMovies,setFavoriteMovies]=useState([])
    const image_base_url=import.meta.env.VITE_TMDB_IMAGE_BASE_URL
    const {user}=useUser()
     const {getToken}=useAuth()
     const location=useLocation()
     const navigate=useNavigate()
    // Inside AppProvider in context/appcontext.jsx

const fetchIsAdmin = async () => {
    try {
        // 1. Check Metadata directly first (Fastest)
        const role = user?.publicMetadata?.role;
        
        if (role === 'admin') {
            setIsAdmin(true);
            return; // Exit early, they are admin
        }

        // 2. Fallback: If metadata doesn't have it, ask the backend
        const { data } = await axios.get('/api/admin/is-admin', {
            headers: {
                Authorization: `Bearer ${await getToken()}`
            }
        });

        setIsAdmin(data.isAdmin);

        // 3. Only redirect if BOTH metadata and backend say no
        if (!data.isAdmin && role !== 'admin' && location.pathname.startsWith('/admin')) {
            navigate('/');
            toast.error('You are not authorized to access admin dashboards');
        }
    } catch (error) {
        console.error("Admin check failed:", error);
    }
};

    const fetchShows=async()=>{
        try {
            const {data}=await axios.get('/api/show/all')
            if(data.success){
                setShows(data.shows)
            }
            else{
               toast.error(data.message) 
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchFavoriteMovies=async()=>{
        try {
            const token = await getToken({ template: "default" });
            console.log("TOKEN:", token);

            const {data}=await axios.get('/api/user/favorites',{headers:{
                Authorization:`Bearer ${await getToken()}`
            }})
            if(data.success){
                setFavoriteMovies(data.movies)
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        fetchShows()
    },[])

    useEffect(()=>{
        if(user){
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
    },[user])
    const value={axios
        ,fetchIsAdmin,
        user,getToken,navigate,isAdmin,shows,
        favoriteMovies,fetchFavoriteMovies,image_base_url
    }

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )

}

export const useAppContext=()=>useContext(AppContext)


