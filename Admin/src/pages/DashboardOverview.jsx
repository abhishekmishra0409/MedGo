import {
    Activity,
    Users,
    ShoppingCart,
    ClipboardList,
    Stethoscope,
    FlaskConical,
    Building
} from "lucide-react";

const Dashboard = () => {
    // Sample data - in a real app, this would come from an API
    const stats = [
        { title: "Total Users", value: "1,234", icon: Users, change: "+12%", trend: "up" },
        { title: "Total Orders", value: "567", icon: ShoppingCart, change: "+5%", trend: "up" },
        { title: "Active Products", value: "89", icon: ClipboardList, change: "-2%", trend: "down" },
        { title: "Registered Doctors", value: "156", icon: Stethoscope, change: "+8%", trend: "up" },
        { title: "Clinics", value: "42", icon: Building, change: "+3%", trend: "up" },
        { title: "Lab Tests", value: "78", icon: FlaskConical, change: "0%", trend: "neutral" },
    ];

    const recentOrders = [
        { id: "#ORD-001", customer: "John Doe", date: "2023-06-15", amount: "$120", status: "Completed" },
        { id: "#ORD-002", customer: "Jane Smith", date: "2023-06-14", amount: "$85", status: "Processing" },
        { id: "#ORD-003", customer: "Robert Johnson", date: "2023-06-14", amount: "$230", status: "Completed" },
        { id: "#ORD-004", customer: "Emily Davis", date: "2023-06-13", amount: "$65", status: "Pending" },
        { id: "#ORD-005", customer: "Michael Wilson", date: "2023-06-12", amount: "$154", status: "Completed" },
    ];

    return (
        <>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : stat.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className={`text-xs mt-2 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                {stat.change} from last month
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Sales Chart */}
                    <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Sales Overview</h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Last 7 days</span>
                                <Activity className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="h-64 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                            [Sales Chart Placeholder]
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                        <div className="space-y-4">
                            {recentOrders.map((order, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{order.id}</p>
                                        <p className="text-sm text-gray-500">{order.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{order.amount}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                        }`}>
                      {order.status}
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                    <div className="space-y-3">
                        {[
                            { action: "New order received", time: "2 min ago", user: "Jane Smith" },
                            { action: "Doctor registration approved", time: "10 min ago", user: "Dr. Robert Chen" },
                            { action: "New lab test added", time: "25 min ago", user: "Admin" },
                            { action: "User account created", time: "1 hour ago", user: "michael.wilson@example.com" },
                            { action: "Clinic profile updated", time: "2 hours ago", user: "City Medical Center" },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 h-2 w-2 mt-2 bg-blue-500 rounded-full"></div>
                                <div className="ml-3">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.action}</span> by {activity.user}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </>
    );
};

export default Dashboard;