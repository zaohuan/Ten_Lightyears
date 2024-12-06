<!-- PTR-FR-002 -->
<template>
  <view class="container">
    <!-- 天气预报部分 -->
    <view class="weather-forecast" v-if="weatherData">
      <view class="section-title">未来天气预报</view>
      <view class="forecast-list">
        <view class="forecast-item" v-for="(item, index) in weatherData.forecast" :key="index">
          <text class="date">{{item.date}}</text>
          <view class="forecast-weather">
            <text class="day-weather">{{item.dayWeather}}</text>
            <image 
              :src="getWeatherIcon(item.dayWeather)" 
              class="forecast-weather-icon"
              mode="aspectFit"
            ></image>
          </view>
          <text class="temp-range">{{item.tempMin}}° / {{item.tempMax}}°</text>
        </view>
      </view>
    </view>

    <!-- 天气提示部分 -->
    <view class="weather-tips" v-if="weatherData">
      <view class="section-title">出行建议</view>
      <view class="tips-content">
        <text>{{ weatherTips }}</text>
      </view>
    </view>
  </view>
</template>


<script>
export default {
  data() {
    return {
      weatherData: null,
      badWeatherTypes: ['小雨', '大雨', '雷雨', '降雪', '雾', '霾']
    }
  },

  computed: {
    weatherTips() {
      if (!this.weatherData || !this.weatherData.forecast) return '';

      const badWeatherDays = this.weatherData.forecast.filter(day => 
        this.badWeatherTypes.some(type => day.dayWeather.includes(type))
      );

      if (badWeatherDays.length === 0) {
        return '未来几天天气晴好，适合户外活动，建议准备防晒用品，多补充水分。';
      }

      let tips = '注意：\n';
      badWeatherDays.forEach(day => {
        tips += `${day.date}将出现${day.dayWeather}，`;
        
        if (day.dayWeather.includes('雨')) {
          tips += '建议携带雨具，选择室内景点。\n';
        } else if (day.dayWeather.includes('雪')) {
          tips += '注意保暖，道路可能湿滑。\n';
        } else if (day.dayWeather.includes('雷')) {
          tips += '注意雷电，选择室内活动。\n';
        }else if (day.dayWeather.includes('雾')) {
          tips += '出现记得戴口罩，建议尽量选择室内活动。\n';
        }else if (day.dayWeather.includes('霾')) {
          tips += '出现记得戴口罩，建议尽量选择室内活动。\n';
        }
      });

      return tips;
    }
  },

  methods: {
    getWeatherIcon(weather) {
      const iconMap = {
        '晴天': '/static/sunny.png',
        '多云': '/static/cloudy.png',
        '小雨': '/static/light-rain.png',
        '大雨': '/static/heavy-rain.png',
        '雷雨': '/static/thunder.png',
        '降雪': '/static/snow.png'
      }
      return iconMap[weather] || '/static/sunny.png'
    },

    loadCachedWeatherData() {
      try {
        const cachedData = uni.getStorageSync('cached_weather_data');
        if (cachedData && cachedData.data) {
          const now = new Date().getTime();
          if (now - cachedData.timestamp < 1 * 60 * 1000) { // 1分钟缓存
            this.weatherData = cachedData.data;
            return true;
          }
        }
        return false;
      } catch (e) {
        console.error('读取缓存天气数据失败:', e);
        return false;
      }
    }
  },

  onLoad() {
    // 尝试加载缓存的天气数据
    if (!this.loadCachedWeatherData()) {
      // 如果没有缓存数据，跳转回天气页面
      uni.showToast({
        title: '有更新，请先查看天气信息',
        icon: 'none',
        duration: 1000,
        success: () => {
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        }
      });
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 20rpx 0;
  color: #333;
}

.weather-forecast {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.forecast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #eee;
}

.forecast-weather {
  display: flex;
  align-items: center;
}

.forecast-weather-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}

.weather-tips {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.tips-content {
  padding: 15rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  line-height: 1.6;
  color: #666;
}
</style> 
