import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages";
import Navbar from "./components/Navbar";
import About from "./pages/about";
import QuizManager from "./pages/QuizManager";
import CreateQuizPage from "./pages/CreateQuizPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/QuizManager" element={<QuizManager />} />
          <Route path="/QuizManager/CreateQuiz" element={<CreateQuizPage/>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
