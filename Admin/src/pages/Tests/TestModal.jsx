import { useEffect, useState } from 'react';
import { Activity, Clock, FlaskConical, IndianRupee, X } from 'lucide-react';

const fieldClass =
    'block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100';

const iconFieldClass =
    'block w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100';

const TestModal = ({ isOpen, onClose, test, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: '',
        price: '',
        preparationInstructions: '',
        reportTime: '',
        isActive: true
    });

    useEffect(() => {
        if (test) {
            setFormData({
                name: test.name || '',
                code: test.code || '',
                description: test.description || '',
                category: test.category || '',
                price: test.price || '',
                preparationInstructions: test.preparationInstructions || '',
                reportTime: test.reportTime || '',
                isActive: test.isActive !== undefined ? test.isActive : true
            });
            return;
        }

        setFormData({
            name: '',
            code: '',
            description: '',
            category: '',
            price: '',
            preparationInstructions: '',
            reportTime: '',
            isActive: true
        });
    }, [test]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            id: test?._id,
            testData: formData
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="admin-scroll max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Lab catalog</p>
                            <h2 className="mt-1 text-2xl font-bold text-slate-950">
                                {test ? 'Edit lab test' : 'Add lab test'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Test name</label>
                                <div className="relative">
                                    <FlaskConical className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={iconFieldClass}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Test code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    className={fieldClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className={fieldClass}
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={fieldClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Price</label>
                                <div className="relative">
                                    <IndianRupee className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className={iconFieldClass}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Report time (hours)</label>
                                <div className="relative">
                                    <Clock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        name="reportTime"
                                        value={formData.reportTime}
                                        onChange={handleChange}
                                        className={iconFieldClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Preparation instructions</label>
                        <div className="relative">
                            <Activity className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <textarea
                                name="preparationInstructions"
                                value={formData.preparationInstructions}
                                onChange={handleChange}
                                className={iconFieldClass}
                                rows="3"
                                placeholder="Any special preparation required for this test"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : test ? 'Update test' : 'Add test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestModal;
