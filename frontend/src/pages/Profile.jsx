// Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";

const ROLE_LABELS = {
  BUYER: "Buyer",
  AGENT: "Agent",
  LEGAL_REVIEWER: "Legal Reviewer",
  FINANCIAL_INSTITUTION: "Financial Institution",
  ADMIN: "Admin",
};

const EMPTY_PASSWORD_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function InlineMessage({ type, children }) {
  const isError = type === "error";
  return (
    <div
      className={`flex items-start gap-2.5 text-sm rounded-md px-4 py-3 mb-5 border ${
        isError
          ? "bg-red-50 border-red-100 text-red-700"
          : "bg-green-50 border-green-100 text-green-700"
      }`}
    >
      {isError ? <FiAlertCircle className="mt-0.5 shrink-0" /> : <FiCheckCircle className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState("account");

  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        // Backend: UserController.getProfile → GET /api/users/profile
        const res = await api.get("/users/profile");
        setProfile(res.data);
        setProfileForm({ fullName: res.data.fullName, email: res.data.email });
      } catch (e) {
        console.log(e);
        setLoadError("Couldn't load your profile. Is the backend running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    const emailChanged = profileForm.email.trim() !== profile.email;
    try {
      // Backend: UserController.updateProfile → PUT /api/users/profile
      const res = await api.put("/users/profile", profileForm);
      setProfile(res.data);

      if (emailChanged) {
        // The JWT was issued against the old email — safest is to have
        // them sign back in with the new one rather than risk a stale session.
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate("/login", { state: { emailChanged: true } });
        return;
      }

      setProfileSuccess("Profile updated.");
    } catch (e) {
      console.log(e);
      setProfileError(
        e.response?.data?.message || e.response?.data || "Couldn't update your profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password don't match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      // Backend: UserController.changePassword → PUT /api/users/change-password
      await api.put("/users/change-password", passwordForm);
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (e) {
      console.log(e);
      setPasswordError(
        e.response?.data?.message || e.response?.data || "Couldn't change your password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const initials = (profile?.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8 max-w-[860px]">
          {loadError && <InlineMessage type="error">{loadError}</InlineMessage>}

          {loading ? (
            <div className="text-center py-24 text-gray-400 text-sm">Loading profile…</div>
          ) : profile ? (
            <>
              {/* Hero banner */}
              <div className="bg-[#1B2338] rounded-lg relative overflow-hidden px-8 pt-9 pb-16">
                <svg
                  className="absolute -right-16 -top-16 opacity-[0.06]"
                  width="280"
                  height="280"
                  viewBox="0 0 280 280"
                  fill="none"
                >
                  <circle cx="140" cy="140" r="139" stroke="white" strokeWidth="1.5" />
                  <circle cx="140" cy="140" r="95" stroke="white" strokeWidth="1.5" />
                </svg>
                <div className="absolute left-0 top-0 h-full w-1 bg-[#3E63C2]" />

                <p className="text-[#8FA0C9] text-[11px] uppercase tracking-[2px] relative">
                  My Profile
                </p>
                <h1 className="font-serif text-white text-[30px] mt-2 relative">
                  Account settings
                </h1>
              </div>

              {/* Avatar card, overlapping the banner */}
              <div className="flex items-end gap-5 px-8 -mt-11 relative">
                <div className="w-24 h-24 rounded-full bg-[#3E63C2] text-white flex items-center justify-center text-3xl font-semibold border-4 border-[#EFEAE0] shadow-md">
                  {initials}
                </div>
                <div className="pb-2">
                  <h2 className="text-xl font-semibold text-[#1B2338]">{profile.fullName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <FiMail className="text-gray-400" size={13} />
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <span className="mb-2 ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E3DDCE] text-[#1B2338] text-[11px] font-semibold tracking-[0.5px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <FiShield size={12} className="text-[#3E63C2]" />
                  {ROLE_LABELS[profile.role] || profile.role}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-8 mt-8">
                <button
                  onClick={() => setTab("account")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-[0.5px] transition-colors ${
                    tab === "account"
                      ? "bg-[#1B2338] text-white"
                      : "bg-white text-gray-500 border border-[#E3DDCE] hover:bg-[#F8F6F0]"
                  }`}
                >
                  <FiUser size={13} /> ACCOUNT DETAILS
                </button>
                <button
                  onClick={() => setTab("security")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-[0.5px] transition-colors ${
                    tab === "security"
                      ? "bg-[#1B2338] text-white"
                      : "bg-white text-gray-500 border border-[#E3DDCE] hover:bg-[#F8F6F0]"
                  }`}
                >
                  <FiLock size={13} /> SECURITY
                </button>
              </div>

              {/* Tab content */}
              <div className="px-8 mt-5 pb-4">
                {tab === "account" && (
                  <form
                    onSubmit={handleProfileSubmit}
                    className="bg-white border border-[#E3DDCE] rounded-lg p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-w-[480px]"
                  >
                    {profileError && <InlineMessage type="error">{String(profileError)}</InlineMessage>}
                    {profileSuccess && <InlineMessage type="success">{profileSuccess}</InlineMessage>}

                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Full name</label>
                    <div className="relative mt-1.5 mb-4">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        name="fullName"
                        required
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        className="w-full h-11 rounded-md border border-[#E3DDCE] pl-11 pr-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                      />
                    </div>

                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Email</label>
                    <div className="relative mt-1.5 mb-2">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        className="w-full h-11 rounded-md border border-[#E3DDCE] pl-11 pr-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                      Changing your email will sign you out — you'll need to log back in with it.
                    </p>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="flex items-center gap-2 h-11 px-7 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
                    >
                      <FiEdit3 size={14} />
                      {profileSaving ? "Saving…" : "Save changes"}
                    </button>
                  </form>
                )}

                {tab === "security" && (
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="bg-white border border-[#E3DDCE] rounded-lg p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] max-w-[480px]"
                  >
                    {passwordError && <InlineMessage type="error">{String(passwordError)}</InlineMessage>}
                    {passwordSuccess && <InlineMessage type="success">{passwordSuccess}</InlineMessage>}

                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Current password</label>
                    <div className="relative mt-1.5 mb-4">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="password"
                        name="currentPassword"
                        required
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full h-11 rounded-md border border-[#E3DDCE] pl-11 pr-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                        placeholder="••••••••"
                      />
                    </div>

                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">New password</label>
                    <div className="relative mt-1.5 mb-4">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="password"
                        name="newPassword"
                        required
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full h-11 rounded-md border border-[#E3DDCE] pl-11 pr-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                        placeholder="••••••••"
                      />
                    </div>

                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Confirm new password</label>
                    <div className="relative mt-1.5 mb-6">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full h-11 rounded-md border border-[#E3DDCE] pl-11 pr-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="flex items-center gap-2 h-11 px-7 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
                    >
                      <FiLock size={14} />
                      {passwordSaving ? "Updating…" : "Update password"}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default Profile;
