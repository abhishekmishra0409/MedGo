import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="admin-shell flex h-screen min-h-0 gap-4 overflow-hidden py-4 xl:gap-6 xl:py-6">
            <Sidebar />
            <div className="min-h-0 flex-1 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm xl:rounded-[32px] xl:p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
