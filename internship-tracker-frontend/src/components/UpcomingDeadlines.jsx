function getDaysLeft(deadline) {
    if (!deadline) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(
        String(deadline).slice(0, 10) + "T00:00:00"
    );

    return Math.ceil(
        (date - today) / (1000 * 60 * 60 * 24)
    );
}

function UpcomingDeadlines({ applications, onSelect }) {
    const upcoming = applications
        .filter(
            (application) => {
                const daysLeft = getDaysLeft(application.deadline);

                return (
                    application.deadline &&
                    daysLeft >= 0 &&
                    daysLeft <= 10
                );
            }
        )
        .sort(
            (a, b) =>
                new Date(a.deadline) -
                new Date(b.deadline)
        )
        .slice(0, 5);

    return (
        <section className="section-panel">
            <div className="section-heading">
                <div>
                    <p className="section-kicker">DEADLINES</p>
                    <h2>Upcoming Deadlines</h2>
                </div>
            </div>

            {upcoming.length === 0 ? (
                <div className="empty-state">
                    No upcoming deadlines.
                </div>
            ) : (
                <div className="deadline-list">
                    {upcoming.map((application) => {
                        const days = getDaysLeft(
                            application.deadline
                        );

                        return (
                            <button
                                className="deadline-item"
                                key={application.id}
                                onClick={() =>
                                    onSelect(application)
                                }
                            >
                                <div>
                                    <strong>
                                        {application.company}
                                    </strong>
                                    <span>
                                        {application.role}
                                    </span>
                                </div>

                                <div className="deadline-count">
                                    {days === 0
                                        ? "Due today"
                                        : days === 1
                                        ? "1 day left"
                                        : `${days} days left`}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default UpcomingDeadlines;