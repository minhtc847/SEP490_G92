'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockPriceQuotes } from '@/app/data/price-quotes';

const PriceQuoteDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const quote = mockPriceQuotes.find(item => item.id === id);

    if (!quote) {
        return <div className="p-6 text-red-600">Không tìm thấy báo giá với ID: {id}</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Chi tiết báo giá</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div><strong>Mã:</strong> {quote.id}</div>
                <div><strong>Tên sản phẩm:</strong> {quote.productName}</div>
                <div><strong>Loại:</strong> {quote.type}</div>
                <div><strong>Phân loại:</strong> {quote.category}</div>
                <div><strong>Độ dày:</strong> {quote.thickness} mm</div>
                <div><strong>Trọng lượng:</strong> {quote.weight} kg/m2</div>
                <div><strong>Đơn giá:</strong> {quote.price.toLocaleString()}₫</div>
            </div>

            <button
                onClick={() => router.back()}
                className="btn"
            >
                ◀ Quay lại
            </button>
        </div>
    );
};

export default PriceQuoteDetailPage;
