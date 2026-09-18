import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/auth";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            await authApi.forgotPassword(email);

            navigate("/reset-password", {
                state: { email }
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
                    <div className="brand-mark">
                        IP
                    </div>

                    <div>
                        <strong>
                            Internship &
                        </strong>

                        <span>
                            Placement Tracker
                        </span>
                    </div>
                </div>

                <div className="auth-heading">
                    <p className="section-kicker">
                        ACCOUNT RECOVERY
                    </p>

                    <h1>
                        Forgot password?
                    </h1>

                    <p>
                        Enter your email and
                        we'll send you a reset
                        code.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Email

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="you@example.com"
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
                            ? "Sending..."
                            : "Send reset code"}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password?{" "}
                    <Link to="/login">
                        Log in
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default ForgotPassword;