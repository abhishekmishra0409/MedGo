import { Outlet } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import Footer from "../FooterNew.jsx";

const PublicLayout = () => {
    return (
        <div className="min-h-screen min-w-0 bg-[var(--color-page)] text-slate-900">
            <Navbar />
            <main className="min-h-[calc(100vh-12rem)] min-w-0">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
