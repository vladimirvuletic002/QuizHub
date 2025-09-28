import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateLiveRoom as CreateLiveRoomService } from "../services/LiveRoomService";
import { GetAllQuizzes as GetAllQuizzesService } from "../services/QuizService";
import { useAuth } from "../context/AuthContext";
import "../styles/LiveRoom.css";

export default function LiveRoomCreatePage({
  createFn = CreateLiveRoomService,
  getQuizzesFn = GetAllQuizzesService,
}) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const isAdmin = useMemo(() => {
    const role = (auth?.Role || auth?.role || "").toLowerCase();
    const userType = auth?.UserType ?? auth?.userType;
    return role === "administrator" || userType === 0;
  }, [auth]);

  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [roomCode, setRoomCode] = useState(""); // opcioni custom
  const [revealSeconds, setRevealSeconds] = useState(5);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const { data } = await getQuizzesFn();
        const list = Array.isArray(data) ? data : (data.items ?? data.Items ?? []);
        setQuizzes(list);
      } catch {}
    })();
  }, [isAdmin, getQuizzesFn]);

  if (!isAdmin) {
    return (
      <div className="live-wrap">
        <div className="live-card">
          <h2>Pristup odbijen</h2>
          <p>Ovo je dostupno samo administratorima.</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!quizId) { setErr("Izaberi kviz."); return; }
    try {
      setLoading(true);
      const { data } = await createFn({
        quizId: Number(quizId),
        roomCode: roomCode.trim() || undefined,
        revealSeconds: Number(revealSeconds) || 5,
      });
      const code = data?.roomCode ?? data?.RoomCode ?? roomCode;
      navigate(`/Live/Room/${code}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Kreiranje nije uspelo.";
      setErr(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="live-wrap">
      <div className="live-card">
        <h1>Kreiraj live sobu</h1>
        {err && <div className="live-error">{err}</div>}

        <form onSubmit={onSubmit} className="live-form">
          <div className="form-row">
            <label>Kviz</label>
            <select value={quizId} onChange={(e) => setQuizId(e.target.value)}>
              <option value="">— izaberi —</option>
              {quizzes.map(q => (
                <option key={q.id ?? q.Id} value={q.id ?? q.Id}>
                  {q.title ?? q.Title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Custom kod (opciono)</label>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="npr. ABC123 (inače server generiše)"
            />
          </div>

          <div className="form-row">
            <label>Prelaz (sekunde)</label>
            <input
              type="number"
              min="1"
              value={revealSeconds}
              onChange={(e) => setRevealSeconds(e.target.value)}
            />
          </div>

          <button className="live-primary" type="submit" disabled={loading}>
            {loading ? "Kreiram…" : "Kreiraj sobu"}
          </button>
        </form>
      </div>
    </div>
  );
}