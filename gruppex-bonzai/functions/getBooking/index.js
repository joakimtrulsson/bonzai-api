const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');

exports.handler = async (event, context) => {
  try {
    const id = event.pathParameters;

    const params = {
      TableName: 'bookingDb',
      Key: {
        bookingId: id.bookingId,
      },
    };

    console.log(id.bookingId, typeof id.bookingId);
    const { Item: booking } = await db.get(params).promise();

    if (!booking) {
      return sendError(404, { success: false, message: 'Bokningen hittades inte.' });
    }

    return sendResponse(200, { success: true, booking });
  } catch (error) {
    console.error(error);
    return sendError(500, { success: false, message: 'Ett fel uppstod vid hämtning av bokningen.' });
  }
};
