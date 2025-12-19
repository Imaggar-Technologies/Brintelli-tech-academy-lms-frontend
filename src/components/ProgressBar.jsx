const ProgressBar = ({ value = 0 }) => {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brintelli-baseAlt/80">
      <div
        className="h-full rounded-full bg-gradient-progress animate-progress"
        style={{ width: `${safeValue}%`, backgroundSize: "200% 100%" }}
      />
    </div>
  );
};

export default ProgressBar;

