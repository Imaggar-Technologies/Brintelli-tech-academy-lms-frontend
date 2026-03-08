import React, { useState, useEffect } from "react";
import { getEntity, postEntity, putEntity, deleteEntity } from "../../../api/cms";

const FREQUENCIES = ["once", "session", "daily"];
const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";
const empty = { title: "", body: "", image: "", ctaLabel: "", ctaLink: "", frequency: "once", target: "all", active: true, startDate: "", endDate: "" };

export default function CmsPopupsList() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getEntity("popups");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, id: form.id || String(Date.now()) };
      if (editing) await putEntity("popups", editing.id, payload);
      else await postEntity("popups", payload);
      setEditing(null);
      setForm({ ...empty });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this popup?")) return;
    try {
      await deleteEntity("popups", item.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Popups (ad-like)</h1>
      <p className="text-sm text-textMuted">Frequency: once | session | daily. Optional start/end date (ISO).</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Title</th>
              <th className="pb-2 text-left font-medium">Frequency</th>
              <th className="pb-2 text-left font-medium">Active</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-brintelli-border">
                <td className="py-2">{row.title}</td>
                <td className="py-2">{row.frequency || "once"}</td>
                <td className="py-2">{row.active ? "Yes" : "No"}</td>
                <td className="py-2">
                  <button type="button" className={btnSec} onClick={() => { setEditing(row); setForm({ ...row }); }}>Edit</button>{" "}
                  <button type="button" className={btnSec} onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={card}>
        <h3 className="mb-4 text-lg font-medium">{editing ? "Edit" : "Add"} Popup</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Frequency</label>
              <select className={input} value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}>
                {FREQUENCIES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Body</label>
            <textarea className={input} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={2} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Image URL</label>
            <input className={input} value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btn}>Save</button>
            {editing && <button type="button" className={btnSec} onClick={() => setEditing(null)}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
