import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Edit3, FileText, ImagePlus, Plus, Trash2, X } from "lucide-react";
import {
    createNewBlog,
    deleteBlog,
    fetchMyBlogs,
    resetBlogState,
    updateBlog,
} from "../../features/Blog/BlogSlice.js";

const initialFormData = {
    title: "",
    description: "",
    content: "",
    category: "",
    image: null,
};

const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return parsed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
};

const DoctorBlogs = () => {
    const dispatch = useDispatch();
    const { myBlogs, loading, error } = useSelector((state) => state.blogs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [imagePreview, setImagePreview] = useState(null);

    const blogList = useMemo(() => (Array.isArray(myBlogs) ? myBlogs : []), [myBlogs]);

    useEffect(() => {
        dispatch(fetchMyBlogs());
        return () => {
            dispatch(resetBlogState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const openCreateModal = () => {
        setCurrentBlog(null);
        setFormData(initialFormData);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (blog) => {
        setCurrentBlog(blog);
        setFormData({
            title: blog.title || "",
            description: blog.description || "",
            content: blog.content || "",
            category: blog.category || "",
            image: null,
        });
        setImagePreview(blog.image || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentBlog(null);
        setFormData(initialFormData);
        setImagePreview(null);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFormData((current) => ({ ...current, image: file }));

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const blogData = new FormData();
        blogData.append("title", formData.title);
        blogData.append("description", formData.description);
        blogData.append("content", formData.content);
        blogData.append("category", formData.category);
        if (formData.image) blogData.append("image", formData.image);

        const action = currentBlog
            ? updateBlog({ id: currentBlog._id, blogData })
            : createNewBlog(blogData);

        dispatch(action)
            .unwrap()
            .then(() => {
                toast.success(currentBlog ? "Blog updated successfully" : "Blog created successfully");
                closeModal();
                dispatch(fetchMyBlogs());
            })
            .catch((submitError) => toast.error(submitError?.message || submitError || "Failed to save blog"));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        dispatch(deleteBlog(id))
            .unwrap()
            .then(() => toast.success("Blog deleted successfully"))
            .catch((deleteError) => toast.error(deleteError?.message || deleteError || "Failed to delete blog"));
    };

    return (
        <div className="w-full space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Blogs</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-950">Doctor blogs</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Create and maintain patient-facing health content from your workspace.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        New blog
                    </button>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {loading && !blogList.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                ) : blogList.length ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {blogList.map((blog) => (
                            <article key={blog._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-sm">
                                <div className="aspect-[16/9] bg-slate-100">
                                    {blog.image ? (
                                        <img src={blog.image} alt={blog.title || "Blog"} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            <FileText className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                                                {blog.category || "General"}
                                            </span>
                                            <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">{blog.title || "Untitled blog"}</h2>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(blog)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-teal-700 hover:bg-teal-50"
                                                aria-label="Edit blog"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(blog._id)}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50"
                                                aria-label="Delete blog"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{blog.description || "No description provided."}</p>
                                    <p className="mt-4 text-xs font-semibold text-slate-400">{formatDate(blog.date || blog.createdAt)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <FileText className="h-7 w-7" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-slate-950">No blogs yet</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            Publish your first patient education post and it will appear here for future edits.
                        </p>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                        >
                            <Plus className="h-4 w-4" />
                            Write first blog
                        </button>
                    </div>
                )}
            </section>

            {isModalOpen ? (
                <BlogModal
                    currentBlog={currentBlog}
                    formData={formData}
                    imagePreview={imagePreview}
                    loading={loading}
                    onChange={handleInputChange}
                    onClose={closeModal}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                />
            ) : null}
        </div>
    );
};

const BlogModal = ({ currentBlog, formData, imagePreview, loading, onChange, onClose, onFileChange, onSubmit }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <section className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Blog editor</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">{currentBlog ? "Edit blog" : "Create blog"}</h2>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </header>
            <form onSubmit={onSubmit} className="modal-scroll flex-1 space-y-4 overflow-y-auto p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title" name="title" value={formData.title} onChange={onChange} required />
                    <Field label="Category" name="category" value={formData.category} onChange={onChange} required />
                </div>
                <Field label="Short description" name="description" value={formData.description} onChange={onChange} required />
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Content</span>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={onChange}
                        rows={8}
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                        required
                    />
                </label>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
                    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-4 text-center text-teal-800 transition hover:bg-teal-50">
                        <ImagePlus className="h-7 w-7" />
                        <span className="mt-2 text-sm font-semibold">{formData.image ? formData.image.name : "Choose blog image"}</span>
                        <span className="mt-1 text-xs text-teal-700">Recommended 16:9 image</span>
                        <input type="file" className="hidden" onChange={onFileChange} accept="image/*" />
                    </label>
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-36 w-full rounded-2xl object-cover" />
                    ) : (
                        <div className="flex h-36 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <FileText className="h-8 w-8" />
                        </div>
                    )}
                </div>
            </form>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    onClick={onSubmit}
                    className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70"
                >
                    {loading ? "Saving..." : currentBlog ? "Update blog" : "Create blog"}
                </button>
            </footer>
        </section>
    </div>
);

const Field = ({ label, ...props }) => (
    <label className="block">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <input
            {...props}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
        />
    </label>
);

export default DoctorBlogs;
