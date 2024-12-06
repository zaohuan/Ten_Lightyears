'use strict';
const https = require('https');

/**
 * 调用文心一言 API 的云函数
 * @param {Object} event - 云函数调用时传递的参数，包括 params 和 accessToken
 * @returns {Promise<Object>} - 返回文心一言 API 的响应
 */
exports.main = async (event, context) => {
    const params = event.params;
    const accessToken = event.accessToken;
	const modelurl = event.modelurl;
	console.log('access_token in sendtowenxin fun(): ', accessToken);
    const url = modelurl + `?access_token=${accessToken}`;

    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify(params);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData),
            },
        };

        const req = https.request(url, options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    console.log('响应数据:', responseData); // 添加日志打印完整响应数据
                    const parsedData = JSON.parse(responseData);

                    if (parsedData.result) {
                        resolve({
                            statusCode: 200,
                            data: parsedData,
                        });
                    } else {
                        console.error('API 返回未包含 result:', parsedData); // 打印详细错误
                        reject({
                            statusCode: 400,
                            error: parsedData,
                        });
                    }
                } catch (error) {
                    console.error('解析响应数据失败:', error, responseData); // 打印解析失败的内容
                    reject({
                        statusCode: 500,
                        error: '解析响应数据失败',
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