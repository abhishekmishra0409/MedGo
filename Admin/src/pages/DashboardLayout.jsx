import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="admin-shell flex min-h-screen gap-6 py-6">
            <Sidebar />
            <div className="flex-1 overflow-auto rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
