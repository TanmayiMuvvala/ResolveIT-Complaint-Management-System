import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function RegisterOfficer() {
  const nav = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register-officer", {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (res.data.status === "success") {
        alert("Officer registration successful! Please login.");
        nav("/login");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
          Register as Officer
        </h2>

        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="Email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="Password"
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={data.confirmPassword}
              onChange={e => setData({ ...data, confirmPassword: e.target.value })}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#6c757d" : "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "15px"
            }}
          >
            {loading ? "Registering..." : "Register as Officer"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 10px 0", color: "#666" }}>Already have an account?</p>
          <Link 
            to="/login" 
            style={{ 
              color: "#007bff", 
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}