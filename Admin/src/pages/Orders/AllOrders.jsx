import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Clock, Package, ShoppingCart, Truck, X } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader, Pagination, SegmentedControl, StatusPill } from "../../components/AdminUI.jsx";
import { getAllOrders, getOrdersByStatus, resetOrderAdminState, updateOrderStatus } from "../../features/Orders/OrderSlice.js";

const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusTone = (status) => {
    if (status === "delivered") return "emerald";
    if (status === "cancelled") return "rose";
    if (status === "pending") return "amber";
    if (status === "processing" || status === "shipped") return "teal";
    return "slate";
};

const statusIcon = (status) => {
    if (status === "delivered") return <Check className="h-3.5 w-3.5" />;
    if (status === "cancelled") return <X className="h-3.5 w-3.5" />;
    if (status === "shipped") return <Truck className="h-3.5 w-3.5" />;
    if (status === "pending") return <Clock className="h-3.5 w-3.5" />;
    return <Package className="h-3.5 w-3.5" />;
};

const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { orders = [], statusOrders = [], totalOrders = 0, pages = 1, currentPage = 1, isLoading } = useSelector((state) => state.order);
    const [limit] = useState(8);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (statusFilter === "all") dispatch(getAllOrders({ page: currentPage, limit }));
        else dispatch(getOrdersByStatus(statusFilter));

        return () => {
            dispatch(resetOrderAdminState());
        };
    }, [statusFilter, currentPage, limit, dispatch]);

    const displayOrders = useMemo(
        () => (statusFilter === "all" ? orders : statusOrders),
        [orders, statusFilter, statusOrders]
    );

    const stats = useMemo(() => ({
        shown: displayOrders.length,
        revenue: displayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    }), [displayOrders]);

    const refreshOrders = () => {
        if (statusFilter === "all") dispatch(getAllOrders({ page: currentPage, limit }));
        else dispatch(getOrdersByStatus(statusFilter));
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success("Order status updated successfully");
            refreshOrders();
        } catch (error) {
            toast.error(error.message || "Failed to update order status");
        }
    };

    const handlePageChange = (newPage) => {
        if (statusFilter === "all") dispatch(getAllOrders({ page: newPage, limit }));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Orders"
                title="Order management"
                description="Review pharmacy orders and move them through fulfillment without leaving the dashboard."
                action={(
                    <div className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        {statusFilter === "all" ? `${totalOrders} total orders` : `${displayOrders.length} ${statusFilter} orders`}
                    </div>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
                    <SegmentedControl
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            if (value === "all") dispatch(getAllOrders({ page: 1, limit }));
                        }}
                    />
                    <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                        <span className="rounded-2xl bg-slate-100 px-4 py-2">{stats.shown} shown</span>
                        <span className="rounded-2xl bg-slate-100 px-4 py-2">{formatMoney(stats.revenue)} shown revenue</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="mt-5 grid gap-4">
                        {[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : displayOrders.length ? (
                    <div className="mt-5 grid gap-4">
                        {displayOrders.map((order) => {
                            const status = order.status || "pending";
                            const itemCount = Array.isArray(order.items)
                                ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                                : 0;

                            return (
                                <article key={order._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                                                <ShoppingCart className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-950">#{order._id?.slice(-6).toUpperCase()}</h3>
                                                    <StatusPill tone={statusTone(status)} icon={statusIcon(status)}>{status}</StatusPill>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    {order.user?.username || order.user?.email || "Customer unavailable"} - {formatDate(order.createdAt)}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatMoney(order.total)}</span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 capitalize">{order.paymentStatus || "pending"} payment</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                                            {orderStatuses.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleStatusUpdate(order._id, option)}
                                                    disabled={status === option}
                                                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold capitalize transition ${
                                                        status === option
                                                            ? "border-teal-200 bg-teal-50 text-teal-800"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"
                                                    }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState
                            icon={<ShoppingCart className="h-7 w-7" />}
                            title="No orders found"
                            description="Orders matching this filter will appear here."
                        />
                    </div>
                )}

                {statusFilter === "all" ? (
                    <div className="mt-5">
                        <Pagination currentPage={currentPage} totalPages={pages} onPageChange={handlePageChange} />
                    </div>
                ) : null}
            </section>
        </div>
    );
};

export default OrdersPage;
