import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { signInAdmin } from "../../services/adminApi";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signInAdmin(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <Link className="brand-lockup auth-brand" to="/">
        <span className="brand-mark">i</span><span>IRIS<span className="brand-period">.</span></span>
      </Link>
      <section className="auth-panel admin-login-panel">
        <div className="admin-login-icon"><ShieldCheck size={21} /></div>
        <p className="eyebrow">ADMINISTRATOR ACCESS</p>
        <h1>Good to have<br />you here.</h1>
        <p className="auth-intro">Enter the temporary admin credentials to open the IRIS dashboard.</p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-username">Admin name</label>
          <input
            id="admin-username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => { setUsername(event.target.value); setError(""); }}
            placeholder="Enter admin name"
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(""); }}
            placeholder="Enter password"
          />
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button className="primary-link admin-submit" type="submit" disabled={submitting}>
            {submitting ? "Checking access…" : "Open admin dashboard"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="admin-demo-note">Demo credentials are configured on the backend.</p>
        <Link className="back-link" to="/">Back to IRIS home</Link>
      </section>
      <p className="auth-legal">TEMPORARY DEMO ACCESS <span>·</span> NOT FOR PRODUCTION</p>
    </main>
  );
}

export default AdminLogin;
