import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/User/UserSlice.js";
import doctorReducer from "../features/Doctor/DoctorSlice.js";
import productReducer from "../features/Product/ProductSlice.js";
import blogReducer from "../features/Blog/BlogSlice.js";
import cartReducer from "../features/Cart/CartSlice.js";
import orderReducer from "../features/Order/OrderSlice.js";
import appointmentReducer from "../features/Appointment/AppointmentSlice.js";
import clinicReducer from "../features/Clinic/ClinicSlice.js";
import labTestReducer from "../features/Labtest/LabtestSlice.js";
import messagesReducer from "../features/Messages/MessageSlice.js";
import authMiddleware from "../Middleware/authMiddleware.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        doctor: doctorReducer,
        products: productReducer,
        blogs: blogReducer,
        cart: cartReducer,
        order:orderReducer,
        appointment: appointmentReducer,
        clinic:clinicReducer,
        labTest: labTestReducer,
        messages: messagesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authMiddleware),
});

export default store;
