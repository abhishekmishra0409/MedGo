import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    BadgeCheck,
    ChevronRight,
    Minus,
    PackageOpen,
    Plus,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Truck,
    X,
} from "lucide-react";
import {
    clearCart,
    fetchCart,
    removeCartItem,
    updateCartItem,
} from "../features/Cart/CartSlice.js";

const CART_STORAGE_KEY = "cartItems";
const COUPON_STORAGE_KEY = "cartCoupon";
const VALID_COUPONS = { SAVE10: 10, SAVE20: 20 };

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const readStoredCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
};

const getProduct = (item) => item?.product || {};
const getProductId = (item) => getProduct(item)?._id || item?.productId || item?._id;
const getProductPrice = (item) => Number(getProduct(item)?.price || item?.price || 0);
const getProductName = (item) => getProduct(item)?.name || item?.name || "Medical product";
const getProductImage = (item) => getProduct(item)?.image || item?.image || "/product01.png";

const persistCart = (items) => {
    if (items.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
        localStorage.removeItem(CART_STORAGE_KEY);
    }
};

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems: reduxCartItems, isLoading } = useSelector((state) => state.cart);
    const [couponInput, setCouponInput] = useState(localStorage.getItem(COUPON_STORAGE_KEY) || "");
    const [appliedCoupon, setAppliedCoupon] = useState(() => {
        const savedCoupon = (localStorage.getItem(COUPON_STORAGE_KEY) || "").trim().toUpperCase();
        return VALID_COUPONS[savedCoupon] ? savedCoupon : "";
    });
    const [couponMessage, setCouponMessage] = useState("");
    const [localCartItems, setLocalCartItems] = useState(readStoredCart);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    useEffect(() => {
        if (Array.isArray(reduxCartItems)) {
            setLocalCartItems(reduxCartItems);
        }
    }, [reduxCartItems]);

    useEffect(() => {
        if (Array.isArray(reduxCartItems)) {
            persistCart(reduxCartItems);
        }
    }, [reduxCartItems]);

    const displayCartItems = localCartItems;

    const subtotal = useMemo(
        () =>
            displayCartItems.reduce(
                (acc, item) => acc + getProductPrice(item) * Number(item?.quantity || 1),
                0
            ),
        [displayCartItems]
    );
    const discount = appliedCoupon ? Math.min(VALID_COUPONS[appliedCoupon], subtotal) : 0;
    const total = Math.max(0, subtotal - discount);
    const itemCount = displayCartItems.reduce((acc, item) => acc + Number(item?.quantity || 1), 0);

    const syncLocalCart = (items) => {
        setLocalCartItems(items);
        persistCart(items);
    };

    const updateQty = async (id, qty) => {
        if (!id) {
            return;
        }

        const newQty = Math.max(1, Number(qty) || 1);
        const previousItems = localCartItems;
        const updatedItems = localCartItems.map((item) =>
            getProductId(item) === id ? { ...item, quantity: newQty } : item
        );

        syncLocalCart(updatedItems);

        try {
            await dispatch(updateCartItem({ productId: id, updatedData: { quantity: newQty } })).unwrap();
        } catch (error) {
            syncLocalCart(previousItems);
            toast.error(error || "Could not update cart quantity.");
        }
    };

    const incrementQty = (id, currentQty) => updateQty(id, Number(currentQty || 1) + 1);
    const decrementQty = (id, currentQty) => updateQty(id, Math.max(1, Number(currentQty || 1) - 1));

    const removeItem = async (id) => {
        if (!id) {
            return;
        }

        const previousItems = localCartItems;
        const updatedItems = localCartItems.filter((item) => getProductId(item) !== id);

        syncLocalCart(updatedItems);

        try {
            await dispatch(removeCartItem(id)).unwrap();
            toast.success("Product removed from cart.");
        } catch (error) {
            syncLocalCart(previousItems);
            toast.error(error || "Could not remove this product.");
        }
    };

    const emptyCart = async () => {
        if (!window.confirm("Are you sure you want to empty your cart?")) {
            return;
        }

        const previousItems = localCartItems;
        syncLocalCart([]);
        localStorage.removeItem(COUPON_STORAGE_KEY);
        setAppliedCoupon("");
        setCouponInput("");

        try {
            await dispatch(clearCart()).unwrap();
            toast.success("Cart emptied.");
        } catch (error) {
            syncLocalCart(previousItems);
            toast.error(error || "Could not empty your cart.");
        }
    };

    const refreshCart = () => {
        dispatch(fetchCart());
    };

    const proceedToCheckout = () => {
        navigate("/checkout");
    };

    const applyCoupon = (event) => {
        event?.preventDefault();
        const code = couponInput.trim().toUpperCase();

        if (!code) {
            setAppliedCoupon("");
            setCouponMessage("Enter a coupon code to apply a discount.");
            localStorage.removeItem(COUPON_STORAGE_KEY);
            return;
        }

        if (VALID_COUPONS[code]) {
            setAppliedCoupon(code);
            setCouponInput(code);
            setCouponMessage(`${code} applied. You saved ${formatMoney(VALID_COUPONS[code])}.`);
            localStorage.setItem(COUPON_STORAGE_KEY, code);
            return;
        }

        setAppliedCoupon("");
        setCouponMessage("That coupon is not available for this cart.");
        localStorage.removeItem(COUPON_STORAGE_KEY);
    };

    const removeCoupon = () => {
        setAppliedCoupon("");
        setCouponInput("");
        setCouponMessage("Coupon removed.");
        localStorage.removeItem(COUPON_STORAGE_KEY);
    };

    const handleCardClick = (id) => {
        if (id) {
            navigate(`/product/${id}`);
        }
    };

    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-4">
                        <span className="eyebrow">Pharmacy cart</span>
                        <div className="space-y-3">
                            <h1 className="section-title max-w-3xl">Review your medical essentials before checkout.</h1>
                            <p className="section-copy max-w-2xl">
                                Adjust quantities, apply pharmacy offers, and continue with a clean order summary.
                            </p>
                        </div>
                    </div>

                    {displayCartItems.length > 0 && (
                        <button onClick={proceedToCheckout} className="btn-primary w-full px-6 py-3 text-sm sm:w-auto">
                            Checkout
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <CartSignal icon={ShoppingBag} label="Items" value={`${itemCount} selected`} />
                    <CartSignal icon={Truck} label="Delivery" value={subtotal > 1000 ? "Free at checkout" : "Calculated next"} />
                    <CartSignal icon={ShieldCheck} label="Payment" value="Protected order flow" />
                </div>
            </section>

            {isLoading && displayCartItems.length === 0 ? (
                <CartSkeleton />
            ) : displayCartItems.length === 0 ? (
                <section className="empty-state">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                        <PackageOpen className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-950">Your cart is empty</h2>
                        <p className="max-w-md text-sm leading-7 text-slate-600">
                            Add medicines, wellness products, or home health essentials to start an order.
                        </p>
                    </div>
                    <button onClick={() => navigate("/productlists")} className="btn-primary px-6 py-3 text-sm">
                        Continue Shopping
                    </button>
                </section>
            ) : (
                <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-4">
                        <div className="section-heading-row">
                            <div>
                                <p className="eyebrow">Cart items</p>
                                <h2 className="text-2xl font-semibold text-slate-950">{displayCartItems.length} products ready</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => navigate("/productlists")}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Shop More
                                </button>
                                <button
                                    onClick={refreshCart}
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                    Sync
                                </button>
                            </div>
                        </div>

                        {displayCartItems.map((item) => {
                            const productId = getProductId(item);
                            const quantity = Number(item?.quantity || 1);
                            const lineTotal = getProductPrice(item) * quantity;

                            return (
                                <article
                                    key={productId || getProductName(item)}
                                    className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-xl sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleCardClick(productId)}
                                        className="flex h-28 w-full items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#f8fbff_0%,#eef8f6_100%)] p-3 sm:w-28"
                                        aria-label={`View ${getProductName(item)}`}
                                    >
                                        <img
                                            src={getProductImage(item)}
                                            alt={getProductName(item)}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </button>

                                    <div className="min-w-0 space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => handleCardClick(productId)}
                                            className="block min-w-0 text-left"
                                        >
                                            <h3 className="line-clamp-2 text-lg font-semibold text-slate-950 transition hover:text-teal-700">
                                                {getProductName(item)}
                                            </h3>
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                            <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">
                                                {formatMoney(getProductPrice(item))} each
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
                                                <BadgeCheck className="h-3.5 w-3.5 text-teal-600" />
                                                MedGo verified
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="inline-flex h-11 items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                                                <button
                                                    type="button"
                                                    onClick={() => decrementQty(productId, quantity)}
                                                    disabled={quantity <= 1 || isLoading}
                                                    className="flex h-full w-11 items-center justify-center text-slate-600 transition hover:bg-white hover:text-teal-700 disabled:opacity-40"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="flex h-full w-12 items-center justify-center border-x border-slate-200 bg-white text-sm font-semibold text-slate-950">
                                                    {quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => incrementQty(productId, quantity)}
                                                    disabled={isLoading}
                                                    className="flex h-full w-11 items-center justify-center text-slate-600 transition hover:bg-white hover:text-teal-700 disabled:opacity-40"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(productId)}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                                        <p className="text-sm font-medium text-slate-500">Subtotal</p>
                                        <p className="text-xl font-semibold text-slate-950">{formatMoney(lineTotal)}</p>
                                    </div>
                                </article>
                            );
                        })}

                        <button
                            type="button"
                            onClick={emptyCart}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                        >
                            <Trash2 className="h-4 w-4" />
                            Empty Cart
                        </button>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        <form onSubmit={applyCoupon} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="eyebrow">Savings</p>
                                    <h3 className="mt-1 text-xl font-semibold text-slate-950">Apply coupon</h3>
                                </div>
                                {appliedCoupon && (
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-rose-600"
                                        aria-label="Remove coupon"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                                    placeholder="SAVE10"
                                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase text-slate-800 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100"
                                />
                                <button type="submit" className="btn-primary px-5 py-3 text-sm">
                                    Apply
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {Object.keys(VALID_COUPONS).map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => {
                                            setCouponInput(code);
                                            setAppliedCoupon(code);
                                            setCouponMessage(`${code} applied. You saved ${formatMoney(VALID_COUPONS[code])}.`);
                                            localStorage.setItem(COUPON_STORAGE_KEY, code);
                                        }}
                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                            appliedCoupon === code
                                                ? "border-teal-200 bg-teal-50 text-teal-700"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-700"
                                        }`}
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>

                            {couponMessage && (
                                <p className={`mt-3 text-sm font-medium ${appliedCoupon ? "text-teal-700" : "text-rose-600"}`}>
                                    {couponMessage}
                                </p>
                            )}
                        </form>

                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="eyebrow">Order summary</p>
                            <h3 className="mt-1 text-xl font-semibold text-slate-950">Cart total</h3>

                            <div className="mt-5 space-y-3">
                                <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />
                                {discount > 0 && <SummaryRow label={`Discount (${appliedCoupon})`} value={`- ${formatMoney(discount)}`} tone="success" />}
                                <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                                    Shipping and GST are calculated on the checkout page.
                                </div>
                                <div className="border-t border-slate-200 pt-4">
                                    <SummaryRow label="Estimated total" value={formatMoney(total)} strong />
                                </div>
                            </div>

                            <button
                                onClick={proceedToCheckout}
                                className="btn-primary mt-5 w-full px-6 py-3 text-sm"
                            >
                                Order Now
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </aside>
                </section>
            )}
        </div>
    );
};

const CartSignal = ({ icon, label, value }) => {
    const SignalIcon = icon;

    return (
        <div className="flex items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <SignalIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
                <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
};

const SummaryRow = ({ label, value, strong = false, tone = "default" }) => (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-bold text-slate-950" : "text-sm text-slate-600"}`}>
        <span>{label}</span>
        <span className={`${tone === "success" ? "text-teal-700" : ""}`}>{value}</span>
    </div>
);

const CartSkeleton = () => (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-[28px] bg-white shadow-sm" />
            ))}
        </div>
        <div className="h-80 animate-pulse rounded-[28px] bg-white shadow-sm" />
    </section>
);

export default CartPage;
