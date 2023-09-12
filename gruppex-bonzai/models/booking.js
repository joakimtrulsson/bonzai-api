const BookingModel = {
  calculateTotalCost: function (room_types) {
    let price = 0;
    for (let index = 0; index < room_types.length; index++) {
      price += room_types[index].price;
    }

    return price;
  },

  checkTotalGuest: function (room_types, total_guests) {
    let total = 0;
    for (let index = 0; index < room_types.length; index++) {
      total += room_types[index].maxGuests;
    }

    return total_guests <= total;
  },
};

module.exports = BookingModel;
