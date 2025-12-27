import PageHeader from "../../components/PageHeader";

const TutorMenteeSessions = () => {
  return (
    <>
      <PageHeader
        title="Mentee Sessions"
        description="View booked mentee sessions and upcoming calls."
      />
      <div className="rounded-2xl border border-brintelli-border/60 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-textMuted">
          Coming soon — booked sessions, session calendar, and notes.
        </p>
      </div>
    </>
  );
};

export default TutorMenteeSessions;


