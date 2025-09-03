import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/QuizSolvePage.css";

export default function QuizResult({ quiz, totalScore, totalMax }) {
  return (
    <div className="qs-wrap">
      <div className="qs-card">
        <h1>Rezultat</h1>
        <p className="qs-big">
          {totalScore} / {totalMax}
        </p>

        <h3>Pregled odgovora</h3>
        <ol className="qs-review-list">
          {quiz.Questions.map((q) => {
            const userVals = userAnswerLabels(q, answers[q.Order]);
            const correctVals = correctAnswerLabels(q);
            const isCorrect = correctnessByOrder.has(q.Order)
              ? correctnessByOrder.get(q.Order)
              : null; // ako backend nije vratio detalj, ostavi neutralno
            return (
              <li
                key={q.Id}
                className={`qs-review-item ${
                  isCorrect === false
                    ? "wrong"
                    : isCorrect === true
                    ? "right"
                    : ""
                }`}
              >
                <div className="qs-review-head">
                  <strong>#{q.Order}</strong>{" "}
                  <span className="qs-review-points">({q.Points} poena)</span>
                </div>
                <div className="qs-review-text">{q.Text}</div>

                <div className="qs-review-row">
                  <span className="qs-tag">Tvoj odgovor:</span>
                  <div className="qs-chipset">
                    {userVals.map((v, i) => (
                      <span key={i} className="qs-chip">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="qs-review-row">
                  <span className="qs-tag">Tačno:</span>
                  <div className="qs-chipset">
                    {correctVals.map((v, i) => (
                      <span key={i} className="qs-chip qs-chip-correct">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <button className="qs-primary" onClick={() => navigate("/QuizManager")}>
          Nazad na listu kvizova
        </button>
      </div>
    </div>
  );
}
