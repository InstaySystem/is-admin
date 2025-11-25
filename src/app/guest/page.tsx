"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Tag } from "antd";
import { getServiceTypesForGuest, getServicesBySlug } from "@/apis/services";
import { Service, ServiceType } from "@/types/service";
import { getServiceTypesBySlug } from "@/apis/service_types";
import { useRouter } from "next/navigation";

export default function GuestServicePage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const router = useRouter();

  const viewServiceType = (record: ServiceType) => {
    router.push(`/guest/${record.slug}`);
  };

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const res = await getServiceTypesForGuest();
      setServiceTypes(res.data.data.service_types || []);
    } catch (error: any) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách loại dịch vụ"
      );
    }
    setLoading(false);
  };

  const openServiceModal = async (record: ServiceType) => {
    setServices([]);
    setModalTitle(record.name);
    setIsModalOpen(true);
    setServicesLoading(true);

    try {
      const res = await getServiceTypesBySlug(record.slug);
      setServices(res.data.data.service_type.services || []);
    } catch (error: any) {
      console.error(error);
      message.error(error?.response?.data?.message || "Không thể tải dịch vụ");
    }
    setServicesLoading(false);
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const serviceTypeColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên loại dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: ServiceType) => (
        <Button type="primary" onClick={() => openServiceModal(record)}>
          Xem dịch vụ
        </Button>
      ),
    },
  ];

  const serviceColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: Service) => (
        <Tag color="blue" key={record.id}>
          {record.price.toLocaleString()} VND
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: ServiceType) => (
        <Button type="primary" onClick={() => viewServiceType(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <header className="text-center text-xl font-bold mb-4">
        Instay - Dịch vụ tiện lợi
      </header>

      <Table
        columns={serviceTypeColumns}
        dataSource={serviceTypes}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        open={isModalOpen}
        title={`Dịch vụ thuộc loại: ${modalTitle}`}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          columns={serviceColumns}
          dataSource={services}
          rowKey="id"
          loading={servicesLoading}
          pagination={false}
        />
      </Modal>
    </div>
  );
}
