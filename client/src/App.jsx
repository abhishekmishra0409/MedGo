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

function App() {
  return (
      <Router>
        <div className="App">
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/doctors" element={<Doctors/>}/>
            <Route path="/store" element={<MedicalStore />} />
            <Route path="/ambulance" element={<Ambulance />} />
              <Route path="/doctorlists" element={<DoctorLists />} />
              <Route path="/productlists" element={<ProductLists />} />
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/appointment/:doctorId" element={<AppointmentForm />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/login-option" element={<LoginOption />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
          <Footer/>
        </div>
      </Router>
);
}

export default App;