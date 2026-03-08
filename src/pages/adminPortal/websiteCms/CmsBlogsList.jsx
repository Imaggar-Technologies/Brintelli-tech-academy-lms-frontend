import React, { useState, useEffect } from "react";
import { getEntity, postEntity, putEntity, deleteEntity } from "../../../api/cms";

const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";
const empty = { title: "", slug: "", description: "", author: "", authorTitle: "", create_at: "", thumb: "", screens: "", bSingle: "", img: "", blClass: "format-standard-image" };

export default function CmsBlogsList() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getEntity("blogs");
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
      if (editing) await putEntity("blogs", editing.id, payload);
      else await postEntity("blogs", payload);
      setEditing(null);
      setForm({ ...empty });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await deleteEntity("blogs", item.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Blogs</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Title</th>
              <th className="pb-2 text-left font-medium">Slug</th>
              <th className="pb-2 text-left font-medium">Date</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-brintelli-border">
                <td className="py-2">{row.title}</td>
                <td className="py-2">{row.slug}</td>
                <td className="py-2">{row.create_at}</td>
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
        <h3 className="mb-4 text-lg font-medium">{editing ? "Edit" : "Add"} Blog</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input className={input} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className={input} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Author</label>
              <input className={input} value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Date (create_at)</label>
              <input className={input} value={form.create_at} onChange={(e) => setForm((f) => ({ ...f, create_at: e.target.value }))} placeholder="18/08/2024" />
            </div>
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
