const API_BASE = "http://localhost:5000/api";


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


export const authApi = {

    signup(data) {
        return request(
            "/auth/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)
            }
        );
    },


    verifyEmail(
        userId,
        otp
    ) {
        return request(
            "/auth/verify-email",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        userId,
                        otp
                    })
            }
        );
    },


    login(
        email,
        password
    ) {
        return request(
            "/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email,
                        password
                    })
            }
        );
    },


    logout() {
        return request(
            "/auth/logout",
            {
                method: "POST"
            }
        );
    },


    me() {
        return request(
            "/auth/me"
        );
    },


    updateProfile(name) {
        return request("/auth/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });
    },


    forgotPassword(email) {
        return request(
            "/auth/forgot-password",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email
                    })
            }
        );
    },


    resetPassword(
        email,
        otp,
        newPassword
    ) {
        return request(
            "/auth/reset-password",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email,
                        otp,
                        newPassword
                    })
            }
        );
    },


    changePassword(
        currentPassword,
        newPassword
    ) {
        return request(
            "/auth/change-password",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        currentPassword,
                        newPassword
                    })
            }
        );
    }
};