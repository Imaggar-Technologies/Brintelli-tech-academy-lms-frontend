import React, { useState, useEffect } from "react";
import { getSeo, postSeo, putSeo } from "../../../api/cms";

const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";

export default function CmsSeoPage() {
  const [list, setList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ path: "/", title: "", description: "", keywords: "", ogImage: "", canonicalUrl: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getSeo();
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
      const pathEnc = form.path || "/";
      const existing = list.find((s) => s.path === pathEnc);
      if (existing) await putSeo(pathEnc, form);
      else await postSeo(form);
      setForm({ path: "/", title: "", description: "", keywords: "", ogImage: "", canonicalUrl: "" });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">SEO</h1>
      <p className="text-sm text-textMuted">Per-route meta (path, title, description, keywords, og image, canonical).</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Path</th>
              <th className="pb-2 text-left font-medium">Title</th>
              <th className="pb-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.path} className="border-b border-brintelli-border">
                <td className="py-2">{row.path}</td>
                <td className="py-2">{row.title || "—"}</td>
                <td className="py-2">
                  <button type="button" className={btnSec} onClick={() => { setEditing(row.path); setForm({ ...row }); }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={card}>
        <h3 className="mb-4 text-lg font-medium">{editing ? "Edit" : "Add"} SEO</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Path</label>
              <input className={input} value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder="/ or /about" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Page title" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea className={input} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Keywords</label>
            <input className={input} value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="Comma-separated" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">OG Image URL</label>
            <input className={input} value={form.ogImage} onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Canonical URL</label>
            <input className={input} value={form.canonicalUrl} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" className={btn}>Save</button>
            {editing && <button type="button" className={btnSec} onClick={() => { setEditing(null); setForm({ path: "/", title: "", description: "", keywords: "", ogImage: "", canonicalUrl: "" }); }}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
