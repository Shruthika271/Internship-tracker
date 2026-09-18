import { useState } from "react";
import { api } from "../services/api";


function SmartImport({ onImported }) {

    const [text, setText] = useState("");

    const [image, setImage] = useState(null);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");


    async function handleTextImport() {

        if (!text.trim()) {

            setMessage(
                "Paste an internship or job description first."
            );

            return;
        }


        try {

            setLoading(true);
            setMessage("");

            const data =
                await api.smartImportText(text);

            onImported(data);

            setMessage(
                "Details extracted. Please review them before saving."
            );

        } catch (error) {

            setMessage(error.message);

        } finally {

            setLoading(false);

        }
    }


    async function handleImageImport() {

        if (!image) {

            setMessage(
                "Choose a screenshot first."
            );

            return;
        }


        try {

            setLoading(true);

            setMessage(
                "Reading screenshot..."
            );

            const data =
                await api.smartImportImage(image);

            onImported(data);

            setMessage(
                "Details extracted. Please review them before saving."
            );

        } catch (error) {

            setMessage(error.message);

        } finally {

            setLoading(false);

        }
    }


    return (
        <section className="section-panel smart-import">

            <div className="section-heading">

                <div>

                    <p className="section-kicker">
                        SMART IMPORT
                    </p>

                    <h2>
                        Paste or upload an internship posting
                    </h2>

                </div>

            </div>


            <p className="helper-text">

                Paste text or upload a screenshot.
                The app extracts the details and
                pre-fills the application form.
                You review everything before saving.

            </p>


            <textarea
                rows="5"
                value={text}
                onChange={(event) =>
                    setText(event.target.value)
                }
                placeholder="Paste the internship/job posting here..."
            />


            <div className="smart-actions">

                <button
                    className="primary-button"
                    type="button"
                    onClick={handleTextImport}
                    disabled={loading}
                >
                    {loading
                        ? "Processing..."
                        : "Extract from text"}
                </button>


                <label className="upload-button">

                    Choose screenshot

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            setImage(
                                event.target.files?.[0] ||
                                null
                            )
                        }
                    />

                </label>


                <button
                    className="ghost-button"
                    type="button"
                    onClick={handleImageImport}
                    disabled={
                        loading || !image
                    }
                >
                    Extract from screenshot
                </button>

            </div>


            {message && (
                <small className="helper-text">
                    {message}
                </small>
            )}

        </section>
    );
}

export default SmartImport;