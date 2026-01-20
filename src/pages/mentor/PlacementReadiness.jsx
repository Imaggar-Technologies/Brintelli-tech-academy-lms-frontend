import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Target, User, TrendingUp, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const PlacementReadiness = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    technicalSkills: 5,
    communication: 5,
    problemSolving: 5,
    interviewReadiness: 5,
    resumeQuality: 5,
    overallReadiness: 5,
    notes: '',
    recommendations: '',
  });
  const [assessments, setAssessments] = useState({}); // menteeId -> assessments

  useEffect(() => {
    fetchMentees();
    loadAssessments();
  }, []);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentees();
      
      if (response.success) {
        setMentees(response.data.mentees || []);
      } else {
        toast.error(response.message || 'Failed to load mentees');
        setMentees([]);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error(error.message || 'Failed to load mentees');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = () => {
    const saved = localStorage.getItem('mentorPlacementAssessments');
    if (saved) {
      try {
        setAssessments(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading assessments:', e);
      }
    }
  };

  const handleSaveAssessment = () => {
    if (!selectedMentee) {
      toast.error('Please select a mentee');
      return;
    }

    const assessment = {
      id: Date.now().toString(),
      ...assessmentData,
      overallReadiness: Math.round(
        (assessmentData.technicalSkills +
         assessmentData.communication +
         assessmentData.problemSolving +
         assessmentData.interviewReadiness +
         assessmentData.resumeQuality) / 5
      ),
      assessedAt: new Date().toISOString(),
    };

    const menteeId = selectedMentee.id || selectedMentee.enrollmentId;
    const newAssessments = {
      ...assessments,
      [menteeId]: [...(assessments[menteeId] || []), assessment],
    };

    setAssessments(newAssessments);
    localStorage.setItem('mentorPlacementAssessments', JSON.stringify(newAssessments));
    toast.success('Placement readiness assessment saved');
    setShowAssessmentModal(false);
    setSelectedMentee(null);
    setAssessmentData({
      technicalSkills: 5,
      communication: 5,
      problemSolving: 5,
      interviewReadiness: 5,
      resumeQuality: 5,
      overallReadiness: 5,
      notes: '',
      recommendations: '',
    });
  };

  const getReadinessLevel = (score) => {
    if (score >= 8) return { label: 'Ready', color: 'bg-green-100 text-green-800' };
    if (score >= 6) return { label: 'Almost Ready', color: 'bg-blue-100 text-blue-800' };
    if (score >= 4) return { label: 'Needs Work', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Not Ready', color: 'bg-red-100 text-red-800' };
  };

  return (
    <>
      <PageHeader
        title="Placement Readiness"
        description="Assess and improve mentee placement readiness"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-brand-600">{mentees.length}</p>
            </div>
            <User className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Assessments</p>
              <p className="text-3xl font-bold text-accent-600">
                {Object.values(assessments).reduce((sum, assessmentList) => sum + assessmentList.length, 0)}
              </p>
            </div>
            <Target className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Readiness</p>
              <p className="text-3xl font-bold text-green-600">
                {(() => {
                  const allScores = Object.values(assessments)
                    .flat()
                    .map(a => a.overallReadiness || 0);
                  return allScores.length > 0
                    ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
                    : 0;
                })()}/10
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Mentees with Assessments */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Placement Readiness Assessment</h3>
            <p className="text-sm text-textMuted mt-1">
              Assess mentee readiness for job placements
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMentees}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading mentees...</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No mentees assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mentees.map((mentee) => {
              const menteeId = mentee.id || mentee.enrollmentId;
              const menteeAssessments = assessments[menteeId] || [];
              const latestAssessment = menteeAssessments.length > 0
                ? menteeAssessments.sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt))[0]
                : null;
              const readiness = latestAssessment
                ? getReadinessLevel(latestAssessment.overallReadiness)
                : null;

              return (
                <div
                  key={menteeId}
                  className="flex flex-col gap-3 rounded-xl border border-brintelli-border bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="font-semibold text-text">{mentee.studentName}</p>
                        <p className="text-xs text-textMuted">{mentee.studentEmail}</p>
                      </div>
                    </div>
                    {readiness && (
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${readiness.color}`}>
                        {readiness.label} ({latestAssessment.overallReadiness}/10)
                      </span>
                    )}
                  </div>

                  {latestAssessment ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-textMuted">Technical</p>
                        <p className="font-semibold text-text">{latestAssessment.technicalSkills}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted">Communication</p>
                        <p className="font-semibold text-text">{latestAssessment.communication}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted">Problem Solving</p>
                        <p className="font-semibold text-text">{latestAssessment.problemSolving}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted">Interview</p>
                        <p className="font-semibold text-text">{latestAssessment.interviewReadiness}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-textMuted">Resume</p>
                        <p className="font-semibold text-text">{latestAssessment.resumeQuality}/10</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-textMuted text-center py-2">
                      No assessment yet
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant={latestAssessment ? "secondary" : "primary"}
                    onClick={() => {
                      setSelectedMentee(mentee);
                      if (latestAssessment) {
                        setAssessmentData(latestAssessment);
                      }
                      setShowAssessmentModal(true);
                    }}
                    className="w-full"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    {latestAssessment ? 'Update Assessment' : 'Assess Readiness'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Modal */}
      <Modal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false);
          setSelectedMentee(null);
          setAssessmentData({
            technicalSkills: 5,
            communication: 5,
            problemSolving: 5,
            interviewReadiness: 5,
            resumeQuality: 5,
            overallReadiness: 5,
            notes: '',
            recommendations: '',
          });
        }}
        title={selectedMentee ? `Assess: ${selectedMentee.studentName}` : 'Placement Readiness Assessment'}
        size="lg"
      >
        {selectedMentee && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMentee.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMentee.studentEmail}</p>
            </div>

            {['technicalSkills', 'communication', 'problemSolving', 'interviewReadiness', 'resumeQuality'].map((skill) => {
              const labels = {
                technicalSkills: 'Technical Skills',
                communication: 'Communication',
                problemSolving: 'Problem Solving',
                interviewReadiness: 'Interview Readiness',
                resumeQuality: 'Resume Quality',
              };
              return (
                <div key={skill}>
                  <label className="block text-sm font-medium text-text mb-2">
                    {labels[skill]} (0-10)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={assessmentData[skill]}
                    onChange={(e) => setAssessmentData({ ...assessmentData, [skill]: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-textMuted mt-1">
                    <span>0</span>
                    <span className="font-semibold text-text">{assessmentData[skill]}/10</span>
                    <span>10</span>
                  </div>
                </div>
              );
            })}

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 mb-1">
                Overall Readiness: {Math.round(
                  (assessmentData.technicalSkills +
                   assessmentData.communication +
                   assessmentData.problemSolving +
                   assessmentData.interviewReadiness +
                   assessmentData.resumeQuality) / 5
                )}/10
              </p>
              <p className="text-xs text-blue-600">
                {getReadinessLevel(Math.round(
                  (assessmentData.technicalSkills +
                   assessmentData.communication +
                   assessmentData.problemSolving +
                   assessmentData.interviewReadiness +
                   assessmentData.resumeQuality) / 5
                )).label}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Assessment Notes</label>
              <textarea
                value={assessmentData.notes}
                onChange={(e) => setAssessmentData({ ...assessmentData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                placeholder="Additional notes about placement readiness..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Recommendations</label>
              <textarea
                value={assessmentData.recommendations}
                onChange={(e) => setAssessmentData({ ...assessmentData, recommendations: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                placeholder="Recommendations to improve placement readiness..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSaveAssessment}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Save Assessment
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAssessmentModal(false);
                  setSelectedMentee(null);
                  setAssessmentData({
                    technicalSkills: 5,
                    communication: 5,
                    problemSolving: 5,
                    interviewReadiness: 5,
                    resumeQuality: 5,
                    overallReadiness: 5,
                    notes: '',
                    recommendations: '',
                  });
                }}
              >
                Cancel
              </Button>
      </div>
    </div>
        )}
      </Modal>
    </>
  );
};

export default PlacementReadiness;

