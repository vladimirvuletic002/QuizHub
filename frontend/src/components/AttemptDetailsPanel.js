import React, { useEffect, useMemo, useState } from "react";
import { GetDetails as GetDetailsService } from "../services/AttemptService";
import ProgressChart from "./ProgressChart";
import "../styles/AttemptDetailsPanel.css";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };


function userAnswerLabels(q, selIds, textAns) {
  if (q.Type === QT.TextInput) return [(textAns ?? "").toString() || "(bez odgovora)"];
  const set = new Set(selIds ?? []);
  const chosen = (q.Options ?? []).filter(o => set.has(o.Id));
  return chosen.length ? chosen.map(o => o.Text) : ["(bez odgovora)"];
}

function correctAnswerLabels(q) {
  if (q.Type === QT.TextInput) return (q.AcceptableAnswers ?? []);
  if (q.Type === QT.TrueFalse || q.Type === QT.SingleChoice || q.Type === QT.MultipleChoice) {
    return (q.Options ?? []).filter(o => o.IsCorrect).map(o => o.Text);
  }
  return [];
}

export default function AttemptDetailsPanel({
  attemptId,
  getFn = GetDetailsService,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!open || details) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getFn(attemptId);
        setDetails(data);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Neuspešno učitavanje detalja.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, details, attemptId, getFn]);

  const progress = useMemo(() => (details?.progress ?? []).map(p => ({
    score: p.score ?? p.Score,
    max: p.maxScore ?? p.MaxScore,
    whenUtc: p.whenUtc ?? p.WhenUtc
  })), [details]);

  return (
    <div className="adp-wrap">
      <button className="adp-toggle" onClick={() => setOpen(o => !o)}>
        {open ? "Sakrij" : "Još"}
      </button>

      {open && (
        <div className="adp-panel">
          {loading && <div className="adp-loading">Učitavanje…</div>}
          {err && <div className="adp-error">{err}</div>}
          {details && (
            <>
              

              {progress.length > 0 && (
                <div className="adp-chart">
                  <ProgressChart points={progress} />
                </div>
              )}

              <ol className="adp-list">
                {(details.questions ?? []).map((q) => {
                  const qn = {
                    Id: q.questionId ?? q.QuestionId,
                    Order: q.order ?? q.Order,
                    Text: q.text ?? q.Text,
                    Type: q.type ?? q.Type,
                    Points: q.points ?? q.Points,
                    Options: (q.options ?? q.Options)?.map(o => ({
                      Id: o.id ?? o.Id, Text: o.text ?? o.Text, IsCorrect: o.isCorrect ?? o.IsCorrect
                    })) ?? null,
                    AcceptableAnswers: q.acceptableAnswers ?? q.AcceptableAnswers ?? null,
                  };
                  const selectedIds = q.selectedOptionIds ?? q.SelectedOptionIds ?? [];
                  const textAns = q.textAnswer ?? q.TextAnswer ?? "";
                  const isCorrect = (q.isCorrect ?? q.IsCorrect) === true;
                  const userVals = userAnswerLabels(qn, selectedIds, textAns);
                  const correctVals = correctAnswerLabels(qn);

                  return (
                    <li key={qn.Id} className={`adp-item ${isCorrect ? "ok" : "bad"}`}>
                      <div className="adp-qhead">
                        <strong>#{qn.Order}</strong>
                        <span className="adp-qpts">{qn.Points} poena</span>
                        <span className={`adp-badge ${isCorrect ? "ok" : "bad"}`}>
                          {isCorrect ? "Tačno" : "Netačno"}
                        </span>
                      </div>
                      <div className="adp-qtext">{qn.Text}</div>

                      <div className="adp-row">
                        <span className="adp-tag">Tvoj odgovor:</span>
                        <div className="adp-chips">
                          {userVals.map((v, i) => (
                            <span key={i} className="adp-chip">{v}</span>
                          ))}
                        </div>
                      </div>

                      <div className="adp-row">
                        <span className="adp-tag">Tačno:</span>
                        <div className="adp-chips">
                          {correctVals.map((v, i) => (
                            <span key={i} className="adp-chip ok">{v}</span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}