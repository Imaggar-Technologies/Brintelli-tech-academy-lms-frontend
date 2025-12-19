import { useState } from "react";
import { UserCog, Users, CheckCircle2, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const LSMAllocation = () => {
  const [allocations, setAllocations] = useState([]);

  return (
    <>
      <PageHeader
        title="LSM Allocation"
        description="Allocate students to Learning Success Managers after onboarding."
        actions={
          <Button className="gap-2">
            <UserCog className="h-4 w-4" />
            Allocate Student
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Users} 
          value={0} 
          label="Total Allocated" 
          trend="All students" 
        />
        <StatsCard icon={CheckCircle2} value={0} label="Completed" trend="Onboarded" />
        <StatsCard icon={Clock} value={0} label="Pending" trend="Awaiting allocation" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-8">
        <div className="text-center text-textMuted">
          <UserCog className="h-12 w-12 mx-auto mb-4 text-textMuted" />
          <p className="text-lg font-semibold mb-2">LSM Allocation</p>
          <p className="text-sm">Assign students to Learning Success Managers after successful onboarding.</p>
        </div>
      </div>
    </>
  );
};

export default LSMAllocation;

