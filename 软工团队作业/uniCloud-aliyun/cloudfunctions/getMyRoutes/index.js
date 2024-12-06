"use strict";

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userInfo, title } = event;
  const user_id = userInfo._id;

  try {
    let query = db.collection("myRoutes").where({
      user_id: user_id,
    });

    const res = await query.get();

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("获取路线失败:", error);
    return {
      success: false,
      message: "获取路线失败",
      error: error.message,
    };
  }
};
