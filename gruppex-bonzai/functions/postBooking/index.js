const BookingModel = require('../../models/booking');
const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const { nanoid } = require('nanoid');
const validationBody = require('../../models/validation');
exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const requiredFields = [
      'name',
      'email',
      'checkIn',
      'checkOut',
      'totalGuests',
      'roomId',
    ];
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

    const { totalGuests, checkIn, checkOut, name, email } = body;

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

    const roomAvailability = await BookingModel.checkRoomAvailability(
      checkIn,
      checkOut
    );

    if (!roomAvailability) {
      return sendResponse(200, {
        message: 'Det finns inga lediga rum för de valda datumen.',
      });
    }

    const bookingId = nanoid().slice(0, 6);
    let totalDays = BookingModel.calculateTotalDays(checkIn, checkOut);
    if (totalDays < 0) {
      return sendError(400, {
        success: false,
        message: 'Check in date must be before check out date.',
      });
    }
    if (totalDays == 0) {
      totalDays = 1;
    }

    const totalCost = BookingModel.calculateTotalCost(existingRooms, totalDays);
    const params = {
      TableName: process.env.DYNAMODB_BOOKING_TABLE,
      Item: {
        bookingId,
        totalGuests,
        checkIn,
        checkOut,
        name,
        email,
        rooms: existingRooms,
        totalCost,
      },
    };

    await db.put(params).promise();

    return sendResponse(200, {
      success: true,
      message: 'Bokning har skapats',
      data: {
        bookingNumber: bookingId,
        rooms: existingRooms,
        checkIn,
        checkOut,
        totalGuests,
        name,
        email,
        totalCost,
      },
    });
  } catch (error) {
    console.log(error);
    return sendError(500, error);
  }
};
