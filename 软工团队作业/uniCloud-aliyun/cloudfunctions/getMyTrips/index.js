"use strict";

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userInfo, title } = event;
  const user_id = userInfo._id;

  try {
    const res = await db
      .collection("myTrips")
      .where({
        user_id: user_id,
        scheduleTitle: title,
      })
      .get();

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("获取行程失败:", error);
    return {
      success: false,
      message: "获取行程失败",
      error: error.message,
    };
  }
};
