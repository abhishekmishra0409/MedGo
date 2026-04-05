import { Link } from 'react-router-dom';
import { ShieldAlert } from "lucide-react";

const UnauthorizedPage = () => {
    return (
        <div className="section-shell flex min-h-[70vh] items-center justify-center py-12">
            <div className="hero-panel max-w-2xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <h1 className="mt-6 text-4xl font-semibold text-slate-950">403 - Unauthorized access</h1>
                <p className="mt-4 text-base leading-8 text-slate-600">
                    This area is protected for a different account type. Use the correct login or return to the public experience.
                </p>
                <Link
                    to="/"
                    className="btn-primary mt-6 px-5 py-3 text-sm"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
