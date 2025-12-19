import { CalendarDays, Clock, MapPin, Users, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const SalesCalendar = () => {
  const meetings = [
    { title: "Demo - TechCorp Inc.", time: "10:00 AM", type: "Demo", attendees: 3 },
    { title: "Follow-up - StartupXYZ", time: "2:00 PM", type: "Follow-up", attendees: 2 },
    { title: "Discovery Call - Digital Solutions", time: "4:00 PM", type: "Call", attendees: 2 },
  ];

  return (
    <>
      <PageHeader
        title="Meeting Calendar"
        description="View and manage all your sales meetings, demos, and follow-ups in one place."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Calendar View</h3>
          <div className="h-96 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
            <div className="flex h-full flex-col items-center justify-center">
              <CalendarDays className="h-12 w-12 text-textMuted" />
              <p className="mt-3 font-semibold text-textMuted">Calendar Widget</p>
              <p>Interactive calendar with meeting schedule</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Today's Meetings</h3>
          <div className="space-y-3">
            {meetings.map((meeting, idx) => (
              <div key={idx} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-text">{meeting.title}</h4>
                    <div className="mt-2 flex items-center gap-4 text-xs text-textMuted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.attendees} people
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    {meeting.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesCalendar;