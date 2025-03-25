import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  InfoIcon
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  { icon: <GridIcon className="w-6 h-6" />, name: "Dashboard", path: "/" },
  { icon: <InfoIcon className="w-6 h-6" />, name: "Appointments", path: "/appointments" },
  { icon: <CalenderIcon className="w-6 h-6" />, name: "Calendar", path: "/calendar" },
  { icon: <DollarLineIcon className="w-6 h-6" />, name: "Transactions", path: "/transactions" },
  { icon: <HorizontaLDots className="w-6 h-6" />, name: "Analytics", path: "/analytics" },
  { icon: <HorizontaLDots className="w-6 h-6" />, name: "Teams", path: "/teams" },
  { icon: <HorizontaLDots className="w-6 h-6" />, name: "Shop Settings", path: "/shopSettings" },
  { icon: <HorizontaLDots className="w-6 h-6" />, name: "Settings", path: "/settings" },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname.startsWith(path),
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path!)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prevHeights) => ({
        ...prevHeights,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex justify-center sticky top-0 bg-white dark:bg-gray-900 z-10">
        <Link to="/">
          <img className="dark:hidden w-32" src="/images/logo/logo.svg" alt="Logo" />
          <img className="hidden dark:block w-32" src="/images/logo/logo-dark.svg" alt="Logo" />
        </Link>
      </div>
      <nav className="mb-6">
        <div className="flex flex-col gap-4">
          {navItems.map((nav, index) => (
            <div key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`menu-item group ${
                    openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  {nav.icon}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon className="ml-auto w-5 h-5" />
                  )}
                </button>
              ) : (
                // This is for setting active link
                <Link
                  to={nav.path!}
                  className={`menu-item group ${isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"}`}
                >
                  {nav.icon}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
