import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiCreditCard,
    FiDollarSign,
    FiMapPin,
    FiPackage,
    FiShoppingBag,
    FiTruck,
    FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getMyOrders, getOrderById } from "../../features/Order/OrderSlice.js";

const statusMeta = {
    pending: {
        label: "Pending",
        icon: FiClock,
        badge: "border-amber-100 bg-amber-50 text-amber-800",
        iconBox: "bg-amber-100 text-amber-800",
    },
    processing: {
        label: "Processing",
        icon: FiPackage,
        badge: "border-yellow-100 bg-yellow-50 text-yellow-800",
        iconBox: "bg-yellow-100 text-yellow-800",
    },
    shipped: {
        label: "Shipped",
        icon: FiTruck,
        badge: "border-teal-100 bg-teal-50 text-teal-800",
        iconBox: "bg-teal-100 text-teal-800",
    },
    delivered: {
        label: "Delivered",
        icon: FiCheckCircle,
        badge: "border-emerald-100 bg-emerald-50 text-emerald-800",
        iconBox: "bg-emerald-100 text-emerald-800",
    },
    cancelled: {
        label: "Cancelled",
        icon: FiAlertCircle,
        badge: "border-rose-100 bg-rose-50 text-rose-700",
        iconBox: "bg-rose-100 text-rose-700",
    },
};

const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "delivered", label: "Delivered" },
];

const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatMoney = (value) => `$ ${Number(value || 0).toFixed(2)}`;

const getOrderId = (order) => `#${String(order?._id || "order").slice(-6).toUpperCase()}`;

const normalizeStatus = (status) => String(status || "pending").toLowerCase();

const getStatusConfig = (status) => statusMeta[normalizeStatus(status)] || statusMeta.pending;

const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.badge}`}>
            <Icon className="h-4 w-4" />
            {config.label}
        </span>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            {icon}
        </div>
        <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
);

const EmptyState = ({ activeFilter }) => (
    <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <FiShoppingBag className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">
            {activeFilter === "all" ? "No orders yet" : "No matching orders"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {activeFilter === "all"
                ? "Your pharmacy orders will appear here with delivery status, payment details, and shipping address."
                : "Try another filter to review the rest of your pharmacy order history."}
        </p>
    </div>
);

const buildTimeline = (currentStatus) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const status = normalizeStatus(currentStatus);
    const currentIndex = steps.indexOf(status);

    return steps.map((step, index) => ({
        step,
        complete: currentIndex >= index || status === "delivered",
    }));
};

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, order, isLoading } = useSelector((state) => state.order);
    const [activeFilter, setActiveFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const orderList = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);

    const stats = useMemo(() => {
        const activeOrders = orderList.filter((item) => !["delivered", "cancelled"].includes(normalizeStatus(item.status))).length;
        const delivered = orderList.filter((item) => normalizeStatus(item.status) === "delivered").length;
        const totalSpend = orderList.reduce((sum, item) => sum + Number(item.total || 0), 0);

        return {
            total: orderList.length,
            active: activeOrders,
            delivered,
            spend: formatMoney(totalSpend),
        };
    }, [orderList]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === "active") {
            return orderList.filter((item) => !["delivered", "cancelled"].includes(normalizeStatus(item.status)));
        }
        if (activeFilter === "delivered") {
            return orderList.filter((item) => normalizeStatus(item.status) === "delivered");
        }
        return orderList;
    }, [activeFilter, orderList]);

    const handleViewOrder = (orderId) => {
        dispatch(getOrderById(orderId))
            .unwrap()
            .then(() => setIsModalOpen(true))
            .catch((error) => {
                toast.error(error?.message || error || "Failed to load order details");
            });
    };

    return (
        <div className="w-full space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Orders</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-950">Your orders</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Review pharmacy purchases, payment status, delivery progress, and shipping details in one place.
                        </p>
                    </div>
                    <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        <FiShoppingBag className="h-5 w-5" />
                        {stats.total} order{stats.total === 1 ? "" : "s"}
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total orders" value={stats.total} icon={<FiShoppingBag className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Active" value={stats.active} icon={<FiClock className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Delivered" value={stats.delivered} icon={<FiCheckCircle className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Total spent" value={stats.spend} icon={<FiDollarSign className="h-5 w-5 text-teal-700" />} />
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                onClick={() => setActiveFilter(filter.key)}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeFilter === filter.key ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">
                        {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} shown
                    </p>
                </div>

                {isLoading && !orderList.length ? (
                    <div className="grid gap-4 py-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                ) : filteredOrders.length ? (
                    <div className="mt-5 grid gap-4">
                        {filteredOrders.map((item) => {
                            const items = Array.isArray(item.items) ? item.items : [];
                            const config = getStatusConfig(item.status);
                            const Icon = config.icon;
                            const firstItem = items[0];

                            return (
                                <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                        <div className="flex min-w-0 gap-4">
                                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${config.iconBox}`}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-950">{getOrderId(item)}</h3>
                                                    <StatusBadge status={item.status} />
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">
                                                    {formatDate(item.createdAt)} - {items.length} item{items.length === 1 ? "" : "s"}
                                                    {firstItem?.name ? ` - ${firstItem.name}${items.length > 1 ? ` +${items.length - 1} more` : ""}` : ""}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatMoney(item.total)}</span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 capitalize">
                                                        {String(item.paymentStatus || "pending").replace(/_/g, " ")}
                                                    </span>
                                                    {item.trackingNumber ? (
                                                        <span className="rounded-full bg-slate-100 px-3 py-1.5">Tracking {item.trackingNumber}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleViewOrder(item._id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                                        >
                                            View details
                                            <FiChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState activeFilter={activeFilter} />
                    </div>
                )}
            </section>

            {isModalOpen ? (
                <OrderDetailsModal order={order} isLoading={isLoading} onClose={() => setIsModalOpen(false)} />
            ) : null}
        </div>
    );
};

const OrderDetailsModal = ({ order, isLoading, onClose }) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const address = order?.shippingAddress || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <section className="flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Order details</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">{order ? getOrderId(order) : "Loading order"}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label="Close order details"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </header>

                <div className="modal-scroll flex-1 overflow-y-auto p-5">
                    {isLoading && !order ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                        </div>
                    ) : order ? (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-4">
                                <InfoTile label="Date" value={formatDate(order.createdAt)} />
                                <InfoTile label="Status" value={<StatusBadge status={order.status} />} />
                                <InfoTile label="Payment" value={String(order.paymentStatus || "pending").replace(/_/g, " ")} icon={FiCreditCard} />
                                <InfoTile label="Total" value={formatMoney(order.total)} icon={FiDollarSign} />
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <h3 className="text-sm font-bold text-slate-950">Delivery timeline</h3>
                                <div className="mt-4 grid gap-3 md:grid-cols-4">
                                    {buildTimeline(order.status).map((item) => (
                                        <div key={item.step} className={`rounded-2xl border p-3 text-sm capitalize ${item.complete ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500"}`}>
                                            <p className="font-semibold">{item.step}</p>
                                            <p className="mt-1 text-xs">{item.complete ? "Reached" : "Pending"}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                                <div className="rounded-3xl border border-slate-200 p-4">
                                    <h3 className="text-sm font-bold text-slate-950">Items</h3>
                                    <div className="mt-3 divide-y divide-slate-200">
                                        {items.map((item) => (
                                            <div key={item._id || item.name} className="flex gap-3 py-4">
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name || "Product"} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                            <FiPackage className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-slate-950">{item.name || "Product unavailable"}</p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Qty {item.quantity || 1} - {formatMoney(item.priceAtPurchase)}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 text-sm font-bold text-slate-950">
                                                    {formatMoney(Number(item.priceAtPurchase || 0) * Number(item.quantity || 1))}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="rounded-3xl border border-slate-200 p-4">
                                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                            <FiMapPin className="h-4 w-4 text-teal-700" />
                                            Shipping address
                                        </h3>
                                        <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                                            <p className="font-semibold text-slate-950">
                                                {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Name unavailable"}
                                            </p>
                                            <p>{[address.street, address.apartment].filter(Boolean).join(", ") || "Street unavailable"}</p>
                                            <p>{[address.city, address.state, address.pincode].filter(Boolean).join(", ") || "City unavailable"}</p>
                                            <p>{address.country || "Country unavailable"}</p>
                                            <p>{address.phone ? `Phone: ${address.phone}` : "Phone unavailable"}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <h3 className="text-sm font-bold text-slate-950">Payment summary</h3>
                                        <PriceRow label="Subtotal" value={order.subtotal} />
                                        <PriceRow label="Shipping" value={order.shippingFee} />
                                        <PriceRow label="Tax" value={order.tax} />
                                        <PriceRow label="Discount" value={-Number(order.discount || 0)} />
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                            <PriceRow label="Total" value={order.total} strong />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState activeFilter="all" />
                    )}
                </div>
            </section>
        </div>
    );
};

const InfoTile = ({ label, value, icon: Icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {Icon ? <Icon className="h-4 w-4 text-teal-700" /> : null}
            {label}
        </p>
        <div className="mt-2 text-sm font-bold capitalize text-slate-950">{value}</div>
    </div>
);

const PriceRow = ({ label, value, strong = false }) => (
    <div className={`mt-2 flex items-center justify-between gap-4 text-sm ${strong ? "font-bold text-slate-950" : "text-slate-600"}`}>
        <span>{label}</span>
        <span>{formatMoney(value)}</span>
    </div>
);

export default Orders;
