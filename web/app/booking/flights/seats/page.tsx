export const dynamic = "force-dynamic";
import { Suspense } from "react";
import SeatsClient from "./SeatsClient";

export default function SeatsPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>}>
      <SeatsClient />
    </Suspense>
  );
}
