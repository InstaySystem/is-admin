"use client";

import { useEffect, useState } from "react";
import { getDepartments } from "@/apis/department";
import { Department } from "@/types/user";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaEdit,
  FaUserShield,
  FaTools,
  FaBroom,
  FaUtensils,
  FaShieldAlt,
} from "react-icons/fa";

export default function DepartmentPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        setDepartments(res.data.data.departments || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDepartments();
  }, []);

  const iconList = [
    <FaUserShield key={1} size={26} className="text-blue-600" />,
    <FaBroom key={2} size={26} className="text-green-600" />,
    <FaUtensils key={3} size={26} className="text-orange-600" />,
    <FaShieldAlt key={4} size={26} className="text-red-600" />,
    <FaTools key={5} size={26} className="text-purple-600" />,
  ];

  const bgColors = [
    "bg-blue-50 border-l-4 border-blue-500",
    "bg-green-50 border-l-4 border-green-500",
    "bg-orange-50 border-l-4 border-orange-500",
    "bg-red-50 border-l-4 border-red-500",
    "bg-purple-50 border-l-4 border-purple-500",
  ];

  const buttonColors = [
    "bg-blue-600 hover:bg-blue-700",
    "bg-green-600 hover:bg-green-700",
    "bg-orange-600 hover:bg-orange-700",
    "bg-red-600 hover:bg-red-700",
    "bg-purple-600 hover:bg-purple-700",
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Tìm kiếm phòng ban..."
            className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
        </div>

        <button className="bg-[#608DBC]! text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Thêm phòng ban
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((dep, index) => (
          <div
            key={index}
            className={`shadow-sm rounded-xl p-5 h-64 flex flex-col items-start justify-between ${
              bgColors[index % bgColors.length]
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                {iconList[index % iconList.length]}

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {dep.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{dep.display_name}</p>
                </div>
              </div>
            </div>

            {/* <p className="mt-3 text-gray-700 text-sm">
              <span className="font-bold text-xl">{dep.employee_count}</span>{" "}
              nhân viên
            </p> */}

            <div className="flex justify-between gap-2 items-center w-full">
              <button
                className={`self-end w-full py-2 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                  buttonColors[index % buttonColors.length]
                }`}
              >
                👁 Xem chi tiết
              </button>

              <button className="text-gray-600 hover:text-gray-800">
                <FaEdit size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
