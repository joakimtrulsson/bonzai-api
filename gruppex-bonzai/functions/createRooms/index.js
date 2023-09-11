const { sendResponse, sendError } = require("../../responses/index");
const { db } = require("../../services/db");
const roomsData = require("../../roomsData");

exports.handler = async (event, context) => {
//   const rooms = roomsData.forEach((item) => {
//     const params = {
//       TableName: "roomsDb",
//       Item: item,
//     };
//   });

const { roomId, roomType, maxGuests, price } = JSON.parse(event.body);

  try {
    // await db
    //   .put({
    //     TableName: "roomsDb",
    //     Item: {},
    //   })
    //   .promise();

    // console.log("före", rooms);

    // await db.put(rooms, (err, data) => {
    //   if (err) {
    //     console.error("Error inserting data:", err);
    //   } else {
    //     console.log("Data inserted successfully:", data);
    //   }
    // }).promise()

    // console.log("efter", roomsData);


    await db
      .put({
        TableName: "roomDb",
        Item: {
            roomId: roomId,
            roomType: roomType,
            maxGuests: maxGuests,
            price: price,
        },
      })
      .promise();
    return sendResponse(200, { success: true });
  } catch (error) {
    return sendError(500, { success: false, error: error });
  }
};
