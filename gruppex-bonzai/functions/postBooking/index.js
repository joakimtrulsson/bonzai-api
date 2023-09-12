const BookingModel = require('../../models/booking');
const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const { nanoid } = require('nanoid');
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { roomTypes, totalGuests, ...rest } = body;

    const isGuestCountValid = BookingModel.checkTotalGuest(
      roomTypes,
      totalGuests
    );
    if (!isGuestCountValid) {
      return sendError(400, {
        success: false,
        message: 'Antalet gäster överstiger antalet tillgängliga rum.',
      });
    }
    const bookingId = nanoid().slice(0, 6);
    let totalDays = BookingModel.calculateTotalDays(
      rest.checkIn,
      rest.checkOut
    );
    if (totalDays < 0) {
      return sendError(400, {
        success: false,
        message: 'Check in date must be before check out date.',
      });
    }
    if (totalDays == 0) {
      totalDays = 1;
    }

    const totalCost = BookingModel.calculateTotalCost(roomTypes, totalDays);
    const params = {
      TableName: process.env.DYNAMODB_BOOKING_TABLE,
      Item: {
        bookingId,
        ...rest,
        totalCost,
        roomTypes,
        totalGuests,
      },
    };

    await db.put(params).promise();

    return sendResponse(200, {
      success: true,
      message: 'Bokning har skapats',
      data: {
        bookingNumber: bookingId,
        name: rest.name,
        checkIn: rest.checkIn,
        checkOut: rest.checkOut,
        totalCost,
        rooms: roomTypes,
        totalGuests,
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(500, error);
  }
};
