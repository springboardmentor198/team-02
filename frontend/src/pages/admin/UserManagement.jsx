// pages/admin/UserManagement.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Save, Search } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import TopHeader from "../../components/TopHeader";
import {
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from "../../services/api";

const ROLES = ["BUYER", "AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [pendingRoles, setPendingRoles] = useState({});
  const currentEmail = localStorage.getItem("email");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 403
          ? "Admin access required."
          : "Couldn't load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = (id, role) => {
    setPendingRoles((prev) => ({ ...prev, [id]: role }));
  };

  const handleSaveRole = async (user) => {
    const newRole = pendingRoles[user.id];
    if (!newRole || newRole === user.role) return;
    setSavingId(user.id);
    try {
      const updated = await updateAdminUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("Couldn't update role. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (user) => {
    if (user.email === currentEmail) {
      alert("You can't remove your own account.");
      return;
    }
    if (!window.confirm(`Remove ${user.fullName || user.email}? This can't be undone.`)) {
      return;
    }
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      alert("Couldn't remove this user. Please try again.");
    }
  };

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <div className="ml-[220px]">
        <TopHeader placeholder="Search users..." />

        <main className="p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-[28px] text-[#1B2338]">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                {users.length} user{users.length === 1 ? "" : "s"} on the platform.
              </p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name, email, or role"
                className="w-[280px] h-10 pl-10 pr-4 rounded-md border border-[#E3DDCE] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E3DDCE] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F6F0] text-left text-[11px] uppercase tracking-[1.5px] text-gray-500">
                  <th className="px-6 py-3.5 font-medium">Name</th>
                  <th className="px-6 py-3.5 font-medium">Email</th>
                  <th className="px-6 py-3.5 font-medium">Role</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-[#F1EDE3]">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-[#F1EDE3] rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                      No users match that search.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((user) => {
                      const pendingRole = pendingRoles[user.id];
                      const dirty = pendingRole && pendingRole !== user.role;
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-t border-[#F1EDE3] hover:bg-[#FAF8F2] transition-colors"
                        >
                          <td className="px-6 py-3.5 font-medium text-[#1B2338]">
                            {user.fullName || "—"}
                          </td>
                          <td className="px-6 py-3.5 text-gray-600">{user.email}</td>
                          <td className="px-6 py-3.5">
                            <select
                              value={pendingRole ?? user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="h-9 rounded-md border border-[#E3DDCE] px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex justify-end gap-2">
                              {dirty && (
                                <button
                                  onClick={() => handleSaveRole(user)}
                                  disabled={savingId === user.id}
                                  className="h-9 px-3 rounded-md bg-[#3E63C2] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#3457AC] transition-colors disabled:opacity-60"
                                >
                                  <Save size={13} />
                                  {savingId === user.id ? "Saving…" : "Save"}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user)}
                                className="h-9 px-3 rounded-md border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserManagement;
