import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders, getOrderById } from '../../features/Order/OrderSlice.js';
import { toast } from 'react-toastify';
import { FiX, FiShoppingBag, FiClock, FiCheckCircle, FiTruck, FiDollarSign } from 'react-icons/fi';

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, order, isLoading } = useSelector((state) => state.order);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // console.log(order)
    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);

    const handleViewOrder = (orderId) => {
        setSelectedOrderId(orderId);
        dispatch(getOrderById(orderId))
            .unwrap()
            .then(() => {
                setIsModalOpen(true);
            })
            .catch((error) => {
                toast.error(error.message || 'Failed to load order details');
            });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'processing':
                return (
                    <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <FiClock className="mr-1" /> Processing
          </span>
                );
            case 'shipped':
                return (
                    <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <FiTruck className="mr-1" /> Shipped
          </span>
                );
            case 'delivered':
                return (
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <FiCheckCircle className="mr-1" /> Delivered
          </span>
                );
            default:
                return (
                    <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            <FiShoppingBag className="mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
                );
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Orders</h1>

            {isLoading && !orders.length ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <FiShoppingBag className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="mt-1 text-gray-500">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <FiDollarSign className="inline mr-1" />
                                    {order.total.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleViewOrder(order._id)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Order #{order?._id.slice(6).toUpperCase()}
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <FiX className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    {order ? (
                                        <div>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Order Date</h4>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                                    <div className="mt-1">
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                                        {order.paymentMethod.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
                                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                                        {order.paymentStatus}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
                                                <div className="bg-gray-50 p-4 rounded-md">
                                                    <div className="flex justify-between py-1">
                                                        <span className="text-sm text-gray-600">Subtotal</span>
                                                        <span className="text-sm text-gray-900">
                              <FiDollarSign className="inline mr-1" />
                                                            {order.subtotal.toFixed(2)}
                            </span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span className="text-sm text-gray-600">Shipping</span>
                                                        <span className="text-sm text-gray-900">
                              <FiDollarSign className="inline mr-1" />
                                                            {order.shippingFee.toFixed(2)}
                            </span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span className="text-sm text-gray-600">Tax</span>
                                                        <span className="text-sm text-gray-900">
                              <FiDollarSign className="inline mr-1" />
                                                            {order.tax.toFixed(2)}
                            </span>
                                                    </div>
                                                    <div className="flex justify-between py-1">
                                                        <span className="text-sm text-gray-600">Discount</span>
                                                        <span className="text-sm text-gray-900">
                              -<FiDollarSign className="inline mr-1" />
                                                            {order.discount.toFixed(2)}
                            </span>
                                                    </div>
                                                    <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                                        <span className="text-sm font-medium text-gray-900">Total</span>
                                                        <span className="text-sm font-medium text-gray-900">
                              <FiDollarSign className="inline mr-1" />
                                                            {order.total.toFixed(2)}
                            </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                                            <div className="border-t border-gray-200">
                                                {order.items.map((item) => (
                                                    <div key={item._id} className="py-4 flex border-b border-gray-200">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                className="h-20 w-20 rounded-md object-cover"
                                                                src={item.image}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <div className="flex justify-between">
                                                                <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                                                <p className="text-sm text-gray-900">
                                                                    <FiDollarSign className="inline mr-1" />
                                                                    {item.priceAtPurchase.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            <p className="mt-1 text-sm text-gray-500">
                                                                Total: <FiDollarSign className="inline mr-1" />
                                                                {(item.priceAtPurchase * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6">
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                                                <div className="bg-gray-50 p-4 rounded-md">
                                                    <p className="text-sm text-gray-900">
                                                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {order.shippingAddress.street}
                                                        {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {order.shippingAddress.city}, {order.shippingAddress.state}
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {order.shippingAddress.country}, {order.shippingAddress.pincode}
                                                    </p>
                                                    <p className="text-sm text-gray-900 mt-2">
                                                        Phone: {order.shippingAddress.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;