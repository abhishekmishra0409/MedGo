import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home.jsx';
import Pharmacy from './page/Pharmacy.jsx';
import Doctors from './page/Doctors.jsx';
import Navbar from "./component/Navbar.jsx";
import Footer from "./component/Footer.jsx";
import Ambulance from './page/Ambulance.jsx';
import Login from './page/Login.jsx';
import DoctorLists from "./page/DoctorLists.jsx";
import MedicalStore from './page/MedicalStore.jsx';

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
            <Route path="/login" element={<Login />} />
          </Routes>
          <Footer/>
        </div>
      </Router>
);
}

export default App;