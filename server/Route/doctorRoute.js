const express = require('express');
const DoctorController = require('../Controllers/doctorController');

const doctorRouter = express.Router();

// Public routes. The admin CRUD/approval set that used to live here was a
// duplicate of userRoute.js's /admin/doctors routes (the one both SPAs
// actually call, and the only one that notifies the doctor on approval) —
// removed rather than kept in sync with two approval code paths.
doctorRouter.get('/', DoctorController.getAllDoctors);
doctorRouter.get('/:id', DoctorController.getDoctorById);

module.exports = doctorRouter;
