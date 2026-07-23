import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthBrandPanel from "../components/AuthBrandPanel";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      alert("Session expired. Please start the forgot password process again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email is missing.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending Reset Password Request");
      console.log({
        email,
        newPassword: form.newPassword,
      });

      const response = await api.post("/auth/reset-password", {
        email: email,
        newPassword: form.newPassword,
      });

      alert(response.data || "Password reset successfully.");

      navigate("/login");
    } catch (err) {
      console.error("Reset Password Error:", err);

      if (err.response) {
        setError(err.response.data || "Unable to reset password.");
      } else {
        setError("Server not reachable.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AuthBrandPanel
        eyebrow="Reset Password"
        headline="Create a new password."
        blurb="Choose a strong password that you haven't used before."
      />

      <div className="flex-1 h-screen bg-[#EFEAE0] flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">

          <div className="mb-8">
            <p className="lg:hidden text-[12px] tracking-[2px] text-[#1B2338] font-medium mb-6">
              DILIGENCE LEDGER
            </p>

            <h2 className="font-serif text-[32px] text-[#1B2338]">
              Reset Password
            </h2>

            <p className="text-sm text-gray-500 mt-1.5">
              Enter your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full h-11 mt-1.5 mb-4 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            />

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full h-11 mt-1.5 mb-6 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;