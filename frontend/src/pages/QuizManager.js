import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GetAllQuizzes as GetAllQuizzesService,
  SearchQuizzes as SearchQuizzesService,
  DeleteQuiz as DeleteQuizService,
} from "../services/QuizService";
import { GetAllCategories as GetAllCategoriesService } from "../services/CategoryService";
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
  getCatsFn = GetAllCategoriesService,
  deleteFn = DeleteQuizService,
  searchFn = SearchQuizzesService,
}) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // sigurnosna zastita i na UI
  const isAdmin = useMemo(() => {
    const role = (auth?.Role || auth?.role || "").toString().toLowerCase();
    const userType = auth?.UserType ?? auth?.userType;
    return role === "administrator" || userType === 0;
  }, [auth]);

  // toolbar state
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(""); // string radi select-a
  const [keyWord, setKeyWord] = useState("");
  const [debouncedKeyWord, setDebouncedKeyWord] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 20;

  // sve kategorije
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getCatsFn();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
      } catch {
        // ignorisi — toolbar i bez kategorija radi
      }
    })();
    return () => {
      active = false;
    };
  }, [getCatsFn]);


  // debounce za keyword
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyWord(keyWord.trim()), 400);
    return () => clearTimeout(t);
  }, [keyWord]);

  // učitaj kvizove (filter + search)
  useEffect(() => {
    if (!auth) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await searchFn({
          categoryId: categoryId ? Number(categoryId) : undefined,
          keyWord: debouncedKeyWord || undefined,
          difficulty : difficulty !== "" ? Number(difficulty) : undefined,
          page,
          pageSize,
        });
        // backend vraca PagedResult { items, total, ... }
        const list = Array.isArray(data)
          ? data
          : data.items ?? data.Items ?? [];
        if (!active) return;
        setRows(list);
      } catch (e) {
        if (!active) return;
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Neuspešno učitavanje kvizova.";
        setErr(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [auth, searchFn, categoryId, debouncedKeyWord, difficulty, page, pageSize]);


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
        {isAdmin ? (
          <>
            <h1>Upravljanje kvizovima</h1>
            <button
              className="adminqz-create"
              onClick={() => navigate("/QuizManager/CreateQuiz")}
            >
              + Dodaj novi kviz
            </button>
          </>
        ) : (
          <h1>Dostupni Kvizovi</h1>
        )}
      </div>

      {/* Toolbar za filtriranje/pretragu */}
      <div className="adminqz-toolbar">
        <div className="adminqz-field">
          <label>Kategorija</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sve kategorije</option>
            {categories.map((c) => (
              <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                {c.name ?? c.Name}
              </option>
            ))}
          </select>
        </div>

        <div className="adminqz-field">
          <label>Pretraga naziva</label>
          <input
            type="text"
            placeholder="npr. Sisari"
            value={keyWord}
            onChange={(e) => {
              setKeyWord(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="adminqz-field">
          <label>Težina</label>
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sve</option>
            <option value="0">Lako</option>
            <option value="1">Srednje</option>
            <option value="2">Teško</option>
          </select>
        </div>
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
                <div className="adminqz-title">{q.title}</div>
                <div>{q.categoryName}</div>
                <div>{difficultyLabel(q.difficulty)}</div>
                <div>{formatSeconds(q.timeLimitSeconds)}</div>
                <div className="adminqz-actions">
                  {!isAdmin ? (
                    <button
                      className="adminqz-take-quiz"
                      onClick={() =>
                        navigate(`/QuizManager/${q.id}/QuizSolving`)
                      }
                    >
                      {" "}
                      Reši Kviz
                    </button>
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
