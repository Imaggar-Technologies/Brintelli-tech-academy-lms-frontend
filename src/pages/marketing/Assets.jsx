import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Download, GraduationCap, FileSpreadsheet, Award, Users, UserCheck } from 'lucide-react';
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

const Assets = () => {
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
  const highValueInputRef = useRef(null);
  const leadsInputRef = useRef(null);

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
      toast.success(data?.message || `Uploaded ${data?.count ?? 0} contact(s). You earned ${data?.pointsAwarded ?? 0} points.`);
      setHighValueFile(null);
      if (highValueInputRef.current) highValueInputRef.current.value = '';
      await fetchHighValueList();
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
      toast.success(data?.message || `Uploaded ${data?.count ?? 0} lead(s).`);
      setLeadsFile(null);
      if (leadsInputRef.current) leadsInputRef.current.value = '';
      await fetchLeadsList();
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
        description="Upload High Value Individual contacts and Student / Leads database via Excel. Each high-value contact added earns you points."
      />

      {/* Secondary topbar: toggle between High Value Individuals and Leads */}
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
                      <strong>Done:</strong> {highValueResult.count} contact(s) added. You earned <strong>{highValueResult.pointsAwarded ?? 0} points</strong>.
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
                      <strong>Done:</strong> {leadsResult.count} lead(s) added to the student database.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Leads: table */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text mb-3">All Leads</h3>
              {leadsLoading ? (
                <div className="py-8 text-center text-textMuted text-sm">Loading…</div>
              ) : leadsList.length === 0 ? (
                <div className="py-8 text-center text-textMuted text-sm">No leads yet. Upload an Excel file above to add student/leads data.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-brintelli-border">
                  <table className="w-full text-sm">
                    <thead className="bg-brintelli-baseAlt/60">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-text">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Clg name</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Department</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Year of pass out</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Resume</th>
                        <th className="text-left py-3 px-4 font-semibold text-text">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brintelli-border">
                      {leadsList.map((row) => (
                        <tr key={row.id} className="hover:bg-brintelli-baseAlt/30">
                          <td className="py-2 px-4 font-medium text-text">{row.name || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.clgName || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.department || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.yearOfPassOut || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.contact || '—'}</td>
                          <td className="py-2 px-4 text-text">{row.email || '—'}</td>
                          <td className="py-2 px-4 text-text">
                            {row.resumeDriveLink ? (
                              <a href={row.resumeDriveLink} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate max-w-[120px] inline-block">
                                Link
                              </a>
                            ) : (
                              '—'
                            )}
                          </td>
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
      </div>
    </div>
  );
};

export default Assets;
