import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";

function TaxHistory() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    taxYear: "",
    taxAmount: "",
    paymentStatus: "Pending",
    paymentDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load properties.");
    }
  }

  async function loadHistory(propertyId) {
    if (!propertyId) {
      setRecords([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/tax-history/property/${propertyId}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load tax history.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedProperty) {
      alert("Please select a property.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/tax-history/${editingId}`, form);
      } else {
        await api.post(
          `/tax-history/property/${selectedProperty}`,
          form
        );
      }

      setForm(emptyForm);
      setEditingId(null);
      loadHistory(selectedProperty);

    } catch (err) {
      console.error(err);
      alert("Failed to save record.");
    }
  }

  function handleEdit(record) {
    setEditingId(record.id);

    setForm({
      taxYear: record.taxYear || "",
      taxAmount: record.taxAmount || "",
      paymentStatus: record.paymentStatus || "Pending",
      paymentDate: record.paymentDate || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;

    try {
      await api.delete(`/tax-history/${id}`);
      loadHistory(selectedProperty);
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />

      <main className="ml-[220px]">
        <TopHeader placeholder="Search tax history..." />

        <div className="px-10 py-8">

          <h1 className="font-serif text-[44px] text-[#1B2338]">
            Property Tax History
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            View and manage property tax records.
          </p>
                    {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 mt-6">
              {error}
            </div>
          )}

          {/* Property Selection */}
          <div className="bg-white border border-[#E3DDCE] rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-[#1B2338] mb-5">
              Select Property
            </h2>

            <select
              className="w-full border border-[#E3DDCE] rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#3E63C2]"
              value={selectedProperty}
              onChange={(e) => {
                setSelectedProperty(e.target.value);
                loadHistory(e.target.value);
              }}
            >
              <option value="">Choose Property</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>

          {/* Add/Edit Form */}
          <div className="bg-white border border-[#E3DDCE] rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#1B2338]">
                {editingId ? "Edit Tax Record" : "Add Tax Record"}
              </h2>

              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Year
                </label>

                <input
                  type="number"
                  className="w-full border border-[#E3DDCE] rounded-md p-3"
                  placeholder="2025"
                  value={form.taxYear}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taxYear: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Amount
                </label>

                <input
                  type="number"
                  className="w-full border border-[#E3DDCE] rounded-md p-3"
                  placeholder="25000"
                  value={form.taxAmount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taxAmount: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Status
                </label>

                <select
                  className="w-full border border-[#E3DDCE] rounded-md p-3"
                  value={form.paymentStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentStatus: e.target.value,
                    })
                  }
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Date
                </label>

                <input
                  type="date"
                  className="w-full border border-[#E3DDCE] rounded-md p-3"
                  value={form.paymentDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1B2338] text-white rounded-md hover:bg-[#2B3450] transition"
                >
                  {editingId ? "Update Record" : "Add Record"}
                </button>
              </div>
            </form>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-[#E3DDCE] rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">
    Tax History Records
</h2>
</div>

{loading ? (
                <div className="py-12 text-center text-gray-500">
                  Loading tax history...
                </div>
              ) : records.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No tax history available for this property.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E3DDCE] text-left">
                      <th className="py-3">Year</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment Date</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-[#F2EFE7] hover:bg-[#FAF8F3]"
                      >
                        <td className="py-4">{record.taxYear}</td>

                        <td>
                          ₹
                          {Number(record.taxAmount).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {record.paymentStatus}
                          </span>
                        </td>

                        <td>
                          {record.paymentDate || "-"}
                        </td>

                        <td className="text-center space-x-4">
                          <button
                            type="button"
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaxHistory;