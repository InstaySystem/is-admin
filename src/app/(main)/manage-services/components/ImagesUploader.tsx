/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Upload, Modal, Image, InputNumber, Checkbox } from "antd";
import { RcFile } from "antd/es/upload";
import { getBase64 } from "@/utils/image";

interface Props {
  fileList: any[];
  setFileList: (files: any[]) => void;
  setValue: (field: string, value: any[]) => void;
  handlePreview: (file: any) => void;
}

const { Dragger } = Upload;

export default function ImagesUploader({
  fileList,
  setFileList,
  setValue,
  handlePreview,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handleCancel = () => setPreviewOpen(false);

  const handleUploadChange = async (info: any) => {
    const updated = await Promise.all(
      info.fileList.map(async (fileItem: any) => {
        if (fileItem.originFileObj && !fileItem.preview) {
          fileItem.preview = await getBase64(fileItem.originFileObj as RcFile);
        }
        return {
          uid: fileItem.uid,
          name: fileItem.name,
          preview: fileItem.preview,
          url: fileItem.url,
          originFileObj: fileItem.originFileObj,
          is_thumbnail: fileItem.is_thumbnail || false,
          sort_order: fileItem.sort_order || 0,
          id: fileItem.id,
          key: fileItem.key,
        };
      })
    );
    setFileList(updated);
    setValue("images", updated);
  };

  const handleRemove = (file: any) => {
    const newList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newList);
    setValue("images", newList);
    return true;
  };

  const toggleThumbnail = (file: any) => {
    const newList = fileList.map((f) => ({
      ...f,
      is_thumbnail: f.uid === file.uid,
    }));
    setFileList(newList);
    setValue("images", newList);
  };

  const updateSortOrder = (file: any, value: number) => {
    const newList = fileList.map((f) =>
      f.uid === file.uid ? { ...f, sort_order: value } : f
    );
    setFileList(newList);
    setValue("images", newList);
  };

  return (
    <>
      <Dragger
        multiple
        accept="image/*"
        listType="picture-card"
        beforeUpload={() => false}
        onPreview={handlePreview}
        onChange={handleUploadChange}
        onRemove={handleRemove}
        fileList={fileList.map((file) => ({
          uid: file.uid,
          name: file.name || file.key || "image",
          status: "done" as const,
          url: file.url || file.preview,
          originFileObj: file.originFileObj,
          preview: file.preview || file.url,
        }))}
        className="rounded-lg border-2 border-dashed border-[#608DBC] hover:border-[#3b5998] transition-all duration-300 p-4"
      >
        <p className="ant-upload-drag-icon">+</p>
        <p className="ant-upload-text">Kéo thả hoặc click để tải ảnh</p>
      </Dragger>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {fileList.map((file) => (
          <div
            key={file.uid}
            className="flex items-center gap-2 border p-2 rounded"
          >
            <Image
              width={80}
              src={file.url || file.preview}
              alt={file.name}
              preview={{ visible: false }}
              className="rounded"
            />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <Checkbox
                  checked={file.is_thumbnail}
                  onChange={() => toggleThumbnail(file)}
                >
                  Thumbnail
                </Checkbox>
              </div>
              <div className="flex items-center gap-1">
                <span>Sort:</span>
                <InputNumber
                  min={1}
                  value={file.sort_order}
                  onChange={(val) => updateSortOrder(file, val || 0)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <Image
          alt={previewTitle}
          style={{ width: "100%" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
}
