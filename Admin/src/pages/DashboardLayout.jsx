import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="admin-shell flex h-screen min-h-0 gap-6 overflow-hidden py-6">
            <Sidebar />
            <div className="min-h-0 flex-1 overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
