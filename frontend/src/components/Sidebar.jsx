// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";

// Trimmed to match what the backend actually exposes right now
// (AuthController, PropertyController, AddressController, UserController).
// Add items back here as matching endpoints/controllers land.
const navItems = [
  { label: "DASHBOARD", path: "/dashboard" },
  { label: "PROPERTY SEARCH", path: "/property-search" },
  { label: "ADD PROPERTY", path: "/add-property" },
  { label: "ADDRESS VALIDATION", path: "/address-validation" },
  { label: "RISK ASSESSMENT", path: "/risk-assessment" },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#1B2338] flex flex-col">
      <div className="flex flex-1">
        <div className="w-1 h-full bg-[#3E63C2]" />
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
                  `text-[12px] tracking-[1.5px] px-3 py-2.5 rounded transition-colors ${
                    isActive
                      ? "bg-[#2B3450] text-white"
                      : "text-gray-400 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="text-[12px] tracking-[1.5px] px-3 py-2.5 rounded text-gray-400 hover:text-white text-left"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
