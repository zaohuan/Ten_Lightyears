const https = require('https');

// 添加温度处理函数
function processTemperatureData(weatherData, forecastData) {
    // 处理当前天气数据
    if (weatherData && weatherData.main) {
        // 获取当前温度
        weatherData.main.temp = Math.round(weatherData.main.temp);
        
        // 从预报数据中获取今天的最高温和最低温
        const today = new Date().setHours(0, 0, 0, 0);
        const todayForecasts = forecastData.list.filter(item => {
            const itemDate = new Date(item.dt * 1000).setHours(0, 0, 0, 0);
            return itemDate === today;
        });

        if (todayForecasts.length > 0) {
            // 找出今天预报中的最高温和最低温
            const temps = todayForecasts.map(item => item.main.temp);
            weatherData.main.temp_max = Math.round(Math.max(...temps));
            weatherData.main.temp_min = Math.round(Math.min(...temps));
        } else {
            // 如果找不到今天的预报，使用当前温度
            weatherData.main.temp_max = weatherData.main.temp;
            weatherData.main.temp_min = weatherData.main.temp;
        }
    }

    // 处理预报数据
    if (forecastData && forecastData.list) {
        // 按天分组预报数据
        const dailyForecasts = {};
        
        forecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000).setHours(0, 0, 0, 0);
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temps: [],
                    weather: forecast.weather[0]
                };
            }
            dailyForecasts[date].temps.push(forecast.main.temp);
        });

        // 更新每天的最高温和最低温
        forecastData.list = Object.entries(dailyForecasts).map(([date, data]) => ({
            dt: parseInt(date) / 1000,
            main: {
                temp_max: Math.round(Math.max(...data.temps)),
                temp_min: Math.round(Math.min(...data.temps))
            },
            weather: [data.weather]
        }));
    }

    return { weatherData, forecastData };
}

exports.main = async (event, context) => {
    const { lat, lon, OPENWEATHER_API_KEY } = event;

    const getData = (url) => {
        return new Promise((resolve, reject) => {
            https.get(url, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject('数据解析失败');
                    }
                });
            }).on('error', (e) => {
                reject(`请求错误: ${e.message}`);
            });
        });
    };

    // 构建 API 请求的 URL
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`;
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_cn`;

    try {
        // 请求数据
        const weatherData = await getData(weatherUrl);
        const airData = await getData(airUrl);
        const forecastData = await getData(forecastUrl);

        // 处理温度数据
        const processedData = processTemperatureData(weatherData, forecastData);

        // 返回处理后的数据
        return {
            weatherData: processedData.weatherData,
            airData,
            forecastData: processedData.forecastData
        };

    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            error: '获取天气数据失败'
        };
    }
};
