import ApplicationTable from "../components/ApplicationTable";
import Filters from "../components/Filters";


function Applications({
    applications,
    filters,
    setFilters,
    locations,
    onEdit,
    onDelete,
    dashboardStatus,
    clearDashboardFilter,
    onChanged,
    guest
}) {
    return (
        <section className="section-panel">

            <div className="section-heading">

                <div>

                    <p className="section-kicker">
                        APPLICATIONS
                    </p>

                    <h2>
                        My Applications
                    </h2>

                    <p className="helper-text">
                        Manage every internship
                        and placement
                        application.
                    </p>

                </div>


                {dashboardStatus !==
                    "All" && (

                    <button
                        className="ghost-button"
                        onClick={
                            clearDashboardFilter
                        }
                    >
                        Clear status filter
                    </button>

                )}

            </div>


            <Filters
                filters={filters}
                setFilters={setFilters}
                locations={locations}
            />


            <ApplicationTable
                applications={applications}
                onEdit={onEdit}
                onDelete={onDelete}
                onChanged={onChanged}
                guest={guest}
            />

        </section>
    );
}


export default Applications;