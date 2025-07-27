const CatchAsyncError = (theFunction) => (req, res, next) => {
    Promise.resolve(theFunction(req, res, next)).catch(next);
};

module.exports = { CatchAsyncError };
