import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
import Register from './pages/Register';
import Home from "./pages";
import Navbar from './components/Navbar';
import About from './pages/about'

function App() {
  return (
    <Router>

      <Navbar />

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>

    </Router>
  );
}

export default App;
