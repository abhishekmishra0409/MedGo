import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, Shield, Trash2, UserRound, Users } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmModal, EmptyState, PageHeader, Pagination, SearchInput, SegmentedControl, StatusPill } from "../../components/AdminUI.jsx";
import { deleteUserAccount, fetchAllUsers } from "../../features/auth/authSlice";

const roleOptions = [
    { value: "all", label: "All" },
    { value: "user", label: "Patients" },
    { value: "doctor", label: "Doctors" },
    { value: "admin", label: "Admins" },
];

const roleTone = (role) => {
    if (role === "doctor") return "teal";
    if (role === "admin") return "amber";
    return "slate";
};

const AllUsers = () => {
    const dispatch = useDispatch();
    const { users = [], isLoading, isSuccess, message, isError } = useSelector((state) => state.auth);
    const [filterValue, setFilterValue] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(8);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess && message) toast.success(message);
        if (isError && message) toast.error(message);
    }, [isSuccess, isError, message]);

    const filteredItems = useMemo(() => {
        const query = filterValue.trim().toLowerCase();
        return users.filter((user) => {
            const role = user.role || "user";
            const matchesRole = roleFilter === "all" || role === roleFilter;
            const matchesSearch =
                !query ||
                (user.username || "").toLowerCase().includes(query) ||
                (user.email || "").toLowerCase().includes(query) ||
                (user.phone || "").toLowerCase().includes(query) ||
                role.toLowerCase().includes(query);

            return matchesRole && matchesSearch;
        });
    }, [filterValue, roleFilter, users]);

    const pages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
    const paginatedItems = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        await dispatch(deleteUserAccount(userToDelete._id));
        dispatch(fetchAllUsers());
        setUserToDelete(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Accounts"
                title="Users"
                description="Search, review, and manage patient, doctor, and admin accounts."
                action={(
                    <div className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        {filteredItems.length} shown
                    </div>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <SearchInput
                        value={filterValue}
                        onChange={(value) => {
                            setFilterValue(value);
                            setPage(1);
                        }}
                        placeholder="Search by name, email, phone, or role..."
                    />
                    <SegmentedControl
                        options={roleOptions}
                        value={roleFilter}
                        onChange={(value) => {
                            setRoleFilter(value);
                            setPage(1);
                        }}
                    />
                </div>

                {isLoading ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : paginatedItems.length ? (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {paginatedItems.map((user) => (
                            <article key={user._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-bold text-teal-800">
                                        {(user.username || user.email || "U").slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate text-lg font-bold text-slate-950">{user.username || "Unnamed user"}</h3>
                                            <StatusPill tone={roleTone(user.role)} icon={<Shield className="h-3.5 w-3.5" />}>{user.role || "user"}</StatusPill>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                            <p className="flex min-w-0 items-center gap-2">
                                                <Mail className="h-4 w-4 shrink-0 text-teal-700" />
                                                <span className="truncate">{user.email || "Email unavailable"}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 shrink-0 text-teal-700" />
                                                {user.phone || "Phone unavailable"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUserToDelete(user)}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50"
                                        aria-label="Delete user"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState
                            icon={<Users className="h-7 w-7" />}
                            title="No users found"
                            description="Try another search term or role filter."
                        />
                    </div>
                )}

                <div className="mt-5">
                    <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
                </div>
            </section>

            {userToDelete ? (
                <ConfirmModal
                    title="Delete user"
                    description={`Delete ${userToDelete.username || userToDelete.email}? This action cannot be undone.`}
                    confirmLabel="Delete user"
                    onCancel={() => setUserToDelete(null)}
                    onConfirm={handleDeleteConfirm}
                />
            ) : null}
        </div>
    );
};

export default AllUsers;
