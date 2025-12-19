import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { salesUsers } from "../data/users";
import Button from "./Button";

const SalesUserSelector = ({ currentUserId, onUserChange }) => {
  const [selectedUser, setSelectedUser] = useState(currentUserId || "sales-agent");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedUser(currentUserId || "sales-agent");
  }, [currentUserId]);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setIsOpen(false);
    if (onUserChange) {
      onUserChange(userId);
    }
  };

  const currentUser = salesUsers[selectedUser] || salesUsers["sales-agent"];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">{currentUser.name}</span>
        <span className="sm:hidden">{currentUser.avatar}</span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-brintelli-border bg-brintelli-card p-2 shadow-lg">
            <div className="space-y-1">
              {Object.values(salesUsers).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                    selectedUser === user.id
                      ? "bg-brand-soft/20 text-brand border border-brand/30"
                      : "hover:bg-brintelli-baseAlt text-textSoft"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-textMuted">{user.roleLabel}</p>
                    </div>
                    {selectedUser === user.id && (
                      <div className="h-2 w-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesUserSelector;

