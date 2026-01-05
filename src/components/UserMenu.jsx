import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, RefreshCw, Settings, User as UserIcon } from "lucide-react";
import { getDefaultUser } from "../data/users";
import { handleLogout } from "../utils/auth";
import { store } from "../store";
import { selectCurrentUser } from "../store/slices/authSlice";

const profilePaths = {
  student: "/student/profile",
  sales: "/sales/profile",
  tutor: "/tutor/profile",
  lsm: "/lsm/profile",
  mentor: "/mentor/profile",
  placement: "/placement/profile",
  "program-manager": "/program-manager/profile",
  finance: "/finance/profile",
  marketing: "/marketing/profile",
  "external-hr": "/external-hr/profile",
};

const settingsPaths = {
  student: "/student/settings",
  sales: "/sales/settings",
  tutor: "/tutor/settings",
  lsm: "/lsm/settings",
  mentor: "/mentor/settings",
  placement: "/placement/settings",
  "program-manager": "/program-manager/settings",
  finance: "/finance/settings",
  marketing: "/marketing/settings",
  "external-hr": "/external-hr/settings",
  admin: "/admin/settings",
};

// Role label mapping for display
const roleLabelMap = {
  sales_agent: "Sales Agent",
  sales_lead: "Sales Lead",
  sales_head: "Sales Head",
  sales_admin: "Sales Admin",
  sales: "Dashboard",
  student: "Student",
  tutor: "Tutor",
  lsm: "Learning Success Manager",
  mentor: "Mentor",
  "program-manager": "Program Manager",
  finance: "Finance Management",
  marketing: "Marketing Operations",
  placement: "Placement Officer",
  admin: "Admin",
};

const UserMenu = ({ role = "student", roleLabel = "Student LMS", userId }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  // Get user data from Redux first, then fallback to defaults
  const currentUser = useMemo(() => {
    // Use actual logged-in user data if available
    if (user) {
      const userRole = user.role || role;
      const displayRole = roleLabelMap[userRole] || roleLabel;
      
      return {
        name: user.fullName || user.name || "User",
        email: user.email || "user@brintelli.com",
        avatar: user.fullName 
          ? `${user.fullName.split(' ')[0]?.[0] || ''}${user.fullName.split(' ')[1]?.[0] || user.fullName.split(' ')[0]?.[1] || ''}`.toUpperCase()
          : "U",
        title: displayRole,
        role: userRole,
      };
    }
    
    // Fallback to default user data
    if (userId && role === "sales") {
      return getDefaultUser(userId);
    }
    if (role === "sales") {
      // Default to sales agent if no userId specified
      return getDefaultUser("sales-agent");
    }
    // Fallback for other roles
    return {
      name: "Aishwarya K",
      email: "aishwarya@brintelli.com",
      avatar: "AK",
    };
  }, [user, role, userId]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = useMemo(() => {
    if (currentUser.avatar) {
      return currentUser.avatar;
    }
    const [first = "", second = ""] = currentUser.name.split(" ");
    return `${first.charAt(0)}${second.charAt(0) || first.charAt(1)}`.toUpperCase();
  }, [currentUser]);

  const handleSelect = (action) => {
    setOpen(false);

    if (action === "profile") {
      const target = profilePaths[role];
      if (target) {
        navigate(target);
      }
      return;
    }

    if (action === "settings") {
      const target = settingsPaths[role] ?? profilePaths[role];
      if (target) {
        navigate(target);
      }
      return;
    }


    if (action === "logout") {
      handleLogout(dispatch, navigate, store.getState);
    }
  };

  const menuItems = [
    { key: "profile", label: "Profile", icon: UserIcon },
    { key: "settings", label: "Settings", icon: Settings },
    { key: "logout", label: "Logout", icon: LogOut },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-3 rounded-full border border-brintelli-border bg-white/80 px-1.5 py-1 shadow-card backdrop-blur transition duration-160 hover:border-brand hover:bg-white"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-heading text-sm font-semibold text-white shadow-glow">
          {initials}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-14 z-40 w-64 rounded-2xl border border-white/40 bg-white/85 p-4 shadow-glass backdrop-blur-lg"
          >
            <div className="rounded-xl bg-white/80 p-3 shadow-inner">
              <p className="text-sm font-semibold text-text">{currentUser.name}</p>
              {currentUser.title && (
                <p className="text-xs text-textMuted">{currentUser.title}</p>
              )}
              <p className="text-xs text-textMuted">{roleLabel}</p>
              <p className="mt-1 text-xs text-textMuted/80">{currentUser.email}</p>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const ItemIcon = item.icon;
                const isDisabled =
                  (item.key === "profile" && !profilePaths[role]) ||
                  (item.key === "settings" && !settingsPaths[role] && !profilePaths[role]);

                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelect(item.key)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition duration-160 ${
                      isDisabled
                        ? "cursor-not-allowed text-textMuted/60"
                        : "text-textSoft hover:bg-white hover:text-text"
                    }`}
                    type="button"
                    disabled={isDisabled}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft/30 text-brand">
                      <ItemIcon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;

