import React from 'react';

interface TableColumn {
    key: string;
    title: string;
    render?: (value: any, record: any) => React.ReactNode;
}

interface ProductionTableProps {
    data: any[];
    columns: TableColumn[];
    title: string;
    onRowClick?: (row: any) => void;
    className?: string;
}

const ProductionTable: React.FC<ProductionTableProps> = ({
    data,
    columns,
    title,
    onRowClick,
    className = ''
}) => {
    const getStatusBadge = (status: string) => {
        const statusClasses: { [key: string]: string } = {
            'Active': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'Paused': 'bg-orange-100 text-orange-800',
            'Finalized': 'bg-green-100 text-green-800',
            'Not Finalized': 'bg-gray-100 text-gray-800',
            'Updated': 'bg-green-100 text-green-800',
            'Not Updated': 'bg-gray-100 text-gray-800'
        };

        const classes = statusClasses[status] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const formatNumber = (value: number) => {
        return value.toLocaleString('vi-VN');
    };

    const defaultRender = (value: any, record: any, column: TableColumn) => {
        if (column.key.includes('status') || column.key.includes('Status')) {
            return getStatusBadge(value);
        }
        
        if (column.key.includes('date') || column.key.includes('Date') || column.key.includes('createdAt')) {
            return formatDate(value);
        }
        
        if (typeof value === 'number' && !column.key.includes('id') && !column.key.includes('Id')) {
            return formatNumber(value);
        }
        
        return value;
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg ${className}`}>
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {column.render 
                                                ? column.render(row[column.key], row)
                                                : defaultRender(row[column.key], row, column)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {data.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Hiển thị {data.length} mục
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionTable;
