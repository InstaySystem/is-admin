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
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Tìm kiếm phòng ban..."
            prefix={<FaSearch className="text-gray-400" />}
            className="text-black py-2"
            size="large"
          />
        </div>

        <button
          className="cursor-pointer bg-[#608DBC] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full md:w-auto"
          onClick={openCreate}
        >
          Thêm phòng ban
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dep, index) => (
          <div
            key={index}
            className="shadow-sm rounded-xl p-4 bg-white flex flex-col justify-between h-auto"
          >
            <div className="flex justify-between items-start w-full">
              <div className="flex items-start gap-3">
                {iconList[index % iconList.length]}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {dep.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{dep.display_name}</p>
                </div>
              </div>

              <div className="text-gray-700 text-sm flex flex-col items-end">
                <span className="font-bold text-xl">{dep.staff_count}</span>
                <span>nhân viên</span>
              </div>
            </div>

            <div className="flex mt-4 gap-2">
              <button
                className="cursor-pointer w-full py-2 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 bg-[#608DBC]"
                onClick={() => openView(dep)}
              >
                👁 Xem chi tiết
              </button>

              <button
                className="cursor-pointer text-gray-600 hover:text-gray-800 border border-gray-200 px-3 rounded-md flex items-center"
                onClick={() => openEdit(dep)}
              >
                <FaEdit size={18} />
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
