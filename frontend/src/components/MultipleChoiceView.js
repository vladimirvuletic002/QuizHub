import React, { useEffect, useMemo, useRef, useState } from "react";

export default function MultipleChoiceView({ question, disabled, onSubmit }) {
  const [picked, setPicked] = React.useState(new Set());

  const toggle = (id) => {
    setPicked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const ids = Array.from(picked);
  return (
    <>
      <div className="live-options">
        {(question.options ?? []).map((o) => {
          const id = o.id ?? o.Id;
          const isOn = picked.has(id);
          return (
            <button
              key={id}
              className={`live-opt ${isOn ? "active" : ""}`}
              onClick={() => toggle(id)}
              disabled={disabled}
            >
              {o.text ?? o.Text}
            </button>
          );
        })}
      </div>
      <button
        className="live-primary"
        onClick={() => onSubmit({ selectedOptionIds: ids })}
        disabled={disabled || ids.length === 0}
      >
        Pošalji
      </button>
    </>
  );
}
