"use client";
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useSearchParams, useRouter } from 'next/navigation';
import { DataTable } from 'mantine-datatable';
import { getOrderDetailById, OrderDetailDto, ProductInOrderDto } from '@/app/(defaults)/sales-order/[id]/service';
import { createProductionPlanFromSaleOrder, ProductionPlanProductInput, getGlassStructureByProductId, updateOrderStatus } from '@/app/(defaults)/production-plans/create/service';
import { OrderDto } from '@/app/(defaults)/sales-order/service';

const PAGE_SIZES = [10, 20, 30, 50, 100];

function calculateTotalGlue(width: number, height: number, thickness: number, glass4mm: number, glass5mm: number, quantity: number, glueLayers: number) {
    // Diện tích keo (m2)
    const areaKeo = ((width - 20) * (height - 20)) / 1_000_000;
    // Độ dày keo
    const doDayKeo = thickness - (glass4mm * 4) - (glass5mm * 5);
    // Tổng keo
    return areaKeo * doDayKeo * 1.2 * quantity * glueLayers;
}

const CreateProductionPlanManager = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams?.get('orderId');
    const orderParam = searchParams?.get('order');
    const [order, setOrder] = useState<OrderDetailDto | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
    const [products, setProducts] = useState<ProductionPlanProductInput[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        // Parse order data from URL parameter if available
        if (orderParam) {
            try {
                const decodedOrder = JSON.parse(decodeURIComponent(orderParam)) as OrderDto;
                setSelectedOrder(decodedOrder);
            } catch (error) {
                console.error('Error parsing order data:', error);
                setError('Dữ liệu đơn hàng không hợp lệ!');
                return;
            }
        }

        // Use orderId if available, otherwise use selectedOrder.id
        const currentOrderId = orderId || selectedOrder?.id;
        if (!currentOrderId) return;

        setLoading(true);
        getOrderDetailById(Number(currentOrderId))
            .then(async (data) => {
                setOrder(data);
                // Lấy glass structure cho từng sản phẩm
                const glassStructures = await Promise.all(
                  data.products.map(async (p: any) => {
                    // productId phải lấy đúng từ backend, giả sử có trường productId
                    return p.productId ? await getGlassStructureByProductId(p.productId) : null;
                  })
                );
                setProducts(
                    data.products.map((p, idx) => {
                        const glass = glassStructures[idx];
                        const glassLayers = glass?.glassLayers ?? 4;
                        const glass5mm = 2;
                        const glass4mm = glassLayers - 2;
                        const butylType = glass?.adhesiveThickness ?? 5;
                        const glueLayers = glass?.adhesiveLayers ?? 2;
                        const adhesiveType = glass?.adhesiveType ?? '';
                        return {
                            productId: p.productId ?? idx + 1, // lấy đúng id từ backend
                            productName: p.productName, // thêm tên sản phẩm
                            quantity: p.quantity,
                            thickness: p.thickness,
                            glueLayers,
                            glassLayers,
                            glass4mm,
                            glass5mm,
                            butylType,
                            isCuongLuc: false, // hoặc lấy từ glass nếu có
                            adhesiveType,
                            width: p.width,
                            height: p.height,
                        };
                    })
                );
            })
            .catch(() => setError('Không lấy được thông tin đơn hàng!'))
            .finally(() => setLoading(false));
    }, [orderId, orderParam, selectedOrder?.id]);

    // Tính tổng keo nano/mềm dựa vào adhesiveType
    const totalKeoNano = products.filter(p => p.adhesiveType?.toLowerCase() === 'nano').reduce((sum, p) => sum + calculateTotalGlue(p.width, p.height, p.thickness, p.glass4mm, p.glass5mm, p.quantity, p.glueLayers), 0);
    const totalKeoMem = products.filter(p => p.adhesiveType?.toLowerCase() === 'mềm').reduce((sum, p) => sum + calculateTotalGlue(p.width, p.height, p.thickness, p.glass4mm, p.glass5mm, p.quantity, p.glueLayers), 0);

    const MAX_QTY = 9999;
    const MAX_VAL = 999999;

    const MySwal = typeof window !== 'undefined' ? withReactContent(Swal) : null as any;
    const warn = (msg: string) => {
        if (!MySwal) return;
        MySwal.fire({
            title: msg,
            icon: 'warning',
            toast: true,
            position: 'bottom-start',
            showConfirmButton: false,
            timer: 3000,
            showCloseButton: true,
        });
    };

    const handleChange = (idx: number, field: keyof ProductionPlanProductInput, rawValue: any) => {
        setProducts((prev) => prev.map((p, i) => {
            if (i !== idx) return p;
            let value = rawValue;
            
            // Rule 1: Thickness không được thay đổi
            if (field === 'thickness') {
                warn('Độ dày không được phép thay đổi');
                return p; // Giữ nguyên giá trị cũ
            }
            
            if (['quantity'].includes(field)) {
                value = Math.floor(Number(rawValue) || 0);
                if (value < 1) value = 1;
                if (value > MAX_QTY) {
                    value = MAX_QTY;
                    warn('Số lượng tối đa là 9999');
                }
                
                // Rule 3: Kiểm tra lượng keo không bị âm khi thay đổi số lượng
                const currentGlue = calculateTotalGlue(p.width, p.height, p.thickness, p.glass4mm, p.glass5mm, p.quantity, p.glueLayers);
                const newGlue = calculateTotalGlue(p.width, p.height, p.thickness, p.glass4mm, p.glass5mm, value, p.glueLayers);
                if (newGlue < 0) {
                    warn('Số lượng này sẽ khiến lượng keo bị âm. Vui lòng kiểm tra lại các thông số khác.');
                    return p; // Giữ nguyên giá trị cũ
                }
            } else if (['glueLayers','glassLayers','glass4mm','glass5mm','butylType','width','height'].includes(field)) {
                value = Number(rawValue) || 0;
                if (value < 0) value = 0;
                if (value > MAX_VAL) {
                    value = MAX_VAL;
                    warn('Giá trị tối đa là 999999');
                }
            }
            
            const updatedProduct = { ...p, [field]: value };
            
            // Rule 2: glassLayers = glass4mm + glass5mm
            if (['glass4mm', 'glass5mm'].includes(field)) {
                updatedProduct.glassLayers = updatedProduct.glass4mm + updatedProduct.glass5mm;
            }
            
            // Rule 3: Kiểm tra lượng keo không bị âm sau khi thay đổi
            const newGlue = calculateTotalGlue(updatedProduct.width, updatedProduct.height, updatedProduct.thickness, updatedProduct.glass4mm, updatedProduct.glass5mm, updatedProduct.quantity, updatedProduct.glueLayers);
            if (newGlue < 0) {
                warn('Thay đổi này sẽ khiến lượng keo bị âm. Vui lòng kiểm tra lại các thông số.');
                return p; // Giữ nguyên giá trị cũ
            }
            
            return updatedProduct;
        }));
    };

    const handleCreate = async () => {
        const currentOrderId = orderId || selectedOrder?.id;
        if (!currentOrderId) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // Tạo kế hoạch sản xuất
            await createProductionPlanFromSaleOrder({
                saleOrderId: Number(currentOrderId),
                products,
            });
            
            // Cập nhật trạng thái đơn hàng sang processing (1)
            try {
                await updateOrderStatus(Number(currentOrderId), 1);
                setSuccess('Tạo kế hoạch sản xuất thành công và đã cập nhật trạng thái đơn hàng!');
            } catch (statusError) {
                console.error('Lỗi khi cập nhật trạng thái đơn hàng:', statusError);
                setSuccess('Tạo kế hoạch sản xuất thành công nhưng không thể cập nhật trạng thái đơn hàng!');
            }
            
            setTimeout(() => router.push('/production-plans'), 2000);
        } catch (e) {
            setError('Tạo kế hoạch sản xuất thất bại!');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !order) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!order) return <div>Chưa có dữ liệu đơn hàng.</div>;

    return (
        <div className="panel">
            <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                <div className="flex-1">
                    <div className="space-y-1 text-white-dark">
                        <div>Sản xuất cho:</div>
                        <div className="font-semibold text-black dark:text-white">{order.customerName}</div>
                        <div>{order.address}</div>
                        <div>{order.phone}</div>
                    </div>
                </div>
                <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                    <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                        <div className="mb-2 flex w-full items-center justify-between">
                            <div className="text-white-dark">Mã đơn hàng :</div>
                            <div>#{order.orderCode}</div>
                        </div>
                        <div className="mb-2 flex w-full items-center justify-between">
                            <div className="text-white-dark">Ngày đặt hàng :</div>
                            <div>{order.orderDate}</div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <div className="datatables mt-8">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={products.map((p, idx) => ({ id: p.productId ?? idx, ...p }))}
                    columns={[
                        { accessor: 'productCode', title: 'Tên sản phẩm', render: (r) => r.productName },
                        { accessor: 'quantity', title: 'Số lượng', render: (r, idx) => <input type="number" min={1} max={MAX_QTY} step={1} value={r.quantity} onChange={e => handleChange(idx, 'quantity', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'thickness', title: 'Dày', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.thickness} onChange={e => handleChange(idx, 'thickness', e.target.value)} className="input input-sm w-20 bg-gray-100" disabled /> },
                        { accessor: 'glueLayers', title: 'Lớp keo', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.glueLayers} onChange={e => handleChange(idx, 'glueLayers', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'glassLayers', title: 'Số kính', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.glassLayers} onChange={e => handleChange(idx, 'glassLayers', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'glass4mm', title: 'Kính 4', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.glass4mm} onChange={e => handleChange(idx, 'glass4mm', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'glass5mm', title: 'Kính 5', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.glass5mm} onChange={e => handleChange(idx, 'glass5mm', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'butylType', title: 'Loại butyl', render: (r, idx) => <input type="number" min={0} max={MAX_VAL} step={1} value={r.butylType} onChange={e => handleChange(idx, 'butylType', e.target.value)} className="input input-sm w-20" /> },
                        { accessor: 'isCuongLuc', title: 'CL', render: (r, idx) => <input type="checkbox" checked={r.isCuongLuc} onChange={e => handleChange(idx, 'isCuongLuc', e.target.checked)} /> },
                        { accessor: 'totalGlue', title: 'Tổng keo(kg)', render: (r) => calculateTotalGlue(r.width, r.height, r.thickness, r.glass4mm, r.glass5mm, r.quantity, r.glueLayers).toFixed(2) },
                    ]}
                    totalRecords={products.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={setPage}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
            <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row mt-6">
                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                    <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">Tổng keo nano :</div>
                        <div>{totalKeoNano.toFixed(2)} kg</div>
                    </div>
                </div>
                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                    <div className="mb-2 flex w-full items-center justify-between">
                        <div className="text-white-dark">Tổng keo mềm:</div>
                        <div>{totalKeoMem.toFixed(2)} kg</div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex gap-4">
                <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>Tạo</button>
                <button className="btn btn-secondary" onClick={() => router.back()} disabled={loading}>Hủy</button>
                {success && <span className="text-green-600">{success}</span>}
                {error && <span className="text-red-600">{error}</span>}
            </div>
        </div>
    );
};

export default CreateProductionPlanManager;
