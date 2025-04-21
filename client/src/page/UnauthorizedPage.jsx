import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized Access</h1>
                <p className="text-gray-700 mb-6">
                    You don't have permission to access this page.
                </p>
                <Link
                    to="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;