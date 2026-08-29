const axios = require('axios');
const config = require('../config/config');

const TIMEOUT_MS = 10000;

// Vidza derives every join link by HMAC and keys meetings on externalId, so
// creating is idempotent: a repeat POST returns the identical room and the
// identical links. That means there is no create-vs-fetch branch to write.
async function createMeeting({ externalId, title, scheduledStart, scheduledEnd, participants }) {
    if (!config.VIDZA_API_URL || !config.VIDZA_API_KEY) {
        const error = new Error('Video calling is not configured');
        error.status = 503;
        throw error;
    }

    try {
        const { data } = await axios.post(
            `${config.VIDZA_API_URL}/v1/meetings`,
            {
                externalId,
                title,
                scheduledStart,
                scheduledEnd,
                joinWindow: { beforeMinutes: 15, afterMinutes: 30 },
                // ponytail: headroom for a stale session, not a waiting room.
                // Vidza refuses at live >= max, so a 2-cap room would lock the
                // second party out whenever the first one's tab lingers.
                maxParticipants: 4,
                participants,
            },
            {
                headers: { Authorization: `Bearer ${config.VIDZA_API_KEY}` },
                timeout: TIMEOUT_MS,
            },
        );
        return data;
    } catch (error) {
        // Don't leak the API key or Vidza's internals to a patient's browser.
        console.error('Vidza createMeeting failed:', error.response?.status, error.response?.data || error.message);
        const wrapped = new Error('Could not start the video call. Please try again.');
        wrapped.status = 502;
        throw wrapped;
    }
}

module.exports = { createMeeting };
