"use client";

import QRCode from "react-qr-code";

export default function QRCodeCard({ code }: { code: string }) {
  const url = `http://localhost:3000/order-rooms/${encodeURIComponent(
    code
  )}`;

  return (
    <div className="mt-6 border rounded p-4">
      <h3 className="font-semibold mb-2 text-black">QR Code</h3>
      <div className="bg-white p-4 inline-block">
        <QRCode value={url} />
      </div>

      <p className="text-xs mt-3 break-all text-black">{url}</p>
    </div>
  );
}
