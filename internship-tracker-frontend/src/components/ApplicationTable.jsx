import { useState } from "react";
import {
    api,
    API_ORIGIN
} from "../services/api";


function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(
        String(value).slice(0, 10) +
            "T00:00:00"
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function ApplicationTable({
    applications,
    onEdit,
    onDelete,
    onChanged,
    guest = false
}) {
    const [expanded, setExpanded] =
        useState(null);

    const [history, setHistory] =
        useState({});


    if (applications.length === 0) {
        return (
            <div className="empty-state">
                No applications match
                the current filters.
            </div>
        );
    }


    async function toggleFavorite(
        application
    ) {
        if (guest) {
            onChanged?.({
                ...application,
                is_favorite:
                    !application.is_favorite
            });

            return;
        }

        try {
            const updated =
                await api.toggleFavorite(
                    application.id
                );

            onChanged?.(updated);
        } catch (error) {
            window.alert(
                error.message
            );
        }
    }


    // async function manageTags(
    //     application
    // ) {
    //     const current =
    //         (application.tags || [])
    //             .map(
    //                 (tag) => tag.name
    //             )
    //             .join(", ");


    //     const value =
    //         window.prompt(
    //             "Tags (comma separated)",
    //             current
    //         );


    //     if (value === null) {
    //         return;
    //     }


    //     const names = [
    //         ...new Set(
    //             value
    //                 .split(",")
    //                 .map(
    //                     (item) =>
    //                         item.trim()
    //                 )
    //                 .filter(Boolean)
    //         )
    //     ];


    //     try {
    //         if (guest) {
    //             onChanged?.({
    //                 ...application,
    //                 tags: names.map(
    //                     (name) => ({
    //                         id:
    //                             `guest-${name}`,
    //                         name
    //                     })
    //                 )
    //             });

    //             return;
    //         }


    //         const oldTags =
    //             application.tags || [];


    //         for (
    //             const tag of oldTags
    //         ) {
    //             await api.detachTag(
    //                 application.id,
    //                 tag.id
    //             );
    //         }


    //         const tags = [];


    //         for (
    //             const name of names
    //         ) {
    //             const tag =
    //                 await api.createTag(
    //                     name
    //                 );

    //             await api.attachTag(
    //                 application.id,
    //                 tag.id
    //             );

    //             tags.push(tag);
    //         }


    //         onChanged?.({
    //             ...application,
    //             tags
    //         });

    //     } catch (error) {
    //         window.alert(
    //             error.message
    //         );
    //     }
    // }


    async function showHistory(
        application
    ) {
        if (
            expanded ===
            application.id
        ) {
            setExpanded(null);
            return;
        }


        try {
            if (
                !history[
                    application.id
                ]
            ) {
                const data = guest
                    ? (
                          application.status_history ||
                          []
                      )
                    : await api.getStatusHistory(
                          application.id
                      );


                setHistory(
                    (current) => ({
                        ...current,
                        [application.id]:
                            data
                    })
                );
            }


            setExpanded(
                application.id
            );

        } catch (error) {
            window.alert(
                error.message
            );
        }
    }


    return (
        <div className="table-wrap">

            <table>

                <thead>

                    <tr>

                        <th>
                            ★
                        </th>

                        <th>
                            Company
                        </th>

                        <th>
                            Role
                        </th>

                        <th>
                            Location
                        </th>

                        <th>
                            Deadline
                        </th>

                        <th>
                            Status
                        </th>

                        {/* <th>
                            Tags
                        </th> */}

                        <th>
                            CV / Resume
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody>

                    {applications.map(
                        (application) => (
                            <>

                                <tr
                                    key={
                                        application.id
                                    }
                                >

                                    <td>

                                        <button
                                            className="small-button"
                                            onClick={() =>
                                                toggleFavorite(
                                                    application
                                                )
                                            }
                                        >
                                            {application.is_favorite
                                                ? "★"
                                                : "☆"}
                                        </button>

                                    </td>


                                    <td className="company-cell">
                                        {
                                            application.company
                                        }
                                    </td>


                                    <td>
                                        {
                                            application.role
                                        }
                                    </td>


                                    <td>
                                        {
                                            application.location ||
                                            "—"
                                        }
                                    </td>


                                    <td>
                                        {(() => {
                                            if (!application.deadline) return "—";

                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            const deadline = new Date(
                                                String(application.deadline).slice(0, 10) + "T00:00:00"
                                            );

                                            const daysLeft = Math.ceil(
                                                (deadline - today) / (1000 * 60 * 60 * 24)
                                            );

                                            if (daysLeft < 0) {
                                                return <span className="deadline-overdue">Overdue</span>;
                                            }

                                            if (daysLeft === 0) {
                                                return <span className="deadline-today">Due today</span>;
                                            }

                                            if (daysLeft < 3) {
                                                return (
                                                    <span className="deadline-warning">
                                                        {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                                                    </span>
                                                );
                                            }

                                            return formatDate(application.deadline);
                                        })()}
                                    </td>


                                    <td>

                                        <span className="status-badge">
                                            {
                                                application.status
                                            }
                                        </span>

                                    </td>


                                    {/* <td>

                                        {application.tags
                                            ?.length ? (
                                            application.tags.map(
                                                (
                                                    tag
                                                ) => (
                                                    <span
                                                        className="tag-chip"
                                                        key={
                                                            tag.id ||
                                                            tag.name
                                                        }
                                                    >
                                                        {
                                                            tag.name
                                                        }
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            "—"
                                        )}

                                    </td> */}


                                    <td>

                                        {application.resume_url ? (

                                            <a
                                                href={
                                                    application.resume_url.startsWith(
                                                        "http"
                                                    )
                                                        ? application.resume_url
                                                        : API_ORIGIN +
                                                          application.resume_url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View file
                                            </a>

                                        ) : (
                                            application.resume_original_name ||
                                            "—"
                                        )}

                                    </td>


                                    <td className="action-cell">

                                        {application.application_url && (

                                            <a
                                                className="small-button"
                                                href={
                                                    application.application_url.startsWith("http")
                                                        ? application.application_url
                                                        : `https://${application.application_url}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Job
                                            </a>

                                        )}


                                        {/* <button
                                            className="small-button"
                                            onClick={() =>
                                                manageTags(
                                                    application
                                                )
                                            }
                                        >
                                            Tags
                                        </button> */}


                                        <button
                                            className="small-button"
                                            onClick={() =>
                                                showHistory(
                                                    application
                                                )
                                            }
                                        >
                                            History
                                        </button>


                                        <button
                                            className="small-button"
                                            onClick={() =>
                                                onEdit(
                                                    application
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            className="small-button danger"
                                            onClick={() =>
                                                onDelete(
                                                    application.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>


                                {expanded ===
                                    application.id && (

                                    <tr
                                        key={`${application.id}-history`}
                                    >

                                        <td
                                            colSpan="9"
                                        >

                                            <div className="history-panel">

                                                <strong>
                                                    Status History
                                                </strong>


                                                {(
                                                    history[
                                                        application.id
                                                    ] || []
                                                ).length ===
                                                0 ? (

                                                    <p className="helper-text">
                                                        No status history yet.
                                                    </p>

                                                ) : (

                                                    <ul>

                                                        {history[
                                                            application.id
                                                        ].map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        item.id ||
                                                                        index
                                                                    }
                                                                >
                                                                    {
                                                                        item.old_status ||
                                                                        "Created"
                                                                    }{" "}
                                                                    →
                                                                    {
                                                                        item.new_status
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {new Date(
                                                                        item.changed_at
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </li>
                                                            )
                                                        )}

                                                    </ul>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )}

                            </>
                        )
                    )}

                </tbody>

            </table>

        </div>
    );
}


export default ApplicationTable;