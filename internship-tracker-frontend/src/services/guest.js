const APP_KEY =
    "internship_tracker_guest_applications";

const NOTES_KEY =
    "internship_tracker_guest_notes";

const PREF_KEY =
    "internship_tracker_guest_preferences";


function read(
    key,
    fallback
) {
    try {
        const value =
            localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;
    } catch {
        return fallback;
    }
}


function write(
    key,
    value
) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


export const guestStore = {

    getApplications() {
        return read(
            APP_KEY,
            []
        );
    },


    saveApplications(value) {
        write(
            APP_KEY,
            value
        );
    },


    getNotes() {
        return read(
            NOTES_KEY,
            []
        );
    },


    saveNotes(value) {
        write(
            NOTES_KEY,
            value
        );
    },


    getPreferences() {
        return read(
            PREF_KEY,
            {
                theme: "dark",
                compact_mode: false
            }
        );
    },


    savePreferences(value) {
        write(
            PREF_KEY,
            value
        );
    },


    clear() {
        localStorage.removeItem(
            APP_KEY
        );

        localStorage.removeItem(
            NOTES_KEY
        );

        localStorage.removeItem(
            PREF_KEY
        );
    }
};