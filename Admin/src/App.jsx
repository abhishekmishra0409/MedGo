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
import AllOwners from "./pages/Owners/AllOwners.jsx";
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
                            {/* Clinic Owners Routes */}
                            <Route path="owners/all" element={<AllOwners />} />
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
                position="top-right"
                reverseOrder={false}
                gutter={10}
                containerClassName=""
                containerStyle={{ top: 18, right: 18 }}
                toastOptions={{
                    duration: 3600,
                    style: {
                        border: '1px solid rgba(148, 163, 184, 0.24)',
                        borderRadius: '18px',
                        boxShadow: '0 22px 48px rgba(15, 23, 42, 0.14)',
                        color: '#0f172a',
                        fontWeight: 600,
                        maxWidth: '420px',
                        padding: '14px 16px',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            borderColor: 'rgba(15, 156, 140, 0.24)',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            borderColor: 'rgba(220, 38, 38, 0.24)',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;
