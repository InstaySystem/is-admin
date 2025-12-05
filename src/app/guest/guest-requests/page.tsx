import { Suspense } from "react";
import GuestRequestClient from "./GuestRequestClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <GuestRequestClient />
    </Suspense>
  );
}
