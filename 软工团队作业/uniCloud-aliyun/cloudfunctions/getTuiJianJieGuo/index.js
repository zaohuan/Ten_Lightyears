'use strict';
const https = require('https');

exports.main = async (event, context) => {
  const { accessToken, formData, modelurl } = event;
  console.log('access_token in getTuiJianJieGuo fun(): ', accessToken);

  // 获取用户的旅行需求
  const {
    destination,
    startDate,
    endDate,
    budgetMin,
    budgetMax,
    accessibility,
    kidFriendly,
    petFriendly,
    naturalLandscape,
    socialLandscape,
    cuisine,
    otherNeeds
  } = formData;

  // 生成用户需求描述，用于向生成模型提供提示
  const userPrompt = `
    请根据以下旅行需求为用户提供三条旅游路线推荐：
    
    目的地: ${destination}
    出发日期: ${startDate}
    结束日期: ${endDate}
    最低预算: ${budgetMin}（单位：人民币）
    最高预算: ${budgetMax}（单位：人民币）
    是否可访问: ${accessibility}（"yes" 或 "no"）
    是否适合儿童: ${kidFriendly}（"yes" 或 "no"）
    是否宠物友好: ${petFriendly}（"yes" 或 "no"）
    自然景观偏好: ${naturalLandscape}
    社会景观偏好: ${socialLandscape}
    美食偏好: ${cuisine}
    其他需求: ${otherNeeds}

    请根据以上需求为用户提供以下格式的三条推荐路线：
    1. 每条路线应包括：
       - 路线标题（如 "豪华尊享游"）
       - 包含的景点（如 "鼓山"、"三坊七巷"）
       - 预算范围（如 "1460-2780"）
    2. 确保每条路线的预算在用户提供的最低预算和最高预算之间。
    3. 景点应根据用户的需求（如自然景观、适合儿童等）进行筛选。
    4. 如果没有明确需求，可提供一些常见的景点。

    输出示例格式：
    [
      {
        "title": "豪华尊享游",
        "spots": [
          { "name": "鼓山" },
          { "name": "三坊七巷" },
          { "name": "达明美食街" }
        ],
        "budget": "1460-2780"
      },
      {
        "title": "经济适用游",
        "spots": [
          { "name": "鼓山" },
          { "name": "闽江公园" },
          { "name": "万达广场/老街" }
        ],
        "budget": "860-1280"
      },
      {
        "title": "特种兵穷游",
        "spots": [
          { "name": "青云山" },
          { "name": "鼓山" },
          { "name": "达明美食街" }
        ],
        "budget": "310-580"
      }
    ]
  `;

  // 构建请求数据
  const params = {
    messages: [
      { role: 'user', content: '根据用户需求生成旅游推荐路线，并按照指定格式输出。' },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    top_p: 1.0,
    //user_id: 'unique_user_id',  // 可以根据实际情况修改
  };

  const url = `${modelurl}?access_token=${accessToken}`;
  const requestData = JSON.stringify(params);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData),
    },
    timeout: 120000  // 设置为2分钟
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

       res.on('end', () => {
		  try {
		    console.log('响应数据:', responseData); // 打印完整响应数据
		  
		    const parsedData = JSON.parse(responseData);
		    console.log("json响应数据：", parsedData);
		  
		    // 获取result字段，去掉 Markdown 代码块标记（```json 和 ```）
		    let resultString = parsedData.result;
		  
		    // 去掉 "```json" 和 "```" 代码块标记
		    resultString = resultString.replace(/```json\n|\n```/g, '');
		  
		    // 解析去除标记后的 JSON 字符串
		    let routesData = [];
		    try {
		      routesData = JSON.parse(resultString); // 解析处理后的 JSON 字符串
		    } catch (e) {
		      console.error('解析 result 字符串失败:', e);
		    }
		  
		    // 判断解析后的数据是否有效
		    if (Array.isArray(routesData) && routesData.length > 0) {
		      const formattedRoutes = routesData.map(route => ({
		        title: route.title || '未知路线',  // 确保有 title 字段
		        spots: route.spots && Array.isArray(route.spots) 
		          ? route.spots.map(spot => ({ name: spot.name || '未知景点' }))  // 确保每个景点有 name
		          : [],  // 如果没有 spots 或者 spots 不是数组，返回空数组
		        budget: route.budget || '未知预算'  // 确保有 budget 字段
		      }));
		      
		      // 返回格式化后的推荐数据
		      resolve({
		        statusCode: 200,
		        data: { routes: formattedRoutes }
		      });
		    } else {
		      // 如果解析数据为空或无效，使用默认数据
		      console.warn('AI 返回数据为空或无效，使用默认数据');
		      resolve({
		        statusCode: 200,
		        data: {
		          routes: [
		            {
		              title: "豪华尊享游",
		              spots: [
		                { name: "鼓山" },
		                { name: "三坊七巷" },
		                { name: "达明美食街" }
		              ],
		              budget: "1460-2780"
		            },
		            {
		              title: "经济适用游",
		              spots: [
		                { name: "鼓山" },
		                { name: "闽江公园" },
		                { name: "万达广场/老街" }
		              ],
		              budget: "860-1280"
		            },
		            {
		              title: "特种兵穷游",
		              spots: [
		                { name: "青云山" },
		                { name: "鼓山" },
		                { name: "达明美食街" }
		              ],
		              budget: "310-580"
		            }
		          ]
		        }
		      });
		    }
		  } catch (error) {
		    console.error('解析响应数据失败:', error);
		    // 如果解析失败，返回默认数据
		    resolve({
		      statusCode: 500,
		      data: {
		        routes: [
		          {
		            title: "豪华尊享游",
		            spots: [
		              { name: "鼓山" },
		              { name: "三坊七巷" },
		              { name: "达明美食街" }
		            ],
		            budget: "1460-2780"
		          },
		          {
		            title: "经济适用游",
		            spots: [
		              { name: "鼓山" },
		              { name: "闽江公园" },
		              { name: "万达广场/老街" }
		            ],
		            budget: "860-1280"
		          },
		          {
		            title: "特种兵穷游",
		            spots: [
		              { name: "青云山" },
		              { name: "鼓山" },
		              { name: "达明美食街" }
		            ],
		            budget: "310-580"
		          }
		        ]
		      }
		    });
		  }
		});
	  });

    req.on('error', (error) => {
      console.error('请求失败:', error);
      reject({
        statusCode: 500,
        error: error.message,
      });
    });

    req.write(requestData);
    req.end();
  });
};
