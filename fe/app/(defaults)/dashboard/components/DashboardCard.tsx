import React from 'react';

interface DashboardCardProps {
    title: string;
    value: number;
    percentage?: number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    percentage,
    icon,
    color,
    trend,
    onClick
}) => {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-500 text-white';
            case 'green':
                return 'bg-green-500 text-white';
            case 'yellow':
                return 'bg-yellow-500 text-white';
            case 'red':
                return 'bg-red-500 text-white';
            case 'purple':
                return 'bg-purple-500 text-white';
            case 'orange':
                return 'bg-orange-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return '↗️';
            case 'down':
                return '↘️';
            case 'stable':
                return '→';
            default:
                return '';
        }
    };

    return (
        <div 
            className={`p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl ${onClick ? 'hover:scale-105' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                    {/* {percentage !== undefined && (
                        <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%
                            </span>
                            <span className="ml-1 text-sm">
                                {getTrendIcon(trend)}
                            </span>
                        </div>
                    )} */}
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
