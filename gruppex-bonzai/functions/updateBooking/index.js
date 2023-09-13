const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const BookingModel = require('../../models/booking');
const validationBody = require('../../models/validation');

exports.handler = async (event, context) => {
  try {
    const { bookingId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const requiredFields = ['checkIn', 'checkOut', 'totalGuests','roomId'];
    const errors = validationBody(requiredFields,body);
    
    if(errors.length > 0){
      return sendError(400, { 
        success: false,
        message: 'Missing required '+errors[0],
      });
    }

    const request = body.roomId.map((id) =>{
      return {
        roomId: id
      }
    }
    )
    const existingRooms = await db.batchGet({
      RequestItems: {
        ['roomDb']: {
          Keys: request
        }
      }
    }).promise()
    if(existingRooms.Responses.roomDb.length != body.roomId.length){
      const existingIds = existingRooms.Responses.roomDb.map((room) => room.roomId)
      const missingRooms = body.roomId.filter((element) => !existingIds.includes(element));
      const message = missingRooms.length > 1 
      ? 'Rooms: '+missingRooms.join(', ')
      : 'Room: '+missingRooms[0]
      return sendError(400, {
        success: false,
        message: message+' does not exist',
      });
    }

    const { checkIn, checkOut, roomId, totalGuests } = body;
    const isGuestCountValid = BookingModel.checkTotalGuest(roomId, totalGuests);
    if (!isGuestCountValid) {
      return sendError(400, {
        success: false,
        message: 'Antalet gäster överstiger antalet tillgängliga rum.',
      });
    }

    const totalDays = BookingModel.calculateTotalDays(checkIn, checkOut);

    const totalCost = BookingModel.calculateTotalCost(roomId, totalDays);
    const params = {
      TableName: process.env.DYNAMODB_BOOKING_TABLE,
      Item: {
        bookingId,
        checkIn,
        checkOut,
        totalGuests,
        totalCost,
        roomId,
      },
    };

    await db
      .update({
        TableName: 'bookingDb',
        Key: {
          bookingId: bookingId,
        },
        UpdateExpression:
          'set checkIn = :checkIn, checkOut = :checkOut, roomId = :roomId, totalGuests = :totalGuests, totalCost = :totalCost',
        ExpressionAttributeValues: {
          ':checkIn': checkIn,
          ':checkOut': checkOut,
          ':roomId': roomId,
          ':totalGuests': totalGuests,
          ':totalCost': totalCost,
        },
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
      roomId
    });
  } catch (error) {
    console.log(error);
    return sendError(500, { success: false, message: 'could not update booking' });
  }
};
