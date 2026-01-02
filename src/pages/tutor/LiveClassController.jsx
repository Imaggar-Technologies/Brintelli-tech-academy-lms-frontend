import { useState } from "react";
import { CalendarClock, Mic, MicOff, Monitor, Play, Square, Users, Video, MessageSquare, BarChart3, Settings } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const TutorLiveClassController = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <PageHeader
        title="Live Class Controller"
        description="Manage your live session, interact with participants, and trigger quizzes seamlessly."
        actions={
          <>
            <Button variant="secondary" className="gap-2">
              <Settings className="h-4 w-4" />
              Test Studio
            </Button>
            <Button variant="primary" className="gap-2">
              <Monitor className="h-4 w-4" />
              Enter Control Room
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-brintelli-border/60 bg-gradient-to-br from-brand-50/30 to-brand-50/10">
            <div className="flex h-full flex-col items-center justify-center text-textMuted">
              <div className="rounded-full bg-brand-100/50 p-4 ring-4 ring-brand-200/30">
                <Monitor className="h-12 w-12 text-brand-600" />
              </div>
              <p className="mt-4 text-base font-bold text-text">Live session preview</p>
              <p className="mt-1 text-sm text-textMuted">Stream will appear once the class starts</p>
            </div>
            {isStreaming && (
              <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                LIVE
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button 
                variant={isStreaming ? "ghost" : "primary"} 
                className="gap-2 shadow-sm"
                onClick={() => setIsStreaming(!isStreaming)}
              >
                <Play className="h-4 w-4" /> 
                {isStreaming ? "Pause Stream" : "Start Stream"}
              </Button>
              <Button variant="ghost" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                <Square className="h-4 w-4" /> End Session
              </Button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                  isMuted 
                    ? "border-rose-300 bg-rose-50 text-rose-600" 
                    : "border-brintelli-border/60 bg-white text-textSoft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="group rounded-2xl border border-brintelli-border/60 bg-gradient-to-br from-brand-50/30 to-white p-5 shadow-sm transition-all duration-200 hover:border-brand-300/60 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand-600" />
                <h4 className="text-base font-bold text-text">Quizzes & Engagement</h4>
              </div>
              <p className="mb-4 text-xs font-medium text-textMuted">Launch quick questions to check understanding.</p>
              <div className="flex flex-col gap-2.5">
                <button className="group/btn flex items-center justify-between rounded-xl border border-brintelli-border/60 bg-white px-4 py-3 text-left text-sm font-medium text-textSoft transition-all duration-200 hover:border-brand-300/60 hover:bg-brand-50/50 hover:text-brand-700">
                  <span>Launch prior knowledge quiz</span>
                  <MessageSquare className="h-4 w-4 text-textMuted transition-colors group-hover/btn:text-brand-600" />
                </button>
                <button className="group/btn flex items-center justify-between rounded-xl border border-brintelli-border/60 bg-white px-4 py-3 text-left text-sm font-medium text-textSoft transition-all duration-200 hover:border-brand-300/60 hover:bg-brand-50/50 hover:text-brand-700">
                  <span>Quiz: Cache eviction strategies</span>
                  <MessageSquare className="h-4 w-4 text-textMuted transition-colors group-hover/btn:text-brand-600" />
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border/60 bg-gradient-to-br from-brand-50/30 to-white p-5 shadow-sm transition-all duration-200 hover:border-brand-300/60 hover:shadow-md">
              <h4 className="mb-3 text-base font-bold text-text">Class Notes</h4>
              <textarea
                rows={5}
                placeholder="Keep cue points or share quick notes with attendees..."
                className="w-full rounded-xl border border-brintelli-border/60 bg-white px-4 py-3 text-sm text-textSoft outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-text">Participants</h3>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500/15 to-brand-600/15 px-3.5 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-200/50">
                <Users className="h-4 w-4" />
                92 joined
              </span>
            </div>
            <div className="mt-5 space-y-2.5">
              {["Vivek S", "Shraddha P", "Madhav T", "Ananya R"].map((name) => (
                <div key={name} className="group flex items-center justify-between rounded-xl border border-brintelli-border/60 bg-gradient-to-r from-white to-brand-50/30 px-4 py-3 transition-all duration-200 hover:border-brand-300/60 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-xs font-bold text-white shadow-sm">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-text">{name}</span>
                  </div>
                  <button className="rounded-lg border border-brand-300/60 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition-all duration-200 hover:bg-brand-100 hover:shadow-sm">
                    Spotlight
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-text">Broadcast Messages</h3>
            <p className="mt-1 mb-4 text-sm text-textMuted">Quick actions to engage with your class.</p>
            <div className="space-y-2.5">
              {[
                "Share assignment dropbox link",
                "Remind about break-out activity",
                "Encourage participation & questions",
              ].map((message) => (
                <button
                  key={message}
                  className="group flex w-full items-center justify-between rounded-xl border border-brintelli-border/60 bg-white px-4 py-3 text-left text-sm font-medium text-textSoft transition-all duration-200 hover:border-brand-300/60 hover:bg-brand-50/50 hover:text-brand-700"
                >
                  <span>{message}</span>
                  <MessageSquare className="h-4 w-4 text-textMuted transition-colors group-hover:text-brand-600" />
                </button>
              ))}
              <Button className="mt-3 w-full gap-2 shadow-sm">
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

