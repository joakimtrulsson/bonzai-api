const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const BookingModel = require('../../models/booking');

exports.handler = async (event, context) => {
    try {
        const { bookingId } = event.pathParameters;
        const body = JSON.parse(event.body);
        const { check_in, check_out, room_types, total_guests } = body;
        const isGuestCountValid = BookingModel.checkTotalGuest(
            room_types,
            total_guests
        );
        if (!isGuestCountValid) {
            return sendError(400, {
                success: false,
                message: 'Antalet gäster överstiger antalet tillgängliga rum.',
            });
        }
        const totalCost = BookingModel.calculateTotalCost(room_types);
        const params = {
            TableName: process.env.DYNAMODB_BOOKING_TABLE,
            Item: {
                bookingId,
                check_in,
                check_out,
                total_guests,
                totalCost,
                room_types,
            },
        };

        await db.update({
            TableName: "bookingDb",
            Key: {
                bookingId: bookingId
            },
            UpdateExpression: "set check_in = :check_in, check_out = :check_out, room_types = :room_types, total_guests = :total_guests, totalCost = :totalCost",
            ExpressionAttributeValues: {
                ":check_in": check_in,
                ":check_out": check_out,
                ":room_types": room_types,
                ":total_guests": total_guests,
                ":totalCost": totalCost
            }

        }).promise();
        return sendResponse(200, {
            success: true,
            message: "Booking updated. Here is the new booking:",
            bookingNumber: bookingId,
            check_in: check_in,
            check_out: check_out,
            total_guests: total_guests,
            totalCost: totalCost,
            room_types: room_types
        });
    } catch (error) {
        console.log(error);
        return sendError(500, { success: false, message: "could not update booking" });
    }
}