/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button, message, Modal, Tag, Card } from "antd";
import { getServiceTypesForGuest } from "@/apis/services";
import { Service, ServiceType } from "@/types/service";
import { getServiceTypesBySlug } from "@/apis/service_types";
import { useRouter } from "next/navigation";
import { getRequestTypesForGuest } from "@/apis/request_type";
import CreateRequestModal from "./components/CreateRequestModal";
import Image from "next/image";

export default function GuestServicePage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [requestTypes, setRequestTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<any>(null);

  const router = useRouter();

  const viewServiceType = (record: any) => {
    router.push(`/guest/${record.slug}`);
  };

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const res = await getServiceTypesForGuest();
      const requestTypesRes = await getRequestTypesForGuest();
      setServiceTypes(res.data.data.service_types || []);
      setRequestTypes(requestTypesRes.data.data.request_types || []);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải danh sách dịch vụ");
    }
    setLoading(false);
  };

  const openServiceModal = async (record: ServiceType) => {
    setModalTitle(record.name);
    setServices([]);
    setIsModalOpen(true);
    setServicesLoading(true);

    try {
      const res = await getServiceTypesBySlug(record.slug);
      setServices(res.data.data.service_type.services || []);
    } catch (error: any) {
      message.error(error.message || "Không thể tải danh sách dịch vụ");
    }

    setServicesLoading(false);
  };

  const handleRequestModalOpen = (item: any) => {
    setRequestType(item);
    setIsRequestModalOpen(true);
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gray-50 space-y-3">
      <header className="text-center text-2xl font-bold text-black flex justify-center">
        <div className="md:w-40 w-20">
          <Image
            className="object-cover"
            src="/images/logo.jpg"
            width={100}
            height={100}
            alt="logo"
          />
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-black">Dịch Vụ</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {serviceTypes.map((item) => (
            <Card
              key={item.id}
              loading={loading}
              onClick={() => openServiceModal(item)}
              className="shadow-sm hover:shadow-md transition cursor-pointer"
              title={<span className="font-semibold">{item.name}</span>}
            ></Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 text-black">Yêu Cầu</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {requestTypes.map((item) => (
            <Card
              key={item.id}
              loading={loading}
              className="shadow-sm hover:shadow-md transition"
              title={<span className="font-semibold">{item.name}</span>}
              onClick={handleRequestModalOpen.bind(null, item)}
            >
              <p className="text-gray-500 mb-3">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Modal
        open={isModalOpen}
        title={`Dịch vụ thuộc loại: ${modalTitle}`}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {servicesLoading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <Card key={svc.id} className="border rounded-md">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{svc.name}</p>
                    <Tag color="blue" className="mt-2">
                      {svc.price.toLocaleString()}₫
                    </Tag>
                  </div>

                  <Button type="primary" onClick={() => viewServiceType(svc)}>
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      <CreateRequestModal
        open={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        requestTypeId={requestType ? requestType.id : 0}
        request={requestType ? requestType.name : ""}
      />
    </div>
  );
}
