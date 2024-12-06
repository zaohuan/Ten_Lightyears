'use strict';
const https = require('https');

exports.main = async (event, context) => {
  const { accessToken, routeData, formData } = event;
  
  // 添加参数检查
  if (!accessToken || !routeData || !formData) {
    console.error('缺少必要参数:', { accessToken: !!accessToken, routeData: !!routeData, formData: !!formData });
    return {
      statusCode: 400,
      error: '缺少必要参数'
    };
  }
  
  // 检查 formData 中的必要字段
  if (!formData.destination || !formData.startDate || !formData.endDate) {
    console.error('formData 缺少必要字段:', formData);
    return {
      statusCode: 400,
      error: 'formData 数据不完整'
    };
  }

  // 生成用户提示,结合用户需求和推荐路线
  const userPrompt = `
    请根据以下用户需求和推荐路线信息生成详细的每日行程安排：

    用户需求信息：
    目的地: ${formData.destination}
    出行日期: ${formData.startDate} 至 ${formData.endDate}
   


    推荐路线信息：
    路线标题: ${routeData.title}
    景点列表: ${routeData.spots.map(spot => spot.name).join('、')}
    预算范围: ${routeData.budget}

    请根据以上信息生成详细的每日行程安排，要求：
    1. 行程天数应该与用户选择的日期相匹配
    2. 每天的行程应包含：
       - 具体时间安排（包括游览时长）
       - 交通方式和预计时间
       - 适合的用餐地点（给出具体地点名称）
       - 每个地点的具体位置（经纬度）
    3. 特别注意：
	   - 尽量简单描述，越快越好
	   - 返回出行时间对应天数的数据
	   - 不需要descrption，只需要transport
	   - 景点不要重复的，可以在推荐路线信息基础上补充
	   - 不要有自由活动
	   - 返回的经纬度按照GCJ-02坐标系
    请按照以下格式输出每日行程安排：
    [
      [
        {
          "time": "8:00",
          "spot": "酒店出发",
          "transport": "打车20分钟",
          "latitude": 26.0829,
          "longitude": 119.2978
        },
        {
          "time": "9:00",
          "spot": "鼓山",
          "transport": "步行10分钟",
          "latitude": 26.0854,
          "longitude": 119.3631
        }
      ],
	  [
	    {
	      "time": "8:00",
	      "spot": "酒店出发",
	      "transport": "打车20分钟",
	      "latitude": 26.0829,
	      "longitude": 119.2978
	    },
	    {
	      "time": "9:00",
	      "spot": "鼓山",
	      "transport": "步行10分钟",
	      "latitude": 26.0854,
	      "longitude": 119.3631
	    }
	  ],
	  [
		  
	  ],
	  //返回出行时间对应天数的数据
    ]
  `;

  const params = {
    messages: [
      { role: 'user', content: '请根据用户需求和推荐路线生成详细的每日行程安排。' },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    top_p: 1.0
  };

  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-turbo-8k?access_token=${accessToken}`;
  const requestData = JSON.stringify(params);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData),
    },
    timeout: 120000  // 2分钟 = 120000毫秒
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('API响应数据:', responseData);
          const parsedData = JSON.parse(responseData);
          let scheduleData = [];
          
          try {
            // 去除 Markdown 代码块标记并解析 JSON
            let resultString = parsedData.result.replace(/```json\n|\n```/g, '');
            scheduleData = JSON.parse(resultString);
          } catch (e) {
            console.error('解析行程数据失败:', e);
            // 使用默认数据
            scheduleData = [
              [
                {
                  time: "8:00",
                  spot: "酒店出发",
                  transport: "打车20分钟",
                  latitude: 26.0829,
                  longitude: 119.2978
                },
                {
                  time: "9:00",
                  spot: "鼓山",
                  transport: "步行10分钟",
                  latitude: 26.0854,
                  longitude: 119.3631
                }
              ]
            ];
          }
          
          resolve({
            statusCode: 200,
            data: { schedule: scheduleData }
          });
        } catch (error) {
          console.error('处理响应失败:', error);
          reject({
            statusCode: 500,
            error: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('请求失败:', error);
      reject({
        statusCode: 500,
        error: error.message
      });
    });

    req.write(requestData);
    req.end();
  });
}; 
