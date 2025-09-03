import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GetAllQuizzes as GetAllQuizzesService,
  DeleteQuiz as DeleteQuizService,
} from "../services/QuizService";
import { useAuth } from "../context/AuthContext";
import "../styles/QuizManager.css";

function formatSeconds(total) {
  if (!total || total <= 0) return "Bez ogr.";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const difficultyLabel = (d) => {
  // backend salje int (0,1,2) ili enum
  const map = { 0: "Lako", 1: "Srednje", 2: "Teško" };
  return map?.[d] ?? d;
};

export default function QuizManager({
  getAllFn = GetAllQuizzesService,
  deleteFn = DeleteQuizService,
}) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // sigurnosna zastita i na UI
  const isAdmin = useMemo(() => {
    const role = (auth?.Role || auth?.role || "").toString().toLowerCase();
    const userType = auth?.UserType ?? auth?.userType;
    return role === "administrator" || userType === 0;
  }, [auth]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!auth) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getAllFn();
        const list = Array.isArray(data)
          ? data
          : data.items ?? data.Items ?? [];
        setRows(list);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Neuspešno učitavanje kvizova.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth, getAllFn]);

  /*if (!isAdmin) {
    return (
      <div className="adminqz-wrap">
        <div className="adminqz-card">
          <h2>Pristup odbijen</h2>
          <p>Ova stranica je dostupna samo administratorima.</p>
          <button onClick={() => navigate("/")}>Nazad na početnu</button>
        </div>
      </div>
    );
  } */

  const onDelete = async (id, title) => {
    const yes = window.confirm(
      `Obrisati kviz "${title}"? Ova radnja je trajna.`
    );
    if (!yes) return;
    try {
      await deleteFn(id);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Brisanje nije uspelo. Pokušaj ponovo."
      );
    }
  };

  return (
    <div className="adminqz-wrap">
      <div className="adminqz-header">
        

        { isAdmin ? (
          <><h1>Upravljanje kvizovima</h1>
          <button
            className="adminqz-create"
            onClick={() => navigate("/QuizManager/CreateQuiz")}
          >
            + Dodaj novi kviz
          </button></>
        ) : (<h1>Dostupni Kvizovi</h1>)}
          
      </div>

      {err && <div className="adminqz-error">{err}</div>}

      {loading ? (
        <div className="adminqz-loading">Učitavanje…</div>
      ) : (
        <div className="adminqz-table">
          <div className="adminqz-thead">
            <div>Naslov</div>
            <div>Kategorija</div>
            <div>Težina</div>
            <div>Vreme</div>
            <div className="adminqz-actions-col">Akcije</div>
          </div>

          {rows.length === 0 ? (
            <div className="adminqz-empty">Nema kvizova.</div>
          ) : (
            rows.map((q) => (
              <div key={q.id} className="adminqz-row">
                <div className="adminqz-title">
                  {q.title}
                </div>
                <div>{q.categoryName}</div>
                <div>{difficultyLabel(q.difficulty)}</div>
                <div>{formatSeconds(q.timeLimitSeconds)}</div>
                <div className="adminqz-actions">
                  {!isAdmin ? (
                    <button className="adminqz-take-quiz" onClick={() =>
                          navigate(`/QuizManager/${q.id}/QuizSolving`)}> Reši Kviz</button>
                  ) : (
                    <>
                      <button
                        className="adminqz-edit"
                        onClick={() =>
                          navigate(`/QuizManager/${q.id}/EditQuiz`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="adminqz-delete"
                        onClick={() => onDelete(q.id, q.title)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
