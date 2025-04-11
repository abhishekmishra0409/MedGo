const Appointment = require('../Models/AppointmentModel');
const Clinic = require('../Models/ClinicModel');
const Doctor = require('../Models/DoctorModel');

class AppointmentService {
    static async createAppointment(appointmentData) {
        // Check doctor availability
        const isAvailable = await this.checkAvailability(
            appointmentData.doctor,
            appointmentData.date,
            appointmentData.timeSlot
        );

        if (!isAvailable) {
            throw new Error('Selected time slot is not available');
        }

        // For in-person appointments, verify clinic
        if (appointmentData.type === 'in-person' && appointmentData.clinic) {
            const clinic = await Clinic.findById(appointmentData.clinic);
            if (!clinic || !clinic.doctors.includes(appointmentData.doctor)) {
                throw new Error('Doctor is not available at this clinic');
            }
        }

        return await Appointment.create(appointmentData);
    }

    static async checkAvailability(doctorId, date, timeSlot) {
        const conflictingAppointments = await Appointment.find({
            doctor: doctorId,
            date,
            status: { $nin: ['cancelled', 'completed'] },
            $or: [
                {
                    'timeSlot.start': { $lt: timeSlot.end },
                    'timeSlot.end': { $gt: timeSlot.start }
                }
            ]
        });

        return conflictingAppointments.length === 0;
    }

    static async getPatientAppointments(patientId) {
        return await Appointment.find({ patient: patientId })
            .populate('doctor', 'name specialty image')
            .populate('clinic', 'name address contact operatingHours')
            .sort({ date: 1, 'timeSlot.start': 1 });
    }

    static async getDoctorAppointments(doctorId) {
        return await Appointment.find({ doctor: doctorId })
            .populate('patient', 'username email phone')
            .populate('clinic', 'name address.city')
            .sort({ date: 1, 'timeSlot.start': 1 });
    }

    static async updateAppointmentStatus(id, status, notes,paymentStatus = null) {
        const update = { status };
        if (notes) update['notes.doctorNotes'] = notes;
        if (paymentStatus) update['payment.status'] = paymentStatus;

        return await Appointment.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        );
    }
}

module.exports = AppointmentService;