import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildRoomConnection } from "../signalR";
import MultipleChoiceView from "../components/MultipleChoiceView";
import TextInputView from "../components/TextInputView";
import {
  setLiveHeader,
  clearLiveHeader,
  stripLiveFromAuth,
  LIVE_STORE,
} from "../components/LiveSession";
import { useAuth } from "../context/AuthContext";
import "../styles/LiveRoom.css";

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

export default function LiveRoomPage() {
  const { roomCode } = useParams();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const isAdmin = useMemo(() => {
    const role = (auth?.Role || auth?.role || "").toLowerCase();
    const userType = auth?.UserType ?? auth?.userType;
    return role === "administrator" || userType === 0;
  }, [auth]);

  const [state, setState] = useState("Lobby"); // Lobby | Question | Reveal | Finished
  const [question, setQuestion] = useState(null); // { id, text, type, options?, timeLimitSeconds, order, points }
  const [left, setLeft] = useState(null);
  const [scores, setScores] = useState([]); // [{userId, username, score}]
  const [joined, setJoined] = useState([]);
  const connRef = useRef(null);
  const answeredRef = useRef(false);

  
  useEffect(() => {
    let cancelled = false;
    const conn = buildRoomConnection();
    connRef.current = conn;

    // event handleri pre starta su ok
    setLiveHeader(roomCode);
    conn.on("ParticipantJoined", (p) => setJoined((prev) => [...prev, p]));
    conn.on("StateChanged", ({ state }) => setState(state));
    conn.on("ShowQuestion", (dto) => {
      setState("Question");
      setQuestion(dto);
      setLeft(dto.timeLimitSeconds ?? null);
      answeredRef.current = false;
    });
    conn.on("Tick", ({ left }) => setLeft(left));
    conn.on("ScoresUpdated", (payload) =>
      setScores(payload?.rows ?? payload?.Rows ?? [])
    );
    conn.on("Reveal", () => setState("Reveal"));
    conn.on("Finished", (payload) => {
      setState("Finished");
      setScores(payload?.rows ?? payload?.Rows ?? []);
      // --- očisti sve live tragove ---
      clearLiveHeader(roomCode);
    });

    (async () => {
      try {
        await conn.start();
        if (!cancelled) {
          await conn.invoke("JoinRoom", roomCode);
        }
      } catch (e) {
        // opcionalno: log e
      }
    })();

    return () => {
      cancelled = true;
      clearLiveHeader(roomCode);
      // stop tek ako je stvarno startovana; u suprotnom pusti da propadne tiho
      if (conn.state === "Connected" || conn.state === "Connecting") {
        conn.stop().catch(() => {});
      }
    };
  }, [roomCode]);

  if(!auth){
    return (
      <div className="live-wrap">
        <div className="live-card">
          <h2>Pristup odbijen</h2>
          <p>Ova stranica je dostupna samo ulogovanim korisnicima.</p>
          <button onClick={() => navigate("/")}>Nazad na početnu</button>
        </div>
      </div>
    );
  }  

  const submit = async (payload) => {
    if (isAdmin) return;
    if (!connRef.current || !question || answeredRef.current) return;
    answeredRef.current = true;
    try {
      await connRef.current.invoke(
        "SubmitAnswer",
        roomCode,
        question.id ?? question.Id,
        payload
      );
    } catch {
      // ignoriši; korisnik i dalje vidi tick/scores preko servera
    }
  };

  const startQuiz = async () => {
    if (!isAdmin || !connRef.current) return;
    try {
      await connRef.current.invoke("StartQuiz", roomCode);
    } catch {}
  };

  // UI helpers
  const renderLeaderboard = () => (
  <div className="live-board">
    <div className="live-board-head">
      <div>Leaderboard</div>
      <div className="live-board-meta">
        <span className={`state-badge state-${state.toLowerCase()}`}>{state}</span>
        {state === "Question" && left != null && (
          <span className="live-board-timer">⏱ {left}s</span>
        )}
      </div>
    </div>

    <div className="live-table">
      <div className="live-thead">
        <div>#</div>
        <div>Igrač</div>
        <div>Poeni</div>
      </div>
      {scores.map((r, i) => (
        <div key={r.userId ?? r.UserId ?? i} className="live-row">
          <div>{i + 1}</div>
          <div>{r.username ?? r.Username}</div>
          <div>{r.score ?? r.Score}</div>
        </div>
      ))}
    </div>
  </div>
);

  const renderQuestion = () => {
    if (!question) return null;

    // Pazimo na disabled na osnovu answeredRef.current
    const disabled = answeredRef.current === true;

    if (question.type === QT.SingleChoice) {
      return (
        <div className="live-options">
          {(question.options ?? []).map((o) => (
            <button
              key={o.id ?? o.Id}
              className="live-opt"
              onClick={() => submit({ selectedOptionId: o.id ?? o.Id })}
              disabled={disabled}
            >
              {o.text ?? o.Text}
            </button>
          ))}
        </div>
      );
    }


    if (question.type === QT.MultipleChoice) {
      return (
        <MultipleChoiceView
          question={question}
          disabled={disabled}
          onSubmit={(payload) => submit(payload)}
        />
      );
    }

    if (question.type === QT.TrueFalse) {
      return (
        <div className="live-options">
          <button
            className="live-opt"
            onClick={() => submit({ trueFalseAnswer: true })}
            disabled={disabled}
          >
            Tačno
          </button>
          <button
            className="live-opt"
            onClick={() => submit({ trueFalseAnswer: false })}
            disabled={disabled}
          >
            Netačno
          </button>
        </div>
      );
    }

    if (question.type === QT.TextInput) {
      return (
        <TextInputView
          disabled={disabled}
          onSubmit={(payload) => submit(payload)}
        />
      );
    }

    return null;
  };

  return (
    <div className="live-wrap">
      <div className="live-card">
        <div className="live-top">
          <h1>Soba: {roomCode}</h1>
          {isAdmin && state === "Lobby" && (
            <button className="live-primary" onClick={startQuiz}>
              Start
            </button>
          )}
        </div>

        {state === "Lobby" && (
          <p>Čekamo start… Učesnici se mogu priključiti ovom kodu.</p>
        )}

        {isAdmin && renderLeaderboard()}

        {state === "Question" && question && !isAdmin && (
          <>
            <div className="live-qhead">
              <div className="live-qmeta">
                <span>#{question.order ?? question.Order} • </span>
                <span>{question.points ?? question.Points} poen</span>
              </div>
              {left != null && (
                <div className="live-timer-user">
                  <span className="live-board-timer">⏱ {left}s</span>
                </div>
              )}
            </div>
            <h3 className="live-qtext">{question.text ?? question.Text}</h3>
            {renderQuestion()}
          </>
        )}

        {state === "Reveal" && (
          <div className="live-reveal">
            Tačan odgovor prikazan. Sledeće pitanje uskoro…
          </div>
        )}

        {state === "Finished" && !isAdmin &&(
          <>
            <h2>Rezultati</h2>
            {renderLeaderboard()}
          </>
        )}
      </div>
    </div>
  );
}
