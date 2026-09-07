import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";

const DashboardLayout = () => {
    return (
        <div className="admin-shell flex min-h-dvh gap-4 py-4 xl:gap-5 xl:py-5">
            <Sidebar />
            <div className="ml-[calc(clamp(1rem,2vw,2rem)+16rem+1rem)] flex-1 xl:ml-[calc(clamp(1rem,2vw,2rem)+16rem+1.25rem)]">
                <header className="fixed left-[calc(clamp(1rem,2vw,2rem)+16rem+1rem)] right-[clamp(1rem,2vw,2rem)] top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm xl:left-[calc(clamp(1rem,2vw,2rem)+16rem+1.25rem)] xl:px-5">
                    <NotificationBell />
                </header>

                <div className="mt-16 rounded-[28px] border border-slate-200 bg-white/92 p-4 shadow-sm xl:p-5">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
