import { useState } from "react";
import { Wallet, DollarSign, CheckCircle2, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const FinancialProcessing = () => {
  const [financials, setFinancials] = useState([]);

  return (
    <>
      <PageHeader
        title="Financial Processing"
        description="Manage financial clearance and payment processing for leads."
        actions={
          <Button className="gap-2">
            <Wallet className="h-4 w-4" />
            Process Payment
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Wallet} 
          value={0} 
          label="Pending Clearance" 
          trend="Awaiting processing" 
        />
        <StatsCard icon={CheckCircle2} value={0} label="Cleared" trend="Approved" />
        <StatsCard icon={Clock} value={0} label="In Review" trend="Under review" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-8">
        <div className="text-center text-textMuted">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-textMuted" />
          <p className="text-lg font-semibold mb-2">Financial Processing</p>
          <p className="text-sm">Handle payment processing and financial clearance for leads.</p>
        </div>
      </div>
    </>
  );
};

export default FinancialProcessing;

