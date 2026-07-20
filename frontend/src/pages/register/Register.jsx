// Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthBrandPanel from "../../components/AuthBrandPanel";

// Matches entity/Role.java. ADMIN is intentionally left out of public
// self-registration — that role should be assigned internally, not chosen
// at signup.
const ROLE_OPTIONS = [
  { value: "BUYER", label: "Buyer" },
  { value: "AGENT", label: "Agent" },
  { value: "LEGAL_REVIEWER", label: "Legal Reviewer" },
  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BUYER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Backend: AuthController.register expects { fullName, email, password, role }
      await api.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          "Couldn't create your account. That email may already be registered."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AuthBrandPanel
        eyebrow="Get started"
        headline="Set up access for your role in the diligence process."
        blurb="Buyers, agents, legal reviewers, and financial institutions all work from the same verified property record."
      />

      <div className="flex-1 h-screen bg-[#EFEAE0] flex items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-[420px]">
          <div className="mb-6">
            <p className="lg:hidden text-[12px] tracking-[2px] text-[#1B2338] font-medium mb-5">
              DILIGENCE LEDGER
            </p>
            <h2 className="font-serif text-[30px] text-[#1B2338] leading-tight">
              Create your account
            </h2>
            <p className="text-sm text-gray-500 mt-1">Set up access to the diligence platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Full name</label>
            <input
              name="fullName"
              required
              autoFocus
              value={form.fullName}
              onChange={handleChange}
              className="w-full h-10 mt-1.5 mb-4 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              placeholder="Durga Prasad Kasireddy"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-10 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full h-10 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-10 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-10 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#3E63C2] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
