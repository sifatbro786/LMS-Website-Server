const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
});

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
    },
});

const bannerImageSchema = new mongoose.Schema({
    public_id: {
        type: String,
    },
    url: {
        type: String,
    },
});

//! main layout 
const layoutSchema = new mongoose.Schema({
    type: {
        type: String,
    },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: {
            type: String,
        },
        subTitle: {
            type: String,
        },
    },
});

const LayoutModel = mongoose.models.Layout ?? mongoose.model("Layout", layoutSchema);

module.exports = LayoutModel;
