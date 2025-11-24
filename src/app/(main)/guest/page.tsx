"use client";

import React, { useEffect, useState } from "react";
import { getServices } from "@/apis/services";
import { Service } from "@/types/service";
import { Card, Spin, Row, Col, message } from "antd";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await getServices({ page: 1, limit: 100 });
        setServices(res.data.data.services);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        message.error(
          err?.response?.data?.message || "Lấy danh sách dịch vụ thất bại"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Danh sách dịch vụ</h2>
      <Row gutter={[16, 16]}>
        {services.map((service) => (
          <Col key={service.id} xs={24} sm={12} md={8} lg={6}>
            <Card title={service.name}>
              <p>Giá: {service.price}</p>
              <p>
                Trạng thái:{" "}
                {service.is_active ? "Hoạt động" : "Ngưng hoạt động"}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
