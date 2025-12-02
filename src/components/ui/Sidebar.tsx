"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaUsers,
  FaCog,
  FaUser,
  FaRestroom,
  FaRegQuestionCircle,
  FaBookMedical,
  FaFirstOrderAlt,
} from "react-icons/fa";
// import { FiMenu } from "react-icons/fi";
import Image from "next/image";
import { LuPanelLeftClose,LuPanelLeftOpen  } from "react-icons/lu";
import { useAppStore } from "@/stores/useAppStore";
// import { IoChatbubbleOutline } from "react-icons/io5";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: <FaChartLine />, path: "/dashboard" },
  { name: "Booking", icon: <FaBookMedical />, path: "/manage-booking" },
  { name: "Rooms", icon: <FaRestroom />, path: "/manage-rooms" },
  { name: "Services", icon: <FaCog />, path: "/manage-services" },
  {
    name: "Order Services",
    icon: <FaFirstOrderAlt />,
    path: "/order-services",
  },

  {
    name: "Request",
    icon: <FaRegQuestionCircle />,
    path: "/manage-requests",
  },
  { name: "Staff", icon: <FaUsers />, path: "/staff", role: "admin-only" },
  {
    name: "Department",
    icon: <FaUsers />,
    path: "/department",
    role: "admin-only",
  },

  { name: "Profile", icon: <FaUser />, path: "/profile" },
];

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();
  const role = useAppStore((state) => state._role);

  const filteredMenu = menuItems.filter((item) => {
    if (role !== "admin" && item.role === "admin-only") return false;
    return true;
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 240 : 80 }}
      className="h-screen bg-white shadow-md flex flex-col overflow-hidden relative text-black transition-all duration-300 ease-in-out"
    >
      <div className="flex h-[65px] items-center px-2 border-b border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0  }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 ml-2"
            >
              <Image
                src="/images/logo.jpg"
                width={48}
                height={48}
                alt="Logo"
                className="object-cover"
              />

            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggle}
  className={`transition-all p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 ${isOpen ? 'ml-auto' : 'mx-auto'}`}
        >
          {isOpen ? <LuPanelLeftClose size={22} /> : <LuPanelLeftOpen size={22} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-2">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.path}>
              <li
                className={`
                  relative flex items-center py-3 px-3 rounded-xl cursor-pointer transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-50" 
                      : "hover:bg-indigo-50"
                  }
                `}
              >
                <div
                  className={`
                    p-2 rounded-lg transition-all duration-300 flex items-center justify-center 
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                        : "bg-transparent text-gray-500 group-hover:text-gray-700" 
                    }
                  `}
                >
                  {item.icon}
                </div>
                <div className={`overflow-hidden flex-1 whitespace-nowrap transition-all duration-300 w-auto opacity-100 ml-3`}>
                   <span className={`font-bold ${isActive ? "text-indigo-500" : "text-gray-600 group-hover:text-indigo-500"}`}>
                     {item.name}
                   </span>
                </div>
              </li>

              
            </Link>
          );
        })}
      </nav>

      <div className={isOpen ? `p-4 border-t border-gray-100`: `hidden`}>
        <AnimatePresence mode="wait">
          <motion.div
              key="copyright"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-gray-600 text-xs text-center font-medium whitespace-nowrap"
            >
              &copy; 2025 Instay Application
            </motion.div>
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}