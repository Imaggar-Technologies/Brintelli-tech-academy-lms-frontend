import { useState } from "react";
import { X } from "lucide-react";
import { collegesAPI } from "../../api/partners";
import { toast } from "react-hot-toast";
import Button from "../../components/Button";

const DOMAINS = [
  { value: "ARTS", label: "Arts" },
  { value: "ENGINEERING", label: "Engineering" },
  { value: "POLYTECHNIC", label: "Polytechnic" },
];

const CreateCollegeModal = ({ onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    district: "",
    location: "",
    area: "",
    tierCity: "",
    phone: "",
    placementCellEmail: "",
    officeEmail: "",
    placementCellPhone: "",
    departments: "",
    domains: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDomain = (value) => {
    setForm((prev) => ({
      ...prev,
      domains: prev.domains.includes(value) ? prev.domains.filter((d) => d !== value) : [...prev.domains, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("College name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      if (form.address) fd.append("address", form.address);
      if (form.district) fd.append("district", form.district);
      if (form.location) fd.append("location", form.location);
      if (form.area) fd.append("area", form.area);
      if (form.tierCity) fd.append("tierCity", form.tierCity);
      if (form.phone) fd.append("phone", form.phone);
      if (form.placementCellEmail) fd.append("placementCellEmail", form.placementCellEmail);
      if (form.officeEmail) fd.append("officeEmail", form.officeEmail);
      if (form.placementCellPhone) fd.append("placementCellPhone", form.placementCellPhone);
      if (form.departments.trim()) fd.append("departments", form.departments.trim());
      if (form.domains.length) fd.append("domains", form.domains.join(","));
      if (logoFile) fd.append("logo", logoFile);
      const res = await collegesAPI.create(fd);
      if (res.success && res.data?.college?.id) {
        toast.success("College created");
        onSuccess?.();
        onClose();
      } else throw new Error(res.error);
    } catch (err) {
      toast.error(err.message || "Failed to create college");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-brintelli-card border border-brintelli-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brintelli-border">
          <h2 className="text-lg font-semibold text-text">Add college</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-brintelli-border text-textMuted hover:text-text" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">College name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Logo (image file)</label>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-sm text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">District</label>
                <input type="text" name="district" value={form.district} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Location</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Area</label>
                <input type="text" name="area" value={form.area} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Tier city</label>
                <input type="text" name="tierCity" value={form.tierCity} onChange={handleChange} placeholder="e.g. Tier 1" className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Domains</label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <label key={d.value} className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.domains.includes(d.value)} onChange={() => toggleDomain(d.value)} className="rounded border-brintelli-border text-brand-500" />
                    <span className="text-sm text-text">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Departments (comma-separated)</label>
              <input type="text" name="departments" value={form.departments} onChange={handleChange} placeholder="CSE, ECE, Mechanical" className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Placement cell email</label>
              <input type="email" name="placementCellEmail" value={form.placementCellEmail} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Office email</label>
              <input type="email" name="officeEmail" value={form.officeEmail} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Placement cell number</label>
              <input type="text" name="placementCellPhone" value={form.placementCellPhone} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-brintelli-border bg-brintelli-baseAlt/50">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving..." : "Save college"}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCollegeModal;
