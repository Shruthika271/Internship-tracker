import { Navigate } from "react-router-dom";

function ProtectedRoute({
    authenticated,
    loading,
    children
}) {
    if (loading) {
        return (
            <div className="auth-loading">
                Checking your session...
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;