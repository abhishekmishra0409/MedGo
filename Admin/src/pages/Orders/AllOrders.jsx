import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllOrders,
    getOrdersByStatus,
    updateOrderStatus,
    resetOrderAdminState
} from '../../features/Orders/OrderSlice.js';
import {
    Search,
    ChevronDown,
    Check,
    X,
    Clock,
    Truck,
    Box,
    ArrowUp,
    ArrowDown,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const {
        orders,
        statusOrders,
        totalOrders,
        pages,
        currentPage,
        isLoading,
        isError,
        isSuccess,
        message
    } = useSelector((state) => state.order);

    // State for pagination, filtering and sorting
    const [limit] = useState(5);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({
        field: 'createdAt',
        direction: 'desc'
    });

    // Available status options
    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    // Fetch orders based on filters
    useEffect(() => {
        if (statusFilter === 'all') {
            dispatch(getAllOrders({ page: currentPage, limit }));
        } else {
            dispatch(getOrdersByStatus(statusFilter));
        }

        return () => {
            dispatch(resetOrderAdminState());
        };
    }, [statusFilter, currentPage, limit, dispatch]);

    // Handle status update
    const handleStatusUpdate = async (orderId, newStatus) => {
        console.log(orderId)
        try {
            await dispatch(updateOrderStatus({
                orderId: orderId,
                status: newStatus
            })).unwrap();
            toast.success('Order status updated successfully');
            // Refresh orders after update
            if (statusFilter === 'all') {
                dispatch(getAllOrders({ page: currentPage, limit }));
            } else {
                dispatch(getOrdersByStatus(statusFilter));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update order status');
        }
    };

    // Handle sorting
    const handleSort = (field) => {
        const direction = sortConfig.field === field && sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc';

        setSortConfig({ field, direction });

        // Sort orders client-side
        const ordersToSort = statusFilter === 'all' ? [...orders] : [...statusOrders];
        const sortedOrders = ordersToSort.sort((a, b) => {
            if (a[field] < b[field]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[field] > b[field]) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        // Update the orders in the store (temporary client-side sort)
        // Note: For large datasets, implement server-side sorting
        if (statusFilter === 'all') {
            dispatch({ type: 'order/setOrders', payload: sortedOrders });
        } else {
            dispatch({ type: 'order/setStatusOrders', payload: sortedOrders });
        }
    };

    // Get status badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <ChevronDown className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'delivered': return <Check className="w-4 h-4" />;
            case 'cancelled': return <X className="w-4 h-4" />;
            default: return <Box className="w-4 h-4" />;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (statusFilter === 'all') {
            dispatch(getAllOrders({ page: newPage, limit }));
        }
    };

    // Get current orders to display
    const displayOrders = statusFilter === 'all' ? orders : statusOrders;
    const displayTotal = statusFilter === 'all' ? totalOrders : statusOrders.length;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order Management</h1>
                <div className="text-sm text-gray-500">
                    {statusFilter === 'all'
                        ? `Total Orders: ${totalOrders}`
                        : `${statusOrders.length} ${statusFilter} orders`}
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            if (e.target.value !== 'all') {
                                dispatch(getOrdersByStatus(e.target.value));
                            } else {
                                dispatch(getAllOrders({ page: 1, limit }));
                            }
                        }}
                        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Orders Table */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center">
                                        Date
                                        {sortConfig.field === 'createdAt' && (
                                            <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center">
                                        Status
                                        {sortConfig.field === 'status' && (
                                            <span className="ml-1">
                          {sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {displayOrders.length > 0 ? (
                                displayOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.user?.username}</div>
                                            <div className="text-sm text-gray-500">{order.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${order.total?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    className={`text-xs rounded-md ${getStatusBadge(order.status)} px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    className="text-blue-600 hover:text-blue-900"
                                                    onClick={() => {
                                                        // Implement order details view if needed
                                                    }}
                                                >
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination - Only show for 'all' orders */}
                    {statusFilter === 'all' && pages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                            <div className="text-sm text-gray-500">
                                Showing {((currentPage - 1) * limit) + 1} to{' '}
                                {Math.min(currentPage * limit, totalOrders)} of{' '}
                                {totalOrders} orders
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                                    let pageNum;
                                    if (pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= pages - 2) {
                                        pageNum = pages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 border rounded-md ${
                                                currentPage === pageNum ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pages}
                                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrdersPage;