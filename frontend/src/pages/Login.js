import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Login as LoginService } from "../services/AuthService";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";


function Login({ loginFn = LoginService }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.usernameOrEmail.trim() || !form.password) {
      return "Sva polja su obavezna.";
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

    try {
      setSubmitting(true);
      const { data } = await loginFn({
        usernameOrEmail: form.usernameOrEmail.trim(),
        password: form.password,
      }); // AuthResponse
      login(data); //cuvanje tokena
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Prijava nije uspela. Pokušaj ponovo.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Prijavi se</h2>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-row">
          <label htmlFor="usernameOrEmail">Username or Email</label>
          <input
            id="usernameOrEmail"
            name="usernameOrEmail"
            type="text"
            value={form.usernameOrEmail}
            onChange={onChange}
            autoComplete="username"
            placeholder="npr. vladimir123"
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
            minLength={8}
            required
          />
        </div>


        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Prijava..." : "Prijavi se"}
        </button>

        <p className='register-question'>Nisi clan? <span className="register-link" onClick={() => navigate("/register")}>Registruj se.</span></p>

      </form>
    </div>
  );


}

export default Login;
