import { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, FileText, Phone } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const StudentSupport = () => {
  const [supportType, setSupportType] = useState('general');

  return (
    <>
      <PageHeader
        title="Need Support?"
        description="Get help with your learning journey, technical issues, or account questions"
      />

      <div className="space-y-6">
        {/* Support Options */}
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => setSupportType('technical')}
            className={`rounded-2xl border p-6 text-left transition hover:shadow-md ${
              supportType === 'technical'
                ? 'border-brand-500 bg-brand-50'
                : 'border-brintelli-border bg-brintelli-card'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/10">
                <HelpCircle className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-semibold text-text">Technical Support</h3>
            </div>
            <p className="text-sm text-textMuted">
              Issues with platform, login, or features
            </p>
          </button>

          <button
            onClick={() => setSupportType('academic')}
            className={`rounded-2xl border p-6 text-left transition hover:shadow-md ${
              supportType === 'academic'
                ? 'border-brand-500 bg-brand-50'
                : 'border-brintelli-border bg-brintelli-card'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/10">
                <FileText className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-semibold text-text">Academic Support</h3>
            </div>
            <p className="text-sm text-textMuted">
              Questions about courses, assignments, or progress
            </p>
          </button>

          <button
            onClick={() => setSupportType('account')}
            className={`rounded-2xl border p-6 text-left transition hover:shadow-md ${
              supportType === 'account'
                ? 'border-brand-500 bg-brand-50'
                : 'border-brintelli-border bg-brintelli-card'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/10">
                <MessageCircle className="h-5 w-5 text-brand-500" />
              </div>
              <h3 className="font-semibold text-text">Account Support</h3>
            </div>
            <p className="text-sm text-textMuted">
              Profile, billing, or account-related questions
            </p>
          </button>
        </div>

        {/* Contact Methods */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Contact Us</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-brintelli-baseAlt">
              <Mail className="h-5 w-5 text-brand-500" />
              <div>
                <p className="font-medium text-text">Email Support</p>
                <p className="text-sm text-textMuted">support@brintellitechacademy.in</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-brintelli-baseAlt">
              <Phone className="h-5 w-5 text-brand-500" />
              <div>
                <p className="font-medium text-text">Phone Support</p>
                <p className="text-sm text-textMuted">Available 9 AM - 6 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-brintelli-baseAlt">
              <p className="font-medium text-text mb-1">How do I access my sessions?</p>
              <p className="text-sm text-textMuted">
                Go to Learning → Sessions to view all your live and recorded sessions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-brintelli-baseAlt">
              <p className="font-medium text-text mb-1">How do I submit assignments?</p>
              <p className="text-sm text-textMuted">
                Navigate to the session page and find the assignments section for that session.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-brintelli-baseAlt">
              <p className="font-medium text-text mb-1">How do I book a mentor session?</p>
              <p className="text-sm text-textMuted">
                Go to Mentors → Book a Session to schedule a 1:1 or group session with your mentor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentSupport;

