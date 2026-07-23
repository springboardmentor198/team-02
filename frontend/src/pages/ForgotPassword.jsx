import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthBrandPanel from "../components/AuthBrandPanel";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    console.log("handleSubmit started");
    console.log("Email:", email);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Calling API...");

      const response = await api.post("/auth/forgot-password", {
        email,
      });

      console.log("Success:", response.data);

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
      console.error("Forgot Password Error:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response:", err.response.data);

        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data?.message || "Unable to send OTP."
        );
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AuthBrandPanel
        eyebrow="Forgot Password"
        headline="Reset your account password."
        blurb="We'll send a One-Time Password (OTP) to your registered email address."
      />

      <div className="flex-1 h-screen bg-[#EFEAE0] flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">

          <div className="mb-8">
            <p className="lg:hidden text-[12px] tracking-[2px] text-[#1B2338] font-medium mb-6">
              DILIGENCE LEDGER
            </p>

            <h2 className="font-serif text-[32px] text-[#1B2338]">
              Forgot Password
            </h2>

            <p className="text-sm text-gray-500 mt-1.5">
              Enter your registered email address.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
            Email
          </label>

          <input
            type="email"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full h-11 mt-1.5 mb-6 rounded-md border border-[#E3DDCE] px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;