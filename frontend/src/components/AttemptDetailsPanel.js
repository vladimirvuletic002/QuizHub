import React, { useEffect, useMemo, useState } from "react";
import { GetDetails as GetDetailsService } from "../services/AttemptService";
import "../styles/AttemptDetailsPanel.css";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

function pct(score, max) {
  return max > 0 ? (score * 100) / max : 0;
}

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

function Sparkline({ points, width=420, height=64, pad=8 }) {
  // points: [{score, max, whenUtc}]
  const vals = points.map(p => pct(p.score, p.max));
  if (vals.length === 0) return null;
  const min = 0, max = 100;
  const n = vals.length;
  const w = width - pad*2, h = height - pad*2;

  const xs = vals.map((_, i) => (i/(Math.max(1, n-1))) * w + pad);
  const ys = vals.map(v => (1 - (v - min)/(max - min)) * h + pad);
  const d = xs.map((x,i) => `${i===0?"M":"L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");

  const last = vals[vals.length-1];
  return (
    <svg width={width} height={height} role="img" aria-label="Progres rezultata">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={
        xs.map((x,i)=>`${x},${ys[i]}`).join(" ")
      } />
      <path d={d} fill="none" stroke="#4f46e5" strokeWidth="2" />
      <circle cx={xs[n-1]} cy={ys[n-1]} r="3" fill="#4f46e5" />
      <text x={width - pad} y={pad+12} textAnchor="end" fontSize="12" fill="#111">
        {Math.round(last)}%
      </text>
    </svg>
  );
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
                  <Sparkline points={progress} />
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