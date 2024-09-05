const authenticateHeaderKey = (req, res, next) => {
    const headerKey = req.headers['x-api-key'];

    if (!headerKey) {
        return res.status(401).json({ error: 'Missing API Key' });
    }

    const validApiKey = '3r3sf%TH*&HSS$^(JD(#&4h49hdcKde3d';
    if (headerKey !== validApiKey) {
        return res.status(403).json({ error: 'Invalid API Key' });
    }

    next();
};

module.exports = authenticateHeaderKey;