import React, { useState, useEffect } from "react";
import { getGallery, putGallery } from "../../../api/cms";

const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const input = "w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm";
const btn = "rounded-xl border border-brand bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";

export default function CmsGalleryEdit() {
  const [data, setData] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await getGallery();
      setData(res && res.sections ? res : { sections: [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addSection = () => {
    setData((d) => ({ ...d, sections: [...(d.sections || []), { id: String(Date.now()), name: "New section", images: [] }] }));
  };

  const updateSection = (idx, upd) => {
    setData((d) => {
      const s = [...(d.sections || [])];
      s[idx] = { ...s[idx], ...upd };
      return { ...d, sections: s };
    });
  };

  const updateSectionImages = (idx, imagesStr) => {
    const images = imagesStr.split("\n").map((s) => s.trim()).filter(Boolean);
    updateSection(idx, { images });
  };

  const removeSection = (idx) => {
    if (!window.confirm("Remove this section?")) return;
    setData((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    setError("");
    try {
      await putGallery(data);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Gallery</h1>
      <p className="text-sm text-textMuted">Sections with name and image URLs (one per line).</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data.sections.map((sec, idx) => (
        <div key={sec.id || idx} className={card}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium">Section name</label>
              <input className={input} value={sec.name || ""} onChange={(e) => updateSection(idx, { name: e.target.value })} placeholder="Events or Achievements" />
            </div>
            <button type="button" className={btnSec} onClick={() => removeSection(idx)}>Remove section</button>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Image URLs (one per line)</label>
            <textarea className={input} value={(sec.images || []).join("\n")} onChange={(e) => updateSectionImages(idx, e.target.value)} rows={6} />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className={btnSec} onClick={addSection}>Add section</button>
        <button type="button" className={btn} onClick={save}>Save all</button>
      </div>
    </div>
  );
}
