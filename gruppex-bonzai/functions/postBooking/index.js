const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");


exports.handler = async (event, context) => {

    try {
        

        return sendResponse(200, { success: true } );
    } catch (error) {
     console.log(error);
        return sendError(500, error);
    }
}