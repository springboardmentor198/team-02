// components/TopHeader.jsx
import { useNavigate, Link } from "react-router-dom";
import NotificationBell from "./notifications/NotificationBell";

function TopHeader({ placeholder = "Search by address, parcel ID, or owner..." }) {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role") || "Analyst";
  const username = email ? email.split("@")[0] : "User";

  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/property-search?q=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E3DDCE] flex items-center justify-between px-10 sticky top-0 z-20">
      <input
        onKeyDown={handleSearch}
        className="w-[380px] h-10 rounded-full border border-[#E3DDCE] px-5 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#3E63C2]/40 focus:border-[#3E63C2] transition-shadow"
        placeholder={placeholder}
      />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[2px] text-gray-500">Logged in as</p>
          <p className="font-semibold text-sm">{role}</p>
        </div>
        <Link
          to="/profile"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B2338] to-[#2B3450] text-white flex items-center justify-center text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          {username[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

export default TopHeader;
