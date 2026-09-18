import { useEffect, useRef, useState } from "react";

const emptyForm = {
    company: "",
    role: "",
    location: "",
    deadline: "",
    status: "Saved",
    application_url: "",
    notes: "",
    original_posting: ""
};

const fields = [
    "company",
    "role",
    "location",
    "deadline",
    "status",
    "application_url",
    "notes"
];

function capitalizeText(value) {
    return value
        .split(" ")
        .map((word) => {
            if (!word) return word;

            if (
                word === "C++" ||
                word === "SQL" ||
                word === "API" ||
                word === "APIs" ||
                word === "AI" ||
                word === "ML" ||
                word === "NVIDIA" ||
                word === "IBM"
            ) {
                return word;
            }

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );
        })
        .join(" ");
}

function ApplicationForm({
    initialData,
    onSubmit,
    onCancel,
    guest
}) {
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const fieldRefs = useRef([]);

    const isEditing = Boolean(initialData?.id);

    useEffect(() => {
        if (initialData) {
            setForm({
                company: initialData.company || "",
                role: initialData.role || "",
                location: initialData.location || "",
                deadline: initialData.deadline
                    ? String(initialData.deadline).slice(0, 10)
                    : "",
                status: initialData.status || "Saved",
                application_url:
                    initialData.application_url || "",
                notes: initialData.notes || "",
                original_posting:
                    initialData.original_posting || ""
            });
        } else {
            setForm(emptyForm);
        }

        setFile(null);
        setErrors({});
    }, [initialData]);

    function updateField(name, value) {
        const capitalizedFields = [
            "company",
            "role",
            "location"
        ];

        const finalValue =
            capitalizedFields.includes(name)
                ? capitalizeText(value)
                : value;

        setForm((current) => ({
            ...current,
            [name]: finalValue
        }));

        setErrors((current) => ({
            ...current,
            [name]: ""
        }));
    }

    function validate() {
        const newErrors = {};

        if (!form.company.trim()) {
            newErrors.company =
                "Please enter the company.";
        }

        if (!form.role.trim()) {
            newErrors.role =
                "Please enter the role.";
        }

        if (
            form.deadline &&
            !/^\d{4}-\d{2}-\d{2}$/.test(form.deadline)
        ) {
            newErrors.deadline =
                "Enter a complete date or leave the deadline blank.";
        }

        {errors.deadline && (
            <small className="error">
                {errors.deadline}
            </small>
        )}

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validate()) return;

        try {
            setSaving(true);

            await onSubmit(form, file);

            /*
             * Clear the file input state after BOTH
             * create and update.
             */
            setFile(null);

            if (!isEditing) {
                setForm(emptyForm);
            }
        } finally {
            setSaving(false);
        }
    }

    function handleKeyDown(event, index) {
        if (event.key !== "Enter") return;

        if (
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }

        event.preventDefault();

        /*
         * Only company and role are required.
         * Optional fields are allowed to be empty.
         */
        if (
            ["company", "role"].includes(
                fields[index]
            ) &&
            !String(form[fields[index]]).trim()
        ) {
            setErrors((current) => ({
                ...current,
                [fields[index]]:
                    "Please fill this field before continuing."
            }));

            return;
        }

        if (index < fields.length - 1) {
            fieldRefs.current[index + 1]?.focus();
        } else {
            event.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <section className="section-panel">
            <div className="section-heading">
                <div>
                    <p className="section-kicker">
                        TRACK
                    </p>

                    <h2>
                        {isEditing
                            ? "Edit Application"
                            : "Add Application"}
                    </h2>
                </div>

                {isEditing && (
                    <button
                        className="ghost-button"
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel edit
                    </button>
                )}
            </div>

            <form
                className="application-form"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="form-grid">

                    <label>
                        Company *
                        <input
                            ref={(element) =>
                                (fieldRefs.current[0] =
                                    element)
                            }
                            value={form.company}
                            onChange={(event) =>
                                updateField(
                                    "company",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 0)
                            }
                            placeholder="e.g. Google"
                        />

                        {errors.company && (
                            <small className="error">
                                {errors.company}
                            </small>
                        )}
                    </label>

                    <label>
                        Role *
                        <input
                            ref={(element) =>
                                (fieldRefs.current[1] =
                                    element)
                            }
                            value={form.role}
                            onChange={(event) =>
                                updateField(
                                    "role",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 1)
                            }
                            placeholder="e.g. Software Engineering Intern"
                        />

                        {errors.role && (
                            <small className="error">
                                {errors.role}
                            </small>
                        )}
                    </label>

                    <label>
                        Location
                        <input
                            ref={(element) =>
                                (fieldRefs.current[2] =
                                    element)
                            }
                            value={form.location}
                            onChange={(event) =>
                                updateField(
                                    "location",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 2)
                            }
                            placeholder="e.g. Bengaluru"
                        />
                    </label>

                    <label>
                        Deadline
                        <input
                            ref={(element) =>
                                (fieldRefs.current[3] =
                                    element)
                            }
                            type="date"
                            value={form.deadline}
                            onChange={(event) =>
                                updateField(
                                    "deadline",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 3)
                            }
                        />

                        {errors.deadline && (
                            <small className="error">
                                {errors.deadline}
                            </small>
                        )}

                    </label>

                    <label>
                        Status
                        <select
                            ref={(element) =>
                                (fieldRefs.current[4] =
                                    element)
                            }
                            value={form.status}
                            onChange={(event) =>
                                updateField(
                                    "status",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 4)
                            }
                        >
                            <option>Saved</option>
                            <option>Applied</option>
                            <option>OA</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                        </select>
                    </label>

                    <label>
                        Application URL
                        <input
                            ref={(element) =>
                                (fieldRefs.current[5] =
                                    element)
                            }
                            type="url"
                            value={
                                form.application_url
                            }
                            onChange={(event) =>
                                updateField(
                                    "application_url",
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) =>
                                handleKeyDown(event, 5)
                            }
                            placeholder="https://..."
                        />
                    </label>
                </div>

                <label>
                    Notes
                    <textarea
                        ref={(element) =>
                            (fieldRefs.current[6] =
                                element)
                        }
                        rows="3"
                        value={form.notes}
                        onChange={(event) =>
                            updateField(
                                "notes",
                                event.target.value
                            )
                        }
                        placeholder="OA date, recruiter details, interview notes..."
                    />
                </label>

                <label>
                    Original Job Posting
                    <textarea
                        rows="5"
                        value={
                            form.original_posting
                        }
                        onChange={(event) =>
                            updateField(
                                "original_posting",
                                event.target.value
                            )
                        }
                        placeholder="Paste or review the original job posting..."
                    />
                </label>


                
                {!guest && (
                <label className="file-field">
                    Resume / CV used for this application{" "}
                    <span>(optional)</span>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(event) =>
                            setFile(
                                event.target.files?.[0] ||
                                    null
                            )
                        }
                    />

                    {file && (
                        <small>
                            Selected: {file.name}
                        </small>
                    )}

                    {!file &&
                        isEditing &&
                        initialData?.resume_original_name && (
                            <small>
                                Current file:{" "}
                                {
                                    initialData.resume_original_name
                                }
                            </small>
                        )}
                </label>)}

                <div className="form-actions">
                    <button
                        className="primary-button"
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving..."
                            : isEditing
                            ? "Update Application"
                            : "Add Application"}
                    </button>

                    {isEditing && (
                        <button
                            className="ghost-button"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

export default ApplicationForm;