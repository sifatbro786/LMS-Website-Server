const UserModel = require("../models/user.model");
const { redis } = require("../utils/redis");

//* get user by id:
const getUserById = async (id, res) => {
    const userJson = await redis.get(id);

    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(200).json({
            success: true,
            user,
        });
    }
};

//* get all users:
const getAllUsersService = async (req, res) => {
    const users = await UserModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        users,
    });
};

//* update user role:
const updateUserRoleService = async (res, userId, role) => {
    const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true });

    res.status(200).json({
        success: true,
        user,
    });
} 

module.exports = { getUserById, getAllUsersService, updateUserRoleService };
