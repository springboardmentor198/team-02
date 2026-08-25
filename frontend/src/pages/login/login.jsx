// Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthBrandPanel from "../../components/AuthBrandPanel";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Backend: AuthController.login → returns { token, email, role }
      const res = await api.post("/auth/login", form);
      const { token, email, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      navigate(role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          "Couldn't sign in. Check your email and password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AuthBrandPanel
        eyebrow="Welcome back"
        headline="Pick up right where your due diligence left off."
        blurb="Every property, verification, and address check you've run is waiting on your dashboard."
      />

      <div className="flex-1 h-screen bg-[#EFEAE0] flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <p className="lg:hidden text-[12px] tracking-[2px] text-[#1B2338] font-medium mb-6">
              DILIGENCE LEDGER
            </p>
            <h2 className="font-serif text-[32px] text-[#1B2338] leading-tight">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1.5">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              value={form.email}
              onChange={handleChange}
              className="w-full h-11 mt-1.5 mb-4 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              placeholder="you@company.com"
            />

            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Password</label>
            </div>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full h-11 mt-1.5 mb-6 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              placeholder="••••••••"
            />
           <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Forgot Password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-7">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#3E63C2] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
