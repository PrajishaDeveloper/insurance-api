const User = require('../models/User');
const Policy = require('../models/Policy');

exports.findUserPolicies = async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.query.name });
        console.log('user',user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('userid',user._id);
        const policies = await Policy.find({ userId: user._id });
        res.status(200).json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.aggregatePoliciesByUser = async (req, res) => {
    try {
        const users = await User.find();
        const aggregatedData = await Promise.all(users.map(async (user) => {
          const policies = await Policy.find({ userId: user._id });
          return { user, policies };
        }));
        res.status(200).json(aggregatedData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   
};
