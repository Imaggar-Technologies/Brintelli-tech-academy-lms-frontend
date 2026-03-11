import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Back breadcrumb for every page. Renders a "Back" button and optional breadcrumb trail.
 * @param {Array<{ label: string, path?: string }>} items - Breadcrumb items; last item is current page (no path)
 * @param {string} [backLabel='Back'] - Label for the back button
 */
const Breadcrumb = ({ items = [], backLabel = "Back" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    const withPath = items.filter((i) => i.path);
    if (withPath.length > 0) {
      navigate(withPath[withPath.length - 1].path);
    } else {
      navigate(-1);
    }
  };

  if (!items.length) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-textMuted mb-4" aria-label="Breadcrumb">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1 hover:text-text font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </button>
      {items.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 text-brintelli-border" aria-hidden />
          <ol className="flex flex-wrap items-center gap-1">
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-brintelli-border mx-0.5">/</span>
                  )}
                  {item.path && !isLast ? (
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="hover:text-text transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className={isLast ? "text-text font-medium" : ""}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
