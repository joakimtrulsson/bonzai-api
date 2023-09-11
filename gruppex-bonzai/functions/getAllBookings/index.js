const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");


exports.handler = async (event, context) => {

    try {
        const { Items: bookings } = await db.scan({
            TableName: "bookingsDb",
            FilterExpression: "attribute_exists(#DYNOBASE_bookingId)",
            ExpressionAttributeNames: {
                "#DYNOBASE_bookingId": "bookingId",
            },
        }).promise();

        return sendResponse(200, { Bookings: bookings } );
    } catch (error) {
     console.log(error);
        return sendError(500, { success: false, message: "could not get bookings" });
    }
}