import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/auth";


function Login({
    onLogin,
    onGuest
}) {
    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    async function submit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const data =
                await authApi.login(
                    email,
                    password
                );

            await onLogin(data);
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
                        WELCOME BACK
                    </p>

                    <h1>
                        Log in
                    </h1>

                    <p>
                        Access your internship
                        and placement tracker.
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={submit}
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


                    <label>
                        Password

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Your password"
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
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Log in"}
                    </button>


                    <button
                        type="button"
                        className="ghost-button auth-submit"
                        onClick={onGuest}
                    >
                        Continue without an account
                    </button>

                </form>


                <p className="auth-footer">
                    <Link to="/forgot-password">
                        Forgot your password?
                    </Link>
                </p>


                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/signup">
                        Create one
                    </Link>
                </p>

            </div>

        </div>
    );
}


export default Login;