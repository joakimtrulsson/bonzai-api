const { db } = require('../services/db');

const BookingModel = {
  calculateTotalDays: function (checkIn, checkOut) {
    return new Date(checkOut).getDate() - new Date(checkIn).getDate();
  },
  calculateTotalCost: function (rooms, totalDays) {
    let price = 0;
    for (let index = 0; index < rooms.length; index++) {
      price += rooms[index].price;
    }

    return price * totalDays;
  },

  checkTotalGuest: function (rooms, totalGuests) {
    let total = 0;
    for (let index = 0; index < rooms.length; index++) {
      total += rooms[index].maxGuests;
    }

    return totalGuests <= total;
  },

  checkRoomAvailability: async function (newCheckIn, newCheckOut) {
    try {
      const existingBookings = await db
        .scan({
          TableName: process.env.DYNAMODB_BOOKING_TABLE,
          FilterExpression: '#checkIn <= :checkOut AND #checkOut >= :checkIn',
          ExpressionAttributeNames: {
            '#checkIn': 'checkIn',
            '#checkOut': 'checkOut',
          },
          ExpressionAttributeValues: {
            ':checkIn': newCheckIn,
            ':checkOut': newCheckOut,
          },
        })
        .promise();

      const availableRooms = {
        single: 0,
        double: 0,
        suite: 0,
      };

      existingBookings.Items.forEach((booking) => {
        booking.roomTypes.forEach((room) => {
          availableRooms[room.type] += 1;
        });
      });

      let totalAvailableRooms = 0;
      for (const type of Object.keys(availableRooms)) {
        totalAvailableRooms += availableRooms[type];
      }

      if (totalAvailableRooms > 20) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Något gick fel vid kontroll av tillgängliga rum.', error);
      throw error;
    }
  },
};

module.exports = BookingModel;
