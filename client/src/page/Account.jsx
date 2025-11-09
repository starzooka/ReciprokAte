// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ Automatically use deployed server if VITE_SERVER_URL exists, otherwise fallback to localhost
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        setFavourites([]);
        return;
      }

      try {
        // Fetch user info
        const userRes = await axios.get(`${SERVER_URL}/api/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Fetch favourites
        const favRes = await axios.get(`${SERVER_URL}/api/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favIds = favRes.data.map((f) => f.recipeId);
        setFavourites([...new Set(favIds)]);

        setIsLoggedIn(true);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setIsLoggedIn(false);
        setUser(null);
        setFavourites([]);
      }
    };

    fetchUserData();
  }, [token, SERVER_URL]);

  const addFavourite = (id) =>
    setFavourites((prev) => [...new Set([...prev, id])]);

  const removeFavourite = (id) =>
    setFavourites((prev) => prev.filter((f) => f !== id));

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        favourites,
        addFavourite,
        removeFavourite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
