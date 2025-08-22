import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/homePage";
import TournamentPage from "./pages/tournemantPage";
import HoleStatsPage from "./pages/HolePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tournament/:id" element={<TournamentPage />} />
      <Route path="/hole/:id" element={<HoleStatsPage />} />
    </Routes>
  );
}
