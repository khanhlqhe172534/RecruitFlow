import { Button } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login({ setAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Get all users
      const response = await axios.get("http://localhost:9999/user/");
      const users = response.data;

      console.log(users);
      // Find user with matching email and password
      const user = users.find(
        (u) => u.email === username && u.password === password
      );

      if (user) {
        // Check if the user is deactivated
        if (
          user.status.name === "deactivated" ||
          user.status === "deactivated"
        ) {
          setError("Your account is deactivated. Please contact support.");
          return;
        }

        // Store user info in localStorage
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userRole", user.role.name);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userFullName", user.fullname);

        // Set authentication state
        setAuth(true);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      if (err.response) {
        setError(
          "Server error: " +
            (err.response.data.message || "Something went wrong")
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Please check if the server is running."
        );
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <>
      <section
        style={{
          backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
        className="py-3 py-md-5 py-xl-8 vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="container">
          <div className="row gy-4 justify-content-center">
            <div className="col-12 col-md-6 col-xl-7">
              <div className="d-flex justify-content-center">
                <div className="col-12 col-xl-9">
                  <img
                    className="img-fluid rounded mb-4"
                    loading="lazy"
                    width="245"
                    height="80"
                    alt="Logo"
                  />
                  <hr className="border-primary-subtle mb-4" />
                  <h2 className="h1 mb-4">Interview Management System</h2>
                  <p className="lead mb-5">
                    Streamline your hiring process with our Interview Management
                    System...
                  </p>
                  <div className="text-end">
                    <Button onClick={() => (window.location.href = "/")}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        fill="currentColor"
                        className="bi bi-grip-horizontal"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-5">
              <div className="card border-0 rounded-4">
                <div className="card-body p-3 p-md-4 p-xl-5">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-4">
                        <h3>Sign in</h3>
                        <p>
                          Forgotten your password? <a href="/#">Reset it.</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  <form autoComplete="off" onSubmit={handleLogin}>
                    <div className="row gy-3 overflow-hidden">
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            id="email"
                            placeholder="name@example.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="remember_me"
                            id="remember_me"
                          />
                          <label
                            className="form-check-label text-secondary"
                            htmlFor="remember_me"
                          >
                            Keep me logged in
                          </label>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-grid">
                          <button
                            className="btn btn-primary btn-lg"
                            type="submit"
                          >
                            Log in
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
