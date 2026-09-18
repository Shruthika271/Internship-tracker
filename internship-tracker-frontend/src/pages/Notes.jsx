import {
    useEffect,
    useState
} from "react";

import { api } from "../services/api";
import { guestStore } from "../services/guest";


function Notes({
    guest = false
}) {
    const [notes, setNotes] =
        useState([]);

    const [title, setTitle] =
        useState("");

    const [text, setText] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [editingId, setEditingId] = useState(null);


    useEffect(() => {
        if (guest) {
            setNotes(
                guestStore.getNotes()
            );

            return;
        }


        api.getNotes()
            .then(setNotes)
            .catch((error) =>
                setMessage(
                    error.message
                )
            );
    }, [guest]);


    async function addNote() {
        if (!text.trim()) {
            return;
        }


        if (editingId) {
            try {
                if (guest) {
                    const next = notes.map((note) =>
                        note.id === editingId
                            ? {
                                ...note,
                                title:
                                    title.trim() ||
                                    "Untitled note",
                                content: text.trim()
                            }
                            : note
                    );

                    setNotes(next);
                    guestStore.saveNotes(next);
                } else {
                    const updated =
                        await api.updateNote(
                            editingId,
                            title.trim() ||
                                "Untitled note",
                            text.trim()
                        );

                    setNotes((current) =>
                        current.map((note) =>
                            note.id === editingId
                                ? updated
                                : note
                        )
                    );
                }

                setEditingId(null);
                setTitle("");
                setText("");
                setMessage("");

            } catch (error) {
                setMessage(error.message);
            }

            return;
        }


        try {
            if (guest) {

                const note = {
                    id:
                        `guest-${Date.now()}`,

                    title:
                        title.trim() ||
                        "Untitled note",

                    content:
                        text.trim(),

                    created_at:
                        new Date().toISOString()
                };


                const next = [
                    note,
                    ...notes
                ];


                setNotes(next);

                guestStore.saveNotes(
                    next
                );

            } else {

                const note =
                    await api.createNote(
                        title.trim() ||
                            "Untitled note",
                        text.trim()
                    );


                setNotes(
                    (current) => [
                        note,
                        ...current
                    ]
                );
            }


            setTitle("");
            setText("");
            setMessage("");

        } catch (error) {
            setMessage(
                error.message
            );
        }
    }


    async function deleteNote(id) {
        try {
            if (guest) {

                const next =
                    notes.filter(
                        (note) =>
                            note.id !== id
                    );

                setNotes(next);

                guestStore.saveNotes(
                    next
                );

            } else {

                await api.deleteNote(id);

                setNotes(
                    (current) =>
                        current.filter(
                            (note) =>
                                note.id !== id
                        )
                );
            }

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
                        PERSONAL SPACE
                    </p>

                    <h2>
                        My Notes ✎
                    </h2>

                    <p className="helper-text">
                        Keep preparation notes
                        and ideas separate from
                        application notes.
                    </p>

                </div>

            </div>


            <div className="notes-composer">

                <input
                    value={title}
                    onChange={(event) =>
                        setTitle(
                            event.target.value
                        )
                    }
                    placeholder="Note title (optional)"
                />


                <textarea
                    rows="5"
                    value={text}
                    onChange={(event) =>
                        setText(
                            event.target.value
                        )
                    }
                    placeholder="Write a note..."
                />


                <button className="primary-button" onClick={addNote}>
                    {editingId ? "Update Note" : "Add Note"}
                </button>

            </div>


            {message && (
                <p className="helper-text">
                    {message}
                </p>
            )}


            <div className="notes-grid">

                {notes.map((note) => (

                    <article
                        className="note-card"
                        key={note.id}
                    >

                        <strong>
                            {
                                note.title ||
                                "Untitled note"
                            }
                        </strong>

                        <p>
                            {
                                note.content ??
                                note.text
                            }
                        </p>


                        <button
                            className="small-button danger"
                            onClick={() =>
                                deleteNote(
                                    note.id
                                )
                            }
                        >
                            Delete
                        </button>


                        <button
                            className="small-button"
                            onClick={() => {
                                setTitle(note.title || "");
                                setText(note.content ?? note.text ?? "");
                                setEditingId(note.id);
                            }}
                        >
                            Edit
                        </button>


                    </article>

                ))}

            </div>


            {notes.length === 0 && (
                <div className="empty-state">
                    No personal notes yet.
                </div>
            )}

        </section>
    );
}


export default Notes;