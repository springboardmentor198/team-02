// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

// Trimmed to match what the backend actually exposes right now
// (AuthController, PropertyController, AddressController, UserController).
// Add items back here as matching endpoints/controllers land.
//
// Notifications intentionally isn't in this list -- it's reachable via the
// bell icon in TopHeader instead, so it doesn't take up a permanent sidebar
// slot every role has to scroll past.
//
// Risk Assessment / Comparable Analysis / Valuation Comparison collapse
// into the single "Analytics" link -> those three now live as tabs inside
// AnalyticsWorkspace.jsx rather than three separate sidebar entries.
const navItems = [
  { label: "DASHBOARD", path: "/dashboard" },
  { label: "PROPERTY SEARCH", path: "/property-search" },
  { label: "ADD PROPERTY", path: "/add-property" },
  { label: "ADDRESS VALIDATION", path: "/address-validation" },
  { label: "ANALYTICS", path: "/analytics" },
];

// Only rendered for role === "ADMIN" -- backend enforces this too
// (SecurityConfig: /api/admin/** and /api/audit-logs/** -> hasRole("ADMIN")).
// Audit & History moved here from the general navItems list: it's a
// system-wide audit log, not personal history, so it's admin-only both in
// the UI and (the part that actually matters) on the backend. User
// Management is intentionally NOT a separate sidebar entry -- it's one
// click away from Admin Dashboard's Quick Actions instead, so the sidebar
// stays short.
const adminNavItems = [
  { label: "AUDIT & HISTORY", path: "/audit-history" },
  { label: "ADMIN DASHBOARD", path: "/admin/dashboard" },
];

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-gradient-to-b from-[#1B2338] to-[#171D30] flex flex-col">
      <div className="flex flex-1">
        <div className="w-1 h-full bg-gradient-to-b from-[#3E63C2] to-[#7C9CF0]" />
        <div className="flex-1 py-6 px-5 flex flex-col">
          <p className="text-white text-[13px] tracking-[2px] font-medium mb-8">
            DILIGENCE LEDGER
          </p>
          <nav className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-[12px] tracking-[1.5px] px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#2B3450] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {role === "ADMIN" && (
              <>
                <p className="text-[10px] tracking-[2px] text-gray-500 mt-5 mb-1 px-3">
                  ADMINISTRATION
                </p>
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `text-[12px] tracking-[1.5px] px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#3E63C2] to-[#5478D6] text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
          <button
            onClick={handleLogout}
            className="text-[12px] tracking-[1.5px] px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] text-left transition-all"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
