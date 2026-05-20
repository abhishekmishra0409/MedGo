import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit3, Package, Plus, SearchX, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ConfirmModal, EmptyState, PageHeader, Pagination, SearchInput, StatusPill } from "../../components/AdminUI.jsx";
import { deleteProduct, getAllProducts } from "../../features/Products/ProductSlice.js";

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const ProductsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products = [], isLoading, isError, message } = useSelector((state) => state.product);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [productToDelete, setProductToDelete] = useState(null);
    const productsPerPage = 8;

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    useEffect(() => {
        if (isError) toast.error(message);
    }, [isError, message]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return products.filter((product) =>
            !query ||
            (product.name || "").toLowerCase().includes(query) ||
            (product.category || "").toLowerCase().includes(query) ||
            (product.description || "").toLowerCase().includes(query)
        );
    }, [products, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
    const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

    const confirmDelete = () => {
        if (!productToDelete) return;

        dispatch(deleteProduct(productToDelete._id))
            .unwrap()
            .then(() => {
                toast.success("Product deleted successfully");
                setProductToDelete(null);
                dispatch(getAllProducts());
                if (currentProducts.length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
            })
            .catch((error) => toast.error(error.message || "Failed to delete product"));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Products"
                title="Product catalog"
                description="Manage medicines, wellness items, stock, pricing, and storefront badges."
                action={(
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/products/create")}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </button>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <SearchInput
                        value={searchTerm}
                        onChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search products by name, category, or description..."
                    />
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
                        {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
                    </div>
                </div>

                {isLoading ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : currentProducts.length ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {currentProducts.map((product) => (
                            <article key={product._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-sm">
                                <div className="flex h-40 items-center justify-center bg-slate-50 p-4">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="h-full w-full rounded-2xl object-contain" />
                                    ) : (
                                        <Package className="h-10 w-10 text-slate-400" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="line-clamp-2 font-bold text-slate-950">{product.name || "Unnamed product"}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{product.category || "Uncategorized"}</p>
                                        </div>
                                        <StatusPill tone={product.isHot ? "rose" : product.isNew ? "teal" : "slate"}>
                                            {product.isHot ? "Hot" : product.isNew ? "New" : "Normal"}
                                        </StatusPill>
                                    </div>
                                    <div className="mt-4 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-bold text-slate-950">{formatMoney(product.price)}</p>
                                            {product.originalPrice ? <p className="text-xs text-slate-400 line-through">{formatMoney(product.originalPrice)}</p> : null}
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${Number(product.stock) > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                            {Number(product.stock || 0)} stock
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-teal-200 px-3 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProductToDelete(product)}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50"
                                            aria-label="Delete product"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState
                            icon={<SearchX className="h-7 w-7" />}
                            title="No products found"
                            description={searchTerm ? "Try another search term." : "Create the first product to start building the catalog."}
                        />
                    </div>
                )}

                <div className="mt-5">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </section>

            {productToDelete ? (
                <ConfirmModal
                    title="Delete product"
                    description={`Delete ${productToDelete.name}? This action cannot be undone.`}
                    confirmLabel="Delete product"
                    onCancel={() => setProductToDelete(null)}
                    onConfirm={confirmDelete}
                />
            ) : null}
        </div>
    );
};

export default ProductsPage;
