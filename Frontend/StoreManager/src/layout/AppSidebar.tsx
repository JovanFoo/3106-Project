import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  ChevronDownIcon,
  DollarLineIcon,
  GridIcon,
  HorizontaLDots,
  InfoIcon,
  PageIcon,
} from "../icons";
import { ListItemButton, ListItemIcon, ListItemText, Chip } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

interface BaseNavItem {
  name: string;
  path?: string;
  pro?: boolean;
  new?: boolean;
  icon?: React.ReactNode;
}

interface NavItemWithSubItems extends BaseNavItem {
  subItems: (NavItemWithSubItems | BaseNavItem)[];
}

type NavItem = BaseNavItem | NavItemWithSubItems;

const isNavItemWithSubItems = (item: NavItem): item is NavItemWithSubItems => {
  return 'subItems' in item;
};

const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
  if (isNavItemWithSubItems(item)) {
    return (
      <ListItemButton>
        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
        <ListItemText primary={item.name} />
        <ExpandMore />
      </ListItemButton>
    );
  }
  
  return (
    <ListItemButton component={Link} to={item.path || '/'}>
      <ListItemText primary={item.name} />
      {item.pro && <Chip label="Pro" size="small" color="primary" />}
      {item.new && <Chip label="New" size="small" color="secondary" />}
    </ListItemButton>
  );
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Ecommerce", path: "/" }],
  },
  {
    icon: <InfoIcon />,
    name: "Appointments",
    path: "/appointments",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <DollarLineIcon />,
    name: "Transactions",
    path: "/transactions",
  },
  {
    name: "Manage",
    icon: <PageIcon />,
    subItems: [
      {
        name: "Leave Management",
        icon: <CalenderIcon />,
        subItems: [
          { name: "Leave Approval", path: "/leave-management" },
          { name: "Emergency Leave", path: "/emergency-leave" },
          { name: "Documentation Approval", path: "/leave-document-approval" }
        ]
      },
      { name: "Expertise & Pricing", path: "/expertise-pricing" },
      { name: "Ratings & Reviews", path: "/ratings-reviews" }
    ],
  },
  {
    icon: <HorizontaLDots />,
    name: "Analytics",
    path: "/analytics",
  },
  {
    icon: <HorizontaLDots />,
    name: "Teams",
    path: "/teams",
  },
  {
    icon: <HorizontaLDots />,
    name: "Shop Settings",
    path: "/shopSettings",
  },
  {
    icon: <HorizontaLDots />,
    name: "Settings",
    path: "/settings",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path?: string) => path ? location.pathname === path : false, [location.pathname]);

  useEffect(() => {
    let activeSubmenus: string[] = [];

    const checkSubmenuItems = (items: (NavItemWithSubItems | BaseNavItem)[], parentIndex?: string): boolean => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const currentIndex = parentIndex ? `${parentIndex}-${i}` : `${i}`;
        
        if (isNavItemWithSubItems(item)) {
          if (item.subItems && checkSubmenuItems(item.subItems, currentIndex)) {
            activeSubmenus.push(currentIndex);
            return true;
          }
        } else if (item.path && isActive(item.path)) {
          if (parentIndex) {
            activeSubmenus.push(parentIndex);
          }
          return true;
        }
      }
      return false;
    };

    checkSubmenuItems(navItems);
    setOpenSubmenus(activeSubmenus);
  }, [location, isActive]);

  useEffect(() => {
    openSubmenus.forEach(submenuKey => {
      if (subMenuRefs.current[submenuKey]) {
        setSubMenuHeight(prevHeights => ({
          ...prevHeights,
          [submenuKey]: subMenuRefs.current[submenuKey]?.scrollHeight || 0,
        }));
      }
    });
  }, [openSubmenus]);

  const handleSubmenuToggle = (index: string) => {
    setOpenSubmenus(prev => {
      const isOpen = prev.includes(index);
      if (isOpen) {
        return prev.filter(item => !item.startsWith(index));
      } else {
        return [...prev, index];
      }
    });
  };

  const renderNavItem = (item: NavItem, index?: string, level: number = 0) => {
    if (isNavItemWithSubItems(item)) {
      const isOpen = openSubmenus.includes(index || '');
      return (
        <>
          <button
            onClick={() => index !== undefined && handleSubmenuToggle(index)}
            className={`menu-item group ${
              isOpen ? "menu-item-active" : "menu-item-inactive"
            } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
          >
            <span className={`menu-item-icon-size ${isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
              {item.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{item.name}</span>}
            {(isExpanded || isHovered || isMobileOpen) && (
              <ChevronDownIcon
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
              />
            )}
          </button>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                if (index !== undefined) {
                  subMenuRefs.current[index] = el;
                }
              }}
              className="overflow-hidden transition-all duration-300"
              style={{ height: isOpen ? `${subMenuHeight[index || '']}px` : "0px" }}
            >
              <ul className={`mt-2 space-y-1 ${level === 0 ? "ml-9" : "ml-4"}`}>
                {item.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name}>
                    {isNavItemWithSubItems(subItem) ? (
                      renderNavItem(subItem, `${index}-${subIndex}`, level + 1)
                    ) : (
                      <Link 
                        to={subItem.path || '/'} 
                        className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && <span className="menu-dropdown-badge">new</span>}
                          {subItem.pro && <span className="menu-dropdown-badge">pro</span>}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      );
    }

    return (
      item.path && (
        <Link to={item.path} className={`menu-item group ${isActive(item.path) ? "menu-item-active" : "menu-item-inactive"}`}>
          <span className={`menu-item-icon-size ${isActive(item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
            {item.icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{item.name}</span>}
        </Link>
      )
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div>
            <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
              {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
            </h2>
            <ul className="flex flex-col gap-4">
              {navItems.map((nav, index) => (
                <li key={nav.name}>
                  {renderNavItem(nav, index.toString(), 0)}
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
