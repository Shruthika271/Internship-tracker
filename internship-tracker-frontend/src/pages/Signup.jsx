import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/auth";

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const data = await authApi.signup(form);

            navigate("/verify-email", {
                state: {
                    userId: data.userId,
                    email: form.email
                }
            });
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="brand-mark">IP</div>
                    <div>
                        <strong>Internship &</strong>
                        <span>Placement Tracker</span>
                    </div>
                </div>

                <div className="auth-heading">
                    <p className="section-kicker">GET STARTED</p>
                    <h1>Create account</h1>
                    <p>
                        Create your personal internship
                        tracking workspace.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Name
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                        />
                    </label>

                    <label>
                        Email
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            minLength="8"
                            required
                        />
                    </label>

                    <label>
                        Confirm password
                        <input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Enter password again"
                            required
                        />
                    </label>

                    {message && (
                        <p className="auth-message">
                            {message}
                        </p>
                    )}

                    <button
                        className="primary-button auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;