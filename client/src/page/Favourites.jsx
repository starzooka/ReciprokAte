// src/pages/Favourites.jsx
import { useEffect, useState } from "react";
import MenuItem from "../components/MenuItem.jsx";
import { useFavourites } from "../context/FavouritesContext.jsx";

const Favourites = () => {
  const { favourites, toggleFavourite, loading } = useFavourites(); // loading = favourites loading
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Use Vite env in prod; fallback to localhost in dev
  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setRecipesLoading(true);
        const res = await fetch(`${SERVER_URL}/api/recipes`);
        const data = await res.json();
        if (data.success) setRecipes(data.recipes || []);
        else setError("Failed to load recipes");
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes");
      } finally {
        setRecipesLoading(false);
      }
    };
    fetchRecipes();
  }, [SERVER_URL]);

  // If your IDs can be strings/numbers, normalize to avoid mismatches:
  const favSet = new Set(favourites.map(String));
  const favouriteRecipes = recipes.filter(r => favSet.has(String(r.id)));

  // 1) Still loading either favourites or recipes
  if (loading || recipesLoading) {
    return <div className="text-center py-20 text-gray-500">Loading favourites...</div>;
  }

  // 2) Error state (optional)
  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  // 3) Empty state ONLY when user truly has no favourites
  if (favourites.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600">
        <p className="text-xl font-semibold mb-2">No recipes added yet ❤️</p>
        <p className="text-gray-500">Browse recipes and click the heart icon to add them here.</p>
      </div>
    );
  }

  // 4) User has favourites; render those that exist in recipes
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">❤️ Your Favourite Dishes</h2>

        {favouriteRecipes.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="font-medium">Your saved items aren’t available right now.</p>
            <p className="text-sm text-gray-500">They may have been removed or are temporarily unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {favouriteRecipes.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onfavourite={() => toggleFavourite(item.id)}
                isFavourited={true}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favourites;
