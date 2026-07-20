// AddressValidation.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";

function AddressValidation() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    try {
      // Backend: AddressController.validate → GET /api/address/validate?address=
      const res = await api.get("/address/validate", { params: { address } });
      setResult(res.data);
      setHistory((prev) => [{ address, ...res.data }, ...prev].slice(0, 8));
    } catch (e) {
      console.log(e);
      setResult({ valid: false, message: "Couldn't reach the validation service. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8 max-w-[720px]">
          <h1 className="font-serif text-[38px] text-[#1B2338] leading-tight">
            Address Validation
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Check an address before adding it as a property — the same check runs
            automatically when you save a new property.
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E3DDCE] rounded-lg p-6 mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex gap-3"
          >
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter a street address, e.g. 14 Lakeview Terrace, Austin TX"
              className="flex-1 h-11 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            />
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="h-11 px-7 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {loading ? "Checking…" : "Validate"}
            </button>
          </form>

          {result && (
            <div
              className={`rounded-lg p-6 mt-6 border ${
                result.valid
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    result.valid ? "bg-[#4D7B73]" : "bg-[#B45B46]"
                  }`}
                >
                  {result.valid ? "✓" : "✕"}
                </span>
                <div>
                  <p className={`font-semibold text-sm ${result.valid ? "text-green-800" : "text-red-800"}`}>
                    {result.valid ? "Address verified" : "Address could not be verified"}
                  </p>
                  <p className={`text-sm mt-0.5 ${result.valid ? "text-green-700" : "text-red-700"}`}>
                    {result.message}
                  </p>
                </div>
              </div>
              {result.valid && (
                <Link
                  to="/add-property"
                  className="inline-block mt-4 text-sm text-[#3E63C2] font-medium hover:underline"
                >
                  Continue to add this property →
                </Link>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white border border-[#E3DDCE] rounded-lg mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-3 border-b border-[#E3DDCE] text-[11px] uppercase tracking-[1.5px] text-gray-500">
                Recent checks this session
              </div>
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-3.5 border-b border-[#F0EBE0] last:border-0"
                >
                  <span className="text-sm text-[#1B2338]">{h.address}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      h.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {h.valid ? "Valid" : "Invalid"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddressValidation;
