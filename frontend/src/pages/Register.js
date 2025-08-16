import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Register as RegisterService} from "../services/AuthService";
import '../styles/Auth.css';

function Register({ registerFn = RegisterService }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  };

  const validate = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      return "Sva polja osim slike su obavezna.";
    }
    if (form.password !== form.confirmPassword) {
      return "Lozinke se ne poklapaju.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Unesite ispravan email.";
    }
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const fd = new FormData();
    // imena polja poklapaju DTO na backendu
    fd.append("Username", form.username.trim());
    fd.append("Email", form.email.trim());
    fd.append("Password", form.password);
    if (file) fd.append("ProfileImage", file);

    try {
      setSubmitting(true);
      const { data } = await registerFn(fd); // AuthResponse
      //localStorage.setItem("auth", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Registracija nije uspela. Pokušaj ponovo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Kreiraj nalog</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-row">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={onChange}
            autoComplete="username"
            placeholder="npr. vladimir123"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            placeholder="ime.prezime@domen.com"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="password">Lozinka</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="confirmPassword">Potvrdi lozinku</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="profileImage">Profilna slika (opciono)</label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>

        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Registrujem…" : "Registruj se"}
        </button>
      </form>
    </div>
  );
}

export default Register;
