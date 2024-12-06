"use strict";

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userInfo, title } = event;
  const user_id = userInfo._id;

  try {

    // 查找并删除匹配的行程
    const res = await db
      .collection("myTrips")
      .where({
        user_id: user_id,
        scheduleTitle: title,
      })
      .remove();
	
	const routeres = await db
	  .collection("myRoutes")
	  .where({
	    user_id: user_id,
		routeTitle: title,
	  })
	  .remove();
	  
    return {
      success: true,
      message: "删除行程成功",
      data: res,
    };
  } catch (error) {
    console.error("删除行程失败:", error);
    return {
      success: false,
      message: "删除行程失败",
      error: error.message,
    };
  }
};
