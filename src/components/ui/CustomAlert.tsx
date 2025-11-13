"use client";

import { Snackbar, Alert, AlertColor } from "@mui/material";
import { useState, useEffect } from "react";

interface CustomAlertProps {
  open: boolean;
  message: string;
  type?: AlertColor;
  duration?: number;
  onClose?: () => void;
}

export default function CustomAlert({
  open,
  message,
  type = "info",
  duration = 3000,
  onClose,
}: CustomAlertProps) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <Snackbar
      open={visible}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
