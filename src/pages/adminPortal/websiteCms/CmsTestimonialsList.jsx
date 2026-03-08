import React, { useState, useEffect } from "react";
import { getEntity, postEntity, putEntity, deleteEntity } from "../../../api/cms";

const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";
const empty = { Title: "", Des: "", Name: "", sub: "", country: "", tImg: "", order: 0 };

export default function CmsTestimonialsList() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getEntity("testimonials");
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
      if (editing) await putEntity("testimonials", editing.id, payload);
      else await postEntity("testimonials", payload);
      setEditing(null);
      setForm({ ...empty });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      await deleteEntity("testimonials", item.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Testimonials</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Quote</th>
              <th className="pb-2 text-left font-medium">Name</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-brintelli-border">
                <td className="py-2">{(row.Title || row.quote || "").slice(0, 50)}…</td>
                <td className="py-2">{row.Name || row.name}</td>
                <td className="py-2">
                  <button type="button" className={btnSec} onClick={() => { setEditing(row); setForm({ ...row, Title: row.Title || row.quote, Des: row.Des || row.text }); }}>Edit</button>{" "}
                  <button type="button" className={btnSec} onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={card}>
        <h3 className="mb-4 text-lg font-medium">{editing ? "Edit" : "Add"} Testimonial</h3>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Quote (Title)</label>
            <input className={input} value={form.Title} onChange={(e) => setForm((f) => ({ ...f, Title: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Full text (Des)</label>
            <textarea className={input} value={form.Des} onChange={(e) => setForm((f) => ({ ...f, Des: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input className={input} value={form.Name} onChange={(e) => setForm((f) => ({ ...f, Name: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Role (sub)</label>
              <input className={input} value={form.sub} onChange={(e) => setForm((f) => ({ ...f, sub: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Country</label>
              <input className={input} value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Avatar URL (tImg)</label>
            <input className={input} value={form.tImg} onChange={(e) => setForm((f) => ({ ...f, tImg: e.target.value }))} placeholder="/images/..." />
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
