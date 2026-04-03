import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";

type AuthMode = "login" | "signup";

export const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Fill in all required fields to continue.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    const result = isSignup
      ? await signup({
          email,
          password
        })
      : await login({
          email,
          password
        });

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="auth-shell-new">
      <section className="auth-hero">
        <div className="auth-badge-row">
          <p className="eyebrow">Expense tracker</p>
          <span className="auth-badge">Private by account</span>
        </div>

        <div className="auth-copy">
          <h1>One clean home for expenses, credits, savings, and money you need back.</h1>
          <p>
            Track personal finances in a workspace that feels fast to use and easy to trust. Each account
            gets its own view, so one person’s updates do not leak into anyone else’s ledger.
          </p>
        </div>

        <div className="auth-snapshot">
          <article className="auth-stat-card auth-stat-card-strong">
            <span>Single-line capture</span>
            <strong>`100 vegetables`</strong>
            <p>Parse fast manual entries into amount, category, note, and payment method.</p>
          </article>
          <article className="auth-stat-card">
            <span>Focused dashboards</span>
            <strong>Debits, credits, savings</strong>
            <p>See what went out, what came in, and what is still expected back.</p>
          </article>
        </div>

        <div className="auth-story-grid">
          <article className="auth-story-card">
            <span>Why sign in</span>
            <strong>Your own ledger, not a shared feed</strong>
            <p>Authentication is the base layer for user-specific expenses, credits, reminders, and edits.</p>
          </article>
          <article className="auth-story-card">
            <span>What comes next</span>
            <strong>Ready for backend auth</strong>
            <p>This frontend shell is designed to plug into FastAPI login, `GET /me`, and user-scoped data.</p>
          </article>
        </div>
      </section>

      <section className="auth-panel-new">
        {/* <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "signup" ? "auth-tab-active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Create Account
          </button>
        </div> */}

        <div className="auth-content">
          <div className="auth-header">
            <h2>{isSignup ? "Get started with Money Cockpit" : "Welcome back"}</h2>
            <p>
              {isSignup
                ? "Create your account to start tracking expenses with ease"
                : "Sign in to access your financial dashboard"}
            </p>
          </div>

          <form className="auth-form-new" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className={`form-input-wrapper ${focusedField === "email" ? "focused" : ""}`}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                />
                <span className="form-icon">✉️</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className={`form-input-wrapper ${focusedField === "password" ? "focused" : ""}`}>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  required
                />
                <span className="form-icon">🔒</span>
              </div>
            </div>

            {error ? <div className="auth-error-banner">{error}</div> : null}

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with email</span>
          </div>

          <p className="auth-footer-text">
            {isSignup
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setError(null);
              }}
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
};
