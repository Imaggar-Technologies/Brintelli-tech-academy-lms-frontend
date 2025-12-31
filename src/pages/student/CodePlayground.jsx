import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Sparkles, 
  Trophy, 
  TrendingUp,
  Lock,
  ArrowRight,
  Star,
  Target,
  Zap
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const CodePlayground = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    // Fetch user's skill progress
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    // TODO: Replace with actual API call
    // Mock data
    const mockSkills = [
      { name: 'Artificial Intelligence', progress: 0, total: 105, points: 0 },
      { name: 'Problem Solving', progress: 30, total: 100, points: 51, nextStar: 49 },
      { name: 'C++', progress: 100, total: 44, points: 1005, solved: 44 },
      { name: 'Security', progress: 100, total: 12, points: 240, solved: 12 },
      { name: 'Algorithms', progress: 45, total: 80, points: 360 },
      { name: 'Data Structures', progress: 60, total: 50, points: 300 },
      { name: 'Java', progress: 25, total: 60, points: 150 },
      { name: 'Python', progress: 70, total: 40, points: 280, solved: 28 }
    ];
    setSkills(mockSkills);
  };

  const practiceSkills = [
    { name: 'Algorithms', icon: Code2 },
    { name: 'Data Structures', icon: Target },
    { name: 'Mathematics', icon: TrendingUp },
    { name: 'Artificial Intelligence', icon: Sparkles },
    { name: 'C', icon: Code2 },
    { name: 'C++', icon: Code2 },
    { name: 'Java', icon: Code2 },
    { name: 'Python', icon: Code2 },
    { name: 'Ruby', icon: Code2 },
    { name: 'SQL', icon: Code2 },
    { name: 'Databases', icon: Code2 },
    { name: 'Linux Shell', icon: Code2 },
    { name: 'Functional Programming', icon: Code2 },
    { name: 'Regex', icon: Code2 },
    { name: 'React', icon: Code2 }
  ];

  const mockInterviews = [
    { 
      title: 'Software Engineer', 
      type: 'Problem Solving (Medium)', 
      duration: '60 mins',
      free: true 
    },
    { 
      title: 'Backend Developer', 
      type: 'Node (Medium)', 
      duration: '60 mins',
      free: false 
    },
    { 
      title: 'Frontend Developer', 
      type: 'React (Medium)', 
      duration: '60 mins',
      free: false 
    },
    { 
      title: 'System Design', 
      type: 'Architecture Design (Medium)', 
      duration: '60 mins',
      free: false 
    }
  ];

  return (
    <>
      <PageHeader
        title="Code Playground"
        description="Practice coding interview problems and improve your skills"
      />

      <div className="space-y-8">
        {/* Prep Kits Section */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-text">Prep Kits</h2>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                New
              </span>
            </div>
          </div>
          
          <div className="rounded-lg border border-brintelli-border bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Software Engineer Prep Kit</h3>
                <p className="text-sm text-textMuted">
                  53 Practice Challenges • 1 Mock Test • 1 Mock Interview • 1 Role Certification
                </p>
            </div>
              <Button variant="primary" onClick={() => navigate('/student/challenges')}>
                Start Preparation
              </Button>
            </div>
            </div>
          </div>

        {/* Continue Practicing Section */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Continue Practicing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.slice(0, 4).map((skill, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/student/challenges', { state: { skill: skill.name } })}
                className="group cursor-pointer rounded-lg border border-brintelli-border bg-white p-4 hover:border-brand-500 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text group-hover:text-brand-600 transition">
                    {skill.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-textMuted group-hover:text-brand-600 transition" />
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-textMuted mb-1">
                    <span>
                      {skill.progress}% {skill.solved ? `(${skill.solved}/${skill.total} challenges solved)` : `(${skill.points || 0} points to next star)`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-brintelli-baseAlt overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        skill.progress === 100 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : 'bg-gradient-to-r from-brand-500 to-accent-500'
                      }`}
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-powered Mock Interviews Section */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-text">AI-powered Mock Interviews</h2>
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                New
              </span>
            </div>
            <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Know More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockInterviews.map((interview, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-brintelli-border bg-white p-4"
              >
                <h3 className="font-semibold text-text mb-1">{interview.title}</h3>
                <p className="text-sm text-textMuted mb-2">{interview.type}</p>
                <p className="text-xs text-textMuted mb-4">{interview.duration}</p>
                {interview.free ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Navigate to mock interview
                      navigate('/student/mock-interviews');
                    }}
                  >
                    Try for Free
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    disabled
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Premium
                  </Button>
                )}
              </div>
            ))}
          </div>
          </div>

        {/* Practice Skills Section */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Practice Skills</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {practiceSkills.map((skill, idx) => {
              const Icon = skill.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate('/student/challenges', { state: { skill: skill.name } })}
                  className="flex flex-col items-center gap-2 rounded-lg border border-brintelli-border bg-white p-4 hover:border-brand-500 hover:shadow-md transition group"
                >
                  <Icon className="h-6 w-6 text-textMuted group-hover:text-brand-600 transition" />
                  <span className="text-sm font-medium text-text group-hover:text-brand-600 transition">
                    {skill.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CodePlayground;
