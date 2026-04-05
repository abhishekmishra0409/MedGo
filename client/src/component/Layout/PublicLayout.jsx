import { Outlet } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import Footer from "../FooterNew.jsx";

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-[var(--color-page)] text-slate-900">
            <Navbar />
            <main className="min-h-[calc(100vh-12rem)]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
