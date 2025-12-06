/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, Spin, message } from "antd";
import { getMyReview, createReview, updateReview } from "@/apis/reviews";
import { Review, CreateReviewRequest } from "@/types/reviews";
import ReviewModal from "../components/ReviewModal";

export default function GuestReviewPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchReview = async () => {
    try {
      setLoading(true);
      const res = await getMyReview();
      const reviewData = res.data.data.review || null;
      setReview(reviewData);
    } catch (error: any) {
      if (error === "review not found") {
        setReview(null);
        setModalOpen(true);
      } else {
        messageApi.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, []);

  const handleSubmit = async (data: CreateReviewRequest) => {
    console.log("CLICK SUBMIT", { data, review });
    setSubmitting(true);

    try {
      if (review) {
        console.log("Updating review ID:", review.id);
        const res = await updateReview(review.id, data);
        console.log("Update response:", res);
        messageApi.success(res.data.message || "Cập nhật đánh giá thành công");
      } else {
        console.log("Creating new review");
        const res = await createReview(data);
        console.log("Create response:", res);
        messageApi.success(res.data.message || "Tạo đánh giá thành công");
      }

      await fetchReview();
      setModalOpen(false);
    } catch (err: any) {
      console.error("Submit error:", err);
      messageApi.error(err);
    } finally {
      setSubmitting(false);
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
    <div className="p-4 max-w-lg mx-auto">
      {contextHolder}
      <h1 className="text-2xl font-semibold text-center mb-4 text-black">
        Đánh giá của tôi
      </h1>

      {!review ? (
        <div className="text-center mb-4 space-y-3">
          <div className="text-gray-500">Bạn chưa có đánh giá nào</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setModalOpen(true)}
          >
            Đánh giá
          </button>
        </div>
      ) : (
        <Card
          key={review.id}
          hoverable
          className="cursor-pointer border border-gray-200 shadow-lg rounded-xl transition-transform transform hover:-translate-y-1 hover:shadow-2xl"
          onClick={() => setModalOpen(true)}
        >
          <div className="flex justify-between items-start space-x-4">
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1">
                {review.email}
              </div>
              <div className="text-gray-700 text-sm mb-2">{review.content}</div>
              <div className="flex items-center">
                <span className="text-yellow-500 text-lg mr-2">
                  {Array.from({ length: review.star }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </span>
                <span className="text-gray-500 text-sm">{review.star}/5</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        </Card>
      )}

      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={review}
        loading={submitting}
      />
    </div>
  );
}
