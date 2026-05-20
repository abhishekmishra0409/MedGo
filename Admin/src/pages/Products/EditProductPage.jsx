import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, PackageCheck, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/AdminUI.jsx";
import { getProductById, updateProduct } from "../../features/Products/ProductSlice.js";

const EditProductPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, isLoading } = useSelector((state) => state.product);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        description: "",
        benefits: [""],
        dosage: "",
        isHot: false,
        isNew: false,
        stock: "",
    });
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [additionalImages, setAdditionalImages] = useState([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

    useEffect(() => {
        dispatch(getProductById(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (!product) return;

        setFormData({
            name: product.name || "",
            price: product.price || "",
            originalPrice: product.originalPrice || "",
            category: product.category || "",
            description: product.description || "",
            benefits: product.benefits?.length ? product.benefits : [""],
            dosage: product.dosage || "",
            isHot: Boolean(product.isHot),
            isNew: Boolean(product.isNew),
            stock: product.stock || "",
        });
        setMainImagePreview(product.image || "");
        setAdditionalImagePreviews(product.images || []);
    }, [product]);

    const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

    const handleBenefitChange = (index, value) => {
        const benefits = [...formData.benefits];
        benefits[index] = value;
        updateField("benefits", benefits);
    };

    const handleAdditionalImagesChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length + additionalImages.length > 3) {
            toast.error("You can upload maximum 3 additional images");
            return;
        }
        setAdditionalImages((current) => [...current, ...files]);
        setAdditionalImagePreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))]);
    };

    const removeAdditionalImage = (index) => {
        const existingCount = additionalImagePreviews.length - additionalImages.length;
        if (index < existingCount) {
            setAdditionalImagePreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
            return;
        }

        setAdditionalImages((current) => current.filter((_, itemIndex) => itemIndex !== index - existingCount));
        setAdditionalImagePreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        const productData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "benefits") productData.append(key, value);
        });
        if (mainImage) productData.append("image", mainImage);
        formData.benefits.forEach((benefit) => {
            if (benefit.trim()) productData.append("benefits[]", benefit);
        });
        additionalImages.forEach((image) => productData.append("images", image));

        try {
            await dispatch(updateProduct({ id, updatedData: productData })).unwrap();
            toast.success("Product updated successfully");
            navigate("/dashboard/products/all");
        } catch (error) {
            toast.error(error.message || "Failed to update product");
        }
    };

    if (isLoading && !product) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Products"
                title="Edit product"
                description="Update product details, stock, badges, benefits, and images."
                action={(
                    <button type="button" onClick={() => navigate("/dashboard/products/all")} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Back to catalog
                    </button>
                )}
            />

            <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Name" name="name" value={formData.name} onChange={updateField} required />
                            <Field label="Category" name="category" value={formData.category} onChange={updateField} required />
                            <Field label="Price" type="number" name="price" value={formData.price} onChange={updateField} required />
                            <Field label="Original price" type="number" name="originalPrice" value={formData.originalPrice} onChange={updateField} />
                            <Field label="Stock" type="number" name="stock" value={formData.stock} onChange={updateField} required />
                            <Field label="Dosage" name="dosage" value={formData.dosage} onChange={updateField} />
                        </div>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">Description</span>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                            />
                        </label>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-bold text-slate-950">Storefront flags</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <ToggleButton active={formData.isHot} onClick={() => updateField("isHot", !formData.isHot)}>Hot product</ToggleButton>
                                <ToggleButton active={formData.isNew} onClick={() => updateField("isNew", !formData.isNew)}>New arrival</ToggleButton>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-slate-950">Benefits</p>
                                <button type="button" onClick={() => updateField("benefits", [...formData.benefits, ""])} className="inline-flex items-center gap-1 rounded-xl border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-white">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </button>
                            </div>
                            <div className="mt-3 space-y-2">
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(event) => handleBenefitChange(index, event.target.value)}
                                            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        {formData.benefits.length > 1 ? (
                                            <button type="button" onClick={() => updateField("benefits", formData.benefits.filter((_, itemIndex) => itemIndex !== index))} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 text-rose-600 hover:bg-rose-50" aria-label="Remove benefit">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <ImageDropzone
                            label="Main image"
                            preview={mainImagePreview}
                            onChange={(event) => {
                                const file = event.target.files[0];
                                if (!file) return;
                                setMainImage(file);
                                setMainImagePreview(URL.createObjectURL(file));
                            }}
                            onRemove={() => {
                                setMainImage(null);
                                setMainImagePreview("");
                            }}
                        />
                        <AdditionalImages previews={additionalImagePreviews} onChange={handleAdditionalImagesChange} onRemove={removeAdditionalImage} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70">
                        <PackageCheck className="h-4 w-4" />
                        {isLoading ? "Updating..." : "Update product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Field = ({ label, name, value, onChange, required, ...props }) => (
    <label className="block">
        <span className="text-sm font-semibold text-slate-700">{label}{required ? <span className="text-rose-500"> *</span> : null}</span>
        <input
            {...props}
            name={name}
            value={value}
            onChange={(event) => onChange(name, event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
            required={required}
        />
    </label>
);

const ToggleButton = ({ active, onClick, children }) => (
    <button type="button" onClick={onClick} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${active ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"}`}>
        {children}
    </button>
);

const ImageDropzone = ({ label, preview, onChange, onRemove }) => (
    <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <div className="mt-2 rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-4 text-center">
            {preview ? (
                <div className="relative">
                    <img src={preview} alt="Preview" className="mx-auto h-44 w-full rounded-2xl object-contain" />
                    <button type="button" onClick={onRemove} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white" aria-label="Remove image">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center text-teal-800">
                    <ImagePlus className="h-9 w-9" />
                    <span className="mt-2 text-sm font-semibold">Choose image</span>
                    <input type="file" className="hidden" onChange={onChange} accept="image/*" />
                </label>
            )}
        </div>
    </div>
);

const AdditionalImages = ({ previews, onChange, onRemove }) => (
    <div>
        <p className="text-sm font-semibold text-slate-700">Additional images</p>
        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {previews.length ? (
                <div className="grid grid-cols-3 gap-2">
                    {previews.map((preview, index) => (
                        <div key={`${preview}-${index}`} className="relative">
                            <img src={preview} alt={`Additional ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                            <button type="button" onClick={() => onRemove(index)} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white" aria-label="Remove image">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
            <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-500 hover:border-teal-200">
                <Plus className="h-6 w-6" />
                <span className="mt-1 text-xs font-semibold">Choose additional images</span>
                <input type="file" className="hidden" onChange={onChange} accept="image/*" multiple />
            </label>
        </div>
    </div>
);

export default EditProductPage;
