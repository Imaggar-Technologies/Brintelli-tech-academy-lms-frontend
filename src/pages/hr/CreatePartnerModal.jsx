import { useState } from "react";
import { X } from "lucide-react";
import { partnersAPI } from "../../api/partners";
import { toast } from "react-hot-toast";
import Button from "../../components/Button";

const CreatePartnerModal = ({ onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [form, setForm] = useState({
    type: "COMPANY",
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    phone: "",
    email: "",
    website: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k] ?? ""));
      if (logoFile) fd.append("logo", logoFile);
      const res = await partnersAPI.create(fd);
      if (res.success && res.data?.partner?.id) {
        toast.success("Partner created");
        onSuccess?.();
        onClose();
      } else throw new Error(res.error);
    } catch (err) {
      toast.error(err.message || "Failed to create partner");
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
          <h2 className="text-lg font-semibold text-text">Add partner company or college</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brintelli-border text-textMuted hover:text-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text">
                <option value="COMPANY">Company</option>
                <option value="COLLEGE">College</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name *</label>
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
                <label className="block text-sm font-medium text-text mb-1">City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">State</label>
                <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Country</label>
                <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Pin code</label>
                <input type="text" name="pinCode" value={form.pinCode} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Website</label>
              <input type="url" name="website" value={form.website} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
            <div className="border-t border-brintelli-border pt-4">
              <p className="text-sm font-medium text-text mb-2">Contact person</p>
              <div className="space-y-3">
                <input type="text" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} placeholder="Name" className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
                <input type="email" name="contactPersonEmail" value={form.contactPersonEmail} onChange={handleChange} placeholder="Email" className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
                <input type="text" name="contactPersonPhone" value={form.contactPersonPhone} onChange={handleChange} placeholder="Phone" className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-brintelli-border bg-brintelli-baseAlt/50">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save partner"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartnerModal;
