import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const userDetails = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
    };

    try {
      await api.post("/auth/register", userDetails);

      const loginData = new URLSearchParams();
      loginData.append("username", userDetails.email);
      loginData.append("password", userDetails.password);

      const response = await api.post("/auth/login", loginData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="muted">
          Register to save careers, jobs, and dashboard insights.
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            minLength={8}
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
