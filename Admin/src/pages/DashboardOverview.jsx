import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Activity,
    Users,
    ShoppingCart,
    ClipboardList,
    Stethoscope,
    FlaskConical,
    Building
} from "lucide-react";
import { fetchAllUsers } from "../features/Auth/AuthSlice.js";
import { getAllOrders } from "../features/Orders/OrderSlice.js";
import { getAllDoctors } from "../features/Doctors/DoctorSlice.js";
import { getAllProducts } from "../features/Products/ProductSlice.js";
import { getClinics } from "../features/Clinics/ClinicSlice.js";
import { getAllTests } from "../features/Tests/TestSlice.js";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatRelativeTime = (value) => {
    if (!value) return "Recently";

    const timestamp = new Date(value).getTime();

    if (Number.isNaN(timestamp)) return "Recently";

    const diffInSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
    const units = [
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "min", seconds: 60 },
    ];
    const unit = units.find((item) => diffInSeconds >= item.seconds);

    if (!unit) return "Just now";

    const amount = Math.floor(diffInSeconds / unit.seconds);
    return `${amount} ${unit.label}${amount > 1 ? "s" : ""} ago`;
};

const getStatusClasses = (status = "") => {
    switch (status) {
        case "delivered":
            return "bg-green-100 text-green-800";
        case "processing":
        case "shipped":
            return "bg-blue-100 text-blue-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        default:
            return "bg-yellow-100 text-yellow-800";
    }
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { users = [], isLoading: isUsersLoading } = useSelector((state) => state.auth);
    const { orders = [], totalOrders = 0, isLoading: isOrdersLoading } = useSelector((state) => state.order);
    const { doctors = [], isLoading: isDoctorsLoading } = useSelector((state) => state.doctor);
    const { products = [], isLoading: isProductsLoading } = useSelector((state) => state.product);
    const { clinics = [], isLoading: isClinicsLoading } = useSelector((state) => state.clinic);
    const { tests = [], isLoading: isTestsLoading } = useSelector((state) => state.test);

    useEffect(() => {
        dispatch(fetchAllUsers());
        dispatch(getAllOrders({ page: 1, limit: 5 }));
        dispatch(getAllDoctors());
        dispatch(getAllProducts());
        dispatch(getClinics());
        dispatch(getAllTests());
    }, [dispatch]);

    const isLoading =
        isUsersLoading ||
        isOrdersLoading ||
        isDoctorsLoading ||
        isProductsLoading ||
        isClinicsLoading ||
        isTestsLoading;

    const patientCount = users.filter((user) => user.role === "user").length;
    const activeProducts = products.filter((product) => Number(product.stock) > 0).length;
    const activeTests = tests.filter((test) => test.isActive !== false).length;
    const activeClinics = clinics.filter((clinic) => clinic.isActive !== false).length;
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const pendingOrders = orders.filter((order) => order.status === "pending").length;

    const stats = [
        { title: "Patient Users", value: formatNumber(patientCount), icon: Users, caption: `${formatNumber(users.length)} total accounts` },
        { title: "Total Orders", value: formatNumber(totalOrders), icon: ShoppingCart, caption: `${formatNumber(pendingOrders)} pending in latest batch` },
        { title: "Active Products", value: formatNumber(activeProducts), icon: ClipboardList, caption: `${formatNumber(products.length)} products listed` },
        { title: "Registered Doctors", value: formatNumber(doctors.length), icon: Stethoscope, caption: `${formatNumber(doctors.filter((doctor) => doctor.approvalStatus === "pending").length)} awaiting approval` },
        { title: "Active Clinics", value: formatNumber(activeClinics), icon: Building, caption: `${formatNumber(clinics.length)} clinics listed` },
        { title: "Active Lab Tests", value: formatNumber(activeTests), icon: FlaskConical, caption: `${formatNumber(tests.length)} tests configured` },
    ];

    const recentActivities = useMemo(() => {
        const orderActivities = orders.slice(0, 3).map((order) => ({
            action: `Order ${order.status || "updated"}`,
            time: formatRelativeTime(order.updatedAt || order.createdAt),
            user: order.user?.username || order.user?.email || "Customer",
        }));

        const doctorActivities = doctors.slice(0, 2).map((doctor) => ({
            action: `Doctor ${doctor.approvalStatus || "registered"}`,
            time: formatRelativeTime(doctor.updatedAt || doctor.createdAt),
            user: doctor.name || doctor.email || "Doctor",
        }));

        const userActivity = users[0]
            ? [{
                action: "Latest account created",
                time: formatRelativeTime(users[0].createdAt),
                user: users[0].email || users[0].username || "User",
            }]
            : [];

        return [...orderActivities, ...doctorActivities, ...userActivity].slice(0, 5);
    }, [orders, doctors, users]);

    return (
        <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Operations overview</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-950">Track growth, throughput, and service readiness.</h1>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {isLoading ? "Refreshing live admin data..." : "Live data from the admin API"}
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</p>
                            </div>
                            <div className="rounded-full bg-teal-100 p-3 text-teal-700">
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{stat.caption}</p>
                    </div>
                ))}
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Order Snapshot</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{formatCurrency(totalRevenue)} latest batch</span>
                            <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {["pending", "processing", "delivered"].map((status) => (
                            <div key={status} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-medium capitalize text-slate-500">{status}</p>
                                <p className="mt-2 text-2xl font-semibold text-slate-950">
                                    {formatNumber(orders.filter((order) => order.status === status).length)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                        Snapshot uses the latest orders returned for the overview page.
                    </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
                    <div className="space-y-4">
                        {orders.length ? (
                            orders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">#{order._id?.slice(-6).toUpperCase()}</p>
                                        <p className="text-sm text-gray-500">{order.user?.username || order.user?.email || "Customer"}</p>
                                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(order.total)}</p>
                                        <span className={`rounded-full px-2 py-1 text-xs capitalize ${getStatusClasses(order.status)}`}>
                                            {order.status || "pending"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No recent orders found.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Recent Activities</h2>
                <div className="space-y-3">
                    {recentActivities.length ? (
                        recentActivities.map((activity, index) => (
                            <div key={`${activity.action}-${index}`} className="flex items-start">
                                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                <div className="ml-3">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.action}</span> by {activity.user}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No recent activity yet.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
