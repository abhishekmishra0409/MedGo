const Clinic = require('../Models/ClinicModel');
const User = require('../Models/UserModel');
const Appointment = require('../Models/AppointmentModel');
const { buildDoctorAccount } = require('../Utils/doctorAccount');
const NotificationService = require('./notificationService');

const doctorSelect =
    '_id name username email phone avatar role doctorProfile.specialty doctorProfile.qualification doctorProfile.image doctorProfile.contactEmail doctorProfile.address doctorProfile.workingHours doctorProfile.education doctorProfile.biography doctorProfile.specializations doctorProfile.rating doctorProfile.reviews doctorProfile.approvalStatus doctorProfile.clinicMembershipStatus doctorProfile.clinicMembershipNotes doctorProfile.councilRegistrationNumber doctorProfile.councilName';

const PUBLIC_DOCTOR_MATCH = {
    'doctorProfile.approvalStatus': 'approved',
    'doctorProfile.clinicMembershipStatus': 'approved',
};

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
                // Admin assigning a doctor to a clinic is an implicit roster approval.
                'doctorProfile.clinicMembershipStatus': 'approved',
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
                'doctorProfile.clinicMembershipStatus': 'none',
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

    // Solo-doctor equivalent of getClinicAvailableSlots: same generateTimeSlots
    // engine, fed from the doctor's own operatingHours/consultationSettings
    // instead of a clinic's.
    static async getDoctorAvailableSlots(doctorId, date) {
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) throw new Error('Doctor not found');

        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const hours = doctor.doctorProfile?.operatingHours || {};
        const operatingHours = isWeekend ? hours.weekends || {} : hours.weekdays || {};

        if (!operatingHours.open || !operatingHours.close) {
            throw new Error('Doctor has not set up consultation hours for this day');
        }

        const appointments = await Appointment.find({
            doctor: doctorId,
            date: new Date(date),
            status: { $nin: ['cancelled', 'completed'] }
        }).select('timeSlot');

        const settings = doctor.doctorProfile?.consultationSettings || {};

        return this.generateTimeSlots(
            operatingHours.open,
            operatingHours.close,
            settings.slotDuration || 30,
            appointments,
            settings.maxDailyAppointments || 20
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

    // Shared by doctors (via primaryClinic / roster membership) and
    // clinic-owners (via Clinic.owner). Deliberately does NOT filter on
    // isActive — an owner whose clinic is still awaiting platform approval
    // must still be able to see and edit it before it goes live.
    static async resolveManagedClinic(user) {
        if (!user || !['doctor', 'clinic-owner'].includes(user.role)) {
            throw new Error('Only doctors and clinic owners can access clinic workspace');
        }

        const primaryClinicId = user.doctorProfile?.primaryClinic;
        const query = user.role === 'clinic-owner'
            ? { owner: user._id }
            : primaryClinicId
                ? { _id: primaryClinicId }
                : { doctors: user._id };

        const clinic = await Clinic.findOne(query)
            .select('+accessCode')
            .populate('doctors', doctorSelect)
            .populate('owner', 'name username email');

        if (!clinic) {
            throw new Error('Clinic not found for this account');
        }

        const isOwner = String(clinic.owner?._id || clinic.owner) === String(user._id);
        const clinicRole = user.role === 'clinic-owner'
            ? 'owner'
            : user.doctorProfile?.clinicRole || (isOwner ? 'owner' : 'member');

        return {
            clinic,
            clinicRole,
            canManage: user.role === 'clinic-owner' || isOwner || clinicRole === 'owner',
        };
    }

    // Self-service equivalent of registerUser's join-clinic mode, for a doctor
    // (solo, or previously removed from a roster) who wants to attach to a
    // clinic after the fact rather than only at signup.
    static async joinClinicByAccessCode(user, accessCode) {
        if (!user || user.role !== 'doctor') {
            throw new Error('Only doctors can join a clinic');
        }

        if (user.doctorProfile?.primaryClinic) {
            throw new Error('You are already linked to a clinic. Leave your current clinic before joining another.');
        }

        const normalizedCode = accessCode?.trim().toUpperCase();
        if (!normalizedCode) {
            throw new Error('Clinic access code is required');
        }

        const clinic = await Clinic.findOne({ accessCode: normalizedCode }).select('+accessCode');
        if (!clinic) {
            throw new Error('Clinic access code is invalid');
        }

        await User.findByIdAndUpdate(user._id, {
            $set: {
                'doctorProfile.primaryClinic': clinic._id,
                'doctorProfile.requestedClinicAccessCode': clinic.accessCode,
                'doctorProfile.clinicRole': 'member',
                'doctorProfile.clinicMembershipStatus': 'pending',
            },
        });

        if (clinic.owner) {
            await NotificationService.safeCreate({
                recipient: clinic.owner,
                recipientRole: 'clinic-owner',
                type: 'clinic.join-request',
                title: 'New doctor wants to join your clinic',
                message: `${user.name || user.username} requested to join ${clinic.name}.`,
                entityType: 'doctor',
                entityId: user._id,
                metadata: { clinicId: clinic._id },
            });
        }

        const freshUser = await User.findById(user._id);
        return this.getMyClinic(freshUser);
    }

    static async getMyClinic(user) {
        const { clinic, clinicRole, canManage } = await this.resolveManagedClinic(user);
        const serialized = serializeClinic(clinic);

        return {
            ...serialized,
            viewerClinicRole: clinicRole,
            canManage,
        };
    }

    static async getMyRoster(user) {
        const { clinic, canManage } = await this.resolveManagedClinic(user);

        if (!canManage) {
            throw new Error('Only clinic owners can view the doctor roster');
        }

        const doctors = await User.find({ 'doctorProfile.primaryClinic': clinic._id, role: 'doctor' })
            .select('-password -__v')
            .lean();

        return doctors.map(buildDoctorAccount);
    }

    static async updateRosterMembership(user, doctorId, status, notes = '') {
        const { clinic, canManage } = await this.resolveManagedClinic(user);

        if (!canManage) {
            throw new Error('Only clinic owners can manage the doctor roster');
        }

        // Roster approval is a trust-conferring action (it makes a doctor
        // publicly bookable), so the acting owner must themselves be
        // platform-approved first — whether they're a clinic-owner account or
        // a doctor who owns their clinic. Viewing/editing the clinic (getMyClinic,
        // updateMyClinic) stays open while pending; this does not.
        const actorApprovalStatus = user.role === 'clinic-owner'
            ? user.ownerProfile?.approvalStatus
            : user.doctorProfile?.approvalStatus;

        if (actorApprovalStatus !== 'approved') {
            throw new Error('Your account must be platform-approved before you can manage the roster');
        }

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            throw new Error('Invalid membership status');
        }

        // Scoped to this clinic — an owner can never touch a doctor outside it.
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor', 'doctorProfile.primaryClinic': clinic._id });
        if (!doctor) {
            throw new Error('Doctor not found on this clinic roster');
        }

        doctor.doctorProfile = {
            ...(doctor.doctorProfile?.toObject?.() || doctor.doctorProfile || {}),
            clinicMembershipStatus: status,
            clinicMembershipNotes: notes?.trim() || '',
        };
        await doctor.save();

        if (status === 'approved') {
            await Clinic.findByIdAndUpdate(clinic._id, { $addToSet: { doctors: doctor._id } });
        } else {
            await Clinic.findByIdAndUpdate(clinic._id, { $pull: { doctors: doctor._id } });
        }

        await NotificationService.safeCreate({
            recipient: doctor._id,
            recipientRole: 'doctor',
            type: 'clinic.membership',
            title: 'Clinic roster status updated',
            message: `${clinic.name} marked your roster membership as ${status}.`,
            entityType: 'clinic',
            entityId: clinic._id,
            metadata: { clinicMembershipStatus: status, clinicMembershipNotes: notes || '' },
        });

        return buildDoctorAccount(doctor.toObject());
    }

    static async updateMyClinic(user, updateData) {
        const currentClinic = await this.getMyClinic(user);

        if (!currentClinic.canManage) {
            throw new Error('Only clinic owners can update clinic details');
        }

        const updatedClinic = await this.updateClinic(currentClinic._id, {
            name: updateData.name,
            address: updateData.address,
            contact: updateData.contact,
            facilities: updateData.facilities,
            operatingHours: updateData.operatingHours,
            appointmentSettings: updateData.appointmentSettings,
            isActive: updateData.isActive,
        });

        return {
            ...updatedClinic,
            viewerClinicRole: currentClinic.viewerClinicRole,
            canManage: true,
        };
    }


    static async getClinicById(clinicId, { publicOnly = true } = {}) {
        const clinic = await Clinic.findOne({ _id: clinicId, isActive: true })
            .populate({ path: 'doctors', select: doctorSelect, ...(publicOnly ? { match: PUBLIC_DOCTOR_MATCH } : {}) })
            .populate('owner', 'name username email')
            .lean();
        if (!clinic) throw new Error('Clinic not found');
        return serializeClinic(clinic);
    }

    static async getClinicByDoctorId(doctorId, { publicOnly = true } = {}) {
        const clinic = await Clinic.findOne({ doctors: doctorId, isActive: true })
            .populate({ path: 'doctors', select: doctorSelect, ...(publicOnly ? { match: PUBLIC_DOCTOR_MATCH } : {}) })
            .populate('owner', 'name username email')
            .lean();
        if (!clinic) throw new Error('Clinic not found for this doctor');
        return serializeClinic(clinic);
    }

    static async getClinics(filters = {}) {
        const query = filters.includeInactive ? {} : { isActive: true };
        const projection = filters.includeAccessCode ? '+accessCode' : undefined;
        const publicOnly = filters.publicOnly !== false;
        const clinics = await Clinic.find(query)
            .select(projection)
            .populate({ path: 'doctors', select: doctorSelect, ...(publicOnly ? { match: PUBLIC_DOCTOR_MATCH } : {}) })
            .populate('owner', 'name username email')
            .lean();

        return clinics.map(serializeClinic);
    }

}

module.exports = ClinicService;
