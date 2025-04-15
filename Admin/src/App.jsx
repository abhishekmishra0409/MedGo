import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AllUsers from "./pages/Auth/AllUsers.jsx";
import ProductsPage from "./pages/Products/Products.jsx";
import CreateProductPage from "./pages/Products/CreateProducts.jsx";
import EditProductPage from "./pages/Products/EditProductPage.jsx";
import OrdersPage from "./pages/Orders/AllOrders.jsx";
import AllDoctors from "./pages/Doctors/AllDoctors.jsx";
import AllClinics from "./pages/Clinics/AllClinics.jsx";
import AllTests from "./pages/Tests/AllTests.jsx";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Dashboard Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            {/* Dashboard Routes */}
                            <Route index element={<DashboardOverview />} />
                            <Route path="overview" element={<DashboardOverview />} />
                            {/* Users Routes */}
                            <Route path="users" element={<AllUsers />} />
                            {/* Products Routes */}
                            <Route path="products/all" element={<ProductsPage />} />
                            <Route path="products/create" element={<CreateProductPage />} />
                            <Route path="products/edit/:id" element={<EditProductPage />} />
                            {/* Orders Routes */}
                            <Route path="orders" element={<OrdersPage />} />
                            {/* Doctors Routes */}
                            <Route path="doctors/all" element={<AllDoctors />} />
                            {/* Clinics Routes */}
                            <Route path="clinics/all" element={<AllClinics />} />
                            {/* Lab Tests Routes */}
                            <Route path="labtests/all" element={<AllTests />} />
                        </Route>
                    </Route>

                    {/* Redirects */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>

            {/* Toast Container */}
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    // Default options for specific types
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10B981',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                            color: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;