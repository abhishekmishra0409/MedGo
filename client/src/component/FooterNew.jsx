import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

const footerLinks = [
    { title: "Care paths", items: ["Doctors", "Lab Tests", "Pharmacy", "Emergency Support"] },
    { title: "Platform", items: ["Appointments", "Order tracking", "Patient dashboard", "Doctor workspace"] },
    { title: "Trust", items: ["Privacy policy", "Terms of use", "Support", "Care standards"] },
];

const FooterNew = () => {
    return (
        <footer className="border-t border-slate-200 bg-[linear-gradient(180deg,#f7fbff_0%,#eef8f6_100%)]">
            <div className="section-shell space-y-10 py-14">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
                    <div className="space-y-6">
                        <span className="eyebrow">Built for dependable care journeys</span>
                        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950">
                            MedGo brings consultations, medicines, and diagnostic follow-up into one calm healthcare experience.
                        </h2>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            Designed for patients who need clarity and trust, and for care teams who need simpler workflows across appointments, orders, and reports.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/doctorlists" className="btn-primary px-5 py-3 text-sm">
                                Find a doctor
                            </Link>
                            <Link to="/labtestlists" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                                Explore diagnostics
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="surface-card">
                            <p className="text-sm font-semibold text-slate-900">24/7 readiness</p>
                            <p className="mt-2 text-sm text-slate-600">Emergency routing, faster discovery, and clearer next steps from the first visit.</p>
                        </div>
                        <div className="surface-card">
                            <p className="text-sm font-semibold text-slate-900">Unified records</p>
                            <p className="mt-2 text-sm text-slate-600">Appointments, lab bookings, and pharmacy orders stay visible in one account area.</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 border-t border-slate-200 pt-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/android-icon-192x192.png" alt="MedGo" className="h-12 w-12 rounded-2xl" />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">MedGo</p>
                                <p className="text-sm text-slate-500">Care platform</p>
                            </div>
                        </div>
                        <p className="text-sm leading-7 text-slate-600">
                            Patient-first healthcare journeys with clearer action states, accessible UI, and dependable operational visibility.
                        </p>
                        <div className="flex items-center gap-3 text-slate-500">
                            <Facebook className="h-4 w-4" />
                            <Instagram className="h-4 w-4" />
                            <Linkedin className="h-4 w-4" />
                            <Youtube className="h-4 w-4" />
                        </div>
                    </div>

                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{group.title}</h3>
                            <ul className="mt-4 space-y-3 text-sm text-slate-700">
                                {group.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>© 2026 MedGo. Healthcare workflows made simpler.</p>
                    <div className="flex flex-wrap gap-3">
                        <img src="/play_store.png" alt="Google Play" className="h-10" />
                        <img src="/app_store.png" alt="App Store" className="h-10" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterNew;
