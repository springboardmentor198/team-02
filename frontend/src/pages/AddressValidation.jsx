// AddressValidation.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCheckCircle, FiXCircle, FiCopy, FiArrowRight } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";

function AddressValidation() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || loading) return;
    setLoading(true);
    setCopied(false);
    try {
      // Backend: AddressController.validate → GET /api/address/validate?address=
      const res = await api.get("/address/validate", { params: { address } });
      setResult({ ...res.data, address });
      setHistory((prev) => [{ address, ...res.data }, ...prev].slice(0, 6));
    } catch (err) {
      console.log(err);
      setResult({
        valid: false,
        message: "Couldn't reach the validation service. Please try again.",
        address,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.address) return;
    navigator.clipboard?.writeText(result.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const runFromHistory = (h) => {
    if (loading) return;
    setAddress(h.address);
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader placeholder="Search by property address, parcel ID, or owner..." />

        <div className="px-10 py-10">
          <div className="max-w-[860px] mx-auto">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-[40px] text-[#1B2338] leading-tight">
                Find &amp; Verify a Property
              </h1>
              <p className="text-sm text-gray-500 mt-3 max-w-[520px] mx-auto">
                Confirm an address is valid before adding it as a property — the same
                check runs automatically when you save a new property.
              </p>
            </div>

            {/* Search card */}
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#E3DDCE] rounded-xl p-3 shadow-[0_2px_10px_rgba(27,35,56,0.06)] flex items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 pl-3">
                <FiSearch className="text-gray-400 shrink-0" size={18} />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Search by property address, parcel ID, or owner..."
                  className="w-full h-12 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="h-12 px-8 rounded-lg bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? "Validating…" : "Validate"}
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2.5 ml-1">
              e.g. "14 Lakeview Terrace, Austin TX" or a parcel ID like "48-453-021"
            </p>

            {/* Loading state */}
            {loading && (
              <div className="bg-white border border-[#E3DDCE] rounded-xl mt-6 p-8 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <span className="w-6 h-6 rounded-full border-2 border-[#E3DDCE] border-t-[#3E63C2] animate-spin shrink-0" />
                <p className="text-sm text-gray-500">Verifying this address…</p>
              </div>
            )}

            {/* Result card */}
            {!loading && result && (
              <div
                className={`rounded-xl mt-6 border shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden ${
                  result.valid ? "border-green-100" : "border-red-100"
                }`}
              >
                <div
                  className={`px-7 py-6 flex items-start gap-4 ${
                    result.valid ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <span
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 ${
                      result.valid ? "bg-[#4D7B73]" : "bg-[#B45B46]"
                    }`}
                  >
                    {result.valid ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm tracking-[0.3px] uppercase ${
                        result.valid ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      {result.valid ? "Verified" : "Not Verified"}
                    </p>
                    <p className="text-[#1B2338] font-medium mt-1.5 break-words">
                      {result.address}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        result.valid ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy address"
                    className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-[#1B2338] hover:bg-white/60 transition-colors"
                  >
                    <FiCopy size={15} />
                  </button>
                </div>

                <div className="bg-white px-7 py-4 flex items-center justify-between">
                  {copied && <span className="text-xs text-gray-400">Copied to clipboard</span>}
                  <div className="ml-auto">
                    {result.valid ? (
                      <Link
                        to="/add-property"
                        className="inline-flex items-center gap-1.5 text-sm text-[#3E63C2] font-semibold hover:underline"
                      >
                        Continue to Add Property <FiArrowRight size={14} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.querySelector("input")?.focus()}
                        className="text-sm text-[#3E63C2] font-semibold hover:underline"
                      >
                        Edit address and try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent searches this session */}
            {history.length > 0 && (
              <div className="bg-white border border-[#E3DDCE] rounded-xl mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-7 py-3.5 border-b border-[#E3DDCE] text-[11px] uppercase tracking-[1.5px] text-gray-500">
                  Recent checks this session
                </div>
                {history.map((h, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => runFromHistory(h)}
                    className="w-full flex items-center justify-between px-7 py-3.5 border-b border-[#F0EBE0] last:border-0 text-left hover:bg-[#F8F6F0] transition-colors"
                  >
                    <span className="text-sm text-[#1B2338] truncate pr-4">{h.address}</span>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium ${
                        h.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {h.valid ? "Verified" : "Not verified"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddressValidation;
