import React, { useState, useEffect, useRef } from "react";
import { getMedia, uploadFile } from "../../../api/cms";
import { API_BASE_URL } from "../../../api/constant";

const card = "rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm";
const btnSec = "rounded-xl border border-brintelli-border bg-white px-4 py-2 text-sm hover:bg-slate-50";

export default function CmsMediaList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const data = await getMedia();
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

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadFile(file);
      load();
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const urlFor = (item) => {
    if (!item.url) return "";
    if (item.url.startsWith("http")) return item.url;
    return `${API_BASE_URL.replace(/\/$/, "")}${item.url}`;
  };

  if (loading) return <div className={card}>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text">Media</h1>
      <p className="text-sm text-textMuted">Upload images. Use the returned URL in blogs, banners, gallery, etc.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className={card}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} disabled={uploading} className="text-sm" />
        {uploading && <span className="ml-2 text-sm">Uploading…</span>}
      </div>
      <div className={card}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brintelli-border">
              <th className="pb-2 text-left font-medium">Preview</th>
              <th className="pb-2 text-left font-medium">URL</th>
              <th className="pb-2 text-left font-medium">Alt</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-brintelli-border">
                <td className="py-2">
                  <img src={urlFor(row)} alt={row.alt || ""} className="max-h-16 max-w-20 object-contain" />
                </td>
                <td className="py-2">
                  <code className="text-xs">{row.url}</code>
                </td>
                <td className="py-2">{row.alt || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
