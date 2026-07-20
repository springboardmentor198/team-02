// AddProperty.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";

const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Land"];

const EMPTY_FORM = {
  title: "",
  address: "",
  city: "",
  state: "",
  propertyType: "Residential",
  price: "",
  area: "",
  ownerName: "",
};

function AddProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [addressCheck, setAddressCheck] = useState(null); // { valid, message }
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "address") setAddressCheck(null);
  };

  const handleValidateAddress = async () => {
    if (!form.address.trim()) return;
    setCheckingAddress(true);
    try {
      // Backend: AddressController.validate → GET /api/address/validate?address=
      const res = await api.get("/address/validate", { params: { address: form.address } });
      setAddressCheck(res.data);
    } catch (e) {
      console.log(e);
      setAddressCheck({ valid: false, message: "Couldn't reach the address validation service." });
    } finally {
      setCheckingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSubmitting(true);
    try {
      // Backend: PropertyController.addProperty → POST /api/properties
      // The service re-validates the address server-side and rejects if invalid,
      // so a failed validation here will also fail on submit.
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        area: form.area ? Number(form.area) : null,
      };
      const res = await api.post("/properties", payload);
      setSuccess(res.data);
      setForm(EMPTY_FORM);
      setAddressCheck(null);
    } catch (e) {
      console.log(e);
      setError(
        e.response?.data?.message ||
          e.response?.data ||
          "Couldn't save this property. Check the fields and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8 max-w-[720px]">
          <h1 className="font-serif text-[38px] text-[#1B2338] leading-tight">Add Property</h1>
          <p className="text-sm text-gray-500 mt-2">
            New properties start with a "Pending" verification status until you run verification.
          </p>

          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-md px-4 py-3 mt-6 flex items-center justify-between">
              <span>"{success.title}" was added successfully.</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="font-medium hover:underline"
              >
                Go to dashboard →
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mt-6">
              {String(error)}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#E3DDCE] rounded-lg p-7 mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Title</label>
            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full h-11 mt-1.5 mb-5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              placeholder="e.g. 14 Lakeview Terrace"
            />

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Address</label>
            <div className="flex gap-3 mt-1.5 mb-1">
              <input
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                className="flex-1 h-11 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                placeholder="Street address"
              />
              <button
                type="button"
                onClick={handleValidateAddress}
                disabled={checkingAddress || !form.address.trim()}
                className="h-11 px-5 rounded-md border border-[#E3DDCE] text-sm text-[#1B2338] font-medium hover:bg-[#F8F6F0] disabled:opacity-50"
              >
                {checkingAddress ? "Checking…" : "Validate"}
              </button>
            </div>
            {addressCheck && (
              <p className={`text-xs mb-4 ${addressCheck.valid ? "text-green-700" : "text-red-600"}`}>
                {addressCheck.message}
              </p>
            )}
            {!addressCheck && <div className="mb-4" />}

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">City</label>
                <input
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="Austin"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">State</label>
                <input
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="TX"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Property type</label>
                <select
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="482000"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Area (sqft)</label>
                <input
                  type="number"
                  name="area"
                  min="0"
                  step="0.01"
                  required
                  value={form.area}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                  placeholder="2100"
                />
              </div>
            </div>

            <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Owner name</label>
            <input
              name="ownerName"
              required
              value={form.ownerName}
              onChange={handleChange}
              className="w-full h-11 mt-1.5 mb-7 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
              placeholder="M. Sanders"
            />

            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-8 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save property"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddProperty;
