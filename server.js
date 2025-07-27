const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./utils/db");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at ${PORT}`);
    connectDB();
});
