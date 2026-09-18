import { useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";
import { authApi } from "../services/auth";

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();

    const userId =
        location.state?.userId;

    const email =
        location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (!userId) {
            setMessage(
                "Verification session not found. Please sign up again."
            );
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            await authApi.verifyEmail(
                userId,
                otp
            );

            navigate("/login");
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
                    <p className="section-kicker">
                        EMAIL VERIFICATION
                    </p>

                    <h1>Verify your email</h1>

                    <p>
                        Enter the 6-digit verification
                        code sent to{" "}
                        <strong>{email}</strong>.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Verification code
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
                            ? "Verifying..."
                            : "Verify email"}
                    </button>
                </form>

                <p className="auth-footer">
                    <Link to="/signup">
                        Back to signup
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default VerifyEmail;