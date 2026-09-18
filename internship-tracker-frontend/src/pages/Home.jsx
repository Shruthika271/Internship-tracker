import Dashboard from "../components/Dashboard";

import UpcomingDeadlines from "../components/UpcomingDeadlines";

function Home({
    applications,
    dashboardStatus,
    onDashboardClick,
    onSmartImport,
    onSelectApplication
}) {
    return (
        <>
            <header className="page-header">
                <div>
                    <p className="eyebrow">
                        CAREER COMMAND CENTER
                    </p>

                    <h1>
                        Welcome back 👋
                    </h1>

                    <p className="page-subtitle">
                        Keep your internship and
                        placement applications
                        organised in one place.
                    </p>
                </div>
            </header>

            <Dashboard
                applications={applications}
                activeStatus={dashboardStatus}
                onStatusClick={onDashboardClick}
            />

            <UpcomingDeadlines
                applications={applications}
                onSelect={onSelectApplication}
            />


        </>
    );
}

export default Home;