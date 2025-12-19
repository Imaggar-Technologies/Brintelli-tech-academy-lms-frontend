import PageHeader from "../../components/PageHeader";
import CourseCard from "../../components/CourseCard";

const courses = [
  {
    id: 1,
    title: "Backend Engineering Mastery",
    mentor: "Rahul Iyer",
    progress: 64,
    nextLesson: "API Gateways - Nov 24",
    category: "Backend",
  },
  {
    id: 2,
    title: "Advanced Data Structures & Algorithms",
    mentor: "Sneha Kapoor",
    progress: 82,
    nextLesson: "Dynamic Programming Marathon - Nov 25",
    category: "Problem Solving",
  },
  {
    id: 3,
    title: "System Design for Scale",
    mentor: "Sarthak Jain",
    progress: 48,
    nextLesson: "Load Balancing Patterns - Nov 26",
    category: "Architecture",
  },
  {
    id: 4,
    title: "Frontend Craft: React & Beyond",
    mentor: "Shreya Narang",
    progress: 91,
    nextLesson: "Performance Budgets - Nov 21",
    category: "Frontend",
  },
];

const StudentMyCourses = () => {
  return (
    <>
      <PageHeader
        title="Your Learning Tracks"
        description="Access all enrolled programs, track your progress, and jump back into classes instantly."
        actions={
          <button className="rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            Explore New Courses
          </button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            mentor={course.mentor}
            progress={course.progress}
            nextLesson={course.nextLesson}
            category={course.category}
          />
        ))}
      </div>
    </>
  );
};

export default StudentMyCourses;

