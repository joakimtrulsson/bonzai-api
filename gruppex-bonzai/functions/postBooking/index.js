const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');

exports.handler = async (event, context) => {
  try {
    const requestData = JSON.parse(event.body);

    // const bookingId = nanoId()

    function calculateTotalCost(price, days) {}

    const params = {
      TableName: 'bookingDb',
      Item: {
        bookingId: bookingId,
        guestName: requestData.guestName,
        checkInDate: requestData.checkInDate,
        checkOutDate: requestData.checkOutDate,
        roomIds: requestData.roomIds,
        totalCost: calculateTotalCost(price, days),
        booked: true,
      },
    };

    await db.put(params).promise();

    return sendResponse(200, { success: true, message: 'Bokning har skapats. Returnera ID.' });
  } catch (error) {
    console.log(error);
    return sendError(500, error);
  }
};
