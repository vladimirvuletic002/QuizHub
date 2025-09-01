import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizInfoForm from "../components/QuizInfoForm";
import QuestionBuildForm from "../components/QuestionBuildForm";
import { CreateQuiz as CreateQuizService } from "../services/QuizService";
import { useAuth } from "../context/AuthContext";
import '../styles/CreateQuizPage.css';

export default function CreateQuizPage({ createFn = CreateQuizService }) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // meta state
  const [meta, setMeta] = useState({
    Title: "",
    Description: "",
    CategoryId: "",
    Difficulty: "",
    TimeLimitSeconds: 0,
  });

  // lista pitanja (bez Order; dodaćemo pri submitu)
  const [questions, setQuestions] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const metaValid = useMemo(() => {
    return (
      meta.Title.trim().length > 0 &&
      !!meta.CategoryId &&
      meta.Difficulty !== "" &&
      meta.Difficulty !== undefined &&
      meta.Difficulty !== null
    );
  }, [meta]);

  // sigurnosna zastita i na UI
    const isAdmin = useMemo(() => {
      const role = (auth?.Role || auth?.role || "").toString().toLowerCase();
      const userType = auth?.UserType ?? auth?.userType;
      return role === "administrator" || userType === 0;
    }, [auth]);

    if (!isAdmin) {
    return (
      <div className="adminqz-wrap">
        <div className="adminqz-card">
          <h2>Pristup odbijen</h2>
          <p>Ova stranica je dostupna samo administratorima.</p>
          <button onClick={() => navigate("/")}>Nazad na početnu</button>
        </div>
      </div>
    );
  }

  const handleAddQuestion = (qDto) => {
    const withOrder = { ...qDto, Order: questions.length + 1 };
    setQuestions((list) => [...list, withOrder]);
  };

  const onFinish = async () => {
    if (questions.length === 0) {
      setErr("Dodajte bar jedno pitanje pre završetka.");
      return;
    }
    setErr("");

    const dto = {
      Title: meta.Title.trim(),
      Description: meta.Description?.trim() || null,
      CategoryId: Number(meta.CategoryId),
      Difficulty: Number(meta.Difficulty),
      TimeLimitSeconds: Number(meta.TimeLimitSeconds) || 0,
      Questions: questions,
    };

    try {
      setSaving(true);
      await createFn(dto);
      navigate("/QuizManager");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Kreiranje kviza nije uspelo.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qcreate-wrap">
      <h1>Kreiranje kviza</h1>

      {err && <div className="qcreate-error">{err}</div>}

      <QuizInfoForm value={meta} onChange={setMeta} />

      {metaValid && (
        <>
          <QuestionBuildForm onAdd={handleAddQuestion} />

          <section className="qcreate-card">
            <h3>Sažetak</h3>
            <p>
              Dodata pitanja: <strong>{questions.length}</strong>
            </p>
          </section>

          <section className="qcreate-footer">
            <button
              type="button"
              className="qcreate-finish"
              disabled={saving || questions.length === 0}
              onClick={onFinish}
            >
              {saving ? "Čuvam…" : "Završi Kreiranje"}
            </button>
            <button
              type="button"
              className="qcreate-cancel"
              onClick={() => navigate("/QuizManager")}
            >
              Otkaži
            </button>
          </section>
        </>
      )}
    </div>
  );
}