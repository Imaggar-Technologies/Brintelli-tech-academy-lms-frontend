import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { apiRequest } from "../../api/apiClient";
import {
  Share2,
  Users,
  UserCheck,
  Copy,
  Check,
  Link2,
  Loader2,
} from "lucide-react";
import Button from "../../components/Button";

export default function MarketingHub() {
  const [creator, setCreator] = useState(null);
  const [creatorLoading, setCreatorLoading] = useState(true);
  const [newUsers, setNewUsers] = useState([]);
  const [newUsersLoading, setNewUsersLoading] = useState(true);
  const [referral, setReferral] = useState(null);
  const [referralLoading, setReferralLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("/api/marketing/creator");
        if (!cancelled && res?.data?.creator) setCreator(res.data.creator);
      } catch {
        if (!cancelled) setCreator(null);
      } finally {
        if (!cancelled) setCreatorLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("/api/marketing/new-users?limit=50&days=30");
        if (!cancelled && res?.data?.users) setNewUsers(res.data.users);
      } catch {
        if (!cancelled) setNewUsers([]);
      } finally {
        if (!cancelled) setNewUsersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest("/api/referrals/me");
        if (!cancelled && res) setReferral(res);
      } catch {
        if (!cancelled) setReferral(null);
      } finally {
        if (!cancelled) setReferralLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const copyLink = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <PageHeader
        title="Referral & New Users"
        description="Who created your account, recent signups, your invite link, and leads who joined via your link."
      />

      <div className="space-y-6">
        {/* Who created me */}
        <section className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
            <UserCheck className="h-5 w-5" />
            Who created this account
          </h3>
          {creatorLoading ? (
            <div className="flex items-center gap-2 text-textMuted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : creator ? (
            <div className="flex flex-wrap gap-4 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <div>
                <div className="text-xs text-textMuted">Name</div>
                <div className="font-medium text-text">{creator.fullName || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-textMuted">Email</div>
                <div className="font-medium text-text">{creator.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-textMuted">Role</div>
                <div className="font-medium text-text">{creator.role || "—"}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-textMuted">No creator record found.</p>
          )}
        </section>

        {/* Referral link */}
        <section className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
            <Link2 className="h-5 w-5" />
            Your referral / invite link
          </h3>
          {referralLoading ? (
            <div className="flex items-center gap-2 text-textMuted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : referral?.referralLink ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 font-mono text-sm text-text break-all">
                {referral.referralLink}
              </div>
              <Button
                variant="secondary"
                onClick={copyLink}
                className="shrink-0 gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-textMuted">No referral link available.</p>
          )}
        </section>

        {/* Leads / users who joined via my link */}
        <section className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
            <Share2 className="h-5 w-5" />
            Leads who joined via your link
          </h3>
          {referralLoading ? (
            <div className="flex items-center gap-2 text-textMuted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : referral?.referrals?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brintelli-border text-left text-textMuted">
                    <th className="pb-2 pr-4 font-medium">Name / Email</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Joined at</th>
                  </tr>
                </thead>
                <tbody>
                  {referral.referrals.map((r) => (
                    <tr key={r.id} className="border-b border-brintelli-border/60">
                      <td className="py-3 pr-4 text-text">
                        <div>{r.referredName || "—"}</div>
                        {r.referredEmail && (
                          <div className="text-xs text-textMuted">{r.referredEmail}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-text">{r.status || "SIGNED_UP"}</td>
                      <td className="py-3 text-textMuted">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-textMuted">No one has joined via your link yet. Share your link to invite people.</p>
          )}
        </section>

        {/* All new users */}
        <section className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
            <Users className="h-5 w-5" />
            New users (last 30 days)
          </h3>
          {newUsersLoading ? (
            <div className="flex items-center gap-2 text-textMuted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : newUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brintelli-border text-left text-textMuted">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {newUsers.map((u) => (
                    <tr key={u.id} className="border-b border-brintelli-border/60">
                      <td className="py-3 pr-4 text-text">{u.fullName || "—"}</td>
                      <td className="py-3 pr-4 text-text">{u.email || "—"}</td>
                      <td className="py-3 pr-4 text-text">{u.role || "—"}</td>
                      <td className="py-3 text-textMuted">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-textMuted">No new users in the last 30 days.</p>
          )}
        </section>
      </div>
    </>
  );
}
