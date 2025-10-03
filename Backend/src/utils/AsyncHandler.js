const asyncHandler = (fn) => async (req, res, next)=>{
     Promise.resolve(fn(req, res, next)).catch((error) => {
        res.status(error.statusCode || 500 ).json({
            success: false,
            message: error.message
        });
    });
};



export { asyncHandler }