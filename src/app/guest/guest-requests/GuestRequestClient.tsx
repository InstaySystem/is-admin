"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Popconfirm, message, Spin, Modal } from "antd";
import { getRequestsForGuest, updateRequestsForGuest } from "@/apis/request";

interface RequestType {
  id: number;
  name: string;
  slug: string;
}

interface Request {
  id: number;
  code: string;
  request_type: RequestType;
  content: string;
  status: string;
  created_at: string;
}

export default function GuestRequestsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [updating, setUpdating] = useState(false);

  console.log(selectedRequest);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await getRequestsForGuest({});
        setRequests(res.data.data.requests || []);
      } catch (error) {
        message.error("Không thể tải danh sách yêu cầu");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    const requestId = searchParams.get("requestId");
    if (requestId && requests.length > 0) {
      const request = requests.find((r) => r.id === parseInt(requestId));
      if (request) {
        setSelectedRequest(request);
      }
    }
  }, [requests, searchParams]);

  const handleCancelRequest = async (request: Request) => {
    if (request.status !== "pending") return;

    try {
      setUpdating(true);
      await updateRequestsForGuest(request.id, { status: "cancelled" });
      message.success("Hủy yêu cầu thành công");

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id ? { ...r, status: "cancelled" } : r
        )
      );
      setSelectedRequest(null);
    } catch (error) {
      console.error(error);
      message.error("Hủy yêu cầu thất bại");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl text-center font-semibold mb-4 text-black">
        Danh sách yêu cầu
      </h1>

      {requests.length === 0 && (
        <div className="text-center text-gray-500">Không có yêu cầu nào</div>
      )}

      <div className="space-y-3">
        {requests.map((request) => (
          <Card
            key={request.id}
            hoverable
            className="cursor-pointer"
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{request.request_type.name}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {request.content}
                </div>
              </div>
              <div
                className={`text-sm font-medium ${
                  request.status === "pending"
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                {request.status}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={`Yêu cầu ${selectedRequest?.request_type.name}`}
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        footer={
          selectedRequest?.status === "pending" ? (
            <Popconfirm
              title={`Bạn có chắc muốn hủy yêu cầu ${selectedRequest.code}?`}
              onConfirm={() =>
                selectedRequest && handleCancelRequest(selectedRequest)
              }
              okText="Hủy"
              cancelText="Đóng"
              okButtonProps={{ danger: true, loading: updating }}
            >
              <Button danger loading={updating}>
                Hủy
              </Button>
            </Popconfirm>
          ) : null
        }
      >
        {selectedRequest && (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Loại yêu cầu:</span>{" "}
              {selectedRequest.request_type.name}
            </p>
            <p>
              <span className="font-medium">Nội dung:</span>{" "}
              {selectedRequest.content}
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {selectedRequest.status}
            </p>
            <p>
              <span className="font-medium">Ngày tạo:</span>{" "}
              {new Date(selectedRequest.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
