"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaBell,
  FaUsers,
  FaCog,
  FaCommentDots,
  FaBullhorn,
  FaUser,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import Image from "next/image";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const menuItems = [
  { name: "Dashboard", icon: <FaChartLine />, path: "/dashboard" },
  { name: "Guest Requests", icon: <FaBell />, path: "/guest-requests" },
  { name: "Services Management", icon: <FaCog />, path: "/services" },
  { name: "Feedback Center", icon: <FaCommentDots />, path: "/feedback" },
  { name: "Analytics", icon: <FaChartLine />, path: "/analytics" },
  { name: "Marketing & Campaign", icon: <FaBullhorn />, path: "/marketing" },
  { name: "Settings", icon: <FaCog />, path: "/settings" },
  { name: "Staff", icon: <FaUsers />, path: "/staff" },
  { name: "Department", icon: <FaUsers />, path: "/department" },
  { name: "Profile", icon: <FaUser />, path: "/profile" },
];

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.div
      animate={{ width: isOpen ? 240 : 70 }}
      className="h-screen bg-white shadow-md flex flex-col overflow-hidden relative text-black transition-all duration-300"
    >
      <div className="flex items-center px-2 py-4 border-b border-gray-200">
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
                src="/images/logo.png"
                width={30}
                height={30}
                alt="Logo"
                className="object-cover"
              />
              <span className="text-blue-600 font-bold text-lg whitespace-nowrap">
                Instay Admin
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-semibold"
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
                      className="whitespace-nowrap"
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
              &copy; 2025 Instay Admin
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
