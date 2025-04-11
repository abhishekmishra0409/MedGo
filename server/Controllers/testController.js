const TestService = require('../Services/testService');

exports.getAllTests = async (req, res) => {
    try {
        const tests = await TestService.getAllTests();
        res.json({ success: true, data: tests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createTest = async (req, res) => {
    try {
        const test = await TestService.createTest(req.body);
        res.status(201).json({ success: true, data: test });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateTest = async (req, res) => {
    try {
        const test = await TestService.updateTest(req.params.id, req.body);
        res.json({ success: true, data: test });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deactivateTest = async (req, res) => {
    try {
        const test = await TestService.deactivateTest(req.params.id);
        res.json({ success: true, data: test });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};