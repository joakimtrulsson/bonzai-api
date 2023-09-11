const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");


exports.handler = async (event, context) => {
    const { bookingId } = event.pathParameters;

    try {
        await db.delete({
            TableName: "bookingsDb",
            Key: {
                bookingId: bookingId,
            },
        }).promise();

        return sendResponse(200, { success: true } );
    } catch (error) {
     console.log(error);
        return sendError(500, { success: false, message: "could not delete booking"});
    }
}