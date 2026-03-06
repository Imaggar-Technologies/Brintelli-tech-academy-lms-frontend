import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus, Copy, Ticket, Gift, Sparkles } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import referralAPI from '../../api/referral';
import couponAPI from '../../api/coupon';
import studentAPI from '../../api/student';

const StudentInviteFriend = () => {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [totalReferralPoints, setTotalReferralPoints] = useState(0);
  const [myWelcomeCouponCode, setMyWelcomeCouponCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponAmount, setCouponAmount] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  useEffect(() => {
    fetchReferral();
    fetchVouchers();
  }, []);

  const fetchReferral = async () => {
    try {
      setLoading(true);
      const res = await referralAPI.getMyReferral();
      if (res?.success) {
        setCode(res.code || '');
        setReferralLink(res.referralLink || '');
        setReferrals(Array.isArray(res.referrals) ? res.referrals : []);
        setTotalReferralPoints(res.totalReferralPoints ?? 0);
        setMyWelcomeCouponCode(res.myWelcomeCouponCode || '');
      }
    } catch (err) {
      console.error('Referral fetch error', err);
      toast.error(err?.message || 'Failed to load referral info');
    } finally {
      setLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      setVouchersLoading(true);
      const res = await studentAPI.getMyVouchers();
      if (res?.success && Array.isArray(res.data?.vouchers)) {
        setVouchers(res.data.vouchers);
      }
    } catch (err) {
      console.error('Vouchers fetch error', err);
    } finally {
      setVouchersLoading(false);
    }
  };

  const copyToClipboard = (text, label = 'Link') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error('Could not copy')
    );
  };

  const handleValidateCoupon = async () => {
    const c = (couponCode || '').trim();
    if (!c) {
      toast.error('Enter a coupon code');
      return;
    }
    try {
      setValidatingCoupon(true);
      setCouponResult(null);
      const amount = couponAmount ? Number(couponAmount) : 0;
      const res = await couponAPI.validateCoupon(c, amount);
      if (res?.success && res?.valid) {
        setCouponResult({
          valid: true,
          message: `Valid! Discount: ${res.discount ?? 0}`,
          discount: res.discount,
          finalAmount: res.finalAmount,
        });
        toast.success('Coupon is valid');
      } else {
        setCouponResult({ valid: false, message: res?.message || 'Invalid or expired coupon' });
        toast.error(res?.message || 'Invalid coupon');
      }
    } catch (err) {
      setCouponResult({ valid: false, message: err?.message || 'Validation failed' });
      toast.error(err?.message || 'Could not validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const statusLabel = (status) => {
    if (status === 'SIGNED_UP') return 'Signed up';
    if (status === 'CONVERTED') return 'Converted';
    return status || 'Pending';
  };

  return (
    <>
      <PageHeader
        title="Invite your friend"
        description="Share your referral link and get rewarded. You can also check coupon codes and vouchers here."
      />

      {totalReferralPoints > 0 && (
        <div className="mb-6 rounded-2xl border border-brand-200/60 bg-gradient-to-r from-brand-50 to-brand-100/50 p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Your referral points</h3>
            <p className="text-sm text-textMuted">You earn 100 points for each friend who joins using your link. Keep sharing!</p>
          </div>
          <div className="ml-auto text-3xl font-bold text-brand-600">{totalReferralPoints}</div>
        </div>
      )}

      {myWelcomeCouponCode && (
        <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Ticket className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text">Your 10% welcome voucher</h3>
            <p className="text-sm text-textMuted">You joined using a friend&apos;s link. Use this code at checkout for 10% off.</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white border border-amber-200 px-3 py-2 font-mono font-bold text-amber-800">
              {myWelcomeCouponCode}
            </code>
            <Button variant="secondary" size="sm" onClick={() => copyToClipboard(myWelcomeCouponCode, 'Voucher code')}>
              Copy
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Referral */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
          <div className="border-b border-brintelli-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text">Your referral link</h3>
              <p className="text-sm text-textSoft">Share this link; when friends sign up, they’ll be linked to you.</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="animate-pulse h-10 bg-brintelli-baseAlt rounded-lg" />
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 rounded-lg border border-brintelli-border bg-brintelli-base px-3 py-2 text-sm text-text"
                  />
                  <Button
                    variant="secondary"
                    className="shrink-0 gap-1"
                    onClick={() => copyToClipboard(referralLink, 'Link')}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                {code && (
                  <div className="flex items-center gap-2 text-sm text-textSoft">
                    <span>Your code:</span>
                    <code className="rounded bg-brintelli-baseAlt px-2 py-1 font-mono">{code}</code>
                    <button
                      type="button"
                      className="text-primary-600 hover:underline"
                      onClick={() => copyToClipboard(code, 'Code')}
                    >
                      Copy code
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="border-t border-brintelli-border p-4">
            <h4 className="text-sm font-medium text-text mb-2">People you referred</h4>
            {referrals.length === 0 ? (
              <p className="text-sm text-textMuted">No referrals yet. Share your link to get started.</p>
            ) : (
              <ul className="divide-y divide-brintelli-border">
                {referrals.map((r) => (
                  <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-text">{r.referredName}</span>
                      {r.referredEmail && (
                        <span className="text-textMuted ml-2">({r.referredEmail})</span>
                      )}
                    </div>
                    <span className="rounded-full bg-brintelli-baseAlt px-2 py-0.5 text-xs text-textSoft">
                      {statusLabel(r.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Coupons */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
          <div className="border-b border-brintelli-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text">Coupons</h3>
              <p className="text-sm text-textSoft">Check if a coupon code is valid. Use it at checkout when you pay.</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-lg border border-brintelli-border bg-brintelli-base px-3 py-2 text-sm text-text placeholder:text-textMuted"
              />
              <input
                type="number"
                placeholder="Amount (optional)"
                value={couponAmount}
                onChange={(e) => setCouponAmount(e.target.value)}
                min={0}
                step={0.01}
                className="w-28 rounded-lg border border-brintelli-border bg-brintelli-base px-3 py-2 text-sm text-text"
              />
              <Button
                variant="primary"
                className="shrink-0"
                onClick={handleValidateCoupon}
                disabled={validatingCoupon}
              >
                {validatingCoupon ? 'Checking…' : 'Validate'}
              </Button>
            </div>
            {couponResult && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  couponResult.valid
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {couponResult.valid ? (
                  <div>
                    <p className="font-medium">{couponResult.message}</p>
                    {couponResult.finalAmount != null && (
                      <p className="mt-1">Final amount: {couponResult.finalAmount}</p>
                    )}
                  </div>
                ) : (
                  <p>{couponResult.message}</p>
                )}
              </div>
            )}
            <p className="text-xs text-textMuted">
              Have a coupon? Validate it above. When you pay for a program or workshop, enter the same code at checkout to get the discount.
            </p>
          </div>
        </div>
      </div>

      {/* My Vouchers (sent by tutor/admin/Brintelli); expired listed first */}
      <div className="mt-6 rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">My vouchers</h3>
            <p className="text-sm text-textSoft">Vouchers sent to you by tutors, admins, or Brintelli. Expired vouchers are listed first.</p>
          </div>
        </div>
        <div className="p-4">
          {vouchersLoading ? (
            <div className="animate-pulse h-20 bg-brintelli-baseAlt rounded-lg" />
          ) : vouchers.length === 0 ? (
            <p className="text-sm text-textMuted">No vouchers sent to you yet.</p>
          ) : (
            <ul className="space-y-3">
              {vouchers.map((v) => (
                <li
                  key={v.id}
                  className={`rounded-lg border p-3 flex flex-wrap items-center justify-between gap-2 ${
                    v.isExpired ? 'border-amber-200 bg-amber-50/50' : 'border-brintelli-border bg-brintelli-baseAlt/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <code className="font-mono font-semibold text-text bg-white px-2 py-1 rounded border border-brintelli-border">
                      {v.code}
                    </code>
                    {v.workshopTitle && (
                      <span className="text-sm text-textMuted">{v.workshopTitle}</span>
                    )}
                    {v.description && (
                      <span className="text-sm text-textSoft">{v.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {v.expiresAt && (
                      <span className={`text-xs ${v.isExpired ? 'text-amber-700 font-medium' : 'text-textMuted'}`}>
                        {v.isExpired ? 'Expired' : 'Expires'}: {formatExpiry(v.expiresAt)}
                      </span>
                    )}
                    {v.isExpired && (
                      <span className="rounded-full bg-amber-200 text-amber-800 px-2 py-0.5 text-xs font-medium">
                        Expired
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentInviteFriend;
