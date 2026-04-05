module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-strong-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '90d',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
