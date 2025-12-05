import { Suspense } from "react";
import GuestServicesClient from "./GuestServicesClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <GuestServicesClient />
    </Suspense>
  );
}
