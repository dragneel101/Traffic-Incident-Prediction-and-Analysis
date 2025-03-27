import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
      </Routes>
    </Router>
  );
}

export default App;
