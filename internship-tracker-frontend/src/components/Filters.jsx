function Filters({
    filters,
    setFilters,
    locations
}) {

    return (
        <div className="filters">

            <input
                value={filters.search}
                onChange={(event) =>
                    setFilters({
                        ...filters,
                        search: event.target.value
                    })
                }
                placeholder="Search company, role or location..."
            />


            <select
                value={filters.status}
                onChange={(event) =>
                    setFilters({
                        ...filters,
                        status: event.target.value
                    })
                }
            >

                <option>All</option>
                <option>Saved</option>
                <option>Applied</option>
                <option>OA</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>

            </select>


            <select
                value={filters.location}
                onChange={(event) =>
                    setFilters({
                        ...filters,
                        location: event.target.value
                    })
                }
            >

                <option>All Locations</option>

                {locations.map((location) => (
                    <option key={location}>
                        {location}
                    </option>
                ))}

            </select>


            <select
                value={filters.sort}
                onChange={(event) =>
                    setFilters({
                        ...filters,
                        sort: event.target.value
                    })
                }
            >

                <option value="newest">
                    Newest first
                </option>

                <option value="oldest">
                    Oldest first
                </option>

                <option value="deadline">
                    Deadline
                </option>

                <option value="company">
                    Company A–Z
                </option>

            </select>

        </div>
    );
}

export default Filters;