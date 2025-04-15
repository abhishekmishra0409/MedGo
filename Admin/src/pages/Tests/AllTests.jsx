import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllTests,
    createTest,
    updateTest,
    deactivateTest,
    resetTestState
} from '../../features/Tests/TestSlice';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    FlaskConical,
    DollarSign,
    Clock,
    Activity,
    X,
    Check,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import TestModal from './TestModal';

const TestsPage = () => {
    const dispatch = useDispatch();
    const {
        tests,
        isLoading,
        isError,
        isSuccess,
        message
    } = useSelector((state) => state.test);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [expandedTest, setExpandedTest] = useState(null);

    useEffect(() => {
        dispatch(getAllTests());

        return () => {
            dispatch(resetTestState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && message) {
            toast.success(message);
            dispatch(getAllTests());
        }
    }, [isError, isSuccess, message, dispatch]);

    const handleDeactivate = (id) => {
        if (window.confirm('Are you sure you want to deactivate this test?')) {
            dispatch(deactivateTest(id));
        }
    };

    const toggleExpand = (id) => {
        setExpandedTest(expandedTest === id ? null : id);
    };

    const filteredTests = tests.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmitTest = async ({ id, testData }) => {
        try {
            if (id) {
                await dispatch(updateTest({ id, testData })).unwrap();
                toast.success('Test Updated Successfully');
            } else {
                await dispatch(createTest(testData)).unwrap();
                toast.success('Test Register Successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save test');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lab Tests Management</h1>
                <button
                    onClick={() => {
                        setSelectedTest(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Test
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search tests by name, code or category..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tests List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTests.length > 0 ? (
                        filteredTests.map((test) => (
                            <div key={test._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <FlaskConical className="h-6 w-6 text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h2 className="text-lg font-bold text-gray-900">{test.name}</h2>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {test.code}
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {test.category}
                                                    </span>
                                                    {test.isActive ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{test.description}</p>

                                                <div className="mt-3 flex flex-wrap gap-4">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        ₹{test.price}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        Report in {test.reportTime} hours
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleExpand(test._id)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                            >
                                                {expandedTest === test._id ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedTest(test);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeactivate(test._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                                title={test.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {test.isActive ? (
                                                    <Trash2 className="h-5 w-5" />
                                                ) : (
                                                    <Check className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {expandedTest === test._id && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Preparation Instructions</h3>
                                                    <p className="text-sm text-gray-600">{test.preparationInstructions || 'No special preparation required'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                            <p className="text-gray-500">
                                {searchTerm ? 'No tests match your search' : 'No tests found'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Test Modal */}
            <TestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                test={selectedTest}
                onSubmit={handleSubmitTest}
                isLoading={isLoading}
            />
        </div>
    );
};

export default TestsPage;