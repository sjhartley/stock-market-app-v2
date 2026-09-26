import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import "./Auth.css";
import { FiLogIn, FiUserPlus, FiPlay } from "react-icons/fi";
import { auth } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        process.env.REACT_APP_DEMO_USERNAME,
        process.env.REACT_APP_DEMO_PASSWORD,
      );
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      localStorage.setItem("token", idToken);
    } catch (err) {
      setError("Demo login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setToken(null);
    localStorage.removeItem("token");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "email, password",
      "confirm password",
      email,
      password,
      confirmPassword,
    );

    if (!email || !password) {
      if (!isLogin && password !== confirmPassword) {
        setError("Password fields do not match");
        return;
      }
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    if (isLogin) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const idToken = await userCredential.user.getIdToken();
        setToken(idToken);
        localStorage.setItem("token", idToken);
      } catch (err) {
        setError("Demo login failed: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        // --- 1. Register ---
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          },
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.message);
          return;
        }
        // --- 2. Immediately log in using Firebase Auth ---
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const idToken = await userCredential.user.getIdToken();
        // --- 3. Save the token for later API calls ---
        setToken(idToken);
        localStorage.setItem("token", idToken);
        alert("Registration successful! You are now logged in.");
        setIsLogin(true); // optional if you want to switch views
      } catch (err) {
        console.error(err);
        setError(err.message || "Server error. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (token) return <Welcome token={token} handleLogout={() => logout()} />;

  return (
    <div className="page-center">
      <div className="card">
        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
        <p className="subtitle">
          {isLogin ? "Sign in to continue" : "Start your journey with us"}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {isLogin ? (
              <span className="btn-content">
                Login <FiLogIn size={18} />
              </span>
            ) : (
              <span className="btn-content">
                Register <FiUserPlus size={18} />
              </span>
            )}
          </button>
        </form>

        {isLogin && (
          <p className="subtitle">
            Just exploring? Try the demo account — no signup required.
            <button
              type="button"
              className="btn-demo"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Try Demo <FiPlay size={18} />
            </button>
          </p>
        )}

        <p className="switch">
          {isLogin ? "No account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
