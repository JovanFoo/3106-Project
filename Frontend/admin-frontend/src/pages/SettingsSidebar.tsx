import { useCallback } from "react";
import { Link, useLocation } from "react-router";

// MUI Icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockResetIcon from "@mui/icons-material/LockReset";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import WorkIcon from "@mui/icons-material/Work";

const settingsNavItems = [
  {
    icon: <AccountCircleIcon className="w-6 h-6" />,
    name: "Profile",
    path: "/settings/profile",
  },
  {
    icon: <LockResetIcon className="w-6 h-6" />,
    name: "Change Password",
    path: "/settings/change-password",
  },
  // {
  //   icon: <PsychologyIcon className="w-6 h-6" />,
  //   name: "Expertise",
  //   path: "/settings/expertise",
  // },
  // {
  //   icon: <WorkIcon className="w-6 h-6" />,
  //   name: "Portfolio",
  //   path: "/settings/portfolio",
  // },
  // {
  //   icon: <ThumbUpAltIcon className="w-6 h-6" />,
  //   name: "Testimonials",
  //   path: "/settings/testimonials",
  // },
];

const SettingsSidebar = () => {
  const location = useLocation();

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  return (
    <aside className="w-[250px] min-h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
      </div>
      <nav>
        <div className="flex flex-col gap-4">
          {settingsNavItems.map((nav) => (
            <Link
              key={nav.name}
              to={nav.path}
              className={`flex items-center gap-3 p-3 rounded-md transition-all duration-200 ${
                isActive(nav.path)
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {nav.icon}
              <span>{nav.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
