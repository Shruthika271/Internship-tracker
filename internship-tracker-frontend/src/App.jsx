import { useEffect, useMemo, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Applications from "./pages/Applications";
import AddApplication from "./pages/AddApplication";
import AnalyticsPage from "./pages/AnalyticsPage";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { api } from "./services/api";
import { authApi } from "./services/auth";
import { guestStore } from "./services/guest";


function App() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [editingApplication, setEditingApplication] =
        useState(null);
    const [prefillData, setPrefillData] =
        useState(null);

    const [dashboardStatus, setDashboardStatus] =
        useState("All");

    const [filters, setFilters] = useState({
        search: "",
        status: "All",
        location: "All Locations",
        sort: "newest"
    });

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] =
        useState(false);
    const [guest, setGuest] = useState(false);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");


    useEffect(() => {
        async function boot() {
            try {
                const session = await authApi.me();

                setAuthenticated(true);
                setGuest(false);
                setUser(session.user);

                const data =
                    await api.getApplications();

                setApplications(data);
            } catch {
                setAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        boot();
    }, []);


    function startGuest() {
        setGuest(true);
        setAuthenticated(false);
        setUser(null);

        setApplications(
            guestStore.getApplications()
        );

        setMessage("");

        navigate("/");
    }


    async function handleLogin(session) {
        try {
            setAuthenticated(true);
            setGuest(false);
            setUser(session.user);

            let data =
                await api.getApplications();

            const importRequested =
                localStorage.getItem(
                    "tracker_guest_import_requested"
                ) === "true";

            if (importRequested) {
                localStorage.removeItem(
                    "tracker_guest_import_requested"
                );

                const guestApps =
                    guestStore.getApplications();

                const guestNotes =
                    guestStore.getNotes();

                if (
                    guestApps.length ||
                    guestNotes.length
                ) {
                    const shouldImport =
                        window.confirm(
                            `Import your ${guestApps.length} guest application(s) and ${guestNotes.length} guest note(s) into this account?`
                        );

                    if (shouldImport) {
                        try {
                            await api.importGuestData(
                                guestApps,
                                guestNotes
                            );

                            data =
                                await api.getApplications();

                            guestStore.clear();
                        } catch (error) {
                            setMessage(
                                error.message
                            );
                        }
                    }
                }
            }

            setApplications(data);
            navigate("/");
        } catch (error) {
            setAuthenticated(false);
            setUser(null);
            setMessage(error.message);
        }
    }


    async function handleSave(
        application,
        file
    ) {
        try {
            setMessage("");

            if (guest) {
                const now =
                    new Date().toISOString();

                const existing =
                    editingApplication;

                const saved = {
                    ...(existing || {}),
                    ...application,

                    id:
                        existing?.id ||
                        `guest-${Date.now()}`,

                    created_at:
                        existing?.created_at ||
                        now,

                    updated_at: now,

                    is_favorite:
                        existing?.is_favorite ||
                        false,

                    // tags:
                    //     existing?.tags ||
                    //     [],

                    status_history:
                        existing?.status_history ||
                        [
                            {
                                id:
                                    `history-${Date.now()}`,
                                old_status: null,
                                new_status:
                                    application.status ||
                                    "Saved",
                                changed_at: now
                            }
                        ]
                };


                if (
                    existing &&
                    existing.status !==
                        application.status
                ) {
                    saved.status_history = [
                        ...saved.status_history,
                        {
                            id:
                                `history-${Date.now()}`,
                            old_status:
                                existing.status,
                            new_status:
                                application.status ||
                                "Saved",
                            changed_at: now
                        }
                    ];
                }


                const next = existing
                    ? applications.map(
                          (item) =>
                              item.id ===
                              existing.id
                                  ? saved
                                  : item
                      )
                    : [
                          saved,
                          ...applications
                      ];

                setApplications(next);

                guestStore.saveApplications(
                    next
                );

                setMessage(
                    existing
                        ? "Application updated successfully."
                        : "Application added successfully."
                );
            }

            else if (editingApplication?.id) {
                const updated =
                    await api.updateApplication(
                        editingApplication.id,
                        application,
                        file
                    );

                setApplications(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                updated.id
                                    ? updated
                                    : item
                        )
                );

                setMessage(
                    "Application updated successfully."
                );
            }

            else {
                const created =
                    await api.createApplication(
                        application,
                        file
                    );

                setApplications(
                    (current) => [
                        created,
                        ...current
                    ]
                );

                setMessage(
                    "Application added successfully."
                );
            }

            setEditingApplication(null);
            setPrefillData(null);

            navigate("/applications");
        } catch (error) {
            setMessage(error.message);
        }
    }


    function handleEdit(application) {
        setEditingApplication(application);
        setPrefillData(null);

        navigate("/add");
    }


    function handleCancelEdit() {
        setEditingApplication(null);
        setPrefillData(null);

        navigate("/applications");
    }


    async function handleDelete(id) {
        const confirmed =
            window.confirm(
                "Delete this application?"
            );

        if (!confirmed) {
            return;
        }

        try {
            if (guest) {
                const next =
                    applications.filter(
                        (application) =>
                            application.id !== id
                    );

                setApplications(next);

                guestStore.saveApplications(
                    next
                );
            } else {
                await api.deleteApplication(id);

                setApplications(
                    (current) =>
                        current.filter(
                            (application) =>
                                application.id !== id
                        )
                );
            }

            setMessage(
                "Application deleted successfully."
            );
        } catch (error) {
            setMessage(error.message);
        }
    }


    function handleApplicationChanged(
        updated
    ) {
        const next =
            applications.map(
                (application) =>
                    application.id === updated.id
                        ? updated
                        : application
            );

        setApplications(next);

        if (guest) {
            guestStore.saveApplications(next);
        }
    }


    function handleSmartImport(data) {
        setPrefillData(data);
        setEditingApplication(null);

        navigate("/add");
    }


    function handleDashboardStatus(status) {
        setDashboardStatus(status);

        setFilters((current) => ({
            ...current,
            status
        }));

        navigate("/applications");
    }


    function clearDashboardFilter() {
        setDashboardStatus("All");

        setFilters((current) => ({
            ...current,
            status: "All"
        }));
    }


    function selectApplication(application) {
        setEditingApplication(application);
        setPrefillData(null);

        navigate("/add");
    }


    const locations = useMemo(
        () =>
            [
                ...new Set(
                    applications
                        .map(
                            (application) =>
                                application.location
                        )
                        .filter(Boolean)
                )
            ].sort(),
        [applications]
    );


    const filteredApplications = useMemo(
        () => {
            return applications
                .filter((application) => {
                    const searchTerm =
                        filters.search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchTerm ||
                        [
                            application.company,
                            application.role,
                            application.location
                        ].some((value) =>
                            value
                                ?.toLowerCase()
                                .includes(
                                    searchTerm
                                )
                        );

                    const matchesStatus =
                        filters.status ===
                            "All" ||
                        application.status ===
                            filters.status;

                    const matchesLocation =
                        filters.location ===
                            "All Locations" ||
                        application.location ===
                            filters.location;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesLocation
                    );
                })
                .sort((a, b) => {
                    if (
                        filters.sort ===
                        "company"
                    ) {
                        return (
                            (a.company || "")
                                .localeCompare(
                                    b.company || ""
                                )
                        );
                    }

                    if (
                        filters.sort ===
                        "oldest"
                    ) {
                        return (
                            new Date(
                                a.created_at
                            ) -
                            new Date(
                                b.created_at
                            )
                        );
                    }

                    if (
                        filters.sort ===
                        "deadline"
                    ) {
                        if (!a.deadline) {
                            return 1;
                        }

                        if (!b.deadline) {
                            return -1;
                        }

                        return (
                            new Date(
                                a.deadline
                            ) -
                            new Date(
                                b.deadline
                            )
                        );
                    }

                    return (
                        new Date(
                            b.created_at
                        ) -
                        new Date(
                            a.created_at
                        )
                    );
                });
        },
        [applications, filters]
    );


    async function handleLogout() {
        if (guest) {
            setGuest(false);
            setApplications([]);
            setMessage("");

            navigate("/login");

            return;
        }

        try {
            await authApi.logout();
        } finally {
            setAuthenticated(false);
            setUser(null);
            setApplications([]);
            setMessage("");

            navigate("/login");
        }
    }


    function requestGuestImport() {
        localStorage.setItem(
            "tracker_guest_import_requested",
            "true"
        );

        setGuest(false);
        setApplications([]);

        navigate("/signup");
    }


    if (loading) {
        return (
            <div className="auth-loading">
                Loading Internship Tracker...
            </div>
        );
    }


    const hasAccess =
        authenticated || guest;


    return (
        <Routes>

            {/* PUBLIC ROUTES */}

            <Route
                path="/login"
                element={
                    hasAccess ? (
                        <Navigate
                            to="/"
                            replace
                        />
                    ) : (
                        <Login
                            onLogin={handleLogin}
                            onGuest={startGuest}
                        />
                    )
                }
            />


            <Route
                path="/signup"
                element={
                    authenticated ? (
                        <Navigate
                            to="/"
                            replace
                        />
                    ) : (
                        <Signup />
                    )
                }
            />


            <Route
                path="/verify-email"
                element={
                    <VerifyEmail />
                }
            />


            <Route
                path="/forgot-password"
                element={
                    <ForgotPassword />
                }
            />


            <Route
                path="/reset-password"
                element={
                    <ResetPassword />
                }
            />


            {/* PROTECTED / GUEST APP */}

            <Route
                path="/*"
                element={
                    <ProtectedRoute
                        authenticated={
                            hasAccess
                        }
                        loading={false}
                    >
                        <div className="app-shell">

                            <Sidebar />

                            <main className="main-content">

                                {message && (
                                    <div className="helper-text app-message">
                                        {message}
                                    </div>
                                )}

                                <Routes>

                                    <Route
                                        path="/"
                                        element={
                                            <Home
                                                applications={
                                                    applications
                                                }
                                                dashboardStatus={
                                                    dashboardStatus
                                                }
                                                onDashboardClick={
                                                    handleDashboardStatus
                                                }
                                                onSmartImport={
                                                    handleSmartImport
                                                }
                                                onSelectApplication={
                                                    selectApplication
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="/applications"
                                        element={
                                            <Applications
                                                applications={
                                                    filteredApplications
                                                }
                                                filters={
                                                    filters
                                                }
                                                setFilters={
                                                    setFilters
                                                }
                                                locations={
                                                    locations
                                                }
                                                onEdit={
                                                    handleEdit
                                                }
                                                onDelete={
                                                    handleDelete
                                                }
                                                dashboardStatus={
                                                    dashboardStatus
                                                }
                                                clearDashboardFilter={
                                                    clearDashboardFilter
                                                }
                                                onChanged={
                                                    handleApplicationChanged
                                                }
                                                guest={
                                                    guest
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="/add"
                                        element={
                                            <AddApplication
                                                onSubmit={
                                                    handleSave
                                                }
                                                onCancel={
                                                    handleCancelEdit
                                                }
                                                initialData={
                                                    editingApplication ||
                                                    prefillData
                                                }
                                                guest={
                                                    guest
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="/analytics"
                                        element={
                                            <AnalyticsPage
                                                applications={
                                                    applications
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="/notes"
                                        element={
                                            <Notes
                                                guest={
                                                    guest
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="/settings"
                                        element={
                                            <Settings
                                                user={user}
                                                guest={guest}
                                                onLogout={
                                                    handleLogout
                                                }
                                                onImportGuest={
                                                    requestGuestImport
                                                }
                                            />
                                        }
                                    />


                                    <Route
                                        path="*"
                                        element={
                                            <Navigate
                                                to="/"
                                                replace
                                            />
                                        }
                                    />

                                </Routes>

                            </main>

                        </div>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}


export default function RootApp() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}