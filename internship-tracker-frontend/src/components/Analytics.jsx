const statuses = [
    "Saved",
    "Applied",
    "OA",
    "Interview",
    "Offer",
    "Rejected"
];


function Analytics({ applications }) {

    return (
        <section className="section-panel">

            <div className="section-heading">

                <div>

                    <p className="section-kicker">
                        ANALYTICS
                    </p>

                    <h2>
                        Application Pipeline
                    </h2>

                </div>

            </div>


            <div className="analytics-list">

                {statuses.map((status) => {

                    const count =
                        applications.filter(
                            (application) =>
                                application.status === status
                        ).length;

                    const percentage =
                        applications.length === 0
                            ? 0
                            : Math.round(
                                  (count /
                                      applications.length) *
                                      100
                              );

                    return (
                        <div
                            className="analytics-row"
                            key={status}
                        >

                            <div className="analytics-label">

                                <span>
                                    {status}
                                </span>

                                <strong>
                                    {count}
                                </strong>

                            </div>


                            <div className="progress-track">

                                <div
                                    className="progress-bar"
                                    style={{
                                        width:
                                            percentage + "%"
                                    }}
                                />

                            </div>

                        </div>
                    );

                })}

            </div>

        </section>
    );
}

export default Analytics;