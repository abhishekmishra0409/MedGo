const Test = require('../Models/TestModel');

class TestService {
    static async getAllTests() {
        return await Test.find({ isActive: true }).select('-__v');
    }

    static async createTest(testData) {
        const test = new Test(testData);
        return await test.save();
    }

    static async updateTest(testId, updateData) {
        return await Test.findByIdAndUpdate(testId, updateData, { new: true, runValidators: true });
    }

    static async deactivateTest(testId) {
        return await Test.findByIdAndUpdate(testId, { isActive: false }, { new: true });
    }
}

module.exports = TestService;