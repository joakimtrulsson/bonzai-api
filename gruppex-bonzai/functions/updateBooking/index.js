const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const BookingModel = require('../../models/booking');
const validationBody = require('../../models/validation');

exports.handler = async (event, context) => {
  try {
    const { bookingId } = event.pathParameters;
    if (!bookingId) {
      return sendError(400, {
        success: false,
        message: 'Missing booking id',
      });
    }
    const existing_booking = await db
      .get({
        TableName: process.env.DYNAMODB_BOOKING_TABLE,
        Key: {
          bookingId: bookingId,
        },
      })
      .promise();
    if (!existing_booking.Item) {
      return sendError(404, {
        success: false,
        message: 'Booking does not exist',
      });
    }
    const body = JSON.parse(event.body);
    const requiredFields = ['checkIn', 'checkOut', 'totalGuests', 'roomId'];
    const errorMessage = validationBody(requiredFields, body);

    if (errorMessage) {
      return sendError(400, {
        success: false,
        message: errorMessage,
      });
    }

    const request = body.roomId.map((id) => {
      return {
        roomId: id,
      };
    });
    const {
      Responses: { roomDb: existingRooms },
    } = await db
      .batchGet({
        RequestItems: {
          ['roomDb']: {
            Keys: request,
          },
        },
      })
      .promise();
    if (existingRooms.length != body.roomId.length) {
      const existingIds = existingRooms.map((room) => room.roomId);
      const missingRooms = body.roomId.filter(
        (element) => !existingIds.includes(element)
      );
      const message =
        missingRooms.length > 1
          ? 'Rooms: ' + missingRooms.join(', ')
          : 'Room: ' + missingRooms[0];
      return sendError(400, {
        success: false,
        message: message + ' does not exist',
      });
    }

    const { checkIn, checkOut, roomId, totalGuests } = body;
    const isGuestCountValid = BookingModel.checkTotalGuest(
      existingRooms,
      totalGuests
    );
    if (!isGuestCountValid) {
      return sendError(400, {
        success: false,
        message: 'Antalet gäster överstiger antalet tillgängliga rum.',
      });
    }

    const totalDays = BookingModel.calculateTotalDays(checkIn, checkOut);
    const totalCost = BookingModel.calculateTotalCost(existingRooms, totalDays);

    await db
      .update({
        TableName: 'bookingDb',
        Key: {
          bookingId: bookingId,
        },
        UpdateExpression:
          'set checkIn = :checkIn, checkOut = :checkOut, rooms = :rooms, totalGuests = :totalGuests, totalCost = :totalCost',
        ExpressionAttributeValues: {
          ':checkIn': checkIn,
          ':checkOut': checkOut,
          ':rooms': existingRooms,
          ':totalGuests': totalGuests,
          ':totalCost': totalCost,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();
    return sendResponse(200, {
      success: true,
      message: 'Booking updated. Here is the new booking:',
      bookingNumber: bookingId,
      checkIn,
      checkOut,
      totalGuests,
      totalCost,
      rooms: existingRooms,
    });
  } catch (error) {
    console.log(error);
    return sendError(500, {
      success: false,
      message: 'could not update booking',
    });
  }
};
