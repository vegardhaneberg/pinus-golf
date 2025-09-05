import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TournamentPage from "./pages/TournemantPage";
import HoleStatsPage from "./pages/HolePage";
import PlayerPage from "./pages/PlayerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tournament/:id" element={<TournamentPage />} />
      <Route path="/hole/:id" element={<HoleStatsPage />} />
      <Route path="/player/:id" element={<PlayerPage />} />
    </Routes>
  );
}
