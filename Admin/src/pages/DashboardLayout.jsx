import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";

const DashboardLayout = () => {
    return (
        <div className="admin-shell flex h-dvh min-h-0 gap-4 overflow-hidden py-4 xl:gap-5 xl:py-5">
            <Sidebar />
            <div className="admin-scroll min-h-0 flex-1 overflow-y-auto rounded-[28px] border border-slate-200 bg-white/92 p-4 shadow-sm xl:p-5">
                <div className="mb-4 flex items-center justify-end">
                    <NotificationBell />
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
