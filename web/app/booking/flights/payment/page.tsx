export const dynamic = "force-dynamic";
import { Suspense } from "react";
import PaymentClient from "./PaymentClient";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>}>
      <PaymentClient />
    </Suspense>
  );
}
