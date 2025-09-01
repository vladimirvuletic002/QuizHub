import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

export default function QuestionEditor({ initial, onCancel, onSave }) {
  const norm = (q) => {
    if (!q) return null;
    return {
      Text: q.Text ?? q.text ?? "",
      Type: q.Type ?? q.type ?? QT.SingleChoice,
      Points: q.Points ?? q.points ?? 1,
      TimeLimitSeconds: q.TimeLimitSeconds ?? q.timeLimitSeconds ?? null,
      Options: q.Options ?? q.options ?? null,
      AcceptableAnswers: q.AcceptableAnswers ?? q.acceptableAnswers ?? null,
    };
  };

  const N = norm(initial);

  const [qText, setQText] = React.useState(N?.Text || "");
  const [qType, setQType] = React.useState(N?.Type ?? QT.SingleChoice);
  const [qPoints, setQPoints] = React.useState(N?.Points ?? 1);

  // TF radio
  const [tf, setTf] = React.useState(null);

  // options (single/multiple)
  const [options, setOptions] = React.useState([
    { text: "", isCorrect: false, key: 1 },
    { text: "", isCorrect: false, key: 2 },
    { text: "", isCorrect: false, key: 3 },
    { text: "", isCorrect: false, key: 4 },
  ]);

  // text input answers
  const [acceptableAnswers, setAcceptableAnswers] = React.useState([]);
  const [textAnswer, setTextAnswer] = React.useState("");

  // PREFILL po promeni initial
  React.useEffect(() => {
    const Q = norm(initial);
    // tekst / tip / poeni
    setQText(Q?.Text || "");
    setQType(Q?.Type ?? QT.SingleChoice);
    setQPoints(Q?.Points ?? 1);

    // TextInput
    if ((Q?.Type ?? QT.SingleChoice) === QT.TextInput) {
      setAcceptableAnswers(Q?.AcceptableAnswers?.slice() ?? []);
      setOptions([
        { text: "", isCorrect: false, key: 1 },
        { text: "", isCorrect: false, key: 2 },
        { text: "", isCorrect: false, key: 3 },
        { text: "", isCorrect: false, key: 4 },
      ]);
      setTf(null);
      return;
    }

    // True/False
    if (Q?.Type === QT.TrueFalse) {
      const t = (Q?.Options ?? []).find(
        (o) => (o.Text ?? o.text ?? "").toLowerCase() === "tačno" || (o.Text ?? o.text ?? "").toLowerCase() === "tacno"
      );
      const f = (Q?.Options ?? []).find(
        (o) => (o.Text ?? o.text ?? "").toLowerCase() === "netačno" || (o.Text ?? o.text ?? "").toLowerCase() === "netacno"
      );
      if (t?.IsCorrect ?? t?.isCorrect) setTf("true");
      else if (f?.IsCorrect ?? f?.isCorrect) setTf("false");
      else setTf(null);
      setAcceptableAnswers([]);
      setOptions([
        { text: "", isCorrect: false, key: 1 },
        { text: "", isCorrect: false, key: 2 },
      ]);
      return;
    }

    // Single/Multiple: mapiraj postojeće opcije ili ostavi 4 prazne
    const src = (Q?.Options ?? []).length
      ? Q?.Options
      : [
          { Text: "", IsCorrect: false },
          { Text: "", IsCorrect: false },
          { Text: "", IsCorrect: false },
          { Text: "", IsCorrect: false },
        ];
    setOptions(
      src.map((o, i) => ({
        text: o.Text ?? o.text ?? "",
        isCorrect: !!(o.IsCorrect ?? o.isCorrect),
        key: i + 1,
      }))
    );
    setTf(null);
    setAcceptableAnswers([]);
  }, [initial]);

  // helperi
  const addOption = () =>
    setOptions((prev) => [...prev, { text: "", isCorrect: false, key: Date.now() }]);

  const removeOption = (idx) =>
    setOptions((prev) => prev.filter((_, i) => i !== idx));

  const setOptionText = (idx, val) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text: val } : o)));

  const toggleOptionCorrect = (idx) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, isCorrect: !o.isCorrect } : o)));

  const addTextAnswer = () => {
    const v = textAnswer.trim();
    if (!v) return;
    setAcceptableAnswers((list) => [...list, v]);
    setTextAnswer("");
  };

  const removeTextAnswer = (i) =>
    setAcceptableAnswers((list) => list.filter((_, idx) => idx !== i));

  // promena tipa resetuje odgovarajuće delove
  const onTypeChange = (num) => {
    const t = Number(num);
    setQType(t);
    if (t === QT.TextInput) {
      setAcceptableAnswers([]);
      setOptions([
        { text: "", isCorrect: false, key: 1 },
        { text: "", isCorrect: false, key: 2 },
        { text: "", isCorrect: false, key: 3 },
        { text: "", isCorrect: false, key: 4 },
      ]);
      setTf(null);
    } else if (t === QT.TrueFalse) {
      setTf(null);
      setAcceptableAnswers([]);
      setOptions([
        { text: "", isCorrect: false, key: 1 },
        { text: "", isCorrect: false, key: 2 },
      ]);
    } else {
      setAcceptableAnswers([]);
      setTf(null);
      setOptions([
        { text: "", isCorrect: false, key: 1 },
        { text: "", isCorrect: false, key: 2 },
        { text: "", isCorrect: false, key: 3 },
        { text: "", isCorrect: false, key: 4 },
      ]);
    }
  };

  const error = React.useMemo(() => {
    if (!qText.trim()) return "Unesite tekst pitanja.";
    if (qPoints < 1) return "Poeni moraju biti >= 1.";
    if (qType === QT.TextInput) {
      if (acceptableAnswers.length === 0) return "Dodajte bar jedan tačan tekstualni odgovor.";
      return "";
    }
    if (qType === QT.TrueFalse) {
      if (tf !== "true" && tf !== "false") return "Izaberite Tačno ili Netačno.";
      return "";
    }
    const filled = options.filter((o) => o.text.trim().length > 0);
    if (filled.length < 2) return "Potrebne su najmanje 2 opcije.";
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (qType === QT.SingleChoice && correctCount !== 1) return "Za Single choice mora biti tačno 1 tačan odgovor.";
    if (qType === QT.MultipleChoice && correctCount < 1) return "Za Multiple choice označite bar 1 tačan odgovor.";
    return "";
  }, [qText, qPoints, qType, acceptableAnswers, tf, options]);

  const buildDto = () => {
    if (qType === QT.TextInput) {
      return {
        Text: qText.trim(),
        Type: QT.TextInput,
        Points: qPoints,
        TimeLimitSeconds: N?.TimeLimitSeconds ?? null,
        AcceptableAnswers: acceptableAnswers.slice(),
        Options: null,
      };
    }
    if (qType === QT.TrueFalse) {
      const isTrueCorrect = tf === "true";
      return {
        Text: qText.trim(),
        Type: QT.TrueFalse,
        Points: qPoints,
        TimeLimitSeconds: N?.TimeLimitSeconds ?? null,
        Options: [
          { Text: "Tačno", IsCorrect: isTrueCorrect },
          { Text: "Netačno", IsCorrect: !isTrueCorrect },
        ],
        AcceptableAnswers: null,
      };
    }
    const filled = options
      .filter((o) => o.text.trim().length > 0)
      .map((o, idx) => ({ Text: o.text.trim(), IsCorrect: !!o.isCorrect }));
    return {
      Text: qText.trim(),
      Type: qType,
      Points: qPoints,
      TimeLimitSeconds: N?.TimeLimitSeconds ?? null,
      Options: filled,
      AcceptableAnswers: null,
    };
  };

  return (
    <div className="qcreate-card">
      <h3>{initial ? "Uredi pitanje" : "Novo pitanje"}</h3>

      {error && <div className="qcreate-error">{error}</div>}

      <div className="qcreate-grid">
        <label className="qcreate-label qcreate-col-span-2">
          Tekst pitanja
          <textarea className="qcreate-input" rows={3} value={qText} onChange={(e) => setQText(e.target.value)} />
        </label>

        <label className="qcreate-label">
          Tip pitanja
          <select className="qcreate-input" value={qType} onChange={(e) => onTypeChange(e.target.value)}>
            <option value={QT.SingleChoice}>Single choice</option>
            <option value={QT.MultipleChoice}>Multiple choice</option>
            <option value={QT.TrueFalse}>Tačno / Netačno</option>
            <option value={QT.TextInput}>Text input</option>
          </select>
        </label>

        <label className="qcreate-label">
          Poeni
          <input className="qcreate-input" type="number" min={1} value={qPoints} onChange={(e) => setQPoints(Number(e.target.value))} />
        </label>
      </div>

      {(qType === QT.SingleChoice || qType === QT.MultipleChoice) && (
        <div className="qcreate-block">
          <p className="qcreate-muted">
            {qType === QT.SingleChoice ? "Obeleži tačan (radio)." : "Označi tačne (checkbox)."}
          </p>
          {options.map((o, i) => (
            <div key={o.key ?? i} className="qcreate-row">
              {qType === QT.SingleChoice ? (
                <input
                  type="radio"
                  name="single-correct-edit"
                  checked={o.isCorrect && options.filter((x) => x.isCorrect).length === 1}
                  onChange={() =>
                    setOptions((prev) => prev.map((x, idx) => ({ ...x, isCorrect: idx === i })))
                  }
                />
              ) : (
                <input type="checkbox" checked={o.isCorrect} onChange={() => toggleOptionCorrect(i)} />
              )}

              <input
                className="qcreate-input"
                type="text"
                placeholder={`Opcija ${i + 1}`}
                value={o.text}
                onChange={(e) => setOptionText(i, e.target.value)}
              />

              {options.length > 2 && (
                <button type="button" className="qcreate-danger" onClick={() => removeOption(i)}>
                  Ukloni
                </button>
              )}
            </div>
          ))}
          <button type="button" className="qcreate-secondary" onClick={addOption}>
            + Dodaj opciju
          </button>
        </div>
      )}

      {qType === QT.TrueFalse && (
        <div className="qcreate-block">
          <div className="qcreate-row">
            <label className="qcreate-radio">
              <input type="radio" name="tf-edit" checked={tf === "true"} onChange={() => setTf("true")} />
              Tačno
            </label>
            <label className="qcreate-radio">
              <input type="radio" name="tf-edit" checked={tf === "false"} onChange={() => setTf("false")} />
              Netačno
            </label>
          </div>
        </div>
      )}

      {qType === QT.TextInput && (
        <div className="qcreate-block">
          <div className="qcreate-row">
            <input
              className="qcreate-input"
              type="text"
              placeholder="Unesi tačan odgovor"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
            />
            <button type="button" className="qcreate-secondary" onClick={addTextAnswer}>
              + Dodaj
            </button>
          </div>
          {acceptableAnswers.length > 0 && (
            <ul className="qcreate-chips">
              {acceptableAnswers.map((a, i) => (
                <li key={`${a}-${i}`}>
                  {a}
                  <button type="button" onClick={() => removeTextAnswer(i)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="qcreate-actions">
        <button type="button" className="qcreate-primary" disabled={!!error} onClick={() => onSave(buildDto())}>
          Sačuvaj
        </button>
        <button type="button" className="qcreate-ghost" onClick={onCancel}>
          Otkaži
        </button>
      </div>
    </div>
  );
}