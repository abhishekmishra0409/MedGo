const LabTestBooking = require('../Models/LabTestModel');
const Test = require('../Models/TestModel');
const Clinic = require('../Models/ClinicModel');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey,{
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

class LabTestService {
    static async bookLabTest(bookingData) {
        // Verify test exists
        const test = await Test.findOne({ _id: bookingData.testId, isActive: true });
        if (!test) throw new Error('Test not found or inactive');

        // Verify clinic exists
        const clinic = await Clinic.findById(bookingData.clinicId);
        if (!clinic) throw new Error('Clinic not found');

        // Check time slot availability
        const existingBooking = await LabTestBooking.findOne({
            clinic: bookingData.clinicId,
            bookingDate: bookingData.bookingDate,
            'timeSlot.start': bookingData.timeSlot.start,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) throw new Error('Time slot already booked');

        // Create booking
        const booking = new LabTestBooking({
            patient: bookingData.patientId,
            clinic: bookingData.clinicId,
            test: {
                _id: test._id,
                name: test.name,
                code: test.code,
                price: test.price
            },
            bookingDate: bookingData.bookingDate,
            timeSlot: bookingData.timeSlot,
            status: 'booked'
        });

        return await booking.save();
    }

    static async getPatientBookings(patientId) {
        return await LabTestBooking.find({ patient: patientId })
            .populate('clinic', 'name address')
            .sort({ bookingDate: -1 });
    }

    static async updateBookingStatus(bookingId, status) {
        const validStatuses = ['booked', 'sample-collected', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) throw new Error('Invalid status');

        return await LabTestBooking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        );
    }

    static async getClinicBookings(clinicId, date) {
        const query = { clinic: clinicId };
        if (date) query.bookingDate = date;

        return await LabTestBooking.find(query)
            .populate('patient', 'name email phone username')
            .sort({ bookingDate: 1, 'timeSlot.start': 1 });
    }

    static async uploadReport(bookingId, filePath) {
        // 1. Check if booking exists and is in a valid state
        const booking = await LabTestBooking.findById(bookingId);
        if (!booking) throw new Error('Booking not found');
        if (booking.status !== 'processing') {
            throw new Error('Report can only be uploaded for tests in "processing" status');
        }

        // 2. Upload PDF to Supabase Storage
        try {
            const fileName = `report_${bookingId}_${Date.now()}.pdf`;
            const fileBuffer = require('fs').readFileSync(filePath);

            // Upload file to Supabase
            const { data, error } = await supabase.storage
                .from('medgo') // Your bucket name
                .upload(fileName, fileBuffer, {
                    contentType: 'application/pdf',
                    upsert: true, // Overwrite if exists
                });

            if (error) throw error;

            // Generate public URL (if bucket is public)
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/medgo/${fileName}`;

            // 3. Update booking with report URL and status
            const updatedBooking = await LabTestBooking.findByIdAndUpdate(
                bookingId,
                {
                    reportFile: publicUrl,
                    status: 'completed',
                    completedAt: new Date()
                },
                { new: true }
            );

            return updatedBooking;
        } catch (error) {
            console.error('Supabase upload error:', error);
            throw new Error('Failed to upload report');
        }
    }
}

module.exports = LabTestService;