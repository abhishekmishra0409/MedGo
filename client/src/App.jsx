import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home.jsx';
import Pharmacy from './page/Pharmacy.jsx';
import Doctors from './page/Doctors.jsx';
import Navbar from "./component/Navbar.jsx";
import Footer from "./component/Footer.jsx";
import Ambulance from './page/Ambulance.jsx';
import Login from './component/AuthPages/Login.jsx';
import Signup from './component/AuthPages/Signup.jsx';
import DoctorLists from "./page/DoctorLists.jsx";
import MedicalStore from './page/MedicalStore.jsx';
import ProductLists from "./page/ProductLists.jsx";
import SingleProduct from "./page/SingleProduct.jsx";
import DoctorProfile from "./page/DoctorProfile.jsx";
import AppointmentForm from "./page/AppointmentForm.jsx";
import Blogs from "./page/Blogs.jsx";
import BlogDetail from "./page/BlogDetails.jsx";
import LoginOption from "./page/LoginOption.jsx";
import CartPage from "./page/CartPage.jsx";
import CheckoutPage from "./page/Checkout.jsx";
import LabTest from "./page/LabTest.jsx";
import LabTestList from "./page/LabTestList.jsx";
import LabTestBookingForm from "./page/LabTestBookingForm.jsx";
import OrderConfirmation from "./page/OrderConfirmation.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainLayout from "./page/Users/Dashboard.jsx";
import Profile from "./page/Users/Profile.jsx";
import Orders from "./page/Users/Orders.jsx";
import Appointments from "./page/Users/Appointments.jsx";
import LabBookings from "./page/Users/LabBookings.jsx";

import DoctorsMainLayout from "./page/Doctors/Dashboard.jsx";
import DoctorsProfile from "./page/Doctors/Profile.jsx";
import DoctorsAppointments from "./page/Doctors/Appointments.jsx";
import DoctorsBlogs from "./page/Doctors/Blogs.jsx"
import DoctorLabBookings from "./page/Doctors/DoctorLabBookings.jsx";
import ConversationPage from "./page/Conversation.jsx";

import { RequireAuth, PreventAuth } from './middleware/AuthMiddleware.jsx';
import UnauthorizedPage from './page/UnauthorizedPage.jsx';


function App() {
  return (
      <Router>
        <div className="App">
          <Navbar />
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/store" element={<MedicalStore />} />
            <Route path="/ambulance" element={<Ambulance />} />
            <Route path="/doctorlists" element={<DoctorLists />} />
            <Route path="/productlists" element={<ProductLists />} />
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/labtest" element={<LabTest />} />
            <Route path="/labtestlists" element={<LabTestList />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Auth Protected Routes */}
            <Route
                path="/appointment/:doctorId"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <AppointmentForm />
                  </RequireAuth>
                }
            />
            <Route
                path="/cart"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <CartPage />
                  </RequireAuth>
                }
            />
            <Route
                path="/checkout"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <CheckoutPage />
                  </RequireAuth>
                }
            />
            <Route
                path="/order-confirmation/:orderId"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <OrderConfirmation />
                  </RequireAuth>
                }
            />
            <Route
                path="/book-lab-test/:testId"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <LabTestBookingForm />
                  </RequireAuth>
                }
            />

            {/* User Dashboard Routes */}
            <Route
                path="/user"
                element={
                  <RequireAuth allowedRoles={['user']}>
                    <MainLayout />
                  </RequireAuth>
                }
            >
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="labtest" element={<LabBookings />} />
              <Route path="messages" element={<ConversationPage userType="user" />} />
            </Route>

            {/* Doctor Dashboard Routes */}
            <Route
                path="/doctor"
                element={
                  <RequireAuth allowedRoles={['doctor']}>
                    <DoctorsMainLayout />
                  </RequireAuth>
                }
            >
              <Route index element={<DoctorsProfile />} />
              <Route path="appointments" element={<DoctorsAppointments />} />
              <Route path="blogs" element={<DoctorsBlogs />} />
              <Route path="labtest" element={<DoctorLabBookings />} />
              <Route path="messages" element={<ConversationPage userType="doctor" />} />
            </Route>

            {/* Auth Pages - Prevent access when logged in */}
            <Route
                path="/login-option"
                element={
                  <PreventAuth>
                    <LoginOption />
                  </PreventAuth>
                }
            />
            <Route
                path="/login"
                element={
                  <PreventAuth>
                    <Login />
                  </PreventAuth>
                }
            />
            <Route
                path="/signup"
                element={
                  <PreventAuth>
                    <Signup />
                  </PreventAuth>
                }
            />
          </Routes>

          <Footer />
        </div>
      </Router>
  );
}

export default App;