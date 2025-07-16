'use client'
import PhieuXuatKeoButylManager from '@/components/VNG/manager/phieu-xuat-keo-buytl-manager';
import { useParams } from 'next/navigation';
import { PhieuXuatKeoButylData, ProductionPlanDetail, fetchPhieuXuatKeoButylData, fetchProductionPlanDetail } from '../../service';
import { useEffect, useState } from 'react';

interface WareHouseSlipDetailPageProps {
    params: {
        id: string;
    };
}

// const WareHouseSlipDetailPage: React.FC<WareHouseSlipDetailPageProps> = ({ params }) => {
//     return <WareHouseSlipDetailManager />;
// };
const WareHouseSlipDetailPage: React.FC<WareHouseSlipDetailPageProps> = ({ params }) => {

    const {butylId} = useParams();
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<PhieuXuatKeoButylData | null>(null);
    const [planDetail, setPlanDetail] = useState<ProductionPlanDetail | null>(null);
    useEffect(() => {
        if (!butylId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [detailData] = await Promise.all([
                    fetchPhieuXuatKeoButylData(butylId as string),
                ]);
                setDetail(detailData);
            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu glue-butyl:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [butylId]);
    // useEffect(() => {
    //     if (!detail) return;
    //
    //     const fetchData = async () => {
    //         try {
    //             setLoading(true);
    //             const [planDetail] = await Promise.all([
    //                 fetchProductionPlanDetail(detail.productionOrderId),
    //             ]);
    //             setPlanDetail(planDetail);
    //         } catch (err) {
    //             console.error('Lỗi khi fetch dữ liệu glue-butyl:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [detail]);
    return detail ? <PhieuXuatKeoButylManager data={detail} /> : <div>Loading...</div>;
};

export default WareHouseSlipDetailPage;
