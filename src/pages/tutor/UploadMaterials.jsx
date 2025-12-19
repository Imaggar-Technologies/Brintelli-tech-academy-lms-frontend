import { CloudUpload, FileText, Link2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const TutorUploadMaterials = () => {
  return (
    <>
      <PageHeader
        title="Upload Course Materials"
        description="Share decks, assignments, and reference documents. Students will get notified instantly."
        actions={
          <Button variant="secondary" className="gap-2">
            View Shared Library
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Upload Center</h3>
          <p className="mt-1 text-sm text-textMuted">Drag & drop files or paste external resource links.</p>
          <div className="mt-6 flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 text-center text-textMuted">
            <CloudUpload className="h-10 w-10 text-brand-500" />
            <p className="text-sm font-semibold text-brand-600">Drop files here or browse</p>
            <p className="text-xs text-textMuted">PDF, PPT, ZIP up to 200 MB</p>
            <Button className="px-5">
              Select Files
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-text">Attach link</label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-textMuted" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-11 py-2.5 text-sm text-textSoft outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
                  />
                </div>
                <Button variant="secondary" className="gap-2 px-4">
                  Attach
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Add description</label>
              <textarea
                rows={3}
                placeholder="Context, instructions or preparation notes..."
                className="mt-2 w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm text-textSoft outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-textMuted">
              <input type="checkbox" id="notify" className="h-4 w-4 rounded border-brintelli-border text-brand-500 focus:ring-brand-400" />
              <label htmlFor="notify">Notify students instantly</label>
            </div>
            <Button className="gap-2 px-5">
              Publish Materials
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Recent Uploads</h3>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              {[
                { title: "Week 4 Deck.pdf", time: "Uploaded 2h ago", size: "12 MB" },
                { title: "Assignment Brief.docx", time: "Uploaded yesterday", size: "1.8 MB" },
                { title: "Case Study.zip", time: "Uploaded 3 days ago", size: "45 MB" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-2xl bg-brintelli-baseAlt px-4 py-3">
                  <div>
                    <p className="font-semibold text-text">{item.title}</p>
                    <p className="text-xs text-textMuted">{item.time}</p>
                  </div>
                  <span className="text-xs font-semibold text-textMuted">{item.size}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Sharing Tips</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-textSoft">
              <li>Use descriptive names for quick discovery by students.</li>
              <li>Bundle code samples and documentation in structured folders.</li>
              <li>Tag materials in Discord post for cross-channel visibility.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorUploadMaterials;

