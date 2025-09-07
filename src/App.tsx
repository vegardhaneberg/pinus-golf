import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import HoleStatsPage from "./pages/HolePage";
import PlayerPage from "./pages/PlayerPage";
import TournamentPage from "./pages/TournamentPage";
import PlayersPage from "./pages/PlayersPage";
import HighlightsPage from "./pages/HighlightsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tournament/:id" element={<TournamentPage />} />
      <Route path="/hole/:id" element={<HoleStatsPage />} />
      <Route path="/player/:id" element={<PlayerPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/highlights" element={<HighlightsPage />} />
    </Routes>
  );
}
