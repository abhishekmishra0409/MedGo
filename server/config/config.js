module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-strong-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '90d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

    // Vidza runs the teleconsultation calls. No fallback for the key: a wrong
    // or absent one must fail the join loudly, not point at some other host.
    VIDZA_API_URL: (process.env.VIDZA_API_URL || '').replace(/\/+$/, ''),
    VIDZA_API_KEY: process.env.VIDZA_API_KEY || ''
};
