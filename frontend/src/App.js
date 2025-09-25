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
import EditQuizPage from "./pages/QuizEditPage";
import QuizSolvingPage from "./pages/QuizSolvingPage";
import MyAttemptsPage from "./pages/MyAttemptsPage";
import QuizLeaderboardPage from "./pages/QuizLeaderboardPage";
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
          <Route path="/QuizManager/:id/EditQuiz/" element={<EditQuizPage/>} />
          <Route path="/QuizManager/:id/QuizSolving/" element={<QuizSolvingPage/>} />
          <Route path="/AttemptsHistory" element={<MyAttemptsPage/>} />
          <Route path="/QuizManager/:id/Leaderboard" element={<QuizLeaderboardPage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
