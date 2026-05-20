import { Search, X } from "lucide-react";

export const PageHeader = ({ eyebrow, title, description, action }) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p> : null}
                <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
                {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
            </div>
            {action}
        </div>
    </section>
);

export const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    </div>
);

export const StatusPill = ({ children, tone = "slate", icon }) => {
    const tones = {
        teal: "border-teal-100 bg-teal-50 text-teal-800",
        emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
        amber: "border-amber-100 bg-amber-50 text-amber-800",
        rose: "border-rose-100 bg-rose-50 text-rose-700",
        slate: "border-slate-100 bg-slate-100 text-slate-700",
    };

    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${tones[tone] || tones.slate}`}>
            {icon}
            {children}
        </span>
    );
};

export const EmptyState = ({ icon, title, description, action }) => (
    <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            {icon}
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
        {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
    </div>
);

export const ConfirmModal = ({ title, description, confirmLabel = "Delete", confirmTone = "rose", onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Confirm action</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
                </div>
                <button type="button" onClick={onCancel} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </header>
            <div className="p-5">
                <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white ${confirmTone === "rose" ? "bg-rose-600 hover:bg-rose-700" : "bg-teal-600 hover:bg-teal-700"}`}
                >
                    {confirmLabel}
                </button>
            </footer>
        </section>
    </div>
);

export const SegmentedControl = ({ options, value, onChange }) => (
    <div className="inline-flex flex-wrap rounded-2xl bg-slate-100 p-1">
        {options.map((option) => (
            <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                    value === option.value ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`h-10 w-10 rounded-2xl border text-sm font-semibold ${
                        currentPage === page ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                type="button"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};
