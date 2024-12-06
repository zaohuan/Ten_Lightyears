"use strict";

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userInfo, title, scheduleData } = event;
  const user_id = userInfo._id;

  try {
    // 查找并更新行程
    const res = await db
      .collection("myTrips")
      .where({
        user_id: user_id,
        scheduleTitle: title,
      })
      .update({
        scheduleData: scheduleData,
      });

    return {
      success: true,
      message: "更新行程成功",
      data: res,
    };
  } catch (error) {
    console.error("更新行程失败:", error);
    return {
      success: false,
      message: "更新行程失败",
      error: error.message,
    };
  }
};