import AnimationWrapper from "./AnimationWrapper";
import { ArrowRight, Clock3 } from "lucide-react";
import ProgressBar from "./ProgressBar";
import Button from "./Button";

const CourseCard = ({ title, mentor, progress = 0, nextLesson, category = "Specialization" }) => {
  return (
    <AnimationWrapper className="group flex flex-col overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card transition duration-160 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-40 w-full bg-gradient-heading">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_70%)]" />
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 text-white">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-white/80">{category}</span>
          <h3 className="text-xl font-semibold leading-snug drop-shadow-sm">{title}</h3>
          {mentor && <p className="text-sm font-normal text-white/85">Mentor: {mentor}</p>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-textSoft">Course Progress</span>
          <span className="font-semibold text-text">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
        {nextLesson && (
          <div className="flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-xs font-medium text-textSoft">
            <Clock3 className="h-4 w-4 text-brand" />
            Next class: {nextLesson}
          </div>
        )}
        <Button variant="primary" className="mt-auto w-full justify-between">
          <span>Continue Learning</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </AnimationWrapper>
  );
};

export default CourseCard;

