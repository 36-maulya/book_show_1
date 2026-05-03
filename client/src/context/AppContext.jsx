import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ✅ Base URL for backend (Render)
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // 🔵 Check Admin
    const fetchIsAdmin = async () => {
        try {
            const role = user?.publicMetadata?.role;

            // Fast check from Clerk metadata
            if (role === "admin") {
                setIsAdmin(true);
                return;
            }

            const token = await getToken();

            const { data } = await axios.get("/api/admin/is-admin", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setIsAdmin(data.isAdmin);

            if (
                !data.isAdmin &&
                role !== "admin" &&
                location.pathname.startsWith("/admin")
            ) {
                navigate("/");
                toast.error("You are not authorized to access admin dashboards");
            }
        } catch (error) {
            console.error("Admin check failed:", error);
        }
    };

    // 🔵 Fetch all shows
    const fetchShows = async () => {
        try {
            const { data } = await axios.get("/api/show/all");

            if (data.success) {
                setShows(data.shows);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 🔵 Fetch favorite movies
    const fetchFavoriteMovies = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/user/favorites", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                setFavoriteMovies(data.movies);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 🔵 Load shows once
    useEffect(() => {
        fetchShows();
    }, []);

    // 🔵 Load user-based data
    useEffect(() => {
        if (user) {
            fetchIsAdmin();
            fetchFavoriteMovies();
        }
    }, [user]);

    const value = {
        axios,
        fetchIsAdmin,
        user,
        getToken,
        navigate,
        isAdmin,
        shows,
        favoriteMovies,
        fetchFavoriteMovies,
        image_base_url,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);