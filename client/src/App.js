import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home/Home";
import Yoga from "./pages/Yoga/Yoga";
import PeerYoga from "./pages/Yoga/PeerYoga";
import Tutorials from "./pages/Tutorials/Tutorials";
import Login from "./pages/Login/Login";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Yoga />} />
        <Route path="/peeryoga" element={<PeerYoga />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
