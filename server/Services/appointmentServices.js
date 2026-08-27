const Appointment = require('../Models/AppointmentModel');
const Clinic = require('../Models/ClinicModel');
const User = require('../Models/UserModel');
const { buildDoctorAccount } = require('../Utils/doctorAccount');
const { buildDoctorSearchQuery } = require('../Utils/doctorAccount');
const mongoose = require('mongoose');
const NotificationService = require('./notificationService');

class AppointmentService {
    static parseTimeToMinutes(value) {
        const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (!match) return null;

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const period = match[3]?.toUpperCase();

        if (minutes > 59 || hours > 23) return null;
        if (period) {
            if (hours < 1 || hours > 12) return null;
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
        }

        return hours * 60 + minutes;
    }

    static getDayIndex(dayName) {
        return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            .indexOf(String(dayName || '').toLowerCase());
    }

    static workingDaysIncludeDate(daysLabel, date) {
        const label = String(daysLabel || '').toLowerCase();
        if (!label) return false;

        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetIndex = date.getDay();
        const targetDay = dayNames[targetIndex];

        if (label.includes('weekday')) return targetIndex >= 1 && targetIndex <= 5;
        if (label.includes('weekend')) return targetIndex === 0 || targetIndex === 6;
        if (label.includes(targetDay)) return true;

        const rangeMatch = label.match(/(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*(?:-|to)\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/);
        if (!rangeMatch) return false;

        const startIndex = this.getDayIndex(rangeMatch[1]);
        const endIndex = this.getDayIndex(rangeMatch[2]);
        if (startIndex === -1 || endIndex === -1) return false;

        if (startIndex <= endIndex) {
            return targetIndex >= startIndex && targetIndex <= endIndex;
        }

        return targetIndex >= startIndex || targetIndex <= endIndex;
    }

    static parseWorkingHourRange(hoursLabel) {
        const parts = String(hoursLabel || '').split(/\s*(?:-|to)\s*/i);
        if (parts.length < 2) return null;

        const start = this.parseTimeToMinutes(parts[0]);
        const end = this.parseTimeToMinutes(parts[1]);
        if (start === null || end === null || end <= start) return null;

        return { start, end };
    }

    static isTimeSlotInsideWorkingHours(doctor, date, timeSlot) {
        const workingHours = Array.isArray(doctor?.doctorProfile?.workingHours)
            ? doctor.doctorProfile.workingHours
            : [];

        const validRows = workingHours
            .map((row) => ({
                days: row?.days,
                range: this.parseWorkingHourRange(row?.hours),
            }))
            .filter((row) => row.days && row.range);

        if (!validRows.length) {
            return true;
        }

        const requestedStart = this.parseTimeToMinutes(timeSlot?.start);
        const requestedEnd = this.parseTimeToMinutes(timeSlot?.end);
        if (requestedStart === null || requestedEnd === null || requestedEnd <= requestedStart) {
            return false;
        }

        return validRows.some((row) => (
            this.workingDaysIncludeDate(row.days, date)
            && requestedStart >= row.range.start
            && requestedEnd <= row.range.end
        ));
    }

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

        // For in-person appointments: a solo doctor (no primaryClinic) is
        // verified against their own practiceAddress instead of a clinic.
        if (appointmentData.type === 'in-person') {
            const isSolo = !doctor.doctorProfile?.primaryClinic;

            if (isSolo) {
                if (!doctor.doctorProfile?.practiceAddress?.city) {
                    throw new Error('This doctor has not set up in-person consultations yet');
                }
            } else {
                if (!appointmentData.clinic) {
                    throw new Error('Clinic is required for in-person appointments');
                }

                const clinic = await Clinic.findById(appointmentData.clinic);
                if (!clinic || !clinic.doctors.some((doctorId) => String(doctorId) === String(canonicalDoctorId))) {
                    throw new Error('Doctor is not available at this clinic');
                }
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

        const appointment = await Appointment.create(payload);

        await Promise.all([
            NotificationService.safeCreate({
                recipient: appointment.patient,
                recipientRole: 'user',
                type: 'appointment.created',
                title: 'Appointment booked',
                message: `Your appointment with Dr. ${doctor.name || doctor.username || 'your doctor'} is booked.`,
                entityType: 'appointment',
                entityId: appointment._id,
                metadata: { status: appointment.status, date: appointment.date, timeSlot: appointment.timeSlot },
            }),
            NotificationService.safeCreate({
                recipient: appointment.doctor,
                recipientRole: 'doctor',
                type: 'appointment.created',
                title: 'New appointment request',
                message: 'A patient booked a new appointment with you.',
                entityType: 'appointment',
                entityId: appointment._id,
                metadata: { status: appointment.status, date: appointment.date, timeSlot: appointment.timeSlot },
            }),
            NotificationService.safeCreateForAdmins({
                type: 'appointment.created',
                title: 'Appointment booked',
                message: `A ${appointment.type} appointment was booked.`,
                entityType: 'appointment',
                entityId: appointment._id,
                metadata: { doctorId: appointment.doctor, patientId: appointment.patient },
            }),
        ]);

        return appointment;
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

        if (!this.isTimeSlotInsideWorkingHours(doctor, startOfDay, timeSlot)) {
            return false;
        }

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
            item.doctor = item.doctor ? buildDoctorAccount(item.doctor) : null;
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

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            update,
            { new: true, runValidators: true }
        );

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        await Promise.all([
            NotificationService.safeCreate({
                recipient: appointment.patient,
                recipientRole: 'user',
                type: 'appointment.status',
                title: 'Appointment updated',
                message: `Your appointment is now ${status}.`,
                entityType: 'appointment',
                entityId: appointment._id,
                metadata: { status, paymentStatus: appointment.payment?.status },
            }),
            NotificationService.safeCreate({
                recipient: appointment.doctor,
                recipientRole: 'doctor',
                type: 'appointment.status',
                title: 'Appointment status changed',
                message: `An appointment was marked ${status}.`,
                entityType: 'appointment',
                entityId: appointment._id,
                metadata: { status, paymentStatus: appointment.payment?.status },
            }),
        ]);

        return appointment;
    }
}

module.exports = AppointmentService;
