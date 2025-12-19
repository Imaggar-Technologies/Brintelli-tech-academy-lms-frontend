import { useState } from "react";
import { CalendarClock, Mic, Monitor, Play, Square, Users, Video } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const TutorLiveClassController = () => {
  return (
    <>
      <PageHeader
        title="Live Class Controller"
        description="Manage your live session, interact with participants, and trigger polls seamlessly."
        actions={
          <>
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Test Studio
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
              Enter Control Room
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="aspect-video w-full rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt">
            <div className="flex h-full flex-col items-center justify-center text-textMuted">
              <Monitor className="h-10 w-10 text-textMuted" />
              <p className="mt-3 text-sm font-semibold text-textMuted">Live session preview</p>
              <p className="text-xs text-textMuted">Stream will appear once the class starts</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="gap-2">
                <Play className="h-4 w-4" /> Start Stream
              </Button>
              <Button variant="ghost" className="gap-2">
                <Square className="h-4 w-4" /> End Session
              </Button>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft transition hover:border-brand-200 hover:text-brand-600">
                <Mic className="h-5 w-5" />
              </button>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft transition hover:border-brand-200 hover:text-brand-600">
                <MicOff className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <h4 className="text-sm font-semibold text-text">Polls & Engagement</h4>
              <p className="mt-1 text-xs text-textMuted">Launch quick questions to check understanding.</p>
              <div className="mt-3 flex flex-col gap-2 text-xs text-textMuted">
                <button className="rounded-xl border border-brintelli-border px-3 py-2 text-left transition hover:border-brand-200 hover:text-brand-600">
                  Launch prior knowledge poll
                </button>
                <button className="rounded-xl border border-brintelli-border px-3 py-2 text-left transition hover:border-brand-200 hover:text-brand-600">
                  Quiz: Cache eviction strategies
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <h4 className="text-sm font-semibold text-text">Class Notes</h4>
              <textarea
                rows={5}
                placeholder="Keep cue points or share quick notes with attendees..."
                className="mt-3 w-full rounded-xl border border-brintelli-border px-3 py-2 text-sm text-textSoft outline-none ring-brand-200 transition focus:border-brand-300 focus:ring-2"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Participants</h3>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold text-brand-600">
                <Users className="h-4 w-4" />
                92 joined
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              {["Vivek S", "Shraddha P", "Madhav T", "Ananya R"].map((name) => (
                <div key={name} className="flex items-center justify-between rounded-xl bg-brintelli-baseAlt px-4 py-3">
                  <span className="font-semibold text-text">{name}</span>
                  <button className="text-xs font-semibold text-brand-600">Spotlight</button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Broadcast Messages</h3>
            <div className="mt-3 space-y-2 text-sm text-textSoft">
              <button className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-left transition hover:border-brand-200 hover:text-brand-600">
                Share assignment dropbox link
              </button>
              <button className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-left transition hover:border-brand-200 hover:text-brand-600">
                Remind about break-out activity
              </button>
              <button className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-left transition hover:border-brand-200 hover:text-brand-600">
                Encourage participation & questions
              </button>
              <Button className="gap-2 px-5">
                <Video className="h-4 w-4" /> Push Recording Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorLiveClassController;

