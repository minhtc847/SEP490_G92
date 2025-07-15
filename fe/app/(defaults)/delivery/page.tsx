"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  fetchDeliveryOrdersByProductionPlanId,
  fetchDeliveryHistoryByProduct,
  createDeliveryHistory,
  DeliveryOrder,
  DeliveryHistoryItem,
} from "./service";

export interface DeliveryProduct {
  id: number;
  productName: string;
  quantity: number;
  done: number; // số lượng đã xong
  totalAmount: number;
  delivered: number;
  lastDeliveryDate: string;
  note?: string;
}

const productionPlanId = 0; // TODO: lấy từ route hoặc props nếu cần

const DeliveryPage = () => {
  const [orders, setOrders] = React.useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedOrderId, setExpandedOrderId] = React.useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
  const [deliveryHistory, setDeliveryHistory] = React.useState<DeliveryHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [form, setForm] = React.useState({ deliveryDate: "", quantity: "", note: "" });
  const [formLoading, setFormLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetchDeliveryOrdersByProductionPlanId(productionPlanId)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleShowDetail = async (prod: any, total: number, delivered: number) => {
    setSelectedProduct({ ...prod, total, delivered });
    setExpandedOrderId(prod.id);
    setHistoryLoading(true);
    try {
      const history = await fetchDeliveryHistoryByProduct(prod.id);
      setDeliveryHistory(history);
    } catch {
      setDeliveryHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setExpandedOrderId(null);
    setSelectedProduct(null);
    setDeliveryHistory([]);
    setForm({ deliveryDate: "", quantity: "", note: "" });
    setFormLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormLoading(true);
    try {
      const newHistory = await createDeliveryHistory(selectedProduct.id, {
        deliveryDate: form.deliveryDate,
        quantity: Number(form.quantity),
        note: form.note,
      });
      setDeliveryHistory((prev) => [...prev, newHistory]);
      setForm({ deliveryDate: "", quantity: "", note: "" });
    } catch {
      alert("Tạo giao hàng thất bại!");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Danh sách trình trạng giao hàng</h1>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div>
                  <span className="font-semibold">Ngày đặt hàng:</span> {order.orderDate}
                  <span className="ml-6 font-semibold">Khách hàng:</span> {order.customerName}
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="italic text-gray-500">Ghi chú: {order.note}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Tên sản phẩm</th>
                      <th className="border px-2 py-1">Số lượng cần giao</th>
                      <th className="border px-2 py-1">Thành tiền</th>
                      <th className="border px-2 py-1">Đã xong</th>
                      <th className="border px-2 py-1">Số lượng đã giao</th>
                      <th className="border px-2 py-1">Ngày giao gần nhất</th>
                      <th className="border px-2 py-1">Ghi chú</th>
                      <th className="border px-2 py-1">Xem chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((prod) => (
                      <tr key={prod.id}>
                        <td className="border px-2 py-1">{prod.productName}</td>
                        <td className="border px-2 py-1 text-center">{prod.quantity}</td>
                        <td className="border px-2 py-1 text-right">{prod.totalAmount.toLocaleString()} đ</td>
                        <td className="border px-2 py-1 text-center">{prod.done ?? '-'}</td>
                        <td className="border px-2 py-1 text-center">{prod.delivered}</td>
                        <td className="border px-2 py-1 text-center">{prod.lastDeliveryDate}</td>
                        <td className="border px-2 py-1">{prod.note}</td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleShowDetail(prod, prod.quantity, prod.delivered)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
      <DeliveryDetailModal
        open={!!expandedOrderId && !!selectedProduct}
        onClose={handleCloseDetail}
        product={selectedProduct}
        totalQuantity={selectedProduct?.total || 0}
        delivered={selectedProduct?.delivered || 0}
        history={deliveryHistory}
        historyLoading={historyLoading}
        form={form}
        onFormChange={handleFormChange}
        onCreateDelivery={handleCreateDelivery}
        formLoading={formLoading}
      />
    </div>
  );
};

const DeliveryDetailModal = ({
  open,
  onClose,
  product,
  totalQuantity,
  delivered,
  history,
  historyLoading,
  form,
  onFormChange,
  onCreateDelivery,
  formLoading,
}: {
  open: boolean;
  onClose: () => void;
  product: any;
  totalQuantity: number;
  delivered: number;
  history: DeliveryHistoryItem[];
  historyLoading: boolean;
  form: { deliveryDate: string; quantity: string; note: string };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateDelivery: (e: React.FormEvent) => void;
  formLoading: boolean;
}) => {
  if (!open || !product) return null;
  const remaining = totalQuantity - delivered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">Lịch sử giao hàng: {product.productName}</h2>
        <div className="mb-2 flex gap-4">
          <div>
            <span className="font-semibold">Đã giao:</span> {delivered}
          </div>
          <div>
            <span className="font-semibold">Còn phải giao:</span> {remaining > 0 ? remaining : 0}
          </div>
        </div>
        <div className="overflow-x-auto mb-4">
          {historyLoading ? (
            <div>Đang tải lịch sử giao hàng...</div>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Tên sản phẩm</th>
                  <th className="border px-2 py-1">Ngày giao</th>
                  <th className="border px-2 py-1">Số lượng giao</th>
                  <th className="border px-2 py-1">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="border px-2 py-1">{product.productName}</td>
                    <td className="border px-2 py-1 text-center">{h.deliveryDate}</td>
                    <td className="border px-2 py-1 text-center">{h.quantity}</td>
                    <td className="border px-2 py-1">{h.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="border-t pt-3 mt-3">
          <h3 className="font-semibold mb-2">Tạo giao hàng mới</h3>
          <form onSubmit={onCreateDelivery} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="date"
                className="form-input flex-1"
                required
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={onFormChange}
                disabled={formLoading}
              />
              <input
                type="number"
                className="form-input flex-1"
                min={1}
                max={remaining}
                placeholder="Số lượng giao"
                required
                name="quantity"
                value={form.quantity}
                onChange={onFormChange}
                disabled={formLoading}
              />
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Ghi chú"
              name="note"
              value={form.note}
              onChange={onFormChange}
              disabled={formLoading}
            />
            <button type="submit" className="btn btn-primary mt-2" disabled={formLoading}>
              {formLoading ? "Đang tạo..." : "Tạo giao hàng"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage; 