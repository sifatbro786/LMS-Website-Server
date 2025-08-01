const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const { cloudinary } = require("../utils/cloudinary");
const LayoutModel = require("../models/layout.model");

//* create layout:
const createLayout = CatchAsyncError(async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!type) {
            return next(new ErrorHandler("Please enter type", 400));
        }

        const isTypeExist = await LayoutModel.findOne({ type });
        if (isTypeExist) {
            return next(new ErrorHandler(`${type} already exists`, 400));
        }

        //? create banner:
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;

            const myCloud = await cloudinary.uploader.upload(image, {
                folder: "layout",
            });

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            };
            await LayoutModel.create(banner);
        }

        //? create faq:
        if (type === "FAQ") {
            const { faq } = req.body;

            const faqItems = await Promise.all(
                faq.map(async (item) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                }),
            );
            await LayoutModel.create({ type: "FAQ", faq: faqItems });
        }

        //? create category:
        if (type === "Categories") {
            const { categories } = req.body;

            const categoriesItems = await Promise.all(
                categories.map(async (item) => {
                    return {
                        title: item.title,
                    };
                }),
            );
            await LayoutModel.create({ type: "Categories", categories: categoriesItems });
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* edit layout:
const editLayout = CatchAsyncError(async (req, res, next) => {
    try {
        const { type } = req.body;

        //? update banner:
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;

            const bannerData = await LayoutModel.findOne({ type: "Banner" });
            if (bannerData) {
                await cloudinary.uploader.destroy(bannerData.image.public_id);
            }
            const myCloud = await cloudinary.uploader.upload(image, {
                folder: "layout",
            });

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle,
            };
            await LayoutModel.findByIdAndUpdate(bannerData.id, { banner });
        }

        //? update faq:
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqData = await LayoutModel.findOne({ type: "FAQ" });

            const faqItems = await Promise.all(
                faq.map(async (item) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                }),
            );
            await LayoutModel.findByIdAndUpdate(faqData._id, { type: "FAQ", faq: faqItems });
        }

        //? update category:
        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesData = await LayoutModel.findOne({ type: "Categories" });

            const categoriesItems = await Promise.all(
                categories.map(async (item) => {
                    return {
                        title: item.title,
                    };
                }),
            );
            await LayoutModel.findByIdAndUpdate(categoriesData._id, {
                type: "Categories",
                categories: categoriesItems,
            });
        }

        res.status(200).json({
            success: true,
            message: "Layout updated successfully",
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get layout by type:
const getLayoutByType = CatchAsyncError(async (req, res, next) => {
    try {
        const { type } = req.body;
        const layout = await LayoutModel.findOne({ type });

        res.status(200).json({
            success: true,
            layout,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = { createLayout, editLayout, getLayoutByType };
