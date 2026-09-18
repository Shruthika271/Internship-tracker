import { NavLink } from "react-router-dom";

const links = [
    {
        to: "/",
        icon: "⌂",
        label: "Home"
    },
    {
        to: "/applications",
        icon: "▤",
        label: "Applications"
    },
    {
        to: "/add",
        icon: "+",
        label: "Add Application"
    },
    {
        to: "/analytics",
        icon: "◫",
        label: "Analytics"
    },
    {
        to: "/notes",
        icon: "✎",
        label: "My Notes"
    },
    {
        to: "/settings",
        icon: "⚙",
        label: "Settings"
    }
];

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <div className="brand-mark">
                    IP
                </div>

                <div>
                    <strong>
                        Internship &
                    </strong>

                    <span>
                        Placement Tracker
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/"}
                        className={({ isActive }) =>
                            isActive
                                ? "nav-link active-nav-link"
                                : "nav-link"
                        }
                    >
                        <span className="nav-icon">
                            {link.icon}
                        </span>

                        <span>
                            {link.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-account">
                <NavLink
                    to="/settings"
                    className="sidebar-account"
                ></NavLink>

                <div>
                    <strong>
                        Your Account
                    </strong>

                    <span>
                        Settings & profile
                    </span>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;