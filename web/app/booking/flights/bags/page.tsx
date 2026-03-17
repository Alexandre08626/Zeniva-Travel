export const dynamic = "force-dynamic";
import { Suspense } from "react";
import BagsClient from "./BagsClient";

export default function BagsPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>}>
      <BagsClient />
    </Suspense>
  );
}
