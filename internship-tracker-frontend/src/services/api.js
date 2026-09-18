const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export const API_ORIGIN =
    import.meta.env.VITE_API_URL || "http://localhost:5000";


async function request(
    path,
    options = {}
) {
    const response =
        await fetch(
            API_BASE + path,
            {
                credentials: "include",
                ...options
            }
        );

    const data =
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Something went wrong."
        );
    }

    return data;
}


function createFormData(
    application,
    file
) {
    const formData =
        new FormData();

    Object.entries(application).forEach(
        ([key, value]) => {
            if (
                value !== undefined &&
                value !== null
            ) {
                formData.append(
                    key,
                    value
                );
            }
        }
    );

    if (file) {
        formData.append(
            "resume",
            file
        );
    }

    return formData;
}


export const api = {

    getApplications() {
        return request(
            "/applications"
        );
    },


    importGuestData(
        applications,
        notes
    ) {
        return request(
            "/import-guest",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        applications,
                        notes
                    })
            }
        );
    },


    createApplication(
        application,
        file
    ) {
        return request(
            "/applications",
            {
                method: "POST",
                body:
                    createFormData(
                        application,
                        file
                    )
            }
        );
    },


    updateApplication(
        id,
        application,
        file
    ) {
        return request(
            `/applications/${id}`,
            {
                method: "PUT",
                body:
                    createFormData(
                        application,
                        file
                    )
            }
        );
    },


    deleteApplication(id) {
        return request(
            `/applications/${id}`,
            {
                method: "DELETE"
            }
        );
    },


    toggleFavorite(id) {
        return request(
            `/applications/${id}/favorite`,
            {
                method: "PATCH"
            }
        );
    },


    getStatusHistory(id) {
        return request(
            `/applications/${id}/history`
        );
    },


    getTags() {
        return request(
            "/tags"
        );
    },


    createTag(name) {
        return request(
            "/tags",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        name
                    })
            }
        );
    },


    attachTag(
        applicationId,
        tagId
    ) {
        return request(
            `/applications/${applicationId}/tags/${tagId}`,
            {
                method: "POST"
            }
        );
    },


    detachTag(
        applicationId,
        tagId
    ) {
        return request(
            `/applications/${applicationId}/tags/${tagId}`,
            {
                method: "DELETE"
            }
        );
    },


    getNotes() {
        return request(
            "/notes"
        );
    },


    createNote(
        title,
        content
    ) {
        return request(
            "/notes",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        title,
                        content
                    })
            }
        );
    },


    updateNote(
        id,
        title,
        content
    ) {
        return request(
            `/notes/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        title,
                        content
                    })
            }
        );
    },


    deleteNote(id) {
        return request(
            `/notes/${id}`,
            {
                method: "DELETE"
            }
        );
    },


    getPreferences() {
        return request(
            "/preferences"
        );
    },


    updatePreferences(data) {
        return request(
            "/preferences",
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(data)
            }
        );
    },


    smartImportText(text) {
        return request(
            "/smart-import/text",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        text
                    })
            }
        );
    },


    smartImportImage(file) {
        const formData =
            new FormData();

        formData.append(
            "image",
            file
        );

        return request(
            "/smart-import/image",
            {
                method: "POST",
                body: formData
            }
        );
    }
};