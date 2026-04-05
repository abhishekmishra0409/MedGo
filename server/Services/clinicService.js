const Clinic = require('../Models/ClinicModel');
const User = require('../Models/UserModel');
const Appointment = require('../Models/AppointmentModel');
const { buildDoctorAccount } = require('../Utils/doctorAccount');

const doctorSelect =
    '_id name username email phone avatar role doctorProfile.specialty doctorProfile.qualification doctorProfile.image doctorProfile.contactEmail doctorProfile.address doctorProfile.workingHours doctorProfile.education doctorProfile.biography doctorProfile.specializations doctorProfile.rating doctorProfile.reviews doctorProfile.approvalStatus';

const serializeClinic = (clinic) => {
    if (!clinic) {
        return clinic;
    }

    const source = clinic.toObject ? clinic.toObject() : clinic;

    return {
        ...source,
        doctors: (source.doctors || []).map((doctor) => buildDoctorAccount(doctor)),
        owner: source.owner
            ? {
                _id: source.owner._id,
                name: source.owner.name || source.owner.username,
                email: source.owner.email,
            }
            : null,
    };
};

class ClinicService {
    static async createClinic(clinicData) {
        const clinic = await Clinic.create(clinicData);
        return await Clinic.findById(clinic._id)
            .select('+accessCode')
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .then(serializeClinic);
    }

    static async addDoctorToClinic(clinicId, doctorId) {
        // Verify doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const clinic = await Clinic.findByIdAndUpdate(
            clinicId,
            { $addToSet: { doctors: doctorId } },
            { new: true, runValidators: true }
        )
            .select('+accessCode')
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email');

        await User.findByIdAndUpdate(doctorId, {
            $set: {
                'doctorProfile.primaryClinic': clinic._id,
                'doctorProfile.requestedClinicAccessCode': clinic.accessCode,
                'doctorProfile.clinicRole': doctor.doctorProfile?.clinicRole || 'member',
            },
        });

        return serializeClinic(clinic);
    }

    static async removeDoctorFromClinic(clinicId, doctorId) {
        const clinic = await Clinic.findByIdAndUpdate(
            clinicId,
            { $pull: { doctors: doctorId } },
            { new: true }
        )
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email');

        if (!clinic) throw new Error('Clinic not found');
        await User.findByIdAndUpdate(doctorId, {
            $unset: {
                'doctorProfile.primaryClinic': '',
                'doctorProfile.requestedClinicAccessCode': '',
            },
            $set: {
                'doctorProfile.clinicRole': null,
            },
        });
        return serializeClinic(clinic);
    }

    static async getClinicsByDoctor(doctorId) {
        const clinics = await Clinic.find({ doctors: doctorId, isActive: true })
            .select('name address contact operatingHours appointmentSettings facilities doctors owner')
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .lean();

        return clinics.map(serializeClinic);
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
        return await Clinic.findById(clinicId)
            .select('+accessCode')
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .then(serializeClinic);
    }


    static async getClinicById(clinicId) {
        const clinic = await Clinic.findOne({ _id: clinicId, isActive: true })
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .lean();
        if (!clinic) throw new Error('Clinic not found');
        return serializeClinic(clinic);
    }

    static async getClinicByDoctorId(doctorId) {
        const clinic = await Clinic.findOne({ doctors: doctorId, isActive: true })
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .lean();
        if (!clinic) throw new Error('Clinic not found for this doctor');
        return serializeClinic(clinic);
    }

    static async getClinics(filters = {}) {
        const query = filters.includeInactive ? {} : { isActive: true };
        const projection = filters.includeAccessCode ? '+accessCode' : undefined;
        const clinics = await Clinic.find(query)
            .select(projection)
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email')
            .lean();

        return clinics.map(serializeClinic);
    }

}

module.exports = ClinicService;
