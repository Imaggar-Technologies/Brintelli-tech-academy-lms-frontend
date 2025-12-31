import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  BookOpen, 
  Tag,
  CheckCircle2,
  Clock,
  Trophy,
  MessageSquare,
  FileText,
  Star,
  ChevronLeft
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';

const ChallengeDetail = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [activeOutputTab, setActiveOutputTab] = useState('output');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiRequest(`/api/students/challenges/${challengeId}`);
      
      // Mock data
      const mockChallenge = {
        id: challengeId,
        title: "Two Sum IV – Binary Search Tree",
        difficulty: "Medium",
        tags: ["Binary Search Tree", "Hashing", "DFS"],
        description: `Given the root of a Binary Search Tree and an integer k, return true if there exist two different nodes whose values add up to k.`,
        examples: [
          {
            input: "root = [5,3,6,2,4,null,7], k = 9",
            output: "true",
            explanation: "5 + 4 = 9"
          },
          {
            input: "root = [5,3,6,2,4,null,7], k = 28",
            output: "false"
          }
        ],
        constraints: [
          "Tree nodes count is in the range [1, 10⁴]",
          "-10⁴ ≤ Node.val ≤ 10⁴",
          "Target value k is within [-10⁴, 10⁴]"
        ],
        defaultCode: {
          javascript: `function findTarget(root, k) {
  const seen = new Set();
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;

    if (seen.has(k - node.val)) {
      return true;
    }

    seen.add(node.val);
    stack.push(node.left, node.right);
  }

  return false;
}`,
          python: `def findTarget(root, k):
    seen = set()
    stack = [root]
    
    while stack:
        node = stack.pop()
        if not node:
            continue
        
        if k - node.val in seen:
            return True
        
        seen.add(node.val)
        stack.append(node.left)
        stack.append(node.right)
    
    return False`,
          java: `public boolean findTarget(TreeNode root, int k) {
    Set<Integer> seen = new HashSet<>();
    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        if (node == null) continue;
        
        if (seen.contains(k - node.val)) {
            return true;
        }
        
        seen.add(node.val);
        stack.push(node.left);
        stack.push(node.right);
    }
    
    return false;
}`,
          cpp: `bool findTarget(TreeNode* root, int k) {
    unordered_set<int> seen;
    stack<TreeNode*> st;
    st.push(root);
    
    while (!st.empty()) {
        TreeNode* node = st.top();
        st.pop();
        if (!node) continue;
        
        if (seen.find(k - node->val) != seen.end()) {
            return true;
        }
        
        seen.insert(node->val);
        st.push(node->left);
        st.push(node->right);
    }
    
    return false;
}`
        },
        submissions: [],
        leaderboard: [],
        discussions: []
      };

      setChallenge(mockChallenge);
      setCode(mockChallenge.defaultCode[language] || mockChallenge.defaultCode.javascript);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (challenge?.defaultCode[newLanguage]) {
      setCode(challenge.defaultCode[newLanguage]);
    }
  };

  const handleRunCode = async () => {
    try {
      setRunning(true);
      // TODO: Implement actual code execution API
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOutput({
        status: 'Accepted',
        runtime: '48 ms',
        memory: '45 MB',
        beats: '92%',
        output: 'true'
      });
      setActiveOutputTab('output');
    } catch (error) {
      console.error('Error running code:', error);
      setOutput({
        status: 'Error',
        message: error.message || 'Failed to run code'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    if (challenge?.defaultCode[language]) {
      setCode(challenge.defaultCode[language]);
    }
    setOutput(null);
    setInput('');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
        <p className="text-textMuted">Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <p className="text-textMuted">Challenge not found.</p>
        <Button onClick={() => navigate('/student/challenges')} className="mt-4">
          Back to Challenges
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => navigate('/student/challenges')}
          className="flex items-center gap-2 text-textMuted hover:text-text transition mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Challenges
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text mb-2">{challenge.title}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
              <button>
                <Star className="h-4 w-4 text-textMuted hover:text-yellow-500 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-brintelli-border">
        <div className="flex gap-6">
          {[
            { id: 'problem', label: 'Problem', icon: FileText },
            { id: 'submissions', label: 'Submissions', icon: CheckCircle2 },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'discussions', label: 'Discussions', icon: MessageSquare },
            { id: 'editorial', label: 'Editorial', icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-textMuted hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'problem' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <section className="flex min-h-[600px] flex-col gap-5 overflow-y-auto rounded-3xl border border-brintelli-border bg-brintelli-card p-6 shadow-card">
            <div className="space-y-4 text-sm leading-relaxed text-textSoft">
              <p>{challenge.description}</p>
              
              {challenge.examples && challenge.examples.length > 0 && (
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-textMuted mb-3">Example</p>
                  {challenge.examples.map((example, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-textSoft">
                        {`Input: ${example.input}\nOutput: ${example.output}${example.explanation ? `\nExplanation: ${example.explanation}` : ''}`}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
              
              {challenge.constraints && challenge.constraints.length > 0 && (
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-5 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-textMuted mb-3">Constraints</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {challenge.constraints.map((constraint, idx) => (
                      <li key={idx} className="text-textSoft">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {challenge.tags && challenge.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {challenge.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-brintelli-baseAlt px-3 py-1 text-xs">
                      <Tag className="h-3.5 w-3.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Code Editor */}
          <section className="flex min-h-[600px] flex-col gap-5 rounded-3xl border border-brintelli-border bg-brintelli-card p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brintelli-border bg-brintelli-baseAlt/60 px-4 py-3">
              <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-textMuted">
                <Code2 className="h-4 w-4 text-brand" />
                Language
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="rounded-full border border-transparent bg-white/70 px-3 py-1 text-sm font-medium text-text outline-none"
                >
                  {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="gap-2 px-4" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <Button 
                  variant="secondary" 
                  className="gap-2 px-4" 
                  onClick={handleRunCode}
                  disabled={running}
                >
                  {running ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Run Code
                    </>
                  )}
                </Button>
                <Button variant="primary" className="gap-2 px-4">
                  Submit Code
                </Button>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-brintelli-border bg-[#0f172a] min-h-[300px]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-full w-full resize-none rounded-2xl bg-transparent p-6 font-mono text-sm leading-6 text-white outline-none"
                spellCheck={false}
                style={{ minHeight: '300px' }}
              />
            </div>

            {/* Input/Output Section - More visible */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt">
              <div className="flex items-center gap-2 border-b border-brintelli-border px-4">
                {['input', 'output'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveOutputTab(tab)}
                    className={`py-3 text-xs font-semibold uppercase tracking-wide transition ${
                      activeOutputTab === tab ? 'text-brand border-b-2 border-brand-500' : 'text-textMuted'
                    }`}
                  >
                    {tab === 'input' ? 'Input' : 'Output / Console'}
                  </button>
                ))}
              </div>
              <div className="min-h-[200px]">
                {activeOutputTab === 'input' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-[200px] w-full resize-none rounded-b-2xl bg-white px-5 py-4 font-mono text-sm text-textSoft outline-none"
                    placeholder="Enter test input..."
                  />
                ) : (
                  <div className="h-[200px] overflow-y-auto space-y-2 rounded-b-2xl bg-white px-5 py-4 font-mono text-sm text-textSoft">
                    {output ? (
                      <>
                        <p className={`font-semibold ${
                          output.status === 'Accepted' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Status: {output.status}
                        </p>
                        {output.runtime && (
                          <p className="text-textMuted">
                            Runtime: {output.runtime} · Beats {output.beats} submissions
                          </p>
                        )}
                        {output.memory && (
                          <p className="text-textMuted">Memory: {output.memory}</p>
                        )}
                        {output.output && (
                          <div className="mt-3 p-3 bg-brintelli-baseAlt rounded-lg">
                            <p className="text-xs text-textMuted mb-1">Output:</p>
                            <p className="text-text">{output.output}</p>
                          </div>
                        )}
                        {output.message && (
                          <p className="text-red-600 mt-2">{output.message}</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-textMuted">Run your code to see output here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Your Submissions</h3>
          {challenge.submissions && challenge.submissions.length > 0 ? (
            <div className="space-y-3">
              {challenge.submissions.map((submission, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-brintelli-border">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-text">Accepted</p>
                      <p className="text-sm text-textMuted">{submission.language} · {submission.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text">{submission.score}</p>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textMuted text-center py-8">No submissions yet. Solve the problem to see your submissions here.</p>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Leaderboard</h3>
          <p className="text-textMuted text-center py-8">Leaderboard coming soon!</p>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Discussions</h3>
          <p className="text-textMuted text-center py-8">Discussions coming soon!</p>
        </div>
      )}

      {activeTab === 'editorial' && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Editorial</h3>
          <p className="text-textMuted text-center py-8">Editorial coming soon!</p>
        </div>
      )}
    </>
  );
};

export default ChallengeDetail;

