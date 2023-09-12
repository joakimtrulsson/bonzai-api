const BookingModel = require('../../models/booking');
const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const { nanoid } = require('nanoid');
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { room_types, total_guests, ...rest } = body;

    const isGuestCountValid = BookingModel.checkTotalGuest(room_types, total_guests);
    if (!isGuestCountValid) {
      return sendError(400, {
        success: false,
        message: 'Antalet gäster överstiger antalet tillgängliga rum.',
      });
    }
    const bookingId = nanoid().slice(0, 6);
    const totalCost = BookingModel.calculateTotalCost(room_types);
    const params = {
      TableName: process.env.DYNAMODB_BOOKING_TABLE,
      Item: {
        bookingId,
        ...rest,
        totalCost,
        room_types,
      },
    };

    await db.put(params).promise();

    return sendResponse(200, {
      success: true,
      message: 'Bokning har skapats. Returnera ID.',
      data: {
        bookingNumber: bookingId,
        ...rest,
        totalCost,
        room_types,
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(500, error);
  }
};
