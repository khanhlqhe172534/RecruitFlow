import { Button, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../LandingPage-assets/img/logo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Get all users
      const response = await axios.post(
        "http://localhost:9999/user/forgot-password",
        {
          email: email,
        }
      );
      const user = response.data.user;

      if (user) {
        // Check if the user is deactivated
        if (
          user.status.name === "deactivated" ||
          user.status === "deactivated"
        ) {
          setError("Your account is deactivated. Please contact support.");
          setLoading(false);
          return;
        }
        setSuccess(true);
      } else {
        setError("Invalid email or password.");
        setLoading(false);
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
      console.error("ResetPassword error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {}, [success]);
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
                    className="img-fluid"
                    loading="lazy"
                    width="20"
                    height="20"
                    src={Logo}
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
              {!success ? (
                <div className="card border-0 rounded-4">
                  <div className="card-body p-3 p-md-4 p-xl-5">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-4">
                          <h3>Forgot Password</h3>
                          <p>
                            Remember your password?{" "}
                            <a href="/login">Login here</a>
                          </p>
                        </div>
                      </div>
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <form
                      autoComplete="off"
                      onSubmit={handleForgotPassword}
                    >
                      <div className="row gy-3 overflow-hidden">
                        <div className="col-12">
                          <div className="form-floating mb-3">
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              id="email"
                              placeholder="name@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                            <label
                              htmlFor="email"
                              className="form-label"
                            >
                              Email
                            </label>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-grid">
                            <button
                              className="btn btn-primary btn-lg"
                              type="submit"
                            >
                              {loading ? (
                                <CircularProgress
                                  size={24}
                                  style={{ color: "white" }}
                                />
                              ) : (
                                "Send"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="card border-0 rounded-4">
                  <div className="card-body p-3 p-md-4 p-xl-5">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-4 ">
                          <h3>Forgot Password</h3>
                          <p className="text-success">
                            Your password has been reset. Check your mail for
                            new one
                          </p>
                          <p>
                            <a href="/login">Back to login</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ForgotPassword;
