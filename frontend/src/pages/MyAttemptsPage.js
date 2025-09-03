import React, { useEffect, useState, useMemo } from "react";
import { GetMyAttempts as GetMyAttemptsService } from "../services/AttemptService";
import { useAuth } from "../context/AuthContext";
import AttemptDetailsPanel from "../components/AttemptDetailsPanel";
import "../styles/MyAttemptsPage.css";

function formatDate(dtIso) {
  try {
    const d = new Date(dtIso);
    return d.toLocaleString(); // po potrebi localize (sr-RS)
  } catch {
    return dtIso ?? "";
  }
}

function formatDuration(sec) {
  const s = Math.max(0, sec | 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export default function MyAttemptsPage({ getFn = GetMyAttemptsService }) {
  const { auth } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isLogged = useMemo(() => !!auth, [auth]);

  useEffect(() => {
    if (!isLogged) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getFn();
        const list = Array.isArray(data) ? data : [];
        setRows(list);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Neuspešno učitavanje istorije.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLogged, getFn]);

  if (!isLogged) {
    return (
      <div className="attempts-wrap">
        <div className="attempts-card">
          <h2>Istorija</h2>
          <p>Morate biti prijavljeni da vidite rezultate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attempts-wrap">
      <div className="attempts-header">
        <h1>Moji rezultati</h1>
      </div>

      {err && <div className="attempts-error">{err}</div>}

      {loading ? (
        <div className="attempts-loading">Učitavanje…</div>
      ) : rows.length === 0 ? (
        <div className="attempts-empty">Još uvek nemate pokušaje.</div>
      ) : (
        <div className="attempts-table">
          <div className="attempts-thead">
            <div>Datum</div>
            <div>Naslov kviza</div>
            <div>Kategorija</div>
            <div>Trajanje</div>
            <div>Rezultat</div>
          </div>

          {rows.map((a) => (
            <div key={a.attemptId} className="attempts-row">
              <div>{formatDate(a.completedAtUtc ?? a.startedAtUtc)}</div>
              <div className="attempts-title">{a.quizTitle}</div>
              <div>{a.categoryName}</div>
              <div>{formatDuration(a.durationSeconds)}</div>
              <div className="attempts-score">
                {a.score} / {a.maxScore} ({Math.round(a.percentage)}%)
              </div>

              <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
                <AttemptDetailsPanel attemptId={a.attemptId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
