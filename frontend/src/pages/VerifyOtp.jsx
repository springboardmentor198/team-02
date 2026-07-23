import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthBrandPanel from "../components/AuthBrandPanel";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      navigate("/reset-password", {
        state: { email },
      });

    } catch (err) {
      setError(
        err.response?.data ||
        "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">

      <AuthBrandPanel
        eyebrow="Verify OTP"
        headline="Verify your identity."
        blurb="Enter the One-Time Password sent to your registered email."
      />

      <div className="flex-1 h-screen bg-[#EFEAE0] flex items-center justify-center px-6">

        <div className="w-full max-w-[380px]">

          <div className="mb-8">

            <p className="lg:hidden text-[12px] tracking-[2px] text-[#1B2338] font-medium mb-6">
              DILIGENCE LEDGER
            </p>

            <h2 className="font-serif text-[32px] text-[#1B2338]">
              Verify OTP
            </h2>

            <p className="text-sm text-gray-500 mt-1.5">
              Enter the OTP sent to your email.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
              OTP
            </label>

            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full h-11 mt-1.5 mb-6 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default VerifyOtp;