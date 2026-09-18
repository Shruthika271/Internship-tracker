const cards = [
    {
        key: "All",
        icon: "📋",
        title: "Applications"
    },
    {
        key: "Applied",
        icon: "📨",
        title: "Applied"
    },
    {
        key: "OA",
        icon: "💻",
        title: "Online Assessments"
    },
    {
        key: "Interview",
        icon: "🎤",
        title: "Interviews"
    },
    {
        key: "Offer",
        icon: "🎉",
        title: "Offers"
    },
    {
        key: "Rejected",
        icon: "✕",
        title: "Rejected"
    }
];

function Dashboard({
    applications,
    activeStatus,
    onStatusClick
}) {
    return (
        <section className="dashboard">

            {cards.map((card) => {

                const count =
                    card.key === "All"
                        ? applications.length
                        : applications.filter(
                              (application) =>
                                  application.status === card.key
                          ).length;

                return (
                    <button
                        className={
                            activeStatus === card.key
                                ? "card active-card"
                                : "card"
                        }
                        key={card.key}
                        onClick={() =>
                            onStatusClick(card.key)
                        }
                    >
                        <span className="card-icon">
                            {card.icon}
                        </span>

                        <h3>{card.title}</h3>

                        <p>{count}</p>

                        <span className="card-hint">
                            Click to view
                        </span>
                    </button>
                );
            })}

        </section>
    );
}

export default Dashboard;