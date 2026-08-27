import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Landmark,
    MapPin,
    PackageCheck,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    Truck,
    WalletCards,
} from "lucide-react";
import { createOrder } from "../features/Order/OrderSlice.js";
import { clearCart, fetchCart } from "../features/Cart/CartSlice.js";

const CART_STORAGE_KEY = "cartItems";
const COUPON_STORAGE_KEY = "cartCoupon";
const VALID_COUPONS = { SAVE10: 10, SAVE20: 20 };

const PAYMENT_OPTIONS = [
    {
        value: "cash_on_delivery",
        label: "Cash on Delivery",
        description: "Pay safely when your order arrives.",
        icon: PackageCheck,
    },
    {
        value: "upi",
        label: "UPI",
        description: "Use any supported UPI app.",
        icon: Smartphone,
    },
    {
        value: "credit_card",
        label: "Credit Card",
        description: "Visa, Mastercard, and more.",
        icon: CreditCard,
    },
    {
        value: "debit_card",
        label: "Debit Card",
        description: "Pay with your bank card.",
        icon: WalletCards,
    },
    {
        value: "net_banking",
        label: "Net Banking",
        description: "Complete payment through your bank.",
        icon: Landmark,
    },
];

const COUNTRY_OPTIONS = ["India", "United States", "United Kingdom"];

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

const splitName = (name = "") => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
    };
};

const buildInitialAddress = (profile) => {
    const fullName = profile?.name || profile?.username || "";
    const nameParts = splitName(fullName);
    const address = profile?.address || {};
    const country = COUNTRY_OPTIONS.includes(address.country) ? address.country : "India";

    return {
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        street: address.line1 || address.street || "",
        apartment: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.postalCode || address.pincode || "",
        country,
        phone: profile?.phone || profile?.contact?.phone || "",
    };
};

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, isLoading: cartLoading } = useSelector((state) => state.cart);
    const { user, profile, isAuthenticated } = useSelector((state) => state.auth);
    const currentUser = profile || user?.data || user?.user || user;
    const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasRequestedCart, setHasRequestedCart] = useState(false);
    const [localCartItems, setLocalCartItems] = useState(readStoredCart);
    const [couponCode] = useState(() => {
        const savedCoupon = (localStorage.getItem(COUPON_STORAGE_KEY) || "").trim().toUpperCase();
        return VALID_COUPONS[savedCoupon] ? savedCoupon : "";
    });
    const [shippingAddress, setShippingAddress] = useState(() => buildInitialAddress(currentUser));

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        let isMounted = true;

        dispatch(fetchCart()).finally(() => {
            if (isMounted) {
                setHasRequestedCart(true);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [dispatch]);

    useEffect(() => {
        if (Array.isArray(cartItems) && cartItems.length > 0) {
            setLocalCartItems(cartItems);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        }
    }, [cartItems]);

    useEffect(() => {
        setShippingAddress((previous) => {
            if (previous.firstName || previous.phone || previous.street || !currentUser) {
                return previous;
            }

            return buildInitialAddress(currentUser);
        });
    }, [currentUser]);

    const checkoutItems = useMemo(() => {
        if (cartItems.length > 0) {
            return cartItems;
        }

        return hasRequestedCart ? [] : localCartItems;
    }, [cartItems, hasRequestedCart, localCartItems]);

    useEffect(() => {
        if (hasRequestedCart && !cartLoading && checkoutItems.length === 0) {
            navigate("/cart");
        }
    }, [cartLoading, checkoutItems.length, hasRequestedCart, navigate]);

    const subtotal = useMemo(
        () =>
            checkoutItems.reduce(
                (acc, item) => acc + getProductPrice(item) * Number(item?.quantity || 1),
                0
            ),
        [checkoutItems]
    );
    const discount = couponCode ? Math.min(VALID_COUPONS[couponCode], subtotal) : 0;
    const shippingFee = subtotal > 1000 ? 0 : 50;
    const tax = subtotal * 0.18;
    const total = Math.max(0, subtotal + shippingFee + tax - discount);
    const totalItems = checkoutItems.reduce((acc, item) => acc + Number(item?.quantity || 1), 0);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        const numericFields = { phone: 10, pincode: 6 };
        const nextValue = numericFields[name] ? value.replace(/\D/g, "").slice(0, numericFields[name]) : value;

        setShippingAddress((prev) => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (checkoutItems.length === 0) {
            navigate("/cart");
            return;
        }

        setIsProcessing(true);

        const orderData = {
            user: currentUser?._id || currentUser?.id,
            items: checkoutItems.map((item) => ({
                product: getProductId(item),
                name: getProductName(item),
                image: getProductImage(item),
                quantity: Number(item?.quantity || 1),
                priceAtPurchase: getProductPrice(item),
            })),
            subtotal,
            shippingFee,
            tax,
            discount,
            total,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "completed",
        };

        try {
            const result = await dispatch(createOrder(orderData)).unwrap();
            const orderId = result?.data?._id || result?._id;
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(COUPON_STORAGE_KEY);
            await dispatch(clearCart()).unwrap().catch(() => null);
            navigate(orderId ? `/order-confirmation/${orderId}` : "/user/orders");
        } catch {
            setIsProcessing(false);
        }
    };

    const isCartPreparing = !hasRequestedCart && checkoutItems.length === 0;

    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={() => navigate("/cart")}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to cart
                        </button>
                        <div className="space-y-3">
                            <span className="eyebrow">Secure checkout</span>
                            <h1 className="section-title max-w-3xl">Confirm delivery details and place your pharmacy order.</h1>
                            <p className="section-copy max-w-2xl">
                                Review the address, choose a payment method, and see the complete tax and shipping breakdown before ordering.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2 rounded-[28px] border border-white/80 bg-white/80 p-3 shadow-sm sm:grid-cols-3">
                        <CheckoutStep label="Cart" state="done" />
                        <CheckoutStep label="Details" state="active" />
                        <CheckoutStep label="Confirm" state="next" />
                    </div>
                </div>
            </section>

            {isCartPreparing ? (
                <CheckoutSkeleton />
            ) : (
                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
                    <div className="space-y-6">
                        <section className="surface-card">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="eyebrow">Delivery</p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Shipping information</h2>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <CheckoutField
                                    label="First Name"
                                    name="firstName"
                                    value={shippingAddress.firstName}
                                    onChange={handleInputChange}
                                    autoComplete="given-name"
                                    required
                                />
                                <CheckoutField
                                    label="Last Name"
                                    name="lastName"
                                    value={shippingAddress.lastName}
                                    onChange={handleInputChange}
                                    autoComplete="family-name"
                                    required
                                />
                                <CheckoutField
                                    className="md:col-span-2"
                                    label="Street Address"
                                    name="street"
                                    value={shippingAddress.street}
                                    onChange={handleInputChange}
                                    autoComplete="address-line1"
                                    required
                                />
                                <CheckoutField
                                    className="md:col-span-2"
                                    label="Apartment, Suite, etc. (Optional)"
                                    name="apartment"
                                    value={shippingAddress.apartment}
                                    onChange={handleInputChange}
                                    autoComplete="address-line2"
                                />
                                <CheckoutField
                                    label="City"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleInputChange}
                                    autoComplete="address-level2"
                                    required
                                />
                                <CheckoutField
                                    label="State"
                                    name="state"
                                    value={shippingAddress.state}
                                    onChange={handleInputChange}
                                    autoComplete="address-level1"
                                    required
                                />
                                <CheckoutField
                                    label="Pincode"
                                    name="pincode"
                                    value={shippingAddress.pincode}
                                    onChange={handleInputChange}
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    title="6-digit pincode"
                                    autoComplete="postal-code"
                                    required
                                />
                                <CheckoutField
                                    label="Phone Number"
                                    name="phone"
                                    value={shippingAddress.phone}
                                    onChange={handleInputChange}
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="\d{10}"
                                    title="10-digit phone number"
                                    autoComplete="tel"
                                    required
                                />
                                <label className="grid gap-2 md:col-span-2">
                                    <span className="text-sm font-semibold text-slate-700">Country</span>
                                    <select
                                        name="country"
                                        value={shippingAddress.country}
                                        onChange={handleInputChange}
                                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100"
                                        required
                                    >
                                        {COUNTRY_OPTIONS.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </section>

                        <section className="surface-card">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="eyebrow">Payment</p>
                                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Choose payment method</h2>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                {PAYMENT_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = paymentMethod === option.value;

                                    return (
                                        <label
                                            key={option.value}
                                            className={`relative flex min-h-28 items-start gap-3 rounded-[24px] border p-4 transition ${
                                                isSelected
                                                    ? "border-teal-300 bg-teal-50 shadow-sm"
                                                    : "border-slate-200 bg-white hover:border-teal-200"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={option.value}
                                                checked={isSelected}
                                                onChange={() => setPaymentMethod(option.value)}
                                                className="sr-only"
                                            />
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isSelected ? "bg-white text-teal-700" : "bg-slate-50 text-slate-500"}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 pr-7">
                                                <p className="font-semibold text-slate-950">{option.label}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                                            </div>
                                            {isSelected && <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-teal-700" />}
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="eyebrow">Summary</p>
                                    <h2 className="mt-1 text-xl font-semibold text-slate-950">Order review</h2>
                                </div>
                                <div className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                                    {totalItems} items
                                </div>
                            </div>

                            <div className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1 modal-scroll">
                                {checkoutItems.map((item) => {
                                    const quantity = Number(item?.quantity || 1);
                                    return (
                                        <div key={getProductId(item) || getProductName(item)} className="flex items-center gap-3 rounded-3xl bg-slate-50 p-3">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
                                                <img src={getProductImage(item)} alt={getProductName(item)} className="max-h-full max-w-full object-contain" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-semibold text-slate-950">{getProductName(item)}</p>
                                                <p className="mt-1 text-xs font-medium text-slate-500">Qty {quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-950">{formatMoney(getProductPrice(item) * quantity)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 space-y-3">
                                <PriceRow label="Subtotal" value={formatMoney(subtotal)} />
                                <PriceRow label="Shipping" value={shippingFee === 0 ? "Free" : formatMoney(shippingFee)} />
                                <PriceRow label="Tax (18%)" value={formatMoney(tax)} />
                                {discount > 0 && <PriceRow label={`Coupon (${couponCode})`} value={`- ${formatMoney(discount)}`} tone="success" />}
                                <div className="border-t border-slate-200 pt-4">
                                    <PriceRow label="Total" value={formatMoney(total)} strong />
                                </div>
                            </div>

                            <div className="mt-5 rounded-3xl bg-[linear-gradient(135deg,rgba(15,156,140,0.12),rgba(14,116,144,0.08))] p-4 text-sm leading-6 text-slate-700">
                                <div className="flex items-start gap-3">
                                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                                    <p>{shippingFee === 0 ? "Your cart qualifies for free shipping." : "Orders above Rs. 1000.00 ship free."}</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing || cartLoading || checkoutItems.length === 0}
                                className="btn-primary mt-5 w-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isProcessing ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-4 w-4" />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </div>
                    </aside>
                </form>
            )}
        </div>
    );
};

const CheckoutStep = ({ label, state }) => {
    const isDone = state === "done";
    const isActive = state === "active";

    return (
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${isActive ? "bg-white text-teal-800 shadow-sm" : "text-slate-500"}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${isDone || isActive ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : label.charAt(0)}
            </span>
            {label}
        </div>
    );
};

const CheckoutField = ({ label, className = "", ...props }) => (
    <label className={`grid gap-2 ${className}`}>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <input
            {...props}
            className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100"
        />
    </label>
);

const PriceRow = ({ label, value, strong = false, tone = "default" }) => (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-bold text-slate-950" : "text-sm text-slate-600"}`}>
        <span>{label}</span>
        <span className={`${tone === "success" ? "font-semibold text-teal-700" : ""}`}>{value}</span>
    </div>
);

const CheckoutSkeleton = () => (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
            <div className="h-96 animate-pulse rounded-[32px] bg-white shadow-sm" />
            <div className="h-72 animate-pulse rounded-[32px] bg-white shadow-sm" />
        </div>
        <div className="h-96 animate-pulse rounded-[28px] bg-white shadow-sm" />
    </section>
);

export default CheckoutPage;
