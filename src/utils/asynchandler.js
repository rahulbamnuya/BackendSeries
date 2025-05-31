const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export { asyncHandler };

// const asyncHandler = (fn) =>async(req,res,next)=>{
//     try{

//     }catch(err){
//         console.error(`❌ Error in asyncHandler: ${err.message}`);
//         res.status(500).json({ success:false,
//             message:err.message,
//             error: 'Internal Server Error' });
//     }
// }