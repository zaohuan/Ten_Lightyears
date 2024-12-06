const https = require('https');

/**
 * 获取 access_token 的云函数
 */
exports.main = async (event, context) => {
    const clientId = 'zXbh9nZwC6DnCDC3pz5l1AmH'; // 替换为实际的 client_id
    const clientSecret = 'wAAytjEdf5Z3rBg8Onh19ZlcRABCLPWL'; // 替换为实际的 client_secret
    const grantType = 'client_credentials';

    const url = `https://aip.baidubce.com/oauth/2.0/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`;

    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'POST' }, (res) => {
            let data = '';

            // 数据块接收
            res.on('data', (chunk) => {
                data += chunk;
            });

            // 请求结束
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    if (responseData.access_token) {
                        resolve({
                            statusCode: 200,
                            data: responseData,
                        });
                    } else {
                        reject({
                            statusCode: 400,
                            error: responseData,
                        });
                    }
                } catch (error) {
                    reject({
                        statusCode: 500,
                        error: '解析响应失败',
                    });
                }
            });
        });

        // 错误处理
        req.on('error', (error) => {
            reject({
                statusCode: 500,
                error: error.message,
            });
        });

        // 发送请求
        req.end();
    });
};
