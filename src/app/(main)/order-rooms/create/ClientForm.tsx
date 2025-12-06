"use client";

import { Suspense } from "react";
import CreateOrderForm from "../components/CreateOrderForm";
export default function ClientForm() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải...</div>}>
      <CreateOrderForm />
    </Suspense>
  );
}
