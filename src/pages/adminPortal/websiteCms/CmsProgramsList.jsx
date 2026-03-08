import React, { useState, useEffect } from "react";
import { getEntity, postEntity, putEntity, deleteEntity } from "../../../api/cms";

const TYPES = ["course", "crash-course", "workshop"];
const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";

export default function CmsProgramsList() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type: "course", title: "", slug: "", description: "", sImg: "", thumb1: "", thumb2: "", features: [], col: "col-lg-4", order: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getEntity("programs");
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
      const payload = { ...form, Id: form.Id || form.id || String(Date.now()) };
      if (editing) await putEntity("programs", editing.Id ?? editing.id, payload);
      else await postEntity("programs", payload);
      setEditing(null);
      setForm({ type: "course", title: "", slug: "", description: "", sImg: "", thumb1: "", thumb2: "", features: [], col: "col-lg-4", order: 0 });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this program?")) return;
    try {
      await deleteEntity("programs", item.Id ?? item.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Programs</h1>
      <p className="text-sm text-textMuted">Courses, crash courses, workshops. Type: course | crash-course | workshop.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Type</th>
              <th className="pb-2 text-left font-medium">Title</th>
              <th className="pb-2 text-left font-medium">Slug</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.Id ?? row.id} className="border-b border-brintelli-border">
                <td className="py-2">{row.type || "course"}</td>
                <td className="py-2">{row.title}</td>
                <td className="py-2">{row.slug}</td>
                <td className="py-2">
                  <button type="button" className={btnSec} onClick={() => { setEditing(row); setForm({ ...row, type: row.type || "course" }); }}>Edit</button>{" "}
                  <button type="button" className={btnSec} onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={card}>
        <h3 className="mb-4 text-lg font-medium">{editing ? "Edit" : "Add"} Program</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select className={input} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input className={input} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className={input} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
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
