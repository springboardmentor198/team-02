// AddProperty.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import api from "../services/api";
import {
  Building2,
  MapPin,
  DollarSign,
  Ruler,
  User,
  Landmark,
  Scale,
  Map,
  Waves,
  ClipboardCheck,
  Leaf,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

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

const EMPTY_LAND_REGISTRY = {
  registryNumber: "",
  registryStatus: "",
  registryOffice: "",
  titleVerified: false,
  lastUpdated: "",
};

const EMPTY_OWNERSHIP = {
  ownershipType: "",
  ownershipSince: "",
  ownerVerified: false,
  remarks: "",
};

const EMPTY_LEGAL_RECORD = {
  courtCases: "",
  caseStatus: "",
  remarks: "",
};

const EMPTY_ZONING = {
  zoneType: "",
  constructionAllowed: "",
  authority: "",
};

const EMPTY_FLOOD_ZONE = {
  zoneType: "",
  riskLevel: "",
  insuranceRequired: "",
  authority: "",
};

const EMPTY_PERMIT = {
  permitNumber: "",
  permitType: "",
  permitStatus: "",
  issuingAuthority: "",
};

const EMPTY_ENVIRONMENTAL = {
  environmentalRisk: "",
  pollutionLevel: "",
  protectedArea: "",
  remarks: "",
};

// ============================================================
// Tab configuration for the 7 due-diligence sections. Purely
// presentational — drives which section is shown and its icon/
// completeness check. Does not touch any request/payload shape.
// ============================================================
const SECTION_TABS = [
  { key: "landRegistry", label: "Land Registry", icon: Landmark },
  { key: "ownership", label: "Ownership", icon: User },
  { key: "legalRecord", label: "Legal Records", icon: Scale },
  { key: "zoning", label: "Zoning", icon: Map },
  { key: "floodZone", label: "Flood Zone", icon: Waves },
  { key: "permit", label: "Permit", icon: ClipboardCheck },
  { key: "environmental", label: "Environmental", icon: Leaf },
];

// Reusable text/select/checkbox input for a nested due-diligence section.
// Unchanged wiring: `value` + `onChange` come straight from the section's
// state object and setter — only the visual styling here is new.
function SectionField({ label, value, onChange, type = "text", options }) {
  if (type === "checkbox") {
    return (
      <label className="group flex items-center gap-2.5 h-11 mt-1.5 text-sm text-[#1B2338] cursor-pointer select-none">
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-md border transition-colors ${
            value
              ? "bg-[#1B2338] border-[#1B2338]"
              : "bg-[#F8F6F0] border-[#E3DDCE] group-hover:border-[#1B2338]/40"
          }`}
        >
          {value && <CheckCircle2 size={13} className="text-white" strokeWidth={2.5} />}
        </span>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {label}
      </label>
    );
  }

  return (
    <div>
      <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
        />
      )}
    </div>
  );
}

// Panel wrapper for whichever section tab is currently active.
function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-fadeIn">
      <h2 className="text-lg font-semibold text-[#1B2338]">{title}</h2>
      {description && <p className="text-xs text-gray-500 mt-1 mb-5">{description}</p>}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${description ? "" : "mt-5"}`}>
        {children}
      </div>
    </div>
  );
}

// Compact circular completion ring for the sticky summary panel — visually
// echoes the verification-score ring already used on the property Dashboard.
function CompletionRing({ value }) {
  const size = 104;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F2EEE4" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#C89546"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#1B2338] leading-none">{Math.round(clamped)}%</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-wide mt-1">Complete</span>
      </div>
    </div>
  );
}

function AddProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [landRegistry, setLandRegistry] = useState(EMPTY_LAND_REGISTRY);
  const [ownership, setOwnership] = useState(EMPTY_OWNERSHIP);
  const [legalRecord, setLegalRecord] = useState(EMPTY_LEGAL_RECORD);
  const [zoning, setZoning] = useState(EMPTY_ZONING);
  const [floodZone, setFloodZone] = useState(EMPTY_FLOOD_ZONE);
  const [permit, setPermit] = useState(EMPTY_PERMIT);
  const [environmental, setEnvironmental] = useState(EMPTY_ENVIRONMENTAL);

  const [addressCheck, setAddressCheck] = useState(null); // { valid, message }
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // New, purely presentational: which due-diligence tab is currently shown.
  // Does not participate in the submitted payload in any way.
  const [activeSection, setActiveSection] = useState("landRegistry");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "address") setAddressCheck(null);
  };

  const field = (setter) => (key) => (value) =>
    setter((prev) => ({ ...prev, [key]: value }));

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
      // Everything below — the property itself plus every due-diligence
      // section — goes to the backend as ONE JSON body and is stored in
      // PostgreSQL in a single transaction.
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        area: form.area ? Number(form.area) : null,
        landRegistry,
        ownership,
        legalRecord,
        zoning,
        floodZone,
        permit,
        environmental,
      };
      const res = await api.post("/properties", payload);
      setSuccess(res.data);
      setForm(EMPTY_FORM);
      setLandRegistry(EMPTY_LAND_REGISTRY);
      setOwnership(EMPTY_OWNERSHIP);
      setLegalRecord(EMPTY_LEGAL_RECORD);
      setZoning(EMPTY_ZONING);
      setFloodZone(EMPTY_FLOOD_ZONE);
      setPermit(EMPTY_PERMIT);
      setEnvironmental(EMPTY_ENVIRONMENTAL);
      setAddressCheck(null);
      setActiveSection("landRegistry");
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

  const landRegistryField = field(setLandRegistry);
  const ownershipField = field(setOwnership);
  const legalRecordField = field(setLegalRecord);
  const zoningField = field(setZoning);
  const floodZoneField = field(setFloodZone);
  const permitField = field(setPermit);
  const environmentalField = field(setEnvironmental);

  // ---- Derived, presentation-only completion tracking ----
  // None of this feeds the payload — it only drives the ring/checklist UI.
  const sectionCompleteness = {
    landRegistry: !!(landRegistry.registryNumber && landRegistry.registryStatus && landRegistry.registryOffice && landRegistry.lastUpdated),
    ownership: !!(ownership.ownershipType && ownership.ownershipSince),
    legalRecord: !!(legalRecord.courtCases && legalRecord.caseStatus),
    zoning: !!(zoning.zoneType && zoning.constructionAllowed && zoning.authority),
    floodZone: !!(floodZone.zoneType && floodZone.riskLevel && floodZone.insuranceRequired && floodZone.authority),
    permit: !!(permit.permitNumber && permit.permitType && permit.permitStatus && permit.issuingAuthority),
    environmental: !!(environmental.environmentalRisk && environmental.pollutionLevel && environmental.protectedArea),
  };
  const coreComplete = !!(form.title && form.address && form.city && form.state && form.price && form.area && form.ownerName);
  const totalTrackedSections = SECTION_TABS.length + 1; // +1 for core property info
  const completedSections =
    Object.values(sectionCompleteness).filter(Boolean).length + (coreComplete ? 1 : 0);
  const completionPct = Math.round((completedSections / totalTrackedSections) * 100);

  const activeIndex = SECTION_TABS.findIndex((t) => t.key === activeSection);
  const goToSection = (key) => setActiveSection(key);
  const goPrev = () => {
    if (activeIndex > 0) setActiveSection(SECTION_TABS[activeIndex - 1].key);
  };
  const goNext = () => {
    if (activeIndex < SECTION_TABS.length - 1) setActiveSection(SECTION_TABS[activeIndex + 1].key);
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeInUp 0.25s ease-out; }
      `}</style>
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8 max-w-[1180px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-[38px] text-[#1B2338] leading-tight">Add Property</h1>
              <p className="text-sm text-gray-500 mt-2">
                New properties start with a "Pending" verification status until you run verification.
              </p>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ===================== Main column ===================== */}
            <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
              {/* ================= Core property info (always visible) ================= */}
              <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-5">
                  <Building2 size={16} className="text-[#1B2338]" />
                  <h2 className="text-lg font-semibold text-[#1B2338]">Property Information</h2>
                </div>

                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Title</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 mb-5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
                  placeholder="e.g. 14 Lakeview Terrace"
                />

                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500 flex items-center gap-1.5">
                  <MapPin size={11} className="text-[#9AA2B5]" /> Address
                </label>
                <div className="flex gap-3 mt-1.5 mb-1">
                  <input
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    className="flex-1 h-11 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
                    placeholder="Street address"
                  />
                  <button
                    type="button"
                    onClick={handleValidateAddress}
                    disabled={checkingAddress || !form.address.trim()}
                    className="h-11 px-5 rounded-md border border-[#E3DDCE] text-sm text-[#1B2338] font-medium hover:bg-[#F8F6F0] hover:border-[#1B2338]/30 transition-colors disabled:opacity-50 disabled:hover:bg-transparent shrink-0"
                  >
                    {checkingAddress ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Checking…
                      </span>
                    ) : (
                      "Validate"
                    )}
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
                      className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
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
                      className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
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
                      className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none transition-shadow"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500 flex items-center gap-1.5">
                      <DollarSign size={11} className="text-[#9AA2B5]" /> Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={handleChange}
                      className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
                      placeholder="482000"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500 flex items-center gap-1.5">
                      <Ruler size={11} className="text-[#9AA2B5]" /> Area (sqft)
                    </label>
                    <input
                      type="number"
                      name="area"
                      min="0"
                      step="0.01"
                      required
                      value={form.area}
                      onChange={handleChange}
                      className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
                      placeholder="2100"
                    />
                  </div>
                </div>

                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500 flex items-center gap-1.5">
                  <User size={11} className="text-[#9AA2B5]" /> Owner name
                </label>
                <input
                  name="ownerName"
                  required
                  value={form.ownerName}
                  onChange={handleChange}
                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2] transition-shadow"
                  placeholder="M. Sanders"
                />
              </div>

              {/* ================= Due-diligence section tabs ================= */}
              <div className="bg-white border border-[#E3DDCE] rounded-2xl overflow-hidden">
                <div className="flex gap-1 overflow-x-auto px-3 pt-3 border-b border-[#F2EEE4]">
                  {SECTION_TABS.map((tab) => {
                    const TabIcon = tab.icon;
                    const active = activeSection === tab.key;
                    const done = sectionCompleteness[tab.key];
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => goToSection(tab.key)}
                        className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap rounded-t-md transition-all hover:-translate-y-[1px] ${
                          active ? "text-[#1B2338] bg-[#FAF8F3]" : "text-gray-400 hover:text-[#1B2338]"
                        }`}
                      >
                        <TabIcon size={14} />
                        {tab.label}
                        {done ? (
                          <CheckCircle2 size={12} className="text-[#4D7B73]" />
                        ) : (
                          <Circle size={12} className="text-gray-300" />
                        )}
                        {active && (
                          <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-[#C89546] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-7">
                  {activeSection === "landRegistry" && (
                    <SectionCard title="Land Registry" description="Public land registry details for this property.">
                      <SectionField label="Registry Number" value={landRegistry.registryNumber} onChange={landRegistryField("registryNumber")} />
                      <SectionField label="Registry Status" value={landRegistry.registryStatus} onChange={landRegistryField("registryStatus")} type="select" options={["ACTIVE", "INACTIVE", "DISPUTED"]} />
                      <SectionField label="Registry Office" value={landRegistry.registryOffice} onChange={landRegistryField("registryOffice")} />
                      <SectionField label="Last Updated" value={landRegistry.lastUpdated} onChange={landRegistryField("lastUpdated")} type="date" />
                      <SectionField label="Title Verified" value={landRegistry.titleVerified} onChange={landRegistryField("titleVerified")} type="checkbox" />
                    </SectionCard>
                  )}

                  {activeSection === "ownership" && (
                    <SectionCard title="Ownership" description="How this property is currently owned.">
                      <SectionField label="Ownership Type" value={ownership.ownershipType} onChange={ownershipField("ownershipType")} type="select" options={["Freehold", "Leasehold", "Joint Ownership"]} />
                      <SectionField label="Ownership Since" value={ownership.ownershipSince} onChange={ownershipField("ownershipSince")} type="date" />
                      <div className="sm:col-span-2">
                        <SectionField label="Remarks" value={ownership.remarks} onChange={ownershipField("remarks")} />
                      </div>
                      <SectionField label="Owner Verified" value={ownership.ownerVerified} onChange={ownershipField("ownerVerified")} type="checkbox" />
                    </SectionCard>
                  )}

                  {activeSection === "legalRecord" && (
                    <SectionCard title="Legal Records" description="Any court cases or legal disputes tied to this property.">
                      <SectionField label="Court Cases" value={legalRecord.courtCases} onChange={legalRecordField("courtCases")} type="select" options={["YES", "NO"]} />
                      <SectionField label="Case Status" value={legalRecord.caseStatus} onChange={legalRecordField("caseStatus")} />
                      <div className="sm:col-span-2">
                        <SectionField label="Remarks" value={legalRecord.remarks} onChange={legalRecordField("remarks")} />
                      </div>
                    </SectionCard>
                  )}

                  {activeSection === "zoning" && (
                    <SectionCard title="Zoning" description="Municipal zoning classification and construction rules.">
                      <SectionField label="Zone Type" value={zoning.zoneType} onChange={zoningField("zoneType")} />
                      <SectionField label="Construction Allowed" value={zoning.constructionAllowed} onChange={zoningField("constructionAllowed")} type="select" options={["YES", "NO"]} />
                      <div className="sm:col-span-2">
                        <SectionField label="Authority" value={zoning.authority} onChange={zoningField("authority")} />
                      </div>
                    </SectionCard>
                  )}

                  {activeSection === "floodZone" && (
                    <SectionCard title="Flood Zone" description="Flood risk classification for this property.">
                      <SectionField label="Zone Type" value={floodZone.zoneType} onChange={floodZoneField("zoneType")} />
                      <SectionField label="Risk Level" value={floodZone.riskLevel} onChange={floodZoneField("riskLevel")} type="select" options={["Low", "Moderate", "High"]} />
                      <SectionField label="Insurance Required" value={floodZone.insuranceRequired} onChange={floodZoneField("insuranceRequired")} type="select" options={["YES", "NO"]} />
                      <SectionField label="Authority" value={floodZone.authority} onChange={floodZoneField("authority")} />
                    </SectionCard>
                  )}

                  {activeSection === "permit" && (
                    <SectionCard title="Permit" description="Building or usage permits issued for this property.">
                      <SectionField label="Permit Number" value={permit.permitNumber} onChange={permitField("permitNumber")} />
                      <SectionField label="Permit Type" value={permit.permitType} onChange={permitField("permitType")} />
                      <SectionField label="Permit Status" value={permit.permitStatus} onChange={permitField("permitStatus")} type="select" options={["Approved", "Pending", "Rejected", "Expired"]} />
                      <SectionField label="Issuing Authority" value={permit.issuingAuthority} onChange={permitField("issuingAuthority")} />
                    </SectionCard>
                  )}

                  {activeSection === "environmental" && (
                    <SectionCard title="Environmental" description="Environmental risk and protected-area status.">
                      <SectionField label="Environmental Risk" value={environmental.environmentalRisk} onChange={environmentalField("environmentalRisk")} type="select" options={["Low", "Moderate", "High"]} />
                      <SectionField label="Pollution Level" value={environmental.pollutionLevel} onChange={environmentalField("pollutionLevel")} type="select" options={["Minimal", "Moderate", "Severe"]} />
                      <SectionField label="Protected Area" value={environmental.protectedArea} onChange={environmentalField("protectedArea")} type="select" options={["Yes", "No"]} />
                      <SectionField label="Remarks" value={environmental.remarks} onChange={environmentalField("remarks")} />
                    </SectionCard>
                  )}

                  {/* Prev / Next section navigation — purely for tab UX */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={activeIndex === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E3DDCE] text-sm text-[#1B2338] font-medium hover:bg-[#F8F6F0] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <span className="text-xs text-gray-400">
                      Section {activeIndex + 1} of {SECTION_TABS.length}
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={activeIndex === SECTION_TABS.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E3DDCE] text-sm text-[#1B2338] font-medium hover:bg-[#F8F6F0] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== Sticky summary rail ===================== */}
            <aside className="lg:sticky lg:top-6 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white rounded-2xl p-6 relative overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 15% 10%, #C89546 0%, transparent 45%), radial-gradient(circle at 90% 85%, #4D7B73 0%, transparent 45%)",
                  }}
                />
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[1.5px] text-white/50 mb-4">Listing summary</p>

                  <div className="flex items-center gap-4 mb-5">
                    <CompletionRing value={completionPct} />
                    <div className="min-w-0">
                      <p className="text-base font-semibold truncate">{form.title || "Untitled property"}</p>
                      <p className="text-xs text-white/60 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={11} />
                        {[form.address, form.city, form.state].filter(Boolean).join(", ") || "No address yet"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] text-white/50">
                        <DollarSign size={11} /> Price
                      </div>
                      <p className="text-sm font-semibold mt-1">{form.price ? `$${form.price}` : "N/A"}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] text-white/50">
                        <Ruler size={11} /> Area
                      </div>
                      <p className="text-sm font-semibold mt-1">{form.area ? `${form.area} sqft` : "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {SECTION_TABS.map((tab) => {
                      const TabIcon = tab.icon;
                      const done = sectionCompleteness[tab.key];
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => goToSection(tab.key)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10 ${
                            activeSection === tab.key ? "bg-white/10" : ""
                          }`}
                        >
                          <TabIcon size={12} className="text-white/60 shrink-0" />
                          <span className="flex-1 text-left text-white/80 truncate">{tab.label}</span>
                          {done ? (
                            <CheckCircle2 size={13} className="text-[#8fd4c4]" />
                          ) : (
                            <Circle size={13} className="text-white/30" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-xl bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving…
                  </>
                ) : (
                  "Save property"
                )}
              </button>
              <p className="text-[11px] text-gray-500 text-center -mt-2">
                Saved as one record across every due-diligence section.
              </p>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddProperty;