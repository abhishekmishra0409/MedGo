const Clinic = require('../Models/ClinicModel');
const Doctor = require('../Models/DoctorModel');
const Appointment = require('../Models/AppointmentModel');

class ClinicService {
    static async createClinic(clinicData) {
        return await Clinic.create(clinicData);
    }

    static async addDoctorToClinic(clinicId, doctorId) {
        // Verify doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        return await Clinic.findByIdAndUpdate(
            clinicId,
            { $addToSet: { doctors: doctorId } },
            { new: true, runValidators: true }
        );
    }

    static async removeDoctorFromClinic(clinicId, doctorId) {
        const clinic = await Clinic.findByIdAndUpdate(
            clinicId,
            { $pull: { doctors: doctorId } },
            { new: true }
        );

        if (!clinic) throw new Error('Clinic not found');
        return clinic;
    }

    static async getClinicsByDoctor(doctorId) {
        return await Clinic.find({ doctors: doctorId })
            .select('name address contact operatingHours')
            .lean();
    }

    static async getClinicAvailableSlots(clinicId, date) {
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) throw new Error('Clinic not found');

        // Check if date is weekend
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

        const operatingHours = isWeekend ?
            clinic.operatingHours.weekends :
            clinic.operatingHours.weekdays;

        if (!operatingHours.open || !operatingHours.close) {
            throw new Error('Clinic is closed on this day');
        }

        // Get all appointments for the day
        const appointments = await Appointment.find({
            clinic: clinicId,
            date: new Date(date),
            status: { $nin: ['cancelled', 'completed'] }
        }).select('timeSlot');

        return this.generateTimeSlots(
            operatingHours.open,
            operatingHours.close,
            clinic.appointmentSettings.slotDuration,
            appointments,
            clinic.appointmentSettings.maxDailyAppointments
        );
    }

    static generateTimeSlots(openTime, closeTime, slotDuration, bookedAppointments, maxAppointments = 20) {
        const slots = [];
        const bookedSlots = bookedAppointments.map(a => ({
            start: a.timeSlot.start,
            end: a.timeSlot.end
        }));

        // Convert times to minutes since midnight for easier calculation
        const toMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const openMinutes = toMinutes(openTime);
        const closeMinutes = toMinutes(closeTime);
        let currentMinutes = openMinutes;
        let slotsGenerated = 0;

        while (currentMinutes + slotDuration <= closeMinutes && slotsGenerated < maxAppointments) {
            const startTime = `${Math.floor(currentMinutes / 60)
                .toString()
                .padStart(2, '0')}:${(currentMinutes % 60)
                .toString()
                .padStart(2, '0')}`;

            const endMinutes = currentMinutes + slotDuration;
            const endTime = `${Math.floor(endMinutes / 60)
                .toString()
                .padStart(2, '0')}:${(endMinutes % 60)
                .toString()
                .padStart(2, '0')}`;

            // Check if slot is available
            const isBooked = bookedSlots.some(booked => {
                const bookedStart = toMinutes(booked.start);
                const bookedEnd = toMinutes(booked.end);
                return (
                    (currentMinutes >= bookedStart && currentMinutes < bookedEnd) ||
                    (endMinutes > bookedStart && endMinutes <= bookedEnd) ||
                    (currentMinutes <= bookedStart && endMinutes >= bookedEnd)
                );
            });

            if (!isBooked) {
                slots.push({
                    start: startTime,
                    end: endTime,
                    available: true
                });
                slotsGenerated++;
            } else {
                slots.push({
                    start: startTime,
                    end: endTime,
                    available: false
                });
            }

            currentMinutes += slotDuration;
        }

        return slots;
    }

    static async updateClinic(clinicId, updateData) {
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            throw new Error('Clinic not found');
        }

        // Update fields
        Object.keys(updateData).forEach((key) => {
            clinic[key] = updateData[key];
        });

        await clinic.save();
        return clinic;
    }


    static async getClinicById(clinicId) {
        const clinic = await Clinic.findById(clinicId)
            .populate('doctors', 'name specialty image')
            .lean();
        if (!clinic) throw new Error('Clinic not found');
        return clinic;
    }

    static async getClinicByDoctorId(doctorId) {
        const clinic = await Clinic.findOne({ doctors: doctorId })
            .populate('doctors', 'name specialty image')
            .lean();
        if (!clinic) throw new Error('Clinic not found for this doctor');
        return clinic;
    }

}

module.exports = ClinicService;