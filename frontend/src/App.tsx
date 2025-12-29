import { Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { SearchPage } from "./pages/SearchPage";
import { HistoryPage } from "./pages/HistoryPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto p-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
