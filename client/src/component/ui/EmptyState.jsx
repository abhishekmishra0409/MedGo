const EmptyState = ({ icon: Icon, title, message, className = "" }) => (
    <div className={`grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center ${className}`}>
        <div>
            {Icon ? <Icon className="mx-auto h-8 w-8 text-slate-400" /> : null}
            <p className="mt-3 font-semibold text-slate-900">{title}</p>
            {message ? <p className="mt-1 text-sm text-slate-500">{message}</p> : null}
        </div>
    </div>
);

export default EmptyState;
