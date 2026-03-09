import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * In-app confirmation dialog using our Modal and design system.
 * Use instead of window.confirm() for a consistent experience.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
      : "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text">{message}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "primary" : "secondary"}
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 ${confirmButtonClass}`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                Please wait…
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
