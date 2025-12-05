"use client";
import { Button } from "antd";

export default function VerifySuccess() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Welcome</h1>
      <p className="mb-6">Chao mung den voi instay</p>
      <Button type="primary">Lượn</Button>
    </div>
  );
}
