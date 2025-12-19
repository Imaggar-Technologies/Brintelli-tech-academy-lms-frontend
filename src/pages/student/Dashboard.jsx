import { CalendarClock, ClipboardList, GraduationCap, Target } from "lucide-react";
import StatsCard from "../../components/StatsCard";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import NextLiveClassCard from "../../components/dashboard/NextLiveClassCard";
import ContinueLearningCard from "../../components/dashboard/ContinueLearningCard";
import Calendar from "../../components/dashboard/Calendar";
import Announcements from "../../components/dashboard/Announcements";
import AnimationWrapper from "../../components/AnimationWrapper";

const statItems = [
  {
    icon: GraduationCap,
    value: "6",
    label: "Active Courses",
    sublabel: "Across 3 tracks",
    trend: "+1 this week",
  },
  {
    icon: CalendarClock,
    value: "3",
    label: "Upcoming Classes",
    sublabel: "Next class in 2h",
    trend: "On track",
  },
  {
    icon: ClipboardList,
    value: "2",
    label: "Assignments",
    sublabel: "Due this week",
    trend: "Review now",
    trendType: "negative",
  },
  {
    icon: Target,
    value: "78%",
    label: "Overall Progress",
    sublabel: "Great momentum!",
    trend: "+5% vs last week",
  },
];

const StudentDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <WelcomeBanner />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <NextLiveClassCard />
          <ContinueLearningCard />
        </div>
        <Calendar />
      </div>

      <Announcements />
    </div>
  );
};

export default StudentDashboard;

