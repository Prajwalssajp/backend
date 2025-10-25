import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const healthCheck = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Everything is Ok"))
})
export{healthCheck}