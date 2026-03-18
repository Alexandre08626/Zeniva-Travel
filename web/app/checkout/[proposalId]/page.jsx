export const dynamic = "force-dynamic";
import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#f8fafc"}}><div style={{textAlign:"center"}}><div style={{fontSize:40,marginBottom:16}}>✈️</div><p style={{color:"#64748b"}}>Loading your trip…</p></div></div>}>
      <CheckoutClient />
    </Suspense>
  );
}
