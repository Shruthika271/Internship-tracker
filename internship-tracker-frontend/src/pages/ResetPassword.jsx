import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import { authApi } from "../services/auth";

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(
        location.state?.email || ""
    );

    const [otp, setOtp] = useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (
            newPassword !==
            confirmPassword
        ) {
            setMessage(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await authApi.resetPassword(
                email,
                otp,
                newPassword
            );

            navigate("/login");
        } catch (error) {
            setMessage(
                error.message
            );
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
                        PASSWORD RESET
                    </p>

                    <h1>
                        Create new password
                    </h1>

                    <p>
                        Enter the code sent to
                        your email and choose a
                        new password.
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
                            required
                        />
                    </label>

                    <label>
                        Reset code

                        <input
                            value={otp}
                            onChange={(event) =>
                                setOtp(
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6)
                                )
                            }
                            placeholder="123456"
                            inputMode="numeric"
                            maxLength="6"
                            required
                        />
                    </label>

                    <label>
                        New password

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(
                                    event.target.value
                                )
                            }
                            minLength="8"
                            placeholder="At least 8 characters"
                            required
                        />
                    </label>

                    <label>
                        Confirm password

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
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
                            ? "Resetting..."
                            : "Reset password"}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link to="/login">
                        Back to login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default ResetPassword;