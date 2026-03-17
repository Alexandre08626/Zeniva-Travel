export const dynamic = "force-dynamic";
import { Suspense } from "react";
import PassengersClient from "./PassengersClient";

export default function PassengersPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>}>
      <PassengersClient />
    </Suspense>
  );
}
