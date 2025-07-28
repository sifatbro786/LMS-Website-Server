const { redis } = require("../utils/redis");

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

module.exports = { getUserById };
