const Test = require('../Models/TestModel');

class TestService {
    static async getAllTests(filters = {}) {
        const query = { isActive: true };
        const search = filters.search?.trim();

        if (filters.category) {
            query.category = filters.category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        return await Test.find(query)
            .select('-__v')
            .sort(search ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 });
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
