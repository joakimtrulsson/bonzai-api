const { sendResponse, sendError } = require('../../responses/index');
const { db } = require('../../services/db');
const BookingModel = require('../../models/booking');

exports.handler = async (event, context) => {
  try {
    const { bookingId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { checkIn, checkOut, roomTypes, totalGuests } = body;
    const isGuestCountValid = BookingModel.checkTotalGuest(roomTypes, totalGuests);
    if (!isGuestCountValid) {
      return sendError(400, {
        success: false,
        message: 'Antalet gäster överstiger antalet tillgängliga rum.',
      });
    }

    const totalDays = BookingModel.calculateTotalDays(checkIn, checkOut);

    const totalCost = BookingModel.calculateTotalCost(roomTypes, totalDays);
    const params = {
      TableName: process.env.DYNAMODB_BOOKING_TABLE,
      Item: {
        bookingId,
        checkIn,
        checkOut,
        totalGuests,
        totalCost,
        roomTypes,
      },
    };

    await db
      .update({
        TableName: 'bookingDb',
        Key: {
          bookingId: bookingId,
        },
        UpdateExpression:
          'set checkIn = :checkIn, checkOut = :checkOut, roomTypes = :roomTypes, totalGuests = :totalGuests, totalCost = :totalCost',
        ExpressionAttributeValues: {
          ':checkIn': checkIn,
          ':checkOut': checkOut,
          ':roomTypes': roomTypes,
          ':totalGuests': totalGuests,
          ':totalCost': totalCost,
        },
      })
      .promise();
    return sendResponse(200, {
      success: true,
      message: 'Booking updated. Here is the new booking:',
      bookingNumber: bookingId,
      checkIn: checkIn,
      checkOut: checkOut,
      totalGuests: totalGuests,
      totalCost: totalCost,
      roomTypes: roomTypes,
    });
  } catch (error) {
    console.log(error);
    return sendError(500, { success: false, message: 'could not update booking' });
  }
};
