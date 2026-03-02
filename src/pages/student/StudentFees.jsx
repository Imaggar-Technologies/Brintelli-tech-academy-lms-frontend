import { CreditCard, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import PrerequisiteGate from "../../components/student/PrerequisiteGate";

/**
 * Student portal - Fees layout page.
 * Link to pay fees; gated by prerequisite courses.
 */
export default function StudentFees() {
  const payFeesUrl = "/student/fees/pay"; // or external payment URL from env/API

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pay Fees"
        subtitle="Complete your fee payment for the program."
        icon={CreditCard}
      />

      <PrerequisiteGate fallbackMessage="Complete prerequisite courses before you can access fee payment.">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-text mb-4">
            You can pay your program fees through the secure payment link below.
          </p>
          <a
            href={payFeesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-gradient-cta px-5 py-2 font-medium text-white shadow-glow transition hover:scale-[1.01] hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-4 w-4" />
            Pay fees
          </a>
        </div>
      </PrerequisiteGate>
    </div>
  );
}
