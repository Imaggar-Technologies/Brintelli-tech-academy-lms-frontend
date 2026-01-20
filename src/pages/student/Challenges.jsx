import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Trophy,
  TrendingUp,
  Code2,
  ArrowRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const Challenges = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images - using placeholder URLs, replace with actual images
  const carouselImages = [
    {
      id: 1,
      title: "Master Data Structures",
      description: "Solve 100+ challenges to become a data structures expert",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop",
      link: "/student/challenges?skill=Data Structures"
    },
    {
      id: 2,
      title: "Algorithm Mastery",
      description: "Level up your problem-solving skills with advanced algorithms",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=400&fit=crop",
      link: "/student/challenges?skill=Algorithms"
    },
    {
      id: 3,
      title: "Coding Competitions",
      description: "Participate in weekly coding contests and win prizes",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop",
      link: "/student/challenges?type=competition"
    }
  ];

  // Mock challenges data
  const challenges = [
    {
      id: 'challenge-1',
      title: 'Two Sum',
      difficulty: 'Easy',
      time: '15 mins',
      points: 10,
      solved: true,
      attempts: 1,
      successRate: 85,
      tags: ['Arrays', 'Hash Table']
    },
    {
      id: 'challenge-2',
      title: 'Add Two Numbers',
      difficulty: 'Medium',
      time: '30 mins',
      points: 20,
      solved: false,
      attempts: 0,
      successRate: 65,
      tags: ['Linked List', 'Math']
    },
    {
      id: 'challenge-3',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      time: '25 mins',
      points: 20,
      solved: true,
      attempts: 2,
      successRate: 70,
      tags: ['String', 'Sliding Window']
    },
    {
      id: 'challenge-4',
      title: 'Median of Two Sorted Arrays',
      difficulty: 'Hard',
      time: '45 mins',
      points: 30,
      solved: false,
      attempts: 0,
      successRate: 45,
      tags: ['Array', 'Binary Search']
    },
    {
      id: 'challenge-5',
      title: 'Longest Palindromic Substring',
      difficulty: 'Medium',
      time: '35 mins',
      points: 25,
      solved: false,
      attempts: 1,
      successRate: 55,
      tags: ['String', 'Dynamic Programming']
    },
    {
      id: 'challenge-6',
      title: 'ZigZag Conversion',
      difficulty: 'Medium',
      time: '20 mins',
      points: 15,
      solved: true,
      attempts: 1,
      successRate: 60,
      tags: ['String']
    },
    {
      id: 'challenge-7',
      title: 'Reverse Integer',
      difficulty: 'Easy',
      time: '10 mins',
      points: 10,
      solved: true,
      attempts: 1,
      successRate: 80,
      tags: ['Math']
    },
    {
      id: 'challenge-8',
      title: 'String to Integer (atoi)',
      difficulty: 'Medium',
      time: '25 mins',
      points: 20,
      solved: false,
      attempts: 0,
      successRate: 50,
      tags: ['String', 'Math']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <PageHeader
        title="Coding Challenges"
        description="Practice with coding challenges and improve your skills"
      />

      <div className="space-y-8">
        {/* Image Carousel */}
        <div className="relative rounded-3xl overflow-hidden border border-brintelli-border bg-brintelli-card shadow-card">
          <div className="relative h-64 md:h-80 lg:h-96">
            {carouselImages.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-black/70 to-black/40 flex items-center">
                    <div className="container mx-auto px-8 text-white">
                      <h2 className="text-3xl md:text-4xl font-bold mb-3">{slide.title}</h2>
                      <p className="text-lg md:text-xl mb-6 max-w-2xl">{slide.description}</p>
                      <Button
                        variant="primary"
                        onClick={() => navigate(slide.link)}
                        className="bg-white text-brand-600 hover:bg-gray-100"
                      >
                        Explore Challenges
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-text" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-text" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-text">Featured Challenges</h2>
            <Button variant="ghost" onClick={() => navigate('/student/challenges')}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => navigate(`/student/challenges/${challenge.id}`)}
                className="group cursor-pointer rounded-xl border border-brintelli-border bg-brintelli-card p-6 transition hover:border-brand-500 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text group-hover:text-brand-600 transition">
                        {challenge.title}
                      </h3>
                      {challenge.solved && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Toggle favorite
                    }}
                  >
                    <Star className="h-4 w-4 text-textMuted hover:text-yellow-500 transition" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{challenge.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{challenge.points} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{challenge.successRate}% solved</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {challenge.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full bg-brintelli-baseAlt text-xs text-textMuted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {challenge.attempts > 0 && (
                  <p className="text-xs text-textMuted">
                    {challenge.attempts} attempt{challenge.attempts > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Challenges;
