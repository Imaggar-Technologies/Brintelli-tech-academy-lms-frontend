import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { partnersAPI } from '../../api/partners';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';
import CreatePartnerModal from './CreatePartnerModal';

const PAGE_SIZE = 12;

const PartnersList = ({ typeFilter: initialType }) => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(initialType || '');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadPartners();
  }, [typeFilter, page]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (typeFilter) params.type = typeFilter;
      const res = await partnersAPI.list(params);
      if (res.success && res.data?.partners) {
        setPartners(res.data.partners);
        setTotal(res.data.total ?? 0);
      } else setPartners([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory' }]} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Partner companies & colleges</h1>
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
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
      ) : partners.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <Building2 className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">No partners yet.</p>
          <Button variant="primary" onClick={() => navigate('/hr/partners/create')}>
            Add first partner
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partners.map((p) => (
              <div
                key={p.id}
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
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">{p.type}</span>
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
          </div>
          {totalPages > 1 && (
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
