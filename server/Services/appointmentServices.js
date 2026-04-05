const Appointment = require('../Models/AppointmentModel');
const Clinic = require('../Models/ClinicModel');
const User = require('../Models/UserModel');
const { buildDoctorAccount } = require('../Utils/doctorAccount');
const { buildDoctorSearchQuery } = require('../Utils/doctorAccount');
const mongoose = require('mongoose');

class AppointmentService {
    static getDateRange(dateInput) {
        if (!dateInput) {
            throw new Error('Appointment date is required');
        }

        const isoDateMatch = String(dateInput).match(/^(\d{4})-(\d{2})-(\d{2})$/);
        let startOfDay;

        if (isoDateMatch) {
            const year = Number(isoDateMatch[1]);
            const month = Number(isoDateMatch[2]) - 1;
            const day = Number(isoDateMatch[3]);
            startOfDay = new Date(year, month, day, 0, 0, 0, 0);
        } else {
            const parsedDate = new Date(dateInput);
            if (Number.isNaN(parsedDate.getTime())) {
                throw new Error('Invalid appointment date');
            }
            startOfDay = new Date(parsedDate);
            startOfDay.setHours(0, 0, 0, 0);
        }

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        return { startOfDay, endOfDay };
    }

    static async resolveDoctor(doctorIdentifier) {
        const rawId = String(doctorIdentifier || '').trim();

        if (!rawId) {
            return null;
        }

        const idMatchers = [{ legacyDoctorId: rawId }];
        if (mongoose.Types.ObjectId.isValid(rawId)) {
            idMatchers.unshift({ _id: rawId });
        }

        return User.findOne({
            role: 'doctor',
            $and: [
                buildDoctorSearchQuery({ approvalStatus: 'approved' }),
                { $or: idMatchers },
            ],
        });
    }

    static async createAppointment(appointmentData) {
        if (!appointmentData?.date) {
            throw new Error('Appointment date is required');
        }

        if (!appointmentData?.timeSlot?.start || !appointmentData?.timeSlot?.end) {
            throw new Error('Please select a valid time slot');
        }

        if (!appointmentData?.type) {
            throw new Error('Appointment type is required');
        }

        const doctor = await this.resolveDoctor(appointmentData.doctor);

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const canonicalDoctorId = doctor._id;
        const { startOfDay } = this.getDateRange(appointmentData.date);

        // Check doctor availability
        const isAvailable = await this.checkAvailability(
            canonicalDoctorId,
            startOfDay,
            appointmentData.timeSlot
        );

        if (!isAvailable) {
            throw new Error('Selected time slot is not available');
        }

        // For in-person appointments, verify clinic
        if (appointmentData.type === 'in-person' && appointmentData.clinic) {
            const clinic = await Clinic.findById(appointmentData.clinic);
            if (!clinic || !clinic.doctors.some((doctorId) => String(doctorId) === String(canonicalDoctorId))) {
                throw new Error('Doctor is not available at this clinic');
            }
        }

        const payload = {
            ...appointmentData,
            doctor: canonicalDoctorId,
            date: startOfDay,
        };

        if (payload.type === 'teleconsultation' && (payload.payment?.amount === undefined || payload.payment?.amount === null)) {
            payload.payment = {
                ...(payload.payment || {}),
                amount: 0,
            };
        }

        return await Appointment.create(payload);
    }

    static async checkAvailability(doctorId, date, timeSlot) {
        const doctor = await this.resolveDoctor(doctorId);

        if (!doctor) {
            throw new Error('Doctor not found');
        }

        if (!timeSlot?.start || !timeSlot?.end) {
            throw new Error('Invalid time slot');
        }

        const { startOfDay, endOfDay } = this.getDateRange(date);

        const conflictingAppointments = await Appointment.find({
            doctor: doctor._id,
            date: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
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
        const appointments = await Appointment.find({ patient: patientId })
            .populate('doctor', '_id name username email phone avatar role doctorProfile')
            .populate('clinic', 'name address contact operatingHours')
            .sort({ date: 1, 'timeSlot.start': 1 });

        return appointments.map((appointment) => {
            const item = appointment.toObject();
            item.doctor = buildDoctorAccount(item.doctor);
            return item;
        });
    }

    static async getDoctorAppointments(doctorId) {
        return await Appointment.find({ doctor: doctorId })
            .populate('patient', 'username email phone')
            .populate('clinic', 'name address.city')
            .sort({ date: 1, 'timeSlot.start': 1 });
    }

    static async updateAppointmentStatus(id, status, notes, paymentStatus = null) {
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
