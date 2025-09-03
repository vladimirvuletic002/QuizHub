

const QT = { SingleChoice: 0, MultipleChoice: 1, TrueFalse: 2, TextInput: 3 };

export default function QuestionShow({ q, value, onChange }) {
  if (!q) return null;

  if (q.Type === QT.SingleChoice || q.Type === QT.MultipleChoice) {
    const multi = q.Type === QT.MultipleChoice;
    const opts = q.Options ?? [];

    const onToggle = (optionId) => {
      if (!multi) {
        onChange(optionId);
      } else {
        const next = new Set(value || []);
        if (next.has(optionId)) next.delete(optionId);
        else next.add(optionId);
        onChange(next);
      }
    };

    return (
      <div className="qs-block">
        {opts.map((o) => (
          <label key={o.Id} className="qs-option">
            <input
              type={multi ? "checkbox" : "radio"}
              name={`q_${q.Order}`}
              checked={multi ? (value ? value.has(o.Id) : false) : value === o.Id}
              onChange={() => onToggle(o.Id)}
            />
            <span>{o.Text}</span>
          </label>
        ))}
      </div>
    );
  }

  if (q.Type === QT.TrueFalse) {
    return (
      <div className="qs-block">
        <label className="qs-option">
          <input
            type="radio"
            name={`q_${q.Order}_tf`}
            checked={value === true}
            onChange={() => onChange(true)}
          />
          <span>Tačno</span>
        </label>
        <label className="qs-option">
          <input
            type="radio"
            name={`q_${q.Order}_tf`}
            checked={value === false}
            onChange={() => onChange(false)}
          />
          <span>Netačno</span>
        </label>
      </div>
    );
  }

  // Text input
  return (
    <div className="qs-block">
      <input
        className="qs-input"
        type="text"
        placeholder="Unesi odgovor…"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}