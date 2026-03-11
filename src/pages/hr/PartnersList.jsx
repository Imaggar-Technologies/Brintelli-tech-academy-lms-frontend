import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { partnersAPI, collegesAPI } from '../../api/partners';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';
import CreatePartnerModal from './CreatePartnerModal';
import CreateCollegeModal from './CreateCollegeModal';

const PAGE_SIZE = 12;

const PartnersList = ({ typeFilter: initialType }) => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(initialType || '');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCollegeModalOpen, setCreateCollegeModalOpen] = useState(false);

  useEffect(() => {
    if (typeFilter === 'COLLEGE') loadColleges();
    else loadPartners();
  }, [typeFilter, page]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (typeFilter === 'COMPANY' || typeFilter === '') params.type = 'COMPANY';
      const res = await partnersAPI.list(params);
      if (res.success && res.data?.partners) {
        setPartners(res.data.partners);
        setTotal(res.data.total ?? 0);
      } else {
        setPartners([]);
        setTotal(0);
      }
      if (typeFilter === '') {
        const colRes = await collegesAPI.list({ page: 1, limit: 500 });
        if (colRes.success && colRes.data?.colleges) setColleges(colRes.data.colleges);
        else setColleges([]);
      } else setColleges([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load partners');
      setPartners([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadColleges = async () => {
    try {
      setLoading(true);
      const res = await collegesAPI.list({ page, limit: PAGE_SIZE });
      if (res.success && res.data?.colleges) {
        setColleges(res.data.colleges);
        setTotal(res.data.total ?? 0);
      } else {
        setColleges([]);
        setTotal(0);
      }
      setPartners([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load colleges');
      setColleges([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const isCollegesTab = typeFilter === 'COLLEGE';
  const isAllTab = typeFilter === '';
  const showPartners = !isCollegesTab && partners.length > 0;
  const showColleges = (isCollegesTab && colleges.length > 0) || (isAllTab && colleges.length > 0);
  const listLength = isCollegesTab ? colleges.length : isAllTab ? partners.length + colleges.length : partners.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const openAddModal = () => {
    if (typeFilter === 'COLLEGE') setCreateCollegeModalOpen(true);
    else setCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Partner companies & colleges</h1>
        <Button variant="primary" onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add partner
        </Button>
      </div>
      {createModalOpen && (
        <CreatePartnerModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => { loadPartners(); setCreateModalOpen(false); }}
        />
      )}
      {createCollegeModalOpen && (
        <CreateCollegeModal
          onClose={() => setCreateCollegeModalOpen(false)}
          onSuccess={() => { if (isCollegesTab) loadColleges(); else loadPartners(); setCreateCollegeModalOpen(false); }}
        />
      )}

      <div className="flex gap-2">
        {['', 'COMPANY', 'COLLEGE'].map((t) => (
          <button
            key={t || 'all'}
            type="button"
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${typeFilter === t ? 'bg-brand-500 text-white' : 'bg-brintelli-card text-textMuted hover:bg-brintelli-border'}`}
          >
            {t === '' ? 'All' : t === 'COMPANY' ? 'Companies' : 'Colleges'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : listLength === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <Building2 className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">{typeFilter === 'COLLEGE' ? 'No colleges yet.' : 'No partners yet.'}</p>
          <Button variant="primary" onClick={openAddModal}>
            Add first {typeFilter === 'COLLEGE' ? 'college' : 'partner'}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {showPartners && partners.map((p) => (
              <div
                key={`p-${p.id}`}
                className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-col hover:border-brand-500/30 transition-colors cursor-pointer shadow-sm"
                onClick={() => navigate(`/hr/partners/${p.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt="" className="h-14 w-14 object-contain rounded-lg bg-white border border-brintelli-border flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-7 w-7 text-brand-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text truncate">{p.name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">COMPANY</span>
                  </div>
                </div>
                {(p.address || p.city || p.email) && (
                  <p className="text-sm text-textMuted flex items-start gap-1 mt-1 line-clamp-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {[p.address, p.city, p.state].filter(Boolean).join(', ') || p.email}
                  </p>
                )}
              </div>
            ))}
            {showColleges && colleges.map((c) => (
              <div
                key={`c-${c.id}`}
                className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-col hover:border-brand-500/30 transition-colors cursor-pointer shadow-sm"
                onClick={() => navigate(`/hr/colleges/${c.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" className="h-14 w-14 object-contain rounded-lg bg-white border border-brintelli-border flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-7 w-7 text-brand-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text truncate">{c.name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">COLLEGE</span>
                  </div>
                </div>
                {(c.placementCellEmail || c.officeEmail || c.district || c.location) && (
                  <p className="text-sm text-textMuted flex items-start gap-1 mt-1 line-clamp-2">
                    <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {[c.placementCellEmail, c.officeEmail].filter(Boolean).join(', ') || [c.district, c.location].filter(Boolean).join(', ') || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
          {(isCollegesTab || typeFilter === 'COMPANY') && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="ghost" size="sm" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={!hasPrev}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-textMuted px-2">
                Page {page} of {totalPages} ({total} total)
              </span>
              <Button variant="ghost" size="sm" onClick={() => setPage((x) => Math.min(totalPages, x + 1))} disabled={!hasNext}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PartnersList;
