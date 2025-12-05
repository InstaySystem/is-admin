/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from "@/apis/department";
import { Department } from "@/types/user";
import {
  FaSearch,
  FaEdit,
  FaUserShield,
  FaTools,
  FaBroom,
  FaUtensils,
  FaShieldAlt,
} from "react-icons/fa";
import { Input } from "antd";
import DepartmentPopUp from "./components/DepartmentPopUp";
import CustomAlert from "@/components/ui/CustomAlert";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<"create" | "view" | "edit">(
    "view"
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [alert, setAlert] = useState({
    open: false,
    type: "success" as "success" | "error" | "info" | "warning",
    message: "",
  });

  const showAlert = (type: typeof alert.type, message: string) => {
    setAlert({ open: true, type, message });
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data.departments || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, []);

  const openCreate = () => {
    setSelectedDepartment(null);
    setPopupMode("create");
    setPopupOpen(true);
  };

  const openView = (dep: Department) => {
    setSelectedDepartment(dep);
    setPopupMode("view");
    setPopupOpen(true);
  };

  const openEdit = (dep: Department) => {
    setSelectedDepartment(dep);
    setPopupMode("edit");
    setPopupOpen(true);
  };

  const handlePopupOk = async (data: {
    name?: string;
    display_name?: string;
    description?: string;
  }) => {
    try {
      if (popupMode === "create") {
        const res = await createDepartment(data);
        showAlert("success", res.data.message);
      } else if (popupMode === "edit" && selectedDepartment) {
        const res = await updateDepartment(selectedDepartment.id, data);
        showAlert("success", res.data.message);
      }
      await fetchDepartments();
      setPopupOpen(false);
    } catch (err: any) {
      showAlert("error", err);
    }
  };

  const iconList = [
    <FaUserShield key={1} size={26} className="text-[#608DBC]" />,
    <FaBroom key={2} size={26} className="text-[#608DBC]" />,
    <FaUtensils key={3} size={26} className="text-[#608DBC]" />,
    <FaShieldAlt key={4} size={26} className="text-[#608DBC]" />,
    <FaTools key={5} size={26} className="text-[#608DBC]" />,
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-80 shadow-sm rounded-lg overflow-hidden">
          <Input
            placeholder="Tìm kiếm phòng ban..."
            prefix={<FaSearch className="text-gray-400 mr-2" />}
            className="py-2.5 text-base border-none focus:ring-0"
            size="large"
            allowClear
          />
        </div>

        <button
          className="cursor-pointer bg-[#608DBC] text-white px-6 py-2.5 rounded-lg hover:bg-[#4a7bb0] transition-colors shadow-md font-medium w-full md:w-auto flex items-center justify-center gap-2"
          onClick={openCreate}
        >
          <span>+</span> Thêm phòng ban
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dep, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  {iconList[index % iconList.length]}
                </div>
                <div>
                  <h2
                    className="text-lg font-bold text-gray-800 line-clamp-1"
                    title={dep.name}
                  >
                    {dep.name}
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {dep.display_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-extrabold text-2xl text-[#608DBC]">
                  {dep.staff_count}
                </span>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Nhân sự
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                className="flex-1 py-2 rounded-lg bg-[#608DBC]/10 text-[#608DBC] font-semibold hover:bg-[#608DBC] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                onClick={() => openView(dep)}
              >
                Xem chi tiết
              </button>

              <button
                className="w-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#608DBC] hover:text-[#608DBC] transition-colors"
                onClick={() => openEdit(dep)}
                title="Chỉnh sửa"
              >
                <FaEdit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <DepartmentPopUp
        open={popupOpen}
        mode={popupMode}
        initialData={selectedDepartment}
        onClose={() => setPopupOpen(false)}
        onOk={handlePopupOk}
      />

      <CustomAlert
        open={alert.open}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </div>
  );
}
