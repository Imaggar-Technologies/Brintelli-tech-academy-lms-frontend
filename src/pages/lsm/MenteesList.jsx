import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CalendarClock, GraduationCap, MessageCircle, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";
import lsmAPI from "../../api/lsm";

const columns = [
  { key: "name", title: "Mentee" },
  { key: "track", title: "Track" },
  { key: "risk", title: "Risk Level" },
  { key: "progress", title: "Progress" },
  { key: "nextStep", title: "Next Action" },
];

const LsmMenteesList = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      
      // Fetch all students
      const studentsResponse = await lsmAPI.getStudents({});
      const students = studentsResponse.success ? (studentsResponse.data?.students || studentsResponse.data || []) : [];
      
      // Fetch risk data for all students
      const riskResponse = await lsmAPI.getRiskStudents({});
      const riskData = riskResponse.success ? (riskResponse.data?.riskStudents || riskResponse.data || []) : [];
      
      // Fetch readiness data
      const readinessResponse = await lsmAPI.getReadiness({});
      const readinessData = readinessResponse.success ? (readinessResponse.data?.readiness || readinessResponse.data || []) : [];
      
      // Fetch progress data
      const progressResponse = await lsmAPI.getProgress({});
      const progressData = progressResponse.success ? (progressResponse.data?.progress || progressResponse.data || []) : [];

      // Map students to mentees with enriched data
      const menteesData = students.map((student) => {
        const studentId = student.id || student._id || student.studentId || student.leadId;
        
        // Find risk data
        const risk = riskData.find(r => 
          (r.studentId || r._id) === studentId || 
          (r.leadId || r.enrollmentId) === studentId
        );
        
        // Find readiness data
        const readiness = readinessData.find(r => 
          (r.studentId || r._id) === studentId || 
          (r.enrollmentId) === studentId
        );
        
        // Find progress data
        const progress = progressData.find(p => 
          (p.studentId || p._id) === studentId || 
          (p.enrollmentId) === studentId
        );

        // Determine risk level
        let riskLevel = "Low";
        if (risk) {
          if (risk.signals && risk.signals.length >= 3) {
            riskLevel = "High";
          } else if (risk.signals && risk.signals.length >= 1) {
            riskLevel = "Medium";
          }
        } else if (readiness) {
          if (readiness.readinessScore < 50) {
            riskLevel = "High";
          } else if (readiness.readinessScore < 70) {
            riskLevel = "Medium";
          }
        }

        // Calculate progress
        let progressPercent = 0;
        if (progress) {
          const moduleProgress = progress.moduleCompletionPercent || 0;
          const assignmentProgress = progress.assignmentsCompletionPercent || 0;
          progressPercent = Math.round((moduleProgress + assignmentProgress) / 2);
        } else if (readiness) {
          progressPercent = readiness.readinessScore || 0;
        }

        // Determine next action
        let nextStep = "Review progress";
        if (riskLevel === "High") {
          nextStep = "Escalate to mentor";
        } else if (riskLevel === "Medium") {
          nextStep = "Follow-up call";
        } else if (progressPercent >= 80) {
          nextStep = "Schedule mock interview";
        } else if (progressPercent >= 60) {
          nextStep = "Resume review";
        }

        return {
          id: studentId,
          name: student.studentName || student.name || student.fullName || student.email || "Unknown Student",
          track: student.program?.name || student.courseName || student.track || "Not assigned",
          risk: riskLevel,
          progress: `${progressPercent}%`,
          nextStep: nextStep,
        };
      });

      setMentees(menteesData);
    } catch (error) {
      console.error("Error fetching mentees:", error);
      toast.error(error.message || "Failed to load mentees");
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Mentee Portfolio"
        description="Consolidated view of all assigned mentees with risk flags and next action steps."
        actions={
          <Button variant="secondary" className="gap-2">
            Export List
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text">Active Mentees</h3>
            <p className="text-sm text-textMuted">
              {loading ? "Loading..." : `${mentees.length} mentee${mentees.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <Button variant="ghost" className="gap-2">
            Share with mentor
          </Button>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-textMuted">Loading mentees...</div>
            </div>
          ) : mentees.length > 0 ? (
            <Table columns={columns} data={mentees} />
          ) : (
            <div className="text-center py-12 text-textMuted">
              <UsersRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No mentees found</p>
              <p className="text-sm mt-2">
                Mentees will appear here once students are assigned to mentors.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LsmMenteesList;

