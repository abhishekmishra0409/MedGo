import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, deleteUserAccount } from '../../features/auth/authSlice';
import { Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AllUsers = () => {
    const dispatch = useDispatch();
    const { users, isLoading, isSuccess, message, isError } = useSelector((state) => state.auth);
    const [filterValue, setFilterValue] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: 'username',
        direction: 'ascending',
    });
    const [userToDelete, setUserToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess && message) toast.success(message);
        if (isError && message) toast.error(message);
    }, [isSuccess, isError, message]);

    const usersWithKeys = users.map(user => ({
        ...user,
        key: user._id
    }));

    const filteredItems = usersWithKeys.filter((user) =>
        user.username.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.role.toLowerCase().includes(filterValue.toLowerCase())
    );

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const sortedItems = [...filteredItems].sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });

    const paginatedItems = sortedItems.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const onSearchChange = (value) => {
        setFilterValue(value);
        setPage(1);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (userToDelete) {
            await dispatch(deleteUserAccount(userToDelete._id));
            dispatch(fetchAllUsers());
            setUserToDelete(null);
            setShowModal(false);
        }
    };

    const columns = [
        { name: 'ID', uid: '_id', sortable: true },
        { name: 'USERNAME', uid: 'username', sortable: true },
        { name: 'EMAIL', uid: 'email', sortable: true },
        { name: 'PHONE', uid: 'phone', sortable: true },
        { name: 'ROLE', uid: 'role', sortable: true },
        { name: 'ACTIONS', uid: 'actions' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">All Users</h1>
                <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search users..."
                        value={filterValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Showing {paginatedItems.length} of {filteredItems.length} users
        </span>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Rows per page:</span>
                    <select
                        className="bg-white border rounded px-2 py-1 text-sm"
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        value={rowsPerPage}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.uid}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.name}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((item) => (
                                <tr key={item.key}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item._id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleDeleteClick(item)}
                                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-center mt-4">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {Array.from({ length: pages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, pages))}
                        disabled={page === pages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Confirm User Deletion</h3>
                        <p className="mb-4">
                            Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?
                        </p>
                        <p className="text-red-600 mb-4">This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsers;