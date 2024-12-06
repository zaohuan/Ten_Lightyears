'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { scheduleData , routeData, userInfo} = event;
  const user_id = userInfo._id;
  
  try {
    const res = await db.collection('myTrips').add({
      user_id: user_id,
	  scheduleTitle: routeData.title,
      scheduleData: scheduleData,
      created_at: new Date().toISOString()
    });
	
	const routeres = await db.collection('myRoutes').add({
	  user_id: user_id,
	  routeTitle: routeData.title,
	  routeData: routeData,
	  created_at: new Date().toISOString()
	});
	
    return {
      success: true,
      message: '行程添加成功',
      data: res.id
    };
  } catch (error) {
    console.error('行程添加失败:', error);
    return {
      success: false,
      message: '行程添加失败',
      error: error.message
    };
  }
};
