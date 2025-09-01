import React, { useMemo, useState } from "react";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

export default function QuestionBuildForm({ onAdd }) {
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState(QT.SingleChoice);
  const [qPoints, setQPoints] = useState(1);

  // opcije za single/multiple
  const [options, setOptions] = useState([
    { text: "", isCorrect: false, key: 1 },
    { text: "", isCorrect: false, key: 2 },
    { text: "", isCorrect: false, key: 3 },
    { text: "", isCorrect: false, key: 4 },
  ]);
  const [singleCorrectIndex, setSingleCorrectIndex] = useState(null);

  // true/false
  const [trueFalseValue, setTrueFalseValue] = useState(null);

  // text input
  const [textAnswer, setTextAnswer] = useState("");
  const [acceptableAnswers, setAcceptableAnswers] = useState([]);

  const resetForm = () => {
    setQText("");
    setQType(QT.SingleChoice);
    setQPoints(1);
    setOptions([
      { text: "", isCorrect: false, key: 1 },
      { text: "", isCorrect: false, key: 2 },
      { text: "", isCorrect: false, key: 3 },
      { text: "", isCorrect: false, key: 4 },
    ]);
    setSingleCorrectIndex(null);
    setTrueFalseValue(null);
    setTextAnswer("");
    setAcceptableAnswers([]);
  };

  const onTypeChange = (v) => {
    const num = Number(v);
    setQType(num);
    setOptions([
      { text: "", isCorrect: false, key: 1 },
      { text: "", isCorrect: false, key: 2 },
      { text: "", isCorrect: false, key: 3 },
      { text: "", isCorrect: false, key: 4 },
    ]);
    setSingleCorrectIndex(null);
    setTrueFalseValue(null);
    setTextAnswer("");
    setAcceptableAnswers([]);
  };

  const setOptionText = (idx, val) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, text: val } : o))
    );
  };

  const toggleOptionCorrect = (idx) => {
    if (qType === QT.SingleChoice) {
      setSingleCorrectIndex(idx);
      setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
    } else {
      setOptions((prev) =>
        prev.map((o, i) => (i === idx ? { ...o, isCorrect: !o.isCorrect } : o))
      );
    }
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { text: "", isCorrect: false, key: Date.now() },
    ]);
  };

  const removeOption = (idx) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
    if (qType === QT.SingleChoice && singleCorrectIndex === idx) {
      setSingleCorrectIndex(null);
    }
  };

  const addTextAnswer = () => {
    const val = textAnswer.trim();
    if (!val) return;
    setAcceptableAnswers((list) => [...list, val]);
    setTextAnswer("");
  };

  const removeTextAnswer = (i) => {
    setAcceptableAnswers((list) => list.filter((_, idx) => idx !== i));
  };

  const error = useMemo(() => {
    if (!qText.trim()) return "Unesite tekst pitanja.";
    if (qPoints < 1) return "Poeni moraju biti >= 1.";

    if (qType === QT.TextInput) {
      if (acceptableAnswers.length === 0)
        return "Dodajte bar jedan tačan tekstualni odgovor.";
      return "";
    }

    if (qType === QT.TrueFalse) {
      if (trueFalseValue !== "true" && trueFalseValue !== "false")
        return "Izaberite Tačno ili Netačno.";
      return "";
    }

    const filled = options.filter((o) => o.text.trim().length > 0);
    if (filled.length < 2) return "Potrebne su najmanje 2 opcije.";

    const correctCount = options.filter((o) => o.isCorrect).length;
    if (qType === QT.SingleChoice && correctCount !== 1)
      return "Za Single choice mora biti tačno 1 tačan odgovor.";
    if (qType === QT.MultipleChoice && correctCount < 1)
      return "Za Multiple choice označite bar 1 tačan odgovor.";

    return "";
  }, [qText, qPoints, qType, acceptableAnswers, trueFalseValue, options, singleCorrectIndex]);

  const buildQuestionDto = () => {
    if (qType === QT.TextInput) {
      return {
        Text: qText.trim(),
        Type: QT.TextInput,
        Points: qPoints,
        TimeLimitSeconds: null,
        AcceptableAnswers: acceptableAnswers.slice(),
        Options: null,
      };
    }

    if (qType === QT.TrueFalse) {
      const isTrueCorrect = trueFalseValue === "true";
      return {
        Text: qText.trim(),
        Type: QT.TrueFalse,
        Points: qPoints,
        TimeLimitSeconds: null,
        Options: [
          { Text: "Tačno", IsCorrect: isTrueCorrect },
          { Text: "Netačno", IsCorrect: !isTrueCorrect },
        ],
        AcceptableAnswers: null,
      };
    }

    const filled = options
      .filter((o) => o.text.trim().length > 0)
      .map((o, idx) => ({
        Text: o.text.trim(),
        IsCorrect: !!o.isCorrect
      }));

    return {
      Text: qText.trim(),
      Type: qType,
      Points: qPoints,
      TimeLimitSeconds: null,
      Options: filled,
      AcceptableAnswers: null,
    };
  };

  const onAddQuestion = () => {
    if (error) return;
    const dto = buildQuestionDto();
    onAdd?.(dto); // parent dodaje Order i cuva listu
    resetForm();
  };

  return (
    <section className="qcreate-card">
      <h2>2) Dodaj pitanje</h2>

      {error && <div className="qcreate-error">{error}</div>}

      <div className="qcreate-grid">
        <label className="qcreate-label qcreate-col-span-2">
          Tekst pitanja
          <textarea
            className="qcreate-input"
            rows={3}
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
        </label>

        <label className="qcreate-label">
          Tip pitanja
          <select
            className="qcreate-input"
            value={qType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value={QT.SingleChoice}>Single choice</option>
            <option value={QT.MultipleChoice}>Multiple choice</option>
            <option value={QT.TrueFalse}>Tačno / Netačno</option>
            <option value={QT.TextInput}>Text input</option>
          </select>
        </label>

        <label className="qcreate-label">
          Poeni
          <input
            className="qcreate-input"
            type="number"
            min={1}
            value={qPoints}
            onChange={(e) => setQPoints(Number(e.target.value))}
          />
        </label>
      </div>

      {qType === QT.SingleChoice && (
        <div className="qcreate-block">
          <p className="qcreate-muted">Obeleži tačan odgovor (radio).</p>
          {options.map((o, i) => (
            <div key={o.key} className="qcreate-row">
              <input
                type="radio"
                name="single-correct"
                checked={i === singleCorrectIndex}
                onChange={() => toggleOptionCorrect(i)}
              />
              <input
                className="qcreate-input"
                type="text"
                placeholder={`Opcija ${i + 1}`}
                value={o.text}
                onChange={(e) => setOptionText(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="qcreate-danger"
                  onClick={() => removeOption(i)}
                >
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

      {qType === QT.MultipleChoice && (
        <div className="qcreate-block">
          <p className="qcreate-muted">Označi tačne odgovore (checkbox).</p>
          {options.map((o, i) => (
            <div key={o.key} className="qcreate-row">
              <input
                type="checkbox"
                checked={o.isCorrect}
                onChange={() => toggleOptionCorrect(i)}
              />
              <input
                className="qcreate-input"
                type="text"
                placeholder={`Opcija ${i + 1}`}
                value={o.text}
                onChange={(e) => setOptionText(i, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="qcreate-danger"
                  onClick={() => removeOption(i)}
                >
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
          <p className="qcreate-muted">Izaberi tačan odgovor.</p>
          <div className="qcreate-row">
            <label className="qcreate-radio">
              <input
                type="radio"
                name="tf"
                checked={trueFalseValue === "true"}
                onChange={() => setTrueFalseValue("true")}
              />
              Tačno
            </label>
            <label className="qcreate-radio">
              <input
                type="radio"
                name="tf"
                checked={trueFalseValue === "false"}
                onChange={() => setTrueFalseValue("false")}
              />
              Netačno
            </label>
          </div>
        </div>
      )}

      {qType === QT.TextInput && (
        <div className="qcreate-block">
          <p className="qcreate-muted">
            Dodaj jedan ili više prihvatljivih odgovora.
          </p>
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
                  <button type="button" onClick={() => removeTextAnswer(i)}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="qcreate-actions">
        <button
          type="button"
          className="qcreate-primary"
          disabled={!!error}
          onClick={onAddQuestion}
        >
          Dodaj pitanje
        </button>
        <button type="button" className="qcreate-ghost" onClick={resetForm}>
          Sledeće pitanje
        </button>
      </div>
    </section>
  );
}