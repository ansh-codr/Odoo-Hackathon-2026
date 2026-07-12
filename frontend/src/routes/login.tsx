import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { ArrowRight, Lock, Mail, AlertCircle, UserPlus, Sun, Moon } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [{ title: "Login — Assera" }],
  }),
});

function Login() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("assera_theme") === "dark";
    }
    return false;
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("assera_theme", next ? "dark" : "light");
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate({ to: "/app" });
    } catch (err: any) {
      if (isSignUp) {
        setError(err.message || "Failed to create account. Please try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate({ to: "/app" });
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page${dark ? " dark" : ""}`}>
      {/* Theme Toggle */}
      <button className="login-theme-btn" onClick={toggleDark} title="Toggle theme">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Background */}
      <div className="login-grid-bg" />
      <div className="login-orb-1" />
      <div className="login-orb-2" />

      {/* Content */}
      <div style={{ width: "100%", maxWidth: 440, padding: "0 16px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 20 }}>
            <img src="/Fevicon.png" alt="Assera" style={{ width: 32, height: 32, objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: "Inter Tight, Inter, sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            {isSignUp ? "Create Account" : "Welcome back"}
          </h1>
          <p className="login-muted" style={{ fontSize: 15, margin: 0 }}>
            {isSignUp ? "Sign up to start tracking your assets" : "Sign in to access your asset dashboard"}
          </p>
        </div>

        {/* Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isSignUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="login-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <UserPlus size={16} className="login-muted" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    className="login-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="login-label">Work Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} className="login-muted" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="login-label">Password</label>
                {!isSignUp && (
                  <a href="#" style={{ fontSize: 13, color: "#a855f7", textDecoration: "none", fontWeight: 500 }}>
                    Forgot password?
                  </a>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} className="login-muted" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-submit-btn" style={{ width: "100%" }}>
              {loading
                ? isSignUp ? "Creating account..." : "Signing in..."
                : <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {!isSignUp && (
            <>
              <div className="login-divider">
                <div className="login-divider-line" />
                <span className="login-divider-text">Or continue with</span>
                <div className="login-divider-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="login-google-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </>
          )}

          {/* Sign up / New here section */}
          <div style={{ marginTop: isSignUp ? 24 : 0 }}>
            {isSignUp ? (
              <div style={{ textAlign: "center" }}>
                <span className="login-muted" style={{ fontSize: 14 }}>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  style={{ background: "none", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, color: "inherit" }}
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div>
                <div className="login-divider">
                  <div className="login-divider-line" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px" }}>New here?</h3>
                <div className="login-info-box">
                  <p className="login-muted" style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                    Sign up creates an employee account.<br />Admin roles assigned later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="login-secondary-btn"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32, fontSize: 12 }}>
          <a href="/" className="login-muted" style={{ textDecoration: "none" }}>← Back to Website</a>
          <span className="login-muted">·</span>
          <span className="login-muted">© 2026 Assera</span>
        </div>
      </div>
    </div>
  );
}
