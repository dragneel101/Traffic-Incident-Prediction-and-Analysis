import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import LandingPage from "./pages/LandingPage";


// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/route-planner" element={<RoutePlanner />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
