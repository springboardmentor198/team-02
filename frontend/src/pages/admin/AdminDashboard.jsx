// pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  Building2,
  FileText,
  ShieldCheck,
  Activity,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopHeader from "../../components/TopHeader";
import { getAdminDashboardStats } from "../../services/api";

// Keeps the app's existing theme (navy / accent blue / cream) rather than
// introducing a new palette — just applied with more depth (soft shadows,
// gradient card headers) for the admin surface.
const NAVY = "#1B2338";
const ACCENT = "#3E63C2";
const ROLE_COLORS = ["#3E63C2", "#7C9CF0", "#1B2338", "#C9A15A", "#5CB88A"];

function StatCard({ icon: Icon, label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-[#E3DDCE] p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#1B2338] flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-[28px] font-semibold text-[#1B2338] leading-none">{value}</p>
      <p className="text-[12px] uppercase tracking-[1.5px] text-gray-500 mt-2">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getAdminDashboardStats();
        if (active) setStats(data);
      } catch (err) {
        console.error(err);
        if (active) {
          setError(
            err.response?.status === 403
              ? "Admin access required."
              : "Couldn't load admin dashboard data."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const roleData = stats?.usersByRole
    ? Object.entries(stats.usersByRole).map(([role, count]) => ({
        name: role.replace(/_/g, " "),
        value: count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <div className="ml-[220px]">
        <TopHeader placeholder="Search users, properties, reports..." />

        <main className="p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-[28px] text-[#1B2338]">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Platform-wide activity, users, and system status.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/users"
                className="h-10 px-5 rounded-md bg-[#1B2338] text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-[#2B3450] transition-colors"
              >
                Manage Users <ChevronRight size={15} />
              </Link>
              <Link
                to="/audit-history"
                className="h-10 px-5 rounded-md border border-[#1B2338] text-[#1B2338] text-sm font-semibold flex items-center hover:bg-white transition-colors"
              >
                View Audit Logs
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 bg-white/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-4 gap-5 mb-8">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} delay={0} />
                <StatCard
                  icon={Building2}
                  label="Properties Registered"
                  value={stats.totalProperties}
                  delay={0.05}
                />
                <StatCard
                  icon={FileText}
                  label="Reports Generated"
                  value={stats.totalReports}
                  sub={`${stats.reportsLast7Days} in the last 7 days`}
                  delay={0.1}
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Pending Reviews"
                  value={stats.pendingReports}
                  delay={0.15}
                />
                <StatCard
                  icon={Activity}
                  label="Total Audit Events"
                  value={stats.totalAuditLogs}
                  delay={0.2}
                />
                <StatCard
                  icon={Clock}
                  label="Audit Events (24h)"
                  value={stats.auditEventsLast24h}
                  delay={0.25}
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Failed Audit Events"
                  value={stats.failedAuditEvents}
                  delay={0.3}
                />
                <StatCard
                  icon={ShieldCheck}
                  label="System Health"
                  value={stats.systemHealth}
                  sub={`${stats.apiUptimePercent}% uptime (static — no monitoring wired up)`}
                  delay={0.35}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  className="col-span-1 bg-white rounded-2xl border border-[#E3DDCE] p-6 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-[#1B2338] mb-4">
                    Users by Role
                  </h3>
                  {roleData.length === 0 ? (
                    <p className="text-sm text-gray-400">No users yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={roleData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {roleData.map((entry, i) => (
                            <Cell key={entry.name} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{ fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 }}
                  className="col-span-2 bg-[#1B2338] rounded-2xl p-6 shadow-sm text-white flex flex-col justify-center"
                >
                  <h3 className="text-sm font-semibold mb-2 opacity-90">Quick Actions</h3>
                  <p className="text-xs text-gray-300 mb-5">
                    Jump to the areas admins manage most often.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/admin/users"
                      className="rounded-lg bg-white/10 hover:bg-white/20 transition-colors px-4 py-3 text-sm"
                    >
                      View &amp; manage users
                    </Link>
                    <Link
                      to="/audit-history"
                      className="rounded-lg bg-white/10 hover:bg-white/20 transition-colors px-4 py-3 text-sm"
                    >
                      Audit logs &amp; report history
                    </Link>
                    <Link
                      to="/property-search"
                      className="rounded-lg bg-white/10 hover:bg-white/20 transition-colors px-4 py-3 text-sm"
                    >
                      Browse properties
                    </Link>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="rounded-lg bg-white/5 text-gray-400 px-4 py-3 text-sm cursor-not-allowed"
                      title="Not implemented yet — no monitoring backend wired up"
                    >
                      System monitoring (coming soon)
                    </a>
                  </div>
                </motion.div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
