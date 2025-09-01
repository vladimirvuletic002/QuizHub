import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  GetQuizById as GetQuizByIdService,
  UpdateQuiz as UpdateQuizService,
} from "../services/QuizService";
import QuizInfoForm from "../components/QuizInfoForm";
import QuestionEditor from "../components/QuestionEditor";
import "../styles/CreateQuizPage.css";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

export default function AdminQuizEditPage({
  getByIdFn = GetQuizByIdService,
  updateFn = UpdateQuizService,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState({
    Title: "",
    Description: "",
    CategoryId: "",
    Difficulty: "",
    TimeLimitSeconds: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingNew, setEditingNew] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getByIdFn(id);
        // mapiraj meta
        setMeta({
          Title: data.title ?? data.Title,
          Description: data.description ?? data.Description ?? "",
          CategoryId: data.categoryId ?? data.CategoryId,
          Difficulty: data.difficulty ?? data.Difficulty,
          TimeLimitSeconds: data.timeLimitSeconds ?? data.TimeLimitSeconds ?? 0,
        });
        // mapiraj pitanja (zadrži Order iz backa)
        const qs = (data.questions ?? data.Questions ?? []).map((q) => ({
          Text: q.text ?? q.Text,
          Type: q.type ?? q.Type,
          Order: q.order ?? q.Order,
          Points: q.points ?? q.Points,
          TimeLimitSeconds: q.timeLimitSeconds ?? q.TimeLimitSeconds ?? null,
          Options: q.options ?? q.Options ?? null,
          AcceptableAnswers: q.acceptableAnswers ?? q.AcceptableAnswers ?? null,
        }));
        // osiguraj stabilan redosled po Order
        qs.sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
        setQuestions(qs);
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

  const metaValid = useMemo(() => {
    return (
      meta.Title?.trim()?.length > 0 &&
      !!meta.CategoryId &&
      meta.Difficulty !== "" &&
      meta.Difficulty !== undefined &&
      meta.Difficulty !== null
    );
  }, [meta]);

  const removeQuestion = (idx) => {
    setQuestions((list) => {
      const next = list.filter((_, i) => i !== idx);
      // reindex Order
      return next.map((q, i2) => ({ ...q, Order: i2 + 1 }));
    });
  };

  const startEdit = (idx) => { setEditingIndex(idx); setEditingNew(false); }
  const cancelEdit = () => { setEditingIndex(-1); setEditingNew(false); }

  const saveEdited = (newDto) => {
    setQuestions((list) => {
    if (editingNew) {
      // append
      return [...list, { ...newDto, Order: list.length + 1 }];
    } else {
      // replace
      const next = [...list];
      next[editingIndex] = { ...newDto, Order: editingIndex + 1 };
      return next;
    }
  });
  setEditingIndex(-1);
  setEditingNew(false);
  };

  const onSaveAll = async () => {
    if (!metaValid) {
      setErr("Popuni naslov, kategoriju i težinu.");
      return;
    }
    if (questions.length === 0) {
      setErr("Kviz mora imati bar jedno pitanje.");
      return;
    }
    setErr("");
    const dto = {
      Title: meta.Title.trim(),
      Description: meta.Description?.trim() || null,
      CategoryId: Number(meta.CategoryId),
      Difficulty: Number(meta.Difficulty),
      TimeLimitSeconds: Number(meta.TimeLimitSeconds) || 0,
      Questions: questions.map((q, i) => ({ ...q, Order: i + 1 })),
    };
    try {
      setSaving(true);
      await updateFn(id, dto);
      navigate("/QuizManager"); // nazad na listu
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Čuvanje nije uspelo.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qcreate-wrap">
      <h1>Uredi kviz</h1>

      {err && <div className="qcreate-error">{err}</div>}
      {loading ? (
        <div className="adminqz-loading">Učitavanje…</div>
      ) : (
        <>
          <QuizInfoForm value={meta} onChange={setMeta} />

          {metaValid && (
            <section className="qcreate-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>Pitanja</h2>
                <button
                  type="button"
                  className="qcreate-secondary"
                  onClick={() => {
                    setEditingIndex(questions.length); // sledeci indeks (append)
                    setEditingNew(true);
                  }}
                >
                  + Dodaj novo pitanje
                </button>
              </div>
              {questions.length === 0 ? (
                <p className="qcreate-muted">Nema pitanja.</p>
              ) : (
                <div className="adminqz-table">
                  <div className="adminqz-thead">
                    <div>#</div>
                    <div>Tekst</div>
                    <div>Tip</div>
                    <div>Poeni</div>
                    <div className="adminqz-actions-col">Akcije</div>
                  </div>
                  {questions.map((q, idx) => (
                    <div key={idx} className="adminqz-row">
                      <div>{idx + 1}</div>
                      <div
                        className="adminqz-title"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {q.Text}
                      </div>
                      <div>
                        {q.Type === QT.SingleChoice
                          ? "Single"
                          : q.Type === QT.MultipleChoice
                          ? "Multiple"
                          : q.Type === QT.TrueFalse
                          ? "T/N"
                          : "Text"}
                      </div>
                      <div>{q.Points}</div>
                      <div className="adminqz-actions">
                        <button
                          className="adminqz-edit"
                          onClick={() => startEdit(idx)}
                        >
                          Edit
                        </button>
                        <button
                          className="adminqz-delete"
                          onClick={() => removeQuestion(idx)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {editingIndex >= 0 && (
            <QuestionEditor
              initial={editingNew ? null : questions[editingIndex]}
              onCancel={cancelEdit}
              onSave={saveEdited}
            />
          )}

          {metaValid && (
            <section className="qcreate-footer">
              <button
                type="button"
                className="qcreate-finish"
                disabled={saving || questions.length === 0}
                onClick={onSaveAll}
              >
                {saving ? "Čuvam…" : "Sačuvaj izmene"}
              </button>
              <button
                type="button"
                className="qcreate-cancel"
                onClick={() => navigate("/QuizManager")}
              >
                Otkaži
              </button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
