import {
    useEffect,
    useState
} from "react";

import { authApi } from "../services/auth";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import { guestStore } from "../services/guest";


function Settings({
    user,
    guest = false,
    onLogout,
    onImportGuest
}) {
    const [theme, setTheme] =
        useState("dark");

    const [compact, setCompact] =
        useState(false);

    const [name, setName] =
        useState(user?.name || "");

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [editingName, setEditingName] =
        useState(false);

    const [message, setMessage] =
        useState("");


    useEffect(() => {
        document.documentElement.dataset.theme =
            theme;

        document.documentElement.dataset.compact =
            compact
                ? "true"
                : "false";
    }, [theme, compact]);


    useEffect(() => {
        setName(
            user?.name || ""
        );
    }, [user]);


    useEffect(() => {
        async function loadPreferences() {
            try {
                if (guest) {
                    const prefs =
                        guestStore.getPreferences();

                    setTheme(
                        prefs.theme ||
                            "dark"
                    );

                    setCompact(
                        !!prefs.compact_mode
                    );

                    return;
                }


                const prefs =
                    await api.getPreferences();

                setTheme(
                    prefs.theme ||
                        "dark"
                );

                setCompact(
                    !!prefs.compact_mode
                );

            } catch (error) {
                setMessage(
                    error.message
                );
            }
        }


        loadPreferences();
    }, [guest]);


    async function savePreferences(
        nextTheme = theme,
        nextCompact = compact
    ) {
        try {
            const preferences = {
                theme: nextTheme,
                compact_mode:
                    nextCompact
            };


            if (guest) {
                guestStore.savePreferences(
                    preferences
                );
            } else {
                await api.updatePreferences(
                    preferences
                );
            }


            setMessage(
                "Preferences saved."
            );

        } catch (error) {
            setMessage(
                error.message
            );
        }
    }


    async function handleThemeChange(
        value
    ) {
        setTheme(value);

        await savePreferences(
            value,
            compact
        );
    }


    async function handleCompactChange(
        value
    ) {
        setCompact(value);

        await savePreferences(
            theme,
            value
        );
    }


    async function saveName() {
        if (!name.trim()) {
            setMessage(
                "Name is required."
            );

            return;
        }


        try {
            const result =
                await authApi.updateProfile(
                    name.trim()
                );

            setName(
                result.user.name
            );

            setEditingName(false);

            setMessage(
                "Profile updated."
            );

        } catch (error) {
            setMessage(
                error.message
            );
        }
    }


    async function changePassword() {
        if (
            !currentPassword ||
            !newPassword
        ) {
            setMessage(
                "Enter your current and new password."
            );

            return;
        }


        try {
            await authApi.changePassword(
                currentPassword,
                newPassword
            );

            setCurrentPassword("");
            setNewPassword("");

            setMessage(
                "Password changed successfully."
            );

        } catch (error) {
            setMessage(
                error.message
            );
        }
    }


    return (
        <section className="section-panel">

            <div className="section-heading">

                <div>

                    <p className="section-kicker">
                        SETTINGS
                    </p>

                    <h2>
                        Preferences
                    </h2>

                    <p className="helper-text">
                        Control your account
                        and application
                        preferences.
                    </p>

                </div>

            </div>


            {message && (
                <p className="helper-text">
                    {message}
                </p>
            )}


            <div className="settings-group">

                <h3>
                    Appearance
                </h3>


                <label>
                    Theme

                    <select
                        value={theme}
                        onChange={(event) =>
                            handleThemeChange(event.target.value)
                        }
                    >
                        <option value="dark">
                            Dark
                        </option>
                    </select>

                </label>


                <label>
                    Compact mode

                    <input
                        type="checkbox"
                        checked={compact}
                        onChange={(event) =>
                            handleCompactChange(
                                event.target.checked
                            )
                        }
                    />

                </label>

            </div>


            <div className="settings-group">

                <h3>
                    Account
                </h3>


                {guest ? (

                    <>
                        <p className="helper-text">
                            You are using Guest
                            Mode. Your tracker
                            data is stored
                            locally in this
                            browser.
                        </p>


                        <button
                            className="primary-button"
                            onClick={
                                onImportGuest
                            }
                        >
                            Create account /
                            Import guest data
                        </button>
                    </>

                ) : (

                    <>

                        <label>
                            Name

                            <input
                                value={name}
                                disabled={
                                    !editingName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setName(
                                        event.target
                                            .value
                                    )
                                }
                            />

                        </label>


                        <button
                            className="small-button"
                            onClick={() =>
                                setEditingName(
                                    (current) =>
                                        !current
                                )
                            }
                        >
                            {editingName
                                ? "Editing"
                                : "Edit Name"}
                        </button>


                        {editingName && (
                            <button
                                className="small-button"
                                onClick={
                                    saveName
                                }
                            >
                                Save Name
                            </button>
                        )}


                        <p>
                            <strong>
                                Email:
                            </strong>{" "}
                            {user?.email}
                        </p>


                        <p>
                            <strong>
                                Email verified:
                            </strong>{" "}
                            {user?.email_verified
                                ? "Yes"
                                : "No"}
                        </p>

                    </>

                )}

            </div>


            {!guest && (

                <div className="settings-group">

                    <h3>
                        Security
                    </h3>


                    <input
                        type="password"
                        value={
                            currentPassword
                        }
                        onChange={(event) =>
                            setCurrentPassword(
                                event.target.value
                            )
                        }
                        placeholder="Current password"
                    />


                    <input
                        type="password"
                        value={
                            newPassword
                        }
                        onChange={(event) =>
                            setNewPassword(
                                event.target.value
                            )
                        }
                        placeholder="New password (8+ characters)"
                    />


                    <button
                        className="primary-button"
                        onClick={
                            changePassword
                        }
                    >
                        Change Password
                    </button>


                    <p className="forgot-password-setting">
                        Forgot your current password?{" "}
                        <Link to="/forgot-password">Reset it using email OTP.</Link>
                    </p>

                </div>

            )}


            <div className="settings-group">

                <h3>
                    {guest
                        ? "Guest Session"
                        : "Account Session"}
                </h3>


                <button
                    className="ghost-button"
                    onClick={onLogout}
                >
                    {guest
                        ? "Leave Guest Mode"
                        : "Log out"}
                </button>

            </div>

        </section>
    );
}


export default Settings;