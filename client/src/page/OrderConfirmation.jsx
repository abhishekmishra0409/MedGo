import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, ChevronRight, PackageCheck, ReceiptText, ShoppingBag } from "lucide-react";
import { getOrderById } from "../features/Order/OrderSlice.js";

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const getShortOrderId = (orderId) => `#${String(orderId || "order").slice(-6).toUpperCase()}`;

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { order, isLoading } = useSelector((state) => state.order);
    const hasValidOrderId = orderId && orderId !== "undefined" && orderId !== "null";
    const confirmedOrder = order?._id === orderId ? order : null;

    useEffect(() => {
        if (hasValidOrderId) {
            dispatch(getOrderById(orderId));
        }
    }, [dispatch, hasValidOrderId, orderId]);

    return (
        <div className="section-shell py-10">
            <section className="hero-panel text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-teal-50 text-teal-700">
                    <CheckCircle2 className="h-11 w-11" />
                </div>

                <div className="mx-auto mt-6 max-w-2xl space-y-3">
                    <span className="eyebrow">Order confirmed</span>
                    <h1 className="section-title">Your pharmacy order is placed.</h1>
                    <p className="section-copy">
                        We received your order and saved the details to your account. You can open the full order page any time.
                    </p>
                </div>

                <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                    <ConfirmationStat icon={ReceiptText} label="Order ID" value={hasValidOrderId ? getShortOrderId(orderId) : "Unavailable"} />
                    <ConfirmationStat
                        icon={ShoppingBag}
                        label="Items"
                        value={confirmedOrder ? `${confirmedOrder.items?.length || 0} products` : isLoading ? "Loading" : "Saved"}
                    />
                    <ConfirmationStat
                        icon={PackageCheck}
                        label="Status"
                        value={confirmedOrder?.status ? confirmedOrder.status : "Pending"}
                    />
                </div>

                {confirmedOrder ? (
                    <div className="mx-auto mt-6 max-w-md rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-600">Order total</span>
                            <span className="text-xl font-bold text-slate-950">{formatMoney(confirmedOrder.total)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-600">
                            <span>Payment</span>
                            <span className="font-semibold capitalize">{String(confirmedOrder.paymentStatus || "pending").replace(/_/g, " ")}</span>
                        </div>
                    </div>
                ) : null}

                {!hasValidOrderId ? (
                    <div className="mx-auto mt-6 max-w-xl rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                        The order was created, but the confirmation link did not include an order id. Please open your orders list to review it.
                    </div>
                ) : null}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    {hasValidOrderId ? (
                        <Link to={`/order-details/${orderId}`} className="btn-primary px-6 py-3 text-sm">
                            View Order Details
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => navigate("/user/orders")}
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                    >
                        View Your Orders
                    </button>
                </div>
            </section>
        </div>
    );
};

const ConfirmationStat = ({ icon, label, value }) => {
    const StatIcon = icon;

    return (
        <div className="rounded-[24px] border border-white/80 bg-white/80 p-4 text-left shadow-sm">
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

export default OrderConfirmation;
