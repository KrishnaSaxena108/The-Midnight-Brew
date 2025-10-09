const { authenticateToken } = require('./middleware');
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {

    authenticateToken(req, res, async (err) => {
        if(err) return;

        try {
            const user = await User.findById(req.user.userId);

            if(!user){
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if(user.role !== 'admin'){
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin role required'
                });
            }

            req.admin = user;
            next();
        }
        catch (error){
            return res.status(500).json({
                success: false,
                message: 'Error verifying admin status',
                error: error.message
            });
        }
    });
};

module.exports = { requireAdmin };