/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Department } from "@/types/user";

type Mode = "create" | "edit" | "view";

interface DepartmentPopUpProps {
  open: boolean;
  mode: Mode;
  initialData?: Department | null;
  onClose: () => void;
  onOk: (data: {
    name?: string;
    display_name?: string;
    description?: string;
  }) => void;
}

export default function DepartmentPopUp({
  open,
  mode,
  initialData,
  onClose,
  onOk,
}: DepartmentPopUpProps) {
  const [form, setForm] = useState({
    name: "",
    display_name: "",
    description: "",
  });

  const isView = mode === "view";

  useEffect(() => {
    if (initialData && mode !== "create") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: initialData.name || "",
        display_name: initialData.display_name || "",
        description: initialData.description || "",
      });
    } else {
      setForm({
        name: "",
        display_name: "",
        description: "",
      });
    }
  }, [initialData, mode]);

  const handleSave = () => {
    onOk({
      name: form.name || undefined,
      display_name: form.display_name || undefined,
      description: form.description || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, y: -40, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 30, scale: 0.95 },
        transition: { duration: 0.25 },
        sx: { borderRadius: 3, overflow: "hidden", boxShadow: 6 },
      }}
    >
      {/* Header */}
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
        {mode === "create" && "Thêm phòng ban"}
        {mode === "edit" && "Chỉnh sửa phòng ban"}
        {mode === "view" && "Thông tin phòng ban"}
      </DialogTitle>

      {/* Content */}
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
            Thông tin phòng ban
          </Typography>

          <TextField
            label="Tên phòng ban"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            disabled={isView}
          />

          <TextField
            label="Tên hiển thị"
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            fullWidth
            disabled={isView}
          />

          <TextField
            label="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            minRows={3}
            fullWidth
            disabled={isView}
          />
        </Box>
      </DialogContent>

      <Divider />

      {/* Actions */}
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
        >
          Đóng
        </Button>

        {mode !== "view" && (
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: "none",
              bgcolor: "#608DBC",
              "&:hover": { bgcolor: "#4a7bb0" },
            }}
          >
            {mode === "edit" ? "Cập nhật" : "Tạo mới"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
