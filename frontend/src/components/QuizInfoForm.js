import React, { useEffect, useMemo, useState } from "react";
import { GetAllCategories as GetCategoriesService } from "../services/CategoryService";

const DIFF = { Easy: 0, Medium: 1, Hard: 2 };

export default function QuizInfoForm({
  value,
  onChange,
  getCategoriesFn = GetCategoriesService,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [err, setErr] = useState("");

  // učitaj kategorije
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCats(true);
        const { data } = await getCategoriesFn();
        setCategories(data || []);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Neuspešno učitavanje kategorija.";
        setErr(msg);
      } finally {
        setLoadingCats(false);
      }
    };
    load();
  }, [getCategoriesFn]);

  const metaValid = useMemo(() => {
    return (
      value?.Title?.trim()?.length > 0 &&
      !!value?.CategoryId &&
      value?.Difficulty !== "" &&
      value?.Difficulty !== undefined &&
      value?.Difficulty !== null
    );
  }, [value]);

  const onField = (k, v) => {
    onChange?.({ ...value, [k]: v });
  };

  return (
    <section className="qcreate-card">
      <h2>1) Osnovne informacije</h2>

      {err && <div className="qcreate-error">{err}</div>}

      <div className="qcreate-grid">
        <label className="qcreate-label qcreate-col-span-2">
          Naslov
          <input
            className="qcreate-input"
            type="text"
            placeholder="npr. JavaScript Osnove"
            value={value?.Title || ""}
            onChange={(e) => onField("Title", e.target.value)}
          />
        </label>

        <label className="qcreate-label">
          Kategorija
          <select
            className="qcreate-input"
            value={value?.CategoryId || ""}
            onChange={(e) => onField("CategoryId", e.target.value)}
            disabled={loadingCats}
          >
            <option value="">— odaberi —</option>
            {categories.map((c) => (
              <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                {c.name ?? c.Name}
              </option>
            ))}
          </select>
        </label>

        <label className="qcreate-label qcreate-col-span-2">
          Opis (opciono)
          <textarea
            className="qcreate-input"
            rows={2}
            placeholder="Kratak opis kviza…"
            value={value?.Description || ""}
            onChange={(e) => onField("Description", e.target.value)}
          />
        </label>

        

        <label className="qcreate-label">
          Težina
          <select
            className="qcreate-input"
            value={value?.Difficulty ?? ""}
            onChange={(e) => onField("Difficulty", Number(e.target.value))}
          >
            <option value="">— odaberi —</option>
            <option value={DIFF.Easy}>Lako</option>
            <option value={DIFF.Medium}>Srednje</option>
            <option value={DIFF.Hard}>Teško</option>
          </select>
        </label>

        <label className="qcreate-label">
          Trajanje kviza (sekunde)
          <input
            className="qcreate-input"
            type="number"
            min={0}
            placeholder="0 = bez ograničenja"
            value={value?.TimeLimitSeconds ?? 0}
            onChange={(e) => onField("TimeLimitSeconds", Number(e.target.value))}
          />
        </label>
      </div>

      {!metaValid && (
        <p className="qcreate-muted" style={{ marginTop: 8 }}>
          Popuni <strong>naslov</strong>, <strong>kategoriju</strong> i{" "}
          <strong>težinu</strong> da bi se pojavila forma za pitanja.
        </p>
      )}
    </section>
  );
}