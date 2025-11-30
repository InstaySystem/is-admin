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
import { FiMenu } from "react-icons/fi";
import Image from "next/image";

import { useAppStore } from "@/stores/useAppStore";
import { IoChatbubbleOutline } from "react-icons/io5";

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
  {
    name: "Chat",
    icon: <IoChatbubbleOutline />,
    path: "/chat",
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
    <motion.div
      animate={{ width: isOpen ? 240 : 70 }}
      className="h-screen bg-white shadow-md flex flex-col overflow-hidden relative text-black transition-all duration-300"
    >
      <div className="flex h-[65px] items-center px-2 border-b border-gray-200">
        <button
          className="p-2 focus:outline-none cursor-pointer"
          onClick={toggle}
        >
          <FiMenu size={24} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
      </div>

      <nav className="flex-1 mt-4">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-100 text-[#608DBC] font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>

                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-600 text-sm"
            >
              &copy; 2025 Instay Application
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
