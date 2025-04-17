import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import PaidIcon from "@mui/icons-material/Paid";
import SettingsIcon from "@mui/icons-material/Settings";
import StoreIcon from "@mui/icons-material/Store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { useUser } from "../context/UserContext";
import { HorizontaLDots } from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};
const AppSidebar: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([
    // {
    //   icon: <DashboardIcon />,
    //   name: "Dashboard",
    //   path: "/",
    // },
    {
      icon: <InfoOutlinedIcon />,
      name: "Appointments",
      path: "/",
    },
    {
      icon: <CalendarMonthIcon />,
      name: "Calendar",
      path: "/calendar",
    },
    {
      icon: <CalendarMonthIcon />,
      name: "Barber Leave",
      path: "/barber-leave",
    },
    {
      icon: <PaidIcon />,
      name: "Transactions",
      path: "/transactions",
    },
    {
      name: "Manage",
      icon: <LayersIcon />,
      subItems: [{ name: "Leave Approval", path: "/leave-Management" }],
    },
    {
      icon: <GroupsIcon />,
      name: "Teams",
      path: "/teams",
    },
    {
      icon: <StoreIcon />,
      name: "Shop Settings",
      path: "/shops",
    },
    {
      icon: <SettingsIcon />,
      name: "Settings",
      path: "/settings",
    },
  ]);
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname == path,
    [location.pathname]
  );
  const user = useUser();
  useEffect(() => {
    filterBasedOnRole();
    // console.log("userrole", navItems);
  }, [user.role]);

  const filterBasedOnRole = () => {
    // console.log(navItems);
    // console.log("User role:", user.role);
    if (user.role !== "Manager") {
      console.log("User role is not StylistManager, filtering nav items.");
      setNavItems(
        navItems
          .filter((item) => {
            return item.name != "Teams";
          })
          .filter((item) => {
            return item.name != "Shop Settings";
          })
          .filter((item) => {
            return item.name != "Transactions";
          })
      );
    }
  };
  useEffect(() => {
    filterBasedOnRole();
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
    // console.log("isActive", navItems);
  }, [location, isActive]);

  useEffect(() => {
    filterBasedOnRole;
    if (openSubmenu !== null) {
      const key = `${openSubmenu}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
    // console.log("openSubmenu", navItems);
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden w-full h-auto object-contain"
                src="/images/logo/logobuzzbook_cropped.png"
                alt="Logo"
              />
              <img
                className="hidden dark:block w-full h-auto object-contain brightness-0 invert"
                src="/images/logo/logobuzzbook_cropped.png"
                alt="Logo"
              />
            </>
          ) : (
            <>
              <img
                className="dark:hidden w-8 h-8 object-contain"
                src="/images/logo/logobuzzbook_cropped.png"
                alt="Logo"
              />
              <img
                className="hidden dark:block w-8 h-8 object-contain brightness-0 invert"
                src="/images/logo/logobuzzbook_cropped.png"
                alt="Logo"
              />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div>
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Menu"
              ) : (
                <HorizontaLDots className="size-6" />
              )}
            </h2>
            <ul className="flex flex-col gap-4">
              {navItems.map((nav, index) => (
                <li key={nav.name}>
                  {nav.subItems ? (
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`menu-item group ${
                        openSubmenu === index
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      } cursor-pointer ${
                        !isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          openSubmenu === index
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <ExpandMoreIcon
                          className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                            openSubmenu === index
                              ? "rotate-180 text-brand-500"
                              : ""
                          }`}
                        />
                      )}
                    </button>
                  ) : (
                    nav.path && (
                      <Link
                        to={nav.path}
                        className={`menu-item group ${
                          isActive(nav.path)
                            ? "menu-item-active"
                            : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`menu-item-icon-size ${
                            isActive(nav.path)
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text">{nav.name}</span>
                        )}
                      </Link>
                    )
                  )}
                  {nav.subItems &&
                    (isExpanded || isHovered || isMobileOpen) && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[`${index}`] = el;
                        }}
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          height:
                            openSubmenu === index
                              ? `${subMenuHeight[`${index}`]}px`
                              : "0px",
                        }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                className={`menu-dropdown-item ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                }`}
                              >
                                {subItem.name}
                                <span className="flex items-center gap-1 ml-auto">
                                  {subItem.new && (
                                    <span
                                      className={`ml-auto menu-dropdown-badge`}
                                    >
                                      new
                                    </span>
                                  )}
                                  {subItem.pro && (
                                    <span
                                      className={`ml-auto menu-dropdown-badge`}
                                    >
                                      pro
                                    </span>
                                  )}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
