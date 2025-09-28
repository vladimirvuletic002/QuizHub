import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetQuizById as GetQuizByIdService,
  SubmitQuiz as SubmitQuizService,
} from "../services/QuizService";
import { useAuth } from "../context/AuthContext";
import QuestionShow from "../components/QuestionShow";
import "../styles/QuizSolvePage.css";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };
const STORE = (id) => `qh_quiz_${id}`;
const nowIso = () => new Date().toISOString();

function formatTime(sec) {
  const s = Math.max(0, sec | 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function normalizeQuiz(raw) {
  if (!raw) return null;
  const data = {
    Id: raw.id ?? raw.Id,
    Title: raw.title ?? raw.Title,
    Description: raw.description ?? raw.Description ?? "",
    CategoryId: raw.categoryId ?? raw.CategoryId,
    CategoryName: raw.categoryName ?? raw.CategoryName ?? "",
    Difficulty: raw.difficulty ?? raw.Difficulty,
    TimeLimitSeconds: raw.timeLimitSeconds ?? raw.TimeLimitSeconds ?? 0,
    Questions: (raw.questions ?? raw.Questions ?? []).map((q) => ({
      Id: q.id ?? q.Id,
      Text: q.text ?? q.Text,
      Type: q.type ?? q.Type,
      Order: q.order ?? q.Order,
      Points: q.points ?? q.Points ?? 1,
      TimeLimitSeconds: q.timeLimitSeconds ?? q.TimeLimitSeconds ?? 0,
      Options:
        (q.options ?? q.Options ?? null)?.map((o, i) => ({
          Id: o.id ?? o.Id, // ← ID je kanonski
          Text: o.text ?? o.Text ?? "",
          IsCorrect: o.isCorrect ?? o.IsCorrect ?? false,
          Order: o.order ?? o.Order ?? i + 1,
        })) ?? null,
      AcceptableAnswers: q.acceptableAnswers ?? q.AcceptableAnswers ?? null,
    })),
  };
  data.Questions.sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  return data;
}

// ---------- Review helpers ----------
function correctAnswerLabels(q) {
  if (q.Type === QT.SingleChoice || q.Type === QT.MultipleChoice) {
    const correct = (q.Options ?? []).filter((o) => o.IsCorrect);
    return correct.map((o) => o.Text);
  }
  if (q.Type === QT.TrueFalse) {
    const t = (q.Options ?? []).find(
      (o) =>
        o.Text.toLowerCase() === "tačno" || o.Text.toLowerCase() === "tacno"
    );
    const isTrueCorrect = !!(t && t.IsCorrect);
    return [isTrueCorrect ? "Tačno" : "Netačno"];
  }
  if (q.Type === QT.TextInput) {
    return (q.AcceptableAnswers ?? []).slice();
  }
  return [];
}

function userAnswerLabels(q, val) {
  if (q == null) return [];
  if (q.Type === QT.SingleChoice) {
    const o = (q.Options ?? []).find((x) => x.Id === val);
    return o ? [o.Text] : ["(bez odgovora)"];
  }
  if (q.Type === QT.MultipleChoice) {
    const set = new Set(Array.isArray(val) ? val : Array.from(val || []));
    const picked = (q.Options ?? []).filter((x) => set.has(x.Id));
    return picked.length ? picked.map((x) => x.Text) : ["(bez odgovora)"];
  }
  if (q.Type === QT.TrueFalse) {
    if (val === true) return ["Tačno"];
    if (val === false) return ["Netačno"];
    return ["(bez odgovora)"];
  }
  if (q.Type === QT.TextInput) {
    const t = (val ?? "").toString().trim();
    return [t || "(bez odgovora)"];
  }
  return [];
}

export default function QuizSolvingPage({
  getByIdFn = GetQuizByIdService,
  submitFn = SubmitQuizService,
}) {
  const { id } = useParams();
  const quizIdNum = Number(id);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [order]: value }
  const [left, setLeft] = useState(null);
  const [finished, setFinished] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const startAtRef = useRef(null); // za cuvanje tajmera
  const submittingRef = useRef(false);
  const finishedRef = useRef(false);

  const isAdmin = useMemo(() => {
      const role = (auth?.Role || auth?.role || "").toString().toLowerCase();
      const userType = auth?.UserType ?? auth?.userType;
      return role === "administrator" || userType === 0;
    }, [auth]);


  // load quiz
  useEffect(() => {
    if (!auth) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getByIdFn(quizIdNum);
        const qz = normalizeQuiz(data);
        setQuiz(qz);

        // restore iz STORE(id), ne STORE(qz.Id)
        const raw = localStorage.getItem(STORE(id));
        let parsed = null;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {}

        // answers
        const restoredAnswers = {};
        const a = parsed?.answers || {};
        for (const k of Object.keys(a)) {
          const order = Number(k);
          const val = a[k];
          const q = qz.Questions.find((x) => x.Order === order);
          if (!q) continue;
          if (q.Type === QT.MultipleChoice) {
            restoredAnswers[order] = new Set(Array.isArray(val) ? val : []);
          } else if (q.Type === QT.TrueFalse) {
            restoredAnswers[order] = typeof val === "boolean" ? val : null;
          } else if (q.Type === QT.SingleChoice) {
            restoredAnswers[order] = typeof val === "number" ? val : null;
          } else {
            restoredAnswers[order] = (val ?? "").toString();
          }
        }
        setAnswers(restoredAnswers);
        setIdx(Number.isInteger(parsed?.idx) ? parsed.idx : 0);

        // TIMER: izračunaj left iz startAtRef + limit
        if (qz.TimeLimitSeconds > 0) {
          const start = new Date(startAtRef.current || nowIso()).getTime();
          const elapsed = Math.floor((Date.now() - start) / 1000);
          const initialLeft = Math.max(qz.TimeLimitSeconds - elapsed, 0);
          setLeft(initialLeft);
          /*if (initialLeft <= 0) {
            handleFinish(qz, restoredAnswers); // auto-završi
            return;
          }*/
        }
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Neuspešno učitavanje kviza.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getByIdFn]);

  // ---- persist answers & idx on change ----
  useEffect(() => {
    if (!quiz) return;
    const key = STORE(id);

    let parsed = {};
    try {
      const raw = localStorage.getItem(key);
      parsed = raw ? JSON.parse(raw) : {};
    } catch {}

    const startAt = parsed.startAt || startAtRef.current || nowIso();
    if (!startAtRef.current) startAtRef.current = startAt;

    const obj = {
      startAt, // ostaje isti
      idx,
      answers: Object.fromEntries(
        Object.entries(answers).map(([order, val]) => {
          if (val instanceof Set) return [order, Array.from(val)];
          return [order, val];
        })
      ),
    };
    localStorage.setItem(key, JSON.stringify(obj));
  }, [answers, idx, quiz, id]);

  // Init storage “sesije” za ovaj quizId pre bilo cega drugog
  useEffect(() => {
    const key = STORE(id); // koristi param iz URL-a, PRE učitavanja kviza
    const raw = localStorage.getItem(key);
    if (!raw) {
      const payload = { startAt: nowIso(), answers: {}, idx: 0 };
      localStorage.setItem(key, JSON.stringify(payload));
      startAtRef.current = payload.startAt;
    } else {
      try {
        const parsed = JSON.parse(raw);
        startAtRef.current = parsed?.startAt || nowIso();
        if (!parsed?.startAt) {
          parsed.startAt = startAtRef.current;
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {
        const payload = { startAt: nowIso(), answers: {}, idx: 0 };
        localStorage.setItem(key, JSON.stringify(payload));
        startAtRef.current = payload.startAt;
      }
    }
  }, [id]);

  // timer
  useEffect(() => {
    if (!quiz || !left || finished) return;

    if(!left || left <= 0){
      handleFinish();
      return;
    }

    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleFinish(quiz, answers); // auto-finish
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, left, finished]);

  const current = useMemo(
    () => (quiz ? quiz.Questions[idx] : null),
    [quiz, idx]
  );

  if (isAdmin) {
    return (
      <div className="adminqz-wrap">
        <div className="adminqz-card">
          <h2>Pristup odbijen</h2>
          <p>Ova stranica je dostupna samo igračima.</p>
          <button onClick={() => navigate("/")}>Nazad na početnu</button>
        </div>
      </div>
    );
  }

  // set answer
  // Single: value = optionId (number)
  // Multiple: value = Set<optionId>
  // T/F: value = boolean
  // Text: value = string
  const setAnswer = (order, val) => setAnswers((a) => ({ ...a, [order]: val }));

  const canPrev = idx > 0;
  const canNext = quiz ? idx < quiz.Questions.length - 1 : false;

  const goPrev = () => canPrev && setIdx((i) => i - 1);
  const goNext = () => canNext && setIdx((i) => i + 1);

  const buildSubmitDto = () => {
    const key = STORE(id);
    let startedAt = null;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      startedAt = parsed?.startAt ?? null;
    } catch {}

    const dto = { StartedAtUtc: startedAt, Answers: [] };
    for (const q of quiz.Questions) {
      const v = answers[q.Order];
      if (q.Type === QT.SingleChoice) {
        dto.Answers.push({
          QuestionId: q.Id,
          SelectedOptionId: typeof v === "number" ? v : null,
        });
      } else if (q.Type === QT.MultipleChoice) {
        dto.Answers.push({
          QuestionId: q.Id,
          SelectedOptionIds: Array.isArray(v) ? v : Array.from(v || []),
        });
      } else if (q.Type === QT.TrueFalse) {
        dto.Answers.push({
          QuestionId: q.Id,
          TrueFalseAnswer: v === true, // boolean
        });
      } else if (q.Type === QT.TextInput) {
        dto.Answers.push({
          QuestionId: q.Id,
          TextAnswer: (v ?? "").toString(),
        });
      }
    }
    return dto;
  };

  const handleFinish = async (qz = quiz, ans = answers) => {
    if (!qz) {
      console.log("Nema kviza!!!");
      return;
    }

    if (finishedRef.current || submittingRef.current) return; // HARD GUARD
    finishedRef.current = true;
    submittingRef.current = true;

    try {
      const dto = buildSubmitDto(qz, ans);
      console.log(qz.Id);
      const { data } = await submitFn(qz.Id, dto);
      setServerResult(data);
      setFinished(true);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Slanje rešenja nije uspelo.";
      setErr(msg);
    } finally {
      
      // očisti storage da novi pokušaj dobije fresh timer
      localStorage.removeItem(STORE(id));
    }
  };

  if (loading) return <div className="qs-wrap">Učitavanje…</div>;
  if (err) return <div className="qs-wrap qs-error">{err}</div>;
  if (!quiz) return <div className="qs-wrap qs-error">Kviz nije pronađen.</div>;

  if (finished) {
    const totalMax =
      serverResult?.max ??
      quiz.Questions.reduce((s, q) => s + (q.Points ?? 1), 0);
    const totalScore = serverResult?.score ?? 0;
    const correctnessByOrder = new Map(
      (serverResult?.questions ?? []).map((qr) => [qr.order, !!qr.correct])
    );

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

          <button
            className="qs-primary"
            onClick={() => navigate("/QuizManager")}
          >
            Nazad na listu kvizova
          </button>
        </div>
      </div>
    );
  }

  const answered = answers[current.Order];

  return (
    <div className="qs-wrap">
      <div className="qs-header">
        <h1>{quiz.Title}</h1>
        <div className="qs-meta">
          {quiz.CategoryName && <span>Kategorija: {quiz.CategoryName}</span>}
          {quiz.TimeLimitSeconds > 0 && (
            <span>
              Preostalo:{" "}
              <strong>{formatTime(left ?? quiz.TimeLimitSeconds)}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="qs-card">
        <div className="qs-qhead">
          <div className="qs-qnum">
            Pitanje {idx + 1} / {quiz.Questions.length}
          </div>
          <div className="qs-qpoints">{current.Points} poena</div>
        </div>

        <h3 className="qs-qtext">{current.Text}</h3>

        <QuestionShow
          q={current}
          value={answered}
          onChange={(val) => setAnswer(current.Order, val)}
        />

        <div className="qs-actions">
          <button className="qs-ghost" disabled={!canPrev} onClick={goPrev}>
            Prethodno
          </button>
          {canNext ? (
            <button className="qs-primary" onClick={goNext}>
              Sledeće
            </button>
          ) : (
            <button className="qs-finish" onClick={() => handleFinish()}>
              Završi kviz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
