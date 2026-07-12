import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
    if (typeof window !== "undefined") return localStorage.getItem("assera_theme") === "dark";
    return false;
  });

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("assera_theme", next ? "dark" : "light");
      return next;
    });
  };

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err: any) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const theme = dark ? {
    bg: "#0a0a12",
    text: "#f0efff",
    muted: "rgba(240,239,255,0.55)",
    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
    inputBg: "rgba(0,0,0,0.3)",
    inputBorder: "rgba(255,255,255,0.1)",
    inputFocus: "rgba(124,58,237,0.5)",
    googleBtnBg: "rgba(255,255,255,0.05)",
    googleBtnHover: "rgba(255,255,255,0.08)",
  } : {
    bg: "#f6f5ff",
    text: "#0f0d1f",
    muted: "rgba(15,13,31,0.55)",
    surface: "#ffffff",
    surfaceHover: "rgba(0,0,0,0.02)",
    border: "rgba(0,0,0,0.09)",
    inputBg: "#ffffff",
    inputBorder: "rgba(0,0,0,0.15)",
    inputFocus: "rgba(124,58,237,0.5)",
    googleBtnBg: "#ffffff",
    googleBtnHover: "#f1f1f1",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, color: theme.text, fontFamily: "Inter, sans-serif", padding: 24, position: "relative", overflow: "hidden", transition: "background 0.3s, color 0.3s" }}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleDark}
        title="Toggle theme"
        style={{ position: "absolute", top: 24, right: 24, zIndex: 10, width: 40, height: 40, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surface, cursor: "pointer", color: theme.muted, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
      >
        {dark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      {/* Background Ornaments */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)"}, transparent 70%)`, filter: "blur(70px)", animation: "float1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${dark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.08)"}, transparent 70%)`, filter: "blur(60px)", animation: "float2 11s ease-in-out infinite" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 20 }}>
            <img src="/Fevicon.png" alt="Assera Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: "Inter Tight, Inter, sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            {isSignUp ? "Create Account" : "Welcome back"}
          </h1>
          <p style={{ color: theme.muted, fontSize: 15 }}>
            {isSignUp ? "Sign up to start tracking your assets" : "Sign in to access your asset dashboard"}
          </p>
        </div>

        <div style={{ background: theme.surface, backdropFilter: "blur(20px)", border: `1px solid ${theme.border}`, borderRadius: 24, padding: "40px 32px", boxShadow: dark ? "0 24px 64px rgba(0,0,0,0.4)" : "0 12px 32px rgba(0,0,0,0.05)", transition: "all 0.3s" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 14 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {isSignUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <UserPlus size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: theme.muted }} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{ width: "100%", height: 48, padding: "0 16px 0 44px", borderRadius: 12, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, fontSize: 15, outline: "none", transition: "border-color 0.2s" }}
                    onFocus={(e) => e.target.style.borderColor = theme.inputFocus}
                    onBlur={(e) => e.target.style.borderColor = theme.inputBorder}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Work Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: theme.muted }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: "100%", height: 48, padding: "0 16px 0 44px", borderRadius: 12, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, fontSize: 15, outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = theme.inputFocus}
                  onBlur={(e) => e.target.style.borderColor = theme.inputBorder}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Password</label>
                {!isSignUp && <a href="#" style={{ fontSize: 13, color: "#a855f7", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>}
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: theme.muted }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: "100%", height: 48, padding: "0 16px 0 44px", borderRadius: 12, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, fontSize: 15, outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = theme.inputFocus}
                  onBlur={(e) => e.target.style.borderColor = theme.inputBorder}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 12, transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,58,237,0.4)"; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.3)"; } }}
            >
              {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (
                <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {!isSignUp && (
            <>
              <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: theme.border }} />
                <span style={{ padding: "0 12px", fontSize: 12, fontWeight: 600, color: theme.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: theme.border }} />
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, height: 48, borderRadius: 12, background: theme.googleBtnBg, border: `1px solid ${theme.border}`, color: theme.text, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "background 0.2s, border-color 0.2s", marginBottom: 24 }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = theme.googleBtnHover; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = theme.googleBtnBg; } }}
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

          <div style={{ marginTop: isSignUp ? 24 : 0 }}>
            {isSignUp ? (
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 14, color: theme.muted }}>Already have an account? </span>
                <button type="button" onClick={() => setIsSignUp(false)} style={{ background: "none", border: "none", fontSize: 14, color: theme.text, fontWeight: 600, cursor: "pointer", padding: 0 }}>Sign In</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: theme.border }} />
                </div>
                
                <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>New here?</h3>
                <div style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: theme.muted, lineHeight: 1.5, margin: 0 }}>
                    Sign up creates an employee account.<br/>Admin roles assigned later.
                  </p>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, background: "transparent", border: `1px solid ${theme.border}`, color: theme.text, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.surfaceHover}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32, fontSize: 12, color: theme.muted }}>
          <a href="/" style={{ color: "inherit", textDecoration: "none" }}>← Back to Website</a>
          <span>·</span>
          <span>© 2026 Assera</span>
        </div>
      </div>
    </div>
  );
}
