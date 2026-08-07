// pages/Notifications.jsx
//
// Task 6: full notification history. Shares state with NotificationBell
// via useNotifications so reading a card here clears the bell badge too.
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, FileText, Inbox } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { useNotifications } from "../hooks/useNotifications";

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function NotificationCardSkeleton() {
  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-5 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-[#F2EEE4] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-[#F2EEE4] rounded" />
        <div className="h-3 w-24 bg-[#F2EEE4] rounded" />
      </div>
    </div>
  );
}

function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications();

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TopHeader />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 sm:px-9 py-8 max-w-[820px] w-full mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E3DDCE] bg-white text-[#1B2338] hover:bg-[#FAF8F3] transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <p className="text-[11px] uppercase tracking-[2px] text-gray-500 font-medium">
              Diligence Ledger &nbsp;/&nbsp; Notifications
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 mb-7">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-[32px] text-[#1B2338]">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full bg-[#3E63C2]/10 text-[#3E63C2] text-[12px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 h-10 px-4 rounded-full border border-[#E3DDCE] bg-white text-sm font-medium text-[#1B2338] hover:bg-[#FAF8F3] transition-colors"
              >
                <CheckCheck size={15} />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <NotificationCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-[#FBEDE9] border border-[#EFD3CB] rounded-2xl p-8 text-center">
              <p className="text-sm font-semibold text-[#B3402F]">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-dashed border-[#D8D1BE] rounded-2xl py-20 px-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#F2EEE4] flex items-center justify-center mb-5">
                <Inbox size={22} className="text-[#9AA2B5]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1B2338]">No notifications yet</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                You'll see updates here whenever a due diligence report or property
                event needs your attention.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const unread = n.status === "UNREAD";
                return (
                  <div
                    key={n.id}
                    className={`group bg-white border rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-16px_rgba(27,35,56,0.25)] ${
                      unread ? "border-[#3E63C2]/30" : "border-[#E3DDCE]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        unread ? "bg-[#3E63C2]/10" : "bg-[#F2EEE4]"
                      }`}
                    >
                      {n.reportId ? (
                        <FileText size={17} className={unread ? "text-[#3E63C2]" : "text-[#9AA2B5]"} />
                      ) : (
                        <Bell size={17} className={unread ? "text-[#3E63C2]" : "text-[#9AA2B5]"} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm leading-6 ${
                            unread ? "text-[#1B2338] font-semibold" : "text-gray-600"
                          }`}
                        >
                          {n.message}
                        </p>
                        {unread && <span className="w-2 h-2 rounded-full bg-[#3E63C2] mt-2 shrink-0" />}
                      </div>
                      <p className="text-[11.5px] text-gray-400 mt-1.5">{formatFull(n.createdAt)}</p>
                    </div>
                    {unread && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 px-3 rounded-full border border-[#E3DDCE] text-[11.5px] font-medium text-[#1B2338] hover:bg-[#FAF8F3]"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}

export default Notifications;
