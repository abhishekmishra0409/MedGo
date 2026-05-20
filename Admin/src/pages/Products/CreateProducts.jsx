import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ImagePlus, PackagePlus, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/AdminUI.jsx";
import { createProduct } from "../../features/Products/ProductSlice.js";

const CreateProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        description: "",
        benefits: ["", ""],
        dosage: "",
        isHot: "0",
        rating: "4.3",
        reviews: "120",
        stock: "",
        isNew: "0",
    });
    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    const updateField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

    const handleBenefitChange = (index, value) => {
        const benefits = [...formData.benefits];
        benefits[index] = value;
        updateField("benefits", benefits);
    };

    const handleAdditionalImagesChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 5) {
            toast.error("Maximum 5 additional images allowed");
            return;
        }
        setAdditionalImages(files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!formData.name || !formData.price || !formData.category || !mainImage) {
            toast.error("Please fill all required fields");
            setIsLoading(false);
            return;
        }

        const productFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "benefits" && key !== "originalPrice") productFormData.append(key, value);
        });
        productFormData.append("originalPrice", formData.originalPrice || formData.price);
        productFormData.append("image", mainImage);

        formData.benefits.forEach((benefit, index) => {
            if (benefit.trim()) productFormData.append(`benefits[${index}]`, benefit);
        });
        additionalImages.forEach((image) => productFormData.append("images", image));

        try {
            await dispatch(createProduct(productFormData)).unwrap();
            toast.success("Product created successfully");
            navigate("/dashboard/products/all");
        } catch (error) {
            toast.error(error.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Products"
                title="Create product"
                description="Add a new pharmacy item with price, stock, benefits, and storefront images."
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
                            <Field label="Rating" type="number" step="0.1" name="rating" value={formData.rating} onChange={updateField} />
                            <Field label="Reviews" type="number" name="reviews" value={formData.reviews} onChange={updateField} />
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
                                <ToggleButton active={formData.isHot === "1"} onClick={() => updateField("isHot", formData.isHot === "1" ? "0" : "1")}>Hot product</ToggleButton>
                                <ToggleButton active={formData.isNew === "1"} onClick={() => updateField("isNew", formData.isNew === "1" ? "0" : "1")}>New arrival</ToggleButton>
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
                                                <X className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <ImageDropzone label="Main image" file={mainImage} onChange={(event) => setMainImage(event.target.files[0])} onRemove={() => setMainImage(null)} required />
                        <AdditionalImages files={additionalImages} onChange={handleAdditionalImagesChange} onRemove={(index) => setAdditionalImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70">
                        <PackagePlus className="h-4 w-4" />
                        {isLoading ? "Creating..." : "Create product"}
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

const ImageDropzone = ({ label, file, onChange, onRemove, required = false }) => (
    <div>
        <p className="text-sm font-semibold text-slate-700">{label}{required ? <span className="text-rose-500"> *</span> : null}</p>
        <div className="mt-2 rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-4 text-center">
            {file ? (
                <div className="relative">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="mx-auto h-44 w-full rounded-2xl object-contain" />
                    <button type="button" onClick={onRemove} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white" aria-label="Remove image">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center text-teal-800">
                    <ImagePlus className="h-9 w-9" />
                    <span className="mt-2 text-sm font-semibold">Choose image</span>
                    <span className="mt-1 text-xs text-teal-700">PNG or JPG up to 5MB</span>
                    <input type="file" className="hidden" onChange={onChange} accept="image/*" required={required} />
                </label>
            )}
        </div>
    </div>
);

const AdditionalImages = ({ files, onChange, onRemove }) => (
    <div>
        <p className="text-sm font-semibold text-slate-700">Additional images</p>
        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {files.length ? (
                <div className="grid grid-cols-3 gap-2">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="relative">
                            <img src={URL.createObjectURL(file)} alt={`Additional ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
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

export default CreateProductPage;
