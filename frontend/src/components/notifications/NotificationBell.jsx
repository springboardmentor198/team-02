// components/notifications/NotificationBell.jsx
//
// Sits in TopHeader.jsx next to the profile avatar. Uses the same
// bg-[#1B2338] chip language as the avatar for the icon button, and the
// same white/border/rounded-2xl card recipe as the rest of the app for
// the dropdown panel.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const preview = notifications.slice(0, 6);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-full border border-[#E3DDCE] bg-[#F8F6F0] flex items-center justify-center text-[#1B2338] hover:bg-[#EFEAE0] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B45B46] text-white text-[10px] font-bold flex items-center justify-center leading-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[360px] bg-white border border-[#E3DDCE] rounded-2xl shadow-[0_20px_50px_-20px_rgba(27,35,56,0.35)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2EEE4]">
            <h3 className="text-sm font-semibold text-[#1B2338]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-medium text-[#3E63C2] hover:text-[#2C4C99] transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="p-5 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 bg-[#F2EEE4] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : preview.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center px-6">
                <div className="w-11 h-11 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-3">
                  <Inbox size={18} className="text-[#9AA2B5]" />
                </div>
                <p className="text-sm text-gray-500">You're all caught up.</p>
              </div>
            ) : (
              preview.map((n) => {
                const unread = n.status === "UNREAD";
                return (
                  <button
                    key={n.id}
                    onClick={() => unread && markRead(n.id)}
                    className={`w-full text-left px-5 py-3.5 border-b border-[#F2EEE4] last:border-0 transition-colors ${
                      unread ? "bg-[#3E63C2]/[0.05] hover:bg-[#3E63C2]/[0.09]" : "hover:bg-[#FAF8F3]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          unread ? "bg-[#3E63C2]" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-[13px] leading-5 ${
                            unread ? "text-[#1B2338] font-medium" : "text-gray-500"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full text-center py-3 text-[12.5px] font-semibold text-[#1B2338] bg-[#FAF8F3] hover:bg-[#F2EEE4] transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
