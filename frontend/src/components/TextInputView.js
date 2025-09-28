import React, { useEffect, useMemo, useRef, useState } from "react";

export default function TextInputView({ disabled, onSubmit }) {
  const [txt, setTxt] = React.useState("");
  return (
    <div>
      <input
        className="live-input"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="Unesi odgovor…"
        disabled={disabled}
      />
      <button
        className="live-primary"
        onClick={() => onSubmit({ textAnswer: txt })}
        disabled={disabled || !txt.trim()}
      >
        Pošalji
      </button>
    </div>
  );
}