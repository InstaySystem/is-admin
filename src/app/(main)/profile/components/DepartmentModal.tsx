/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Department } from "@/types/user";
import {
  updateDepartment,
  deleteDepartment,
  getDepartments,
} from "@/apis/department";

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  userId: number | undefined;
  department?: Department;
  onUpdated?: (department?: Department, departmentId?: number) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function DepartmentModal({
  open,
  onClose,
  userId,
  department,
  onUpdated,
  onSuccess,
  onError,
}: DepartmentModalProps) {
  const [dept, setDept] = useState<Department | undefined>(department);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  useEffect(() => {
    setDept(
      department
        ? { ...department, description: department.description }
        : undefined
    );
  }, [department]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        setAllDepartments(res.data.data.departments || []);
      } catch (error: any) {
        console.error("Không thể tải danh sách phòng ban:", error.message);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (field: keyof Department, value: string) => {
    if (!dept) return;
    setDept({ ...dept, [field]: value });
  };

  const handleSelectDepartment = (deptId: number) => {
    const selected = allDepartments.find((d) => d.id === deptId);
    if (!selected) return;
    setDept({
      ...dept!,
      id: selected.id,
      name: selected.name,
      display_name: selected.display_name,
      description: selected.description,
    });
  };

  const handleDeleteCancel = () => setConfirmOpen(false);

  const handleDeleteConfirm = async () => {
    if (!dept || !userId) return;
    setLoading(true);
    try {
      const res = await deleteDepartment(dept.id);
      onUpdated?.(undefined, undefined);
      onSuccess?.(res.data.message);
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      onClose();
    }
  };

  const handleSave = async () => {
    if (!dept || !userId) return;
    setLoading(true);
    try {
      const updatedDept = await updateDepartment(dept.id, {
        name: dept.name,
        display_name: dept.display_name,
      });
      onUpdated?.(updatedDept.data, dept.id);
      onSuccess?.(updatedDept.data.message);
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!dept) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: -50, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 50, scale: 0.95 },
          transition: { duration: 0.3 },
          sx: { borderRadius: 3, overflow: "hidden", boxShadow: 6 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#608DBC",
            color: "white",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.25rem",
            py: 2,
          }}
        >
          Quản lý phòng ban
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography fontWeight={600} fontSize="1rem">
              Chọn phòng ban
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="department-select-label">Phòng ban</InputLabel>
              <Select
                labelId="department-select-label"
                value={dept.id ?? ""}
                label="Phòng ban"
                onChange={(e) => handleSelectDepartment(Number(e.target.value))}
              >
                {allDepartments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Tên hiển thị"
              value={dept.display_name}
              fullWidth
              size="medium"
              variant="outlined"
              disabled
            />
          </Box>

          {loading && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress size={30} />
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            justifyContent: "space-between",
            px: 4,
            py: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: "none",
              color: "grey.700",
              borderColor: "grey.400",
              "&:hover": { borderColor: "grey.600" },
            }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ borderRadius: 2, px: 4, textTransform: "none" }}
              disabled={loading}
              className="bg-[#608DBC]!"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: -20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 20, scale: 0.95 },
          transition: { duration: 0.25 },
          sx: { borderRadius: 3, p: 2 },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" color="text.secondary">
            Bạn có chắc muốn xóa phòng ban <strong>{dept.display_name}</strong>{" "}
            không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleDeleteCancel}
            sx={{ borderRadius: 2, px: 3 }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: 2, px: 3 }}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
