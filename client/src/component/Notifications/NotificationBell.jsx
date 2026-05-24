import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, CheckCheck, Inbox, Loader2, X } from "lucide-react";
import {
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "../../features/Notifications/NotificationSlice.js";
import EmptyState from "../ui/EmptyState.jsx";

const formatTime = (value) => {
    if (!value) return "Recently";

    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return "Recently";

    const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
    const units = [
        { label: "d", seconds: 86400 },
        { label: "h", seconds: 3600 },
        { label: "m", seconds: 60 },
    ];
    const unit = units.find((item) => seconds >= item.seconds);

    if (!unit) return "Just now";
    return `${Math.floor(seconds / unit.seconds)}${unit.label} ago`;
};

const getToneClass = (type = "") => {
    if (type.includes("order")) return "bg-emerald-100 text-emerald-700";
    if (type.includes("appointment")) return "bg-sky-100 text-sky-700";
    if (type.includes("lab")) return "bg-violet-100 text-violet-700";
    if (type.includes("message")) return "bg-amber-100 text-amber-700";
    return "bg-teal-100 text-teal-700";
};

const NotificationBell = ({ tokenKey = "userToken", label = "Notifications", align = "right" }) => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const { items, unreadCount, isLoading } = useSelector((state) => state.notifications);
    const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem(tokenKey));

    useEffect(() => {
        if (hasToken) {
            dispatch(fetchNotifications({ tokenKey }));
        }
    }, [dispatch, hasToken, tokenKey]);

    const sortedItems = useMemo(() => items.slice(0, 30), [items]);

    const openDrawer = () => {
        setIsOpen(true);
        if (hasToken) {
            dispatch(fetchNotifications({ tokenKey }));
        }
    };

    const handleMarkRead = (notification) => {
        if (!notification?.readAt) {
            dispatch(markNotificationRead({ notificationId: notification._id, tokenKey }));
        }
    };

    const handleMarkAll = () => {
        dispatch(markAllNotificationsRead({ tokenKey }));
    };

    if (!hasToken) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={openDrawer}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
                aria-label={label}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[0.65rem] font-bold leading-none text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                ) : null}
            </button>

            {isOpen ? (
                <div className="fixed inset-0 z-[90]">
                    <button
                        type="button"
                        aria-label="Close notifications"
                        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
                        onClick={() => setIsOpen(false)}
                    />
                    <section
                        className={`absolute top-0 h-full w-full max-w-md bg-white shadow-2xl ${
                            align === "left" ? "left-0" : "right-0"
                        }`}
                    >
                        <div className="flex h-full flex-col">
                            <div className="border-b border-slate-200 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Activity</p>
                                        <h2 className="mt-1 text-xl font-semibold text-slate-950">{label}</h2>
                                        <p className="mt-1 text-sm text-slate-500">{unreadCount} unread updates</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                                        aria-label="Close notifications"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleMarkAll}
                                    disabled={!unreadCount}
                                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Mark all read
                                </button>
                            </div>

                            <div className="modal-scroll min-h-0 flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="flex h-40 items-center justify-center text-slate-500">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Loading updates...
                                    </div>
                                ) : sortedItems.length ? (
                                    <div className="space-y-3">
                                        {sortedItems.map((notification) => (
                                            <button
                                                key={notification._id}
                                                type="button"
                                                onClick={() => handleMarkRead(notification)}
                                                className={`w-full rounded-3xl border p-4 text-left transition hover:border-teal-200 ${
                                                    notification.readAt
                                                        ? "border-slate-100 bg-white"
                                                        : "border-teal-100 bg-teal-50/70"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className={`mt-0.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase ${getToneClass(notification.type)}`}>
                                                        {notification.entityType || "Update"}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="font-semibold text-slate-950">{notification.title}</p>
                                                            <span className="shrink-0 text-xs text-slate-400">{formatTime(notification.createdAt)}</span>
                                                        </div>
                                                        <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Inbox}
                                        title="No notifications yet"
                                        message="Order, booking, lab, and message updates will appear here."
                                        className="h-52"
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    );
};

export default NotificationBell;
