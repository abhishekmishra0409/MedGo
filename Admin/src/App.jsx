// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
//
// // Products
// import AllProducts from "./pages/products/AllProducts";
// import CreateProduct from "./pages/products/CreateProduct";
// import UpdateProduct from "./pages/products/UpdateProduct";
//
// // Orders
// import Orders from "./pages/orders/Orders";
//
// // Doctors
// import AllDoctors from "./pages/doctors/AllDoctors";
// import UpdateDoctors from "./pages/doctors/UpdateDoctors";
// import RegisterDoctor from "./pages/doctors/RegisterDoctor";
//
// // Clinics
// import AllClinics from "./pages/clinics/AllClinics";
// import AddDoctorsToClinic from "./pages/clinics/AddDoctorsToClinic";
// import RegisterClinic from "./pages/clinics/RegisterClinic";
//
// // Lab Tests
// import AllLabTests from "./pages/labtests/AllLabTests";
// import UpdateTests from "./pages/labtests/UpdateTests";
// import AddLabTest from "./pages/labtests/AddLabTest";
//
// // Users
// import Users from "./pages/users/Users";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    {/* Dashboard Routes */}
                    <Route index element={<DashboardOverview />} />
                    <Route path="overview" element={<DashboardOverview />} />

                    {/*/!* Products Routes *!/*/}
                    {/*<Route path="products" element={<AllProducts />} />*/}
                    {/*<Route path="products/all" element={<AllProducts />} />*/}
                    {/*<Route path="products/create" element={<CreateProduct />} />*/}
                    {/*<Route path="products/update" element={<UpdateProduct />} />*/}

                    {/*/!* Orders Routes *!/*/}
                    {/*<Route path="orders" element={<Orders />} />*/}

                    {/*/!* Doctors Routes *!/*/}
                    {/*<Route path="doctors" element={<AllDoctors />} />*/}
                    {/*<Route path="doctors/all" element={<AllDoctors />} />*/}
                    {/*<Route path="doctors/update" element={<UpdateDoctors />} />*/}
                    {/*<Route path="doctors/register" element={<RegisterDoctor />} />*/}

                    {/*/!* Clinics Routes *!/*/}
                    {/*<Route path="clinics" element={<AllClinics />} />*/}
                    {/*<Route path="clinics/all" element={<AllClinics />} />*/}
                    {/*<Route path="clinics/add" element={<AddDoctorsToClinic />} />*/}
                    {/*<Route path="clinics/register" element={<RegisterClinic />} />*/}

                    {/*/!* Lab Tests Routes *!/*/}
                    {/*<Route path="labtests" element={<AllLabTests />} />*/}
                    {/*<Route path="labtests/all" element={<AllLabTests />} />*/}
                    {/*<Route path="labtests/update" element={<UpdateTests />} />*/}
                    {/*<Route path="labtests/add" element={<AddLabTest />} />*/}

                    {/*/!* Users Routes *!/*/}
                    {/*<Route path="users" element={<Users />} />*/}
                </Route>

                {/* Redirect root to dashboard */}
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<DashboardOverview />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;