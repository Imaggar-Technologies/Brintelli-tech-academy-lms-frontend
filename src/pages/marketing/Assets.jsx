import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, Download, GraduationCap, FileSpreadsheet, Award, Users, UserCheck, History, ChevronDown, X, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import marketingAPI from '../../api/marketing';

const TAB_HIGH_VALUE = 'high-value';
const TAB_LEADS = 'leads';

const HIGH_VALUE_CSV_HEADER = 'Category,Name,Contact,Email,Institution';
const HIGH_VALUE_CATEGORIES = 'HOD, DEAN, PRINCIPAL, STAFF, ADMIN_OFFICER, PROFESSOR';

const STUDENT_LEADS_CSV_HEADER = 'Name,Clg name,Department,Year of pass out,Contact,Email id,Resume (drive link)';

function downloadCsv(filename, header, exampleRow = '') {
  const content = exampleRow ? `${header}\n${exampleRow}` : header;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatDateTime(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

const Assets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TAB_HIGH_VALUE);
  const [highValueFile, setHighValueFile] = useState(null);
  const [highValueUploading, setHighValueUploading] = useState(false);
  const [highValueResult, setHighValueResult] = useState(null);
  const [highValueList, setHighValueList] = useState([]);
  const [highValueLoading, setHighValueLoading] = useState(false);
  const [leadsFile, setLeadsFile] = useState(null);
  const [leadsUploading, setLeadsUploading] = useState(false);
  const [leadsResult, setLeadsResult] = useState(null);
  const [leadsList, setLeadsList] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const highValueInputRef = useRef(null);
  const leadsInputRef = useRef(null);

  const fetchUploadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await marketingAPI.getUploadHistory({ limit: 100 });
      setUploadHistory(res?.data?.list ?? []);
    } catch {
      setUploadHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const lastUpload = uploadHistory[0] || null;

  const fetchHighValueList = async () => {
    setHighValueLoading(true);
    try {
      const res = await marketingAPI.getHighValueList();
      setHighValueList(res?.data?.list ?? []);
    } catch {
      setHighValueList([]);
    } finally {
      setHighValueLoading(false);
    }
  };

  const fetchLeadsList = async () => {
    setLeadsLoading(true);
    try {
      const res = await marketingAPI.getLeadsList();
      setLeadsList(res?.data?.list ?? []);
    } catch {
      setLeadsList([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === TAB_HIGH_VALUE) fetchHighValueList();
    else fetchLeadsList();
  }, [activeTab]);

  const handleDownloadHighValueTemplate = () => {
    downloadCsv(
      'high_value_individuals_template.csv',
      HIGH_VALUE_CSV_HEADER,
      'PROFESSOR,Dr. John Doe,9876543210,john@college.edu,ABC Engineering College'
    );
    toast.success('Template downloaded. Open in Excel, fill in data, and save as .xlsx or .xls');
  };

  const handleDownloadLeadsTemplate = () => {
    downloadCsv(
      'student_leads_template.csv',
      STUDENT_LEADS_CSV_HEADER,
      'Rahul Kumar,XYZ College,CSE,2025,9876543210,rahul@email.com,https://drive.google.com/...'
    );
    toast.success('Template downloaded. Open in Excel, fill in data, and save as .xlsx or .xls');
  };

  const handleHighValueUpload = async () => {
    if (!highValueFile) {
      toast.error('Select an Excel file first');
      return;
    }
    setHighValueUploading(true);
    setHighValueResult(null);
    try {
      const res = await marketingAPI.uploadHighValueContacts(highValueFile);
      const data = res?.data || res;
      setHighValueResult(data);
      const newCount = data?.newLeadsAdded ?? data?.count ?? 0;
      const dupCount = data?.duplicatesSkipped ?? 0;
      toast.success(data?.message || `${newCount} new lead(s) added, ${dupCount} duplicate(s) skipped. You earned ${data?.pointsAwarded ?? 0} points.`);
      setHighValueFile(null);
      if (highValueInputRef.current) highValueInputRef.current.value = '';
      await Promise.all([fetchHighValueList(), fetchUploadHistory()]);
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setHighValueUploading(false);
    }
  };

  const handleLeadsUpload = async () => {
    if (!leadsFile) {
      toast.error('Select an Excel file first');
      return;
    }
    setLeadsUploading(true);
    setLeadsResult(null);
    try {
      const res = await marketingAPI.uploadStudentLeads(leadsFile);
      const data = res?.data || res;
      setLeadsResult(data);
      const newCount = data?.newLeadsAdded ?? data?.count ?? 0;
      const dupCount = data?.duplicatesSkipped ?? 0;
      toast.success(data?.message || `${newCount} new lead(s) added, ${dupCount} duplicate(s) skipped.`);
      setLeadsFile(null);
      if (leadsInputRef.current) leadsInputRef.current.value = '';
      await Promise.all([fetchLeadsList(), fetchUploadHistory()]);
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setLeadsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Asset Library"
        description="Upload High Value Individual contacts and Student / Leads database via Excel. All uploads are added as leads; duplicates are skipped. Each new high-value contact earns you points."
      />

      {/* Top bar: upload stats + history */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brintelli-border bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-textMuted">
          All uploads are treated as <strong className="text-text">leads</strong>. Duplicates (same contact/email) are not added again.
        </p>
        <div className="flex items-center gap-3">
          {lastUpload && (
            <span className="text-sm text-text">
              Last upload: <strong className="text-green-600">{lastUpload.newLeadsAdded}</strong> new, <strong className="text-amber-600">{lastUpload.duplicatesSkipped}</strong> duplicates
            </span>
          )}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryOpen((o) => !o)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Upload history
              <ChevronDown className={`h-4 w-4 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
            </Button>
            {historyOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setHistoryOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-[420px] max-h-[70vh] overflow-hidden rounded-xl border border-brintelli-border bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-brintelli-border px-4 py-3 bg-brintelli-baseAlt/40">
                    <h3 className="font-semibold text-text">Upload history</h3>
                    <button type="button" onClick={() => setHistoryOpen(false)} className="p-1 rounded hover:bg-brintelli-border text-textMuted" aria-label="Close">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-[60vh]">
                    {historyLoading ? (
                      <div className="py-8 text-center text-sm text-textMuted">Loading…</div>
                    ) : uploadHistory.length === 0 ? (
                      <div className="py-8 text-center text-sm text-textMuted">No uploads yet.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-brintelli-baseAlt/60 sticky top-0">
                          <tr>
                            <th className="text-left py-2 px-3 font-semibold text-text">Date</th>
                            <th className="text-left py-2 px-3 font-semibold text-text">Type</th>
                            <th className="text-left py-2 px-3 font-semibold text-text">New</th>
                            <th className="text-left py-2 px-3 font-semibold text-text">Duplicates</th>
                            <th className="text-left py-2 px-3 font-semibold text-text">Missing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brintelli-border">
                          {uploadHistory.map((h) => (
                            <tr key={h.id} className="hover:bg-brintelli-baseAlt/30">
                              <td className="py-2 px-3 text-textMuted whitespace-nowrap">{formatDateTime(h.createdAt)}</td>
                              <td className="py-2 px-3 text-text">{h.type === 'high_value' ? 'High value' : 'Leads'}</td>
                              <td className="py-2 px-3 text-green-600 font-medium">{h.newLeadsAdded ?? 0}</td>
                              <td className="py-2 px-3 text-amber-600 font-medium">{h.duplicatesSkipped ?? 0}</td>
                              <td className="py-2 px-3 text-rose-600 font-medium">{h.invalidCount ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: High Value Individuals and Leads */}
      <div className="flex border-b border-brintelli-border bg-white rounded-t-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab(TAB_HIGH_VALUE)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${
            activeTab === TAB_HIGH_VALUE
              ? 'bg-brand-500 text-white border-b-2 border-brand-600'
              : 'bg-brintelli-baseAlt/50 text-textMuted hover:bg-brintelli-baseAlt hover:text-text'
          }`}
        >
          <UserCheck className="h-5 w-5" />
          High Value Individuals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TAB_LEADS)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-colors ${
            activeTab === TAB_LEADS
              ? 'bg-brand-500 text-white border-b-2 border-brand-600'
              : 'bg-brintelli-baseAlt/50 text-textMuted hover:bg-brintelli-baseAlt hover:text-text'
          }`}
        >
          <Users className="h-5 w-5" />
          Leads
        </button>
      </div>

      {/* Content for active tab */}
      <div className="rounded-b-2xl border border-t-0 border-brintelli-border bg-white shadow-card overflow-hidden">
        {activeTab === TAB_HIGH_VALUE && (
          <>
            {/* High Value: upload card */}
            <div className="p-6 border-b border-brintelli-border">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-text">High Value Individuals</h2>
                  <p className="mt-1 text-sm text-textMuted">
                    Upload contact numbers for HOD, Dean, Principal, Staff, Admin Officer, and Professors. Each valid row you add earns you points.
                  </p>
                  <p className="mt-1 text-xs text-textSoft">
                    Categories: {HIGH_VALUE_CATEGORIES}. Excel columns: <strong>Category</strong>, <strong>Name</strong>, <strong>Contact</strong>, Email (optional), Institution (optional).
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={handleDownloadHighValueTemplate} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download template
                    </Button>
                    <input
                      ref={highValueInputRef}
                      type="file"
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      className="hidden"
                      onChange={(e) => setHighValueFile(e.target.files?.[0] || null)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => highValueInputRef.current?.click()} className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      {highValueFile ? highValueFile.name : 'Choose Excel file'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleHighValueUpload}
                      disabled={!highValueFile || highValueUploading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {highValueUploading ? 'Uploading…' : 'Upload'}
                    </Button>
                  </div>
                  {highValueResult && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      <strong>Done:</strong> {highValueResult.totalRows ?? highValueResult.count} row(s) — <strong>{highValueResult.newLeadsAdded ?? highValueResult.count}</strong> new lead(s) added, <strong>{highValueResult.duplicatesSkipped ?? 0}</strong> duplicate(s) skipped. You earned <strong>{highValueResult.pointsAwarded ?? 0} points</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* High Value: table */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text mb-3">All High Value Individuals</h3>
              {highValueLoading ? (
                <div className="py-8 text-center text-textMuted text-sm">Loading…</div>
              ) : highValueList.length === 0 ? (
                <div className="py-8 text-center text-textMuted text-sm">No contacts yet. Upload an Excel file above to add high-value individuals.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-brintelli-border">
                  <table className="w-full text-sm">
                    <thead className="bg-brintelli-baseAlt/60">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-text">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Institution</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brintelli-border">
                      {highValueList.map((row) => (
                        <tr key={row.id} className="hover:bg-brintelli-baseAlt/30">
                          <td className="py-2 px-4 text-text">{row.category || '—'}</td>
                          <td className="py-2 px-4 font-medium text-text">{row.name || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.contact || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.email || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.institution || '—'}</td>
                          <td className="py-2 px-4 text-textMuted">{formatDate(row.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === TAB_LEADS && (
          <>
            {/* Leads: upload card */}
            <div className="p-6 border-b border-brintelli-border">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-text">Student / Leads Database</h2>
                  <p className="mt-1 text-sm text-textMuted">
                    Upload your student or leads list. All entries are stored in the database for campaigns and outreach.
                  </p>
                  <p className="mt-1 text-xs text-textSoft">
                    Excel columns: <strong>Name</strong>, <strong>Clg name</strong>, <strong>Department</strong>, <strong>Year of pass out</strong>, <strong>Contact</strong>, <strong>Email id</strong>, <strong>Resume (drive link)</strong>.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={handleDownloadLeadsTemplate} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download template
                    </Button>
                    <input
                      ref={leadsInputRef}
                      type="file"
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                      className="hidden"
                      onChange={(e) => setLeadsFile(e.target.files?.[0] || null)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => leadsInputRef.current?.click()} className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      {leadsFile ? leadsFile.name : 'Choose Excel file'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLeadsUpload}
                      disabled={!leadsFile || leadsUploading}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {leadsUploading ? 'Uploading…' : 'Upload'}
                    </Button>
                  </div>
                  {leadsResult && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      <strong>Done:</strong> {leadsResult.totalRows ?? leadsResult.count} row(s) — <strong>{leadsResult.newLeadsAdded ?? leadsResult.count}</strong> new lead(s) added, <strong>{leadsResult.duplicatesSkipped ?? 0}</strong> duplicate(s) skipped, <strong>{leadsResult.invalidCount ?? 0}</strong> missing data.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Leads: upload history cards (rows) */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text mb-3">All Leads</h3>
              {historyLoading ? (
                <div className="py-8 text-center text-textMuted text-sm">Loading…</div>
              ) : (() => {
                const leadsHistory = uploadHistory.filter((h) => h.type === 'student_leads');
                if (leadsHistory.length === 0) {
                  return (
                    <div className="py-8 text-center text-textMuted text-sm">
                      No leads yet. Upload an Excel file above to add student/leads data.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {leadsHistory.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => navigate(`/marketing/assets/upload/${h.id}`)}
                        className="w-full flex items-center justify-between gap-4 rounded-xl border border-brintelli-border bg-white px-4 py-3 text-left shadow-sm hover:border-brand-400 hover:bg-brintelli-baseAlt/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-4 min-w-0">
                          <span className="text-sm font-medium text-text shrink-0">
                            {formatDateTime(h.createdAt)}
                          </span>
                          {h.fileName && (
                            <span className="text-sm text-textMuted truncate max-w-[200px]" title={h.fileName}>
                              {h.fileName}
                            </span>
                          )}
                          <span className="text-sm text-green-600 font-medium">{h.newLeadsAdded ?? 0} new</span>
                          <span className="text-sm text-amber-600 font-medium">{h.duplicatesSkipped ?? 0} duplicates</span>
                          <span className="text-sm text-rose-600 font-medium">{h.invalidCount ?? 0} missing data</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-textMuted shrink-0" />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Assets;
