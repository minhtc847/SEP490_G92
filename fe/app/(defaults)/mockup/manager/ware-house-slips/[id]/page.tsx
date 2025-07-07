import PhieuXuatKeoButylManager from '@/components/VNG/manager/phieu-xuat-keo-buytl-manager';
import WareHouseSlipDetailManager from '@/components/VNG/manager/ware-house-slip-detail-manager';

interface WareHouseSlipDetailPageProps {
    params: {
        id: string;
    };
}

// const WareHouseSlipDetailPage: React.FC<WareHouseSlipDetailPageProps> = ({ params }) => {
//     return <WareHouseSlipDetailManager />;
// };
const WareHouseSlipDetailPage: React.FC<WareHouseSlipDetailPageProps> = ({ params }) => {
    return <PhieuXuatKeoButylManager />;
};

export default WareHouseSlipDetailPage;
