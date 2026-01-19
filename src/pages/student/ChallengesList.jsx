import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  CheckCircle2, 
  Circle, 
  Filter,
  Search,
  Code2,
  Trophy,
  TrendingUp
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';

const ChallengesList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all, solved, unsolved
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, easy, medium, hard
  const [skillFilter, setSkillFilter] = useState('all'); // all, or specific skill
  const [subdomainFilter, setSubdomainFilter] = useState('all'); // all, or specific subdomain
  
  // Stats
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalChallenges: 0,
    rank: null,
    points: 0
  });

  // Available filters
  const skills = ['C++', 'Java', 'Python', 'JavaScript', 'C', 'SQL', 'Algorithms', 'Data Structures'];
  const subdomains = ['Introduction', 'Strings', 'Arrays', 'Sorting', 'Searching', 'Graphs', 'Trees', 'Dynamic Programming'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, statusFilter, difficultyFilter, skillFilter, subdomainFilter, searchQuery]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiRequest('/api/students/challenges');
      
      // Mock data for now
      const mockChallenges = generateMockChallenges();
      setChallenges(mockChallenges);
      
      // Calculate stats
      const solved = mockChallenges.filter(c => c.status === 'solved').length;
      setStats({
        totalSolved: solved,
        totalChallenges: mockChallenges.length,
        rank: 1,
        points: 1085
      });
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockChallenges = () => {
    const challenges = [];
    const titles = [
      "Say 'Hello, World!' With C++",
      "Input and Output",
      "Basic Data Types",
      "Conditional Statements",
      "For Loop",
      "Functions",
      "Pointer",
      "Arrays Introduction",
      "Variable Sized Arrays",
      "Attribute Parser",
      "StringStream",
      "Strings",
      "Structs",
      "Class",
      "Classes and Objects",
      "Box It!",
      "Inherited Code",
      "Exceptional Server",
      "Virtual Functions",
      "Abstract Classes - Polymorphism",
      "Vector-Sort",
      "Vector-Erase",
      "Lower Bound-STL",
      "Sets-STL",
      "Maps-STL",
      "Print Pretty",
      "Deque-STL",
      "Inheritance Introduction",
      "Hotel Prices",
      "Cpp exception handling",
      "Rectangle Area",
      "Multi Level Inheritance",
      "Two Sum",
      "Add Two Numbers",
      "Longest Substring Without Repeating Characters",
      "Median of Two Sorted Arrays",
      "Longest Palindromic Substring",
      "ZigZag Conversion",
      "Reverse Integer",
      "String to Integer (atoi)"
    ];

    const difficulties = ['Easy', 'Medium', 'Hard'];
    const skills = ['C++', 'Java', 'Python', 'JavaScript', 'C', 'SQL', 'Algorithms', 'Data Structures'];
    const subdomains = ['Introduction', 'Strings', 'Arrays', 'Sorting', 'Searching', 'Graphs', 'Trees', 'Dynamic Programming'];
    const statuses = ['solved', 'unsolved'];

    titles.forEach((title, index) => {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const skill = skills[Math.floor(Math.random() * skills.length)];
      const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
      const status = index < 20 ? 'solved' : 'unsolved'; // First 20 are solved
      const maxScore = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
      const successRate = Math.floor(Math.random() * 100);

      challenges.push({
        id: `challenge-${index + 1}`,
        title,
        difficulty,
        skill,
        subdomain,
        status,
        maxScore,
        successRate,
        points: maxScore
      });
    });

    return challenges;
  };

  const filterChallenges = () => {
    let filtered = [...challenges];

    // Status filter
    if (statusFilter === 'solved') {
      filtered = filtered.filter(c => c.status === 'solved');
    } else if (statusFilter === 'unsolved') {
      filtered = filtered.filter(c => c.status === 'unsolved');
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(c => c.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    }

    // Skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(c => c.skill === skillFilter);
    }

    // Subdomain filter
    if (subdomainFilter !== 'all') {
      filtered = filtered.filter(c => c.subdomain === subdomainFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChallenges(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
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

  return (
    <>
      <PageHeader
        title="Coding Challenges"
        description="Practice coding problems to improve your skills"
      />

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-brintelli-border bg-white px-12 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Challenges List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-textMuted">Loading challenges...</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No challenges found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => navigate(`/student/challenges/${challenge.id}`)}
                  className="group cursor-pointer rounded-xl border border-brintelli-border bg-brintelli-card p-4 transition hover:border-brand-500 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text group-hover:text-brand-600 transition">
                          {challenge.title}
                        </h3>
                        {challenge.status === 'solved' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Toggle favorite
                          }}
                          className="ml-auto"
                        >
                          <Star className="h-4 w-4 text-textMuted hover:text-yellow-500 transition" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span>{challenge.skill}</span>
                        <span>Max Score: {challenge.maxScore}</span>
                        <span>Success Rate: {challenge.successRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Filters & Stats */}
        <div className="w-80 space-y-6">
          {/* Stats Card */}
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-textMuted">Challenges Solved</span>
                  <span className="text-sm font-semibold text-text">
                    {stats.totalSolved}/{stats.totalChallenges}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-brintelli-baseAlt overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                    style={{ width: `${(stats.totalSolved / stats.totalChallenges) * 100}%` }}
                  />
                </div>
              </div>
              
              {stats.rank && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textMuted">Rank</span>
                  <span className="text-sm font-semibold text-text flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    {stats.rank}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Points</span>
                <span className="text-sm font-semibold text-text">{stats.points}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-textMuted" />
              <h3 className="text-lg font-semibold text-text">Filters</h3>
            </div>
            
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <h4 className="text-sm font-medium text-text mb-3">STATUS</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'solved', label: 'Solved' },
                    { value: 'unsolved', label: 'Unsolved' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={statusFilter === option.value}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-textMuted">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <h4 className="text-sm font-medium text-text mb-3">SKILLS</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="skill"
                      value="all"
                      checked={skillFilter === 'all'}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-textMuted">All</span>
                  </label>
                  {skills.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="skill"
                        value={skill}
                        checked={skillFilter === skill}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-textMuted">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h4 className="text-sm font-medium text-text mb-3">DIFFICULTY</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value="all"
                      checked={difficultyFilter === 'all'}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-textMuted">All</span>
                  </label>
                  {difficulties.map((difficulty) => (
                    <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="difficulty"
                        value={difficulty.toLowerCase()}
                        checked={difficultyFilter === difficulty.toLowerCase()}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-textMuted">{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subdomains Filter */}
              <div>
                <h4 className="text-sm font-medium text-text mb-3">SUBDOMAINS</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subdomain"
                      value="all"
                      checked={subdomainFilter === 'all'}
                      onChange={(e) => setSubdomainFilter(e.target.value)}
                      className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-textMuted">All</span>
                  </label>
                  {subdomains.map((subdomain) => (
                    <label key={subdomain} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subdomain"
                        value={subdomain}
                        checked={subdomainFilter === subdomain}
                        onChange={(e) => setSubdomainFilter(e.target.value)}
                        className="h-4 w-4 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-textMuted">{subdomain}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengesList;














