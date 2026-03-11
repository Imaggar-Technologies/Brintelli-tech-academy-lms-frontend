import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UsersRound, Mail, Phone, Building2 } from "lucide-react";
import { partnersAPI } from "../../api/partners";
import { toast } from "react-hot-toast";
import Breadcrumb from "../../components/Breadcrumb";

const HrContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await partnersAPI.list({ limit: 500 });
      if (!res.success || !res.data?.partners) {
        setContacts([]);
        return;
      }
      const list = [];
      res.data.partners.forEach((p) => {
        const hasContactPerson = p.contactPersonName || p.contactPersonEmail || p.contactPersonPhone;
        if (hasContactPerson) {
          list.push({
            id: `${p.id}-cp`,
            partnerId: p.id,
            partnerName: p.name,
            partnerType: p.type,
            name: p.contactPersonName || "—",
            email: p.contactPersonEmail || p.email || null,
            phone: p.contactPersonPhone || p.phone || null,
          });
        } else if (p.email || p.phone) {
          list.push({
            id: p.id,
            partnerId: p.id,
            partnerName: p.name,
            partnerType: p.type,
            name: p.name,
            email: p.email || null,
            phone: p.phone || null,
          });
        }
      });
      setContacts(list);
    } catch (e) {
      toast.error(e.message || "Failed to load contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "HR", path: "/hr/dashboard" }, { label: "HR Contacts" }]} />
      <div>
        <h1 className="text-2xl font-bold text-text">HR Contacts</h1>
        <p className="text-textMuted mt-1 text-sm">
          Contact persons and main contacts from partner companies and colleges.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <UsersRound className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No contacts yet.</p>
          <p className="text-sm text-textMuted mt-1">
            Add contact persons in Partner Directory to see them here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/hr/partners")}
            className="mt-4 text-brand-500 hover:underline font-medium"
          >
            Go to Partner Directory
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brintelli-border bg-brintelli-baseAlt/50">
                  <th className="px-4 py-3 text-sm font-medium text-text">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-text">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-text">Phone</th>
                  <th className="px-4 py-3 text-sm font-medium text-text">Partner</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-brintelli-border last:border-0 hover:bg-brintelli-baseAlt/30"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-text">{c.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="text-brand-500 hover:underline inline-flex items-center gap-1"
                        >
                          <Mail className="h-4 w-4" />
                          {c.email}
                        </a>
                      ) : (
                        <span className="text-textMuted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.phone ? (
                        <span className="inline-flex items-center gap-1 text-text">
                          <Phone className="h-4 w-4" />
                          {c.phone}
                        </span>
                      ) : (
                        <span className="text-textMuted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/hr/partners/${c.partnerId}`)}
                        className="inline-flex items-center gap-1 text-brand-500 hover:underline"
                      >
                        <Building2 className="h-4 w-4" />
                        {c.partnerName}
                        <span className="text-xs text-textMuted">({c.partnerType})</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrContacts;
