import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    ReceiptText,
    ShieldCheck,
    ShoppingBag,
    Truck,
    WalletCards,
} from "lucide-react";
import { getOrderById } from "../features/Order/OrderSlice.js";

const statusMeta = {
    pending: {
        label: "Pending",
        badge: "border-amber-100 bg-amber-50 text-amber-800",
        iconBox: "bg-amber-100 text-amber-800",
    },
    processing: {
        label: "Processing",
        badge: "border-yellow-100 bg-yellow-50 text-yellow-800",
        iconBox: "bg-yellow-100 text-yellow-800",
    },
    shipped: {
        label: "Shipped",
        badge: "border-teal-100 bg-teal-50 text-teal-800",
        iconBox: "bg-teal-100 text-teal-800",
    },
    delivered: {
        label: "Delivered",
        badge: "border-emerald-100 bg-emerald-50 text-emerald-800",
        iconBox: "bg-emerald-100 text-emerald-800",
    },
    cancelled: {
        label: "Cancelled",
        badge: "border-rose-100 bg-rose-50 text-rose-700",
        iconBox: "bg-rose-100 text-rose-700",
    },
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (dateString) => {
    if (!dateString) {
        return "Date unavailable";
    }

    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) {
        return "Date unavailable";
    }

    return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const normalizeStatus = (status) => String(status || "pending").toLowerCase();
const getStatusConfig = (status) => statusMeta[normalizeStatus(status)] || statusMeta.pending;
const getShortOrderId = (orderId) => `#${String(orderId || "order").slice(-6).toUpperCase()}`;
const formatPaymentLabel = (value) => String(value || "pending").replace(/_/g, " ");

const buildTimeline = (currentStatus) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const status = normalizeStatus(currentStatus);
    const currentIndex = steps.indexOf(status);

    return steps.map((step, index) => ({
        step,
        complete: status === "delivered" || currentIndex >= index,
    }));
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { order, isLoading, isError, message } = useSelector((state) => state.order);
    const hasValidOrderId = orderId && orderId !== "undefined" && orderId !== "null";
    const currentOrder = order?._id === orderId ? order : null;
    const address = currentOrder?.shippingAddress || {};
    const items = Array.isArray(currentOrder?.items) ? currentOrder.items : [];

    useEffect(() => {
        if (hasValidOrderId) {
            dispatch(getOrderById(orderId));
        }
    }, [dispatch, hasValidOrderId, orderId]);

    if (!hasValidOrderId) {
        return (
            <div className="section-shell py-10">
                <div className="empty-state">
                    <ReceiptText className="h-12 w-12 text-teal-700" />
                    <h1 className="text-2xl font-semibold text-slate-950">Order id is missing</h1>
                    <p className="max-w-md text-sm leading-7 text-slate-600">Open your orders list to choose an order and view the complete details.</p>
                    <Link to="/user/orders" className="btn-primary px-6 py-3 text-sm">
                        View Your Orders
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading && !currentOrder) {
        return <OrderDetailsSkeleton />;
    }

    if ((isError && !currentOrder) || !currentOrder) {
        return (
            <div className="section-shell py-10">
                <div className="empty-state">
                    <ReceiptText className="h-12 w-12 text-teal-700" />
                    <h1 className="text-2xl font-semibold text-slate-950">We could not load this order</h1>
                    <p className="max-w-md text-sm leading-7 text-slate-600">
                        {message || "Please check your orders list and try opening the order again."}
                    </p>
                    <Link to="/user/orders" className="btn-primary px-6 py-3 text-sm">
                        View Your Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-3">
                        <span className="eyebrow">Order details</span>
                        <h1 className="section-title max-w-3xl">Order {getShortOrderId(currentOrder._id)}</h1>
                        <p className="section-copy max-w-2xl">
                            Full order summary, item list, shipping address, payment status, and delivery timeline.
                        </p>
                    </div>

                    <StatusBadge status={currentOrder.status} />
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailStat icon={CalendarDays} label="Placed on" value={formatDate(currentOrder.createdAt)} />
                    <DetailStat icon={ShoppingBag} label="Items" value={`${items.length} products`} />
                    <DetailStat icon={CreditCard} label="Payment" value={formatPaymentLabel(currentOrder.paymentStatus)} />
                    <DetailStat icon={WalletCards} label="Total" value={formatMoney(currentOrder.total)} />
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                    <div className="surface-card">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="eyebrow">Progress</p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Delivery timeline</h2>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-4">
                            {buildTimeline(currentOrder.status).map((item) => (
                                <div
                                    key={item.step}
                                    className={`rounded-[24px] border p-4 capitalize ${
                                        item.complete
                                            ? "border-teal-200 bg-teal-50 text-teal-800"
                                            : "border-slate-200 bg-white text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className={`h-5 w-5 ${item.complete ? "text-teal-700" : "text-slate-300"}`} />
                                        <p className="font-semibold">{item.step}</p>
                                    </div>
                                    <p className="mt-2 text-xs font-medium">{item.complete ? "Reached" : "Pending"}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="surface-card">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="eyebrow">Products</p>
                                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Items in this order</h2>
                            </div>
                        </div>

                        <div className="mt-5 divide-y divide-slate-200">
                            {items.map((item) => (
                                <div key={item._id || item.name} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                                    <div className="flex h-24 w-full items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#f8fbff_0%,#eef8f6_100%)] p-3 sm:w-24">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name || "Product"} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <Package className="h-8 w-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-semibold text-slate-950">{item.name || "Product unavailable"}</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Quantity {item.quantity || 1} x {formatMoney(item.priceAtPurchase)}
                                        </p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-950">
                                        {formatMoney(Number(item.priceAtPurchase || 0) * Number(item.quantity || 1))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                    <div className="surface-card">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="eyebrow">Shipping</p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-950">Delivery address</h2>
                            </div>
                        </div>

                        <div className="mt-5 space-y-1 text-sm leading-7 text-slate-600">
                            <p className="font-semibold text-slate-950">
                                {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Name unavailable"}
                            </p>
                            <p>{[address.street, address.apartment].filter(Boolean).join(", ") || "Street unavailable"}</p>
                            <p>{[address.city, address.state, address.pincode].filter(Boolean).join(", ") || "City unavailable"}</p>
                            <p>{address.country || "Country unavailable"}</p>
                            <p>{address.phone ? `Phone: ${address.phone}` : "Phone unavailable"}</p>
                        </div>
                    </div>

                    <div className="surface-card">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="eyebrow">Payment</p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-950">Order summary</h2>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <PriceRow label="Subtotal" value={currentOrder.subtotal} />
                            <PriceRow label="Shipping" value={currentOrder.shippingFee} />
                            <PriceRow label="Tax" value={currentOrder.tax} />
                            {Number(currentOrder.discount || 0) > 0 && <PriceRow label="Discount" value={-Number(currentOrder.discount)} tone="success" />}
                            <div className="border-t border-slate-200 pt-4">
                                <PriceRow label="Total" value={currentOrder.total} strong />
                            </div>
                        </div>

                        <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            <p className="font-semibold capitalize text-slate-950">{formatPaymentLabel(currentOrder.paymentMethod)}</p>
                            <p className="capitalize">{formatPaymentLabel(currentOrder.paymentStatus)}</p>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize ${config.badge}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${normalizeStatus(status) === "cancelled" ? "bg-rose-500" : "bg-teal-600"}`} />
            {config.label}
        </span>
    );
};

const DetailStat = ({ icon, label, value }) => {
    const StatIcon = icon;

    return (
        <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <StatIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                    <p className="truncate text-sm font-semibold capitalize text-slate-950">{value}</p>
                </div>
            </div>
        </div>
    );
};

const PriceRow = ({ label, value, strong = false, tone = "default" }) => (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-bold text-slate-950" : "text-sm text-slate-600"}`}>
        <span>{label}</span>
        <span className={tone === "success" ? "font-semibold text-teal-700" : ""}>{formatMoney(value)}</span>
    </div>
);

const OrderDetailsSkeleton = () => (
    <div className="section-shell space-y-8 py-10">
        <div className="h-80 animate-pulse rounded-[40px] bg-white shadow-sm" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
                <div className="h-64 animate-pulse rounded-[32px] bg-white shadow-sm" />
                <div className="h-96 animate-pulse rounded-[32px] bg-white shadow-sm" />
            </div>
            <div className="h-96 animate-pulse rounded-[32px] bg-white shadow-sm" />
        </div>
    </div>
);

export default OrderDetails;
