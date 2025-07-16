"use client";
import CuttingGlassPage from "../CuttingGlassPage";

export default function Page({ params }: { params: { productionOrderId: string } }) {
  return <CuttingGlassPage productionOrderId={params.productionOrderId} />;
} 