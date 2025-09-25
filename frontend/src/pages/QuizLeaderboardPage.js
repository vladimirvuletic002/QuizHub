import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetQuizLeaderboard as GetQuizLeaderboardService, GetMyRank as GetMyRankService } from "../services/LeaderboardService";
import { GetQuizById as GetQuizByIdService } from "../services/QuizService";
import "../styles/QuizLeaderboard.css";

function formatDate(dtIso) {
  try { return new Date(dtIso).toLocaleString(); } catch { return dtIso ?? ""; }
}

function formatDuration(sec) {
  if (sec == null) return "—";
  const s = Math.max(0, sec | 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function QuizLeaderboardPage({
  getLbFn = GetQuizLeaderboardService,
  getQuizFn = GetQuizByIdService,
  getMeFn = GetMyRankService,
}) {
  const { id } = useParams();
  const quizId = Number(id);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [rows, setRows] = useState([]);
  const [myUserId, setMyUserId] = useState(null); // samo za highlight
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ucitava meta kviza (naslov, kategorija)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getQuizFn(quizId);
        if (!active) return;
        setQuiz(data);
      } catch {
        // nije kriticno za LB
      }
    })();
    return () => { active = false; };
  }, [quizId, getQuizFn]);


  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true); setErr("");

        const [lbRes, meRes] = await Promise.allSettled([
          getLbFn(quizId, { page: 1, pageSize: 100 }),
          getMeFn(quizId), // uvek pokušaj; ako nema pokušaja -> 404 (not ranked)
        ]);

        if (!active) return;

        if (lbRes.status === "fulfilled") {
          const data = lbRes.value.data;
          const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
          setRows(list);
        } else {
          setErr(lbRes.reason?.response?.data?.message || "Neuspešno učitavanje rang liste.");
        }

        if (meRes.status === "fulfilled") {
            const me = meRes.value.data || {};
            const uid = me.userId ?? me.UserId ?? null;
            setMyUserId(uid);
        } else {
          // 401 -> nije ulogovan; 404 -> nema pokušaja; ignorisati kao „nema ranga“
          setMyUserId(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [quizId, getLbFn, getMeFn]);

  const title = useMemo(() => quiz?.title ?? quiz?.Title ?? `Kviz #${quizId}`, [quiz, quizId]);
  const category = useMemo(() => quiz?.categoryName ?? quiz?.CategoryName ?? "", [quiz]);

  return (
    <div className="lb-wrap">
      <div className="lb-header">
        <div>
          <h1>Rang lista</h1>
          <div className="lb-sub">
            <span className="lb-quiz-title">{title}</span>
            {category && <span className="lb-category">• {category}</span>}
          </div>
        </div>

        <div className="lb-actions">

          <button className="lb-ghost" onClick={() => navigate(-1)}>Nazad</button>
        </div>
      </div>

      {err && <div className="lb-error">{err}</div>}

      {loading ? (
        <div className="lb-loading">Učitavanje…</div>
      ) : rows.length === 0 ? (
        <div className="lb-empty">Još uvek nema rangiranih rezultata.</div>
      ) : (
        <div className="lb-table">
          <div className="lb-thead">
            <div>#</div>
            <div>Igrač</div>
            <div>Rezultat</div>
            <div>Vreme</div>
            <div>Datum</div>
          </div>

          {rows.map((r, i) => {
            const userId = r.userId ?? r.UserId ?? null;
            const username = r.username ?? r.Username ?? `User #${r.userId ?? r.UserId ?? "?"}`;
            const score = r.Score ?? r.score ?? 0;
            const max = r.maxScore ?? r.MaxScore ?? r.max ?? r.Max ?? 0;
            const duration = r.durationSeconds ?? r.DurationSeconds ?? null;
            const when = r.completedAtUtc ?? r.CompletedAtUtc;
            const isMe = myUserId != null && userId === myUserId;


            return (
              <div key={userId ?? i} className={`lb-row ${isMe ? "me" : ""}`}>
                <div className="lb-rank">{i + 1}</div>
                <div className="lb-user">{username} {isMe && <span className="lb-badge-me">vi</span>}</div>
                <div className="lb-score">{score} / {max}</div>
                <div className="lb-time">{formatDuration(duration)}</div>
                <div className="lb-date">{formatDate(when)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}