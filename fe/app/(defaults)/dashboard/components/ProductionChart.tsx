import React from 'react';

interface ProductionChartProps {
    data: any[];
    type: 'line' | 'bar' | 'pie' | 'doughnut';
    title: string;
    height?: number;
    className?: string;
}

const ProductionChart: React.FC<ProductionChartProps> = ({
    data,
    type,
    title,
    height = 300,
    className = ''
}) => {
    const renderChart = () => {
        switch (type) {
            case 'doughnut':
                return renderDoughnutChart();
            case 'pie':
                return renderPieChart();
            case 'bar':
                return renderBarChart();
            case 'line':
                return renderLineChart();
            default:
                return <div>Unsupported chart type</div>;
        }
    };

    const renderDoughnutChart = () => {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let cumulativePercentage = 0;

        return (
            <div className="relative w-full h-full">
                <svg width="100%" height={height} className="transform -rotate-90">
                    {data.map((item, index) => {
                        const percentage = (item.count / total) * 100;
                        const startAngle = cumulativePercentage * 3.6;
                        const endAngle = (cumulativePercentage + percentage) * 3.6;
                        cumulativePercentage += percentage;

                        const radius = 80;
                        const centerX = 150;
                        const centerY = 150;

                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = (endAngle * Math.PI) / 180;

                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);

                        const largeArcFlag = percentage > 50 ? 1 : 0;

                        const pathData = [
                            `M ${centerX} ${centerY}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                        ].join(' ');

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={getColor(item.color)}
                                stroke="white"
                                strokeWidth="2"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        return renderDoughnutChart(); // Same as doughnut for now
    };

    const renderBarChart = () => {
        const maxValue = Math.max(...data.map(item => item.count));
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#6B7280'];
        
        return (
            <div className="w-full h-full p-4">
                <div className="flex items-end justify-between h-full space-x-2">
                    {data.map((item, index) => {
                        const color = item.color ? getColor(item.color) : colors[index % colors.length];
                        return (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full rounded-t"
                                    style={{
                                        height: `${(item.count / maxValue) * 200}px`,
                                        backgroundColor: color
                                    }}
                                />
                                <div className="mt-2 text-xs text-center">
                                    <div className="font-medium">{item.count}</div>
                                    <div className="text-gray-600">{item.status || item.type}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderLineChart = () => {
        return (
            <div className="w-full h-full p-4">
                <div className="text-center text-gray-500">
                    Line chart implementation would go here
                </div>
            </div>
        );
    };

    const getColor = (colorName: string) => {
        const colors: { [key: string]: string } = {
            blue: '#3B82F6',
            green: '#10B981',
            yellow: '#F59E0B',
            red: '#EF4444',
            purple: '#8B5CF6',
            orange: '#F97316',
            gray: '#6B7280'
        };
        return colors[colorName] || colors.gray;
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div style={{ height: `${height}px` }}>
                {renderChart()}
            </div>
            {(type === 'doughnut' || type === 'pie' || type === 'bar') ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {data.map((item, index) => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#6B7280'];
                        const color = item.color ? getColor(item.color) : colors[index % colors.length];
                        return (
                            <div key={index} className="flex items-center">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-sm text-gray-600">
                                    {item.status || item.type}: {item.count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};

export default ProductionChart;
