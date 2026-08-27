import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/Auth/AuthSlice.js";
import productReducer from "../features/Products/ProductSlice.js";
import orderReducer from "../features/Orders/OrderSlice.js";
import doctorReducer from "../features/Doctors/DoctorSlice.js";
import ownerReducer from "../features/Owners/OwnerSlice.js";
import clinicReducer from "../features/Clinics/ClinicSlice.js";
import testReducer from "../features/Tests/TestSlice.js";
import notificationReducer from "../features/Notifications/NotificationSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        order: orderReducer,
        doctor: doctorReducer,
        owner: ownerReducer,
        clinic: clinicReducer,
        test: testReducer,
        notifications: notificationReducer
    },
});

export default store;
