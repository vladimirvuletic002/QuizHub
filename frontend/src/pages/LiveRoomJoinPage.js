import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LiveRoom.css";

export default function LiveRoomJoinPage() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { auth } = useAuth();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!auth) return;
    const c = code.trim().toUpperCase();
    if (!c) { setErr("Unesi kod sobe."); return; }
    navigate(`/Live/Room/${c}`);
  };

  return (
    <div className="live-wrap">
      <div className="live-card">
        <h1>Pridruži se live sobi</h1>
        {err && <div className="live-error">{err}</div>}

        <form onSubmit={onSubmit} className="live-form">
          <div className="form-row">
            <label>Kod</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="npr. ABC123"
            />
          </div>
          <button className="live-primary" type="submit">Uđi</button>
        </form>
      </div>
    </div>
  );
}