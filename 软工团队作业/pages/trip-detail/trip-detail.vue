<template>
  <view class="container">
    <view class="map-section">
      <web-view 
        class="map-container"
        id="map-webview"
        :webview-styles="{ progress: true }"
        :src="mapUrl"
        @message="handleMessage"
      ></web-view>
    </view>

    <cover-view class="schedule-container">
      <cover-view class="day-tabs">
        <cover-view class="day-text">第</cover-view>
        <cover-view
          v-for="day in totalDays"
          :key="day"
          :class="['day-tab', currentDay === day ? 'active' : '']"
          @tap="switchDay(day)"
        >
          {{ day }}
        </cover-view>
        <cover-view class="day-text">天</cover-view>
      </cover-view>

      <cover-view class="schedule-list">
        <cover-view
          class="schedule-item"
          v-for="(item, index) in currentSchedule"
          :key="index"
        >
          <cover-view class="time">{{ item.time }}</cover-view>
          <cover-view class="schedule-content">
            <cover-view class="spot-name">{{ item.spot }}</cover-view>
            <cover-view class="transport" v-if="item.transport">
              <cover-image
                src="/static/taxi.png"
                class="transport-icon"
              ></cover-image>
              <cover-view class="transport-text">{{
                item.transport
              }}</cover-view>
            </cover-view>
          </cover-view>
        </cover-view>
      </cover-view>
    </cover-view>

    <view v-if="htmlContent" class="html-content">
      <cover-view v-html="htmlContent"></cover-view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";

declare const uni: any;
declare const getCurrentPages: any;
declare const plus: any;

interface ScheduleItem {
  time: string;
  spot: string;
  transport?: string;
  latitude?: number;
  longitude?: number;
}

interface RouteItem {
  title: string;
  spots: any[];
  budget: string;
}

export default defineComponent({
  setup() {
    const trip = ref<RouteItem | null>(null);
    const currentDay = ref(1);
    const totalDays = ref(1);
    const scheduleData = ref<ScheduleItem[][]>([]);
    const mapUrl = ref("/static/map.html");
    const formData = ref<any>({});
    const htmlContent = ref<string>("");

    const currentSchedule = computed(() => {
      return scheduleData.value[currentDay.value - 1] || [];
    });

    const switchDay = (day: number) => {
      currentDay.value = day;

      const data = {
        scheduleData: scheduleData.value.map(daySchedule => 
          daySchedule.map(item => ({
            time: item.time,
            spot: item.spot,
            transport: item.transport,
            latitude: item.latitude,
            longitude: item.longitude
          }))
        ),
        currentDay: currentDay.value
      };

      const safeData = JSON.parse(JSON.stringify(data));

      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      const currentWebview = page.$getAppWebview();

      const webviewId = currentWebview.children()[0];

      if (webviewId) {
        webviewId.setStyle({
          width: '100%',
          height: '35vh'
        });
        webviewId.evalJS(`
          initMap(${JSON.stringify(safeData.scheduleData)}, ${safeData.currentDay});
        `);
        console.log('发送数据到地图:', safeData);
      }
    };

    const showDetail = () => {
      uni.navigateTo({
        url: "/pages/detailed-plan/detailed-plan",
      });
    };

    const handleMessage = (event: any) => {
      console.log("收到web-view消息:", event.detail);
    };

    const fetchTripDetail = async (title: string) => {
      const userInfo = uni.getStorageSync("userInfo");
      console.log("获取的 userInfo:", userInfo);
      console.log("传递的 title:", title);

      if (!userInfo) {
        uni.showToast({
          title: "用户未登录",
          icon: "none",
        });
        return;
      }

      try {
        const res = await uniCloud.callFunction({
          name: "getMyTrips",
          data: {
            userInfo: userInfo,
            title: title,
          },
        });

        console.log("云函数响应:", res);

        if (res.result && res.result.success && res.result.data.length > 0) {
          const tripData = res.result.data[0];
          trip.value = tripData.scheduleData;
          
          scheduleData.value = tripData.scheduleData;
          totalDays.value = scheduleData.value.length;
          
          switchDay(1);
          
          console.log("设置的行程数据:", scheduleData.value);
        } else {
          uni.showToast({
            title: "获取行程详情失败",
            icon: "none",
          });
        }

        if (res.result && res.result.data && res.result.data.htmlContent) {
          htmlContent.value = res.result.data.htmlContent;
        }

      } catch (err) {
        console.error("获取行程详情失败:", err);
        uni.showToast({
          title: "请求失败，请稍后再试",
          icon: "none",
        });
      }
    };

    const formatDate = (date: string) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("zh-CN", options);
    };

    const formatSpots = (spots: any[]) => {
      return spots.map((spot: any) => spot.name).join(" -> ");
    };

    onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      
      const query = currentPage.$page?.options || currentPage.options || {};
      const title = query.id;
      
      console.log("当前页面:", currentPage);
      console.log("获取到的title参数:", title);
      
      if (title) {
        fetchTripDetail(decodeURIComponent(title));
      } else {
        console.error("未找到 title 参数");
        uni.showToast({
          title: "行程信息错误",
          icon: "none",
        });
      }
    });

    return {
      mapUrl,
      currentDay,
      totalDays,
      currentSchedule,
      switchDay,
      handleMessage,
      showDetail,
      trip,
      formatDate,
      formatSpots,
      htmlContent,
    };
  },
});
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-section {
  flex: none;
  height: 50vh;
  max-height: 50vh;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100% !important;
}

.schedule-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 55vh;
  margin-top: -50px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  z-index: 999;
}

.day-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin: 0 0 10px 0;
  height: 50px;
}

.day-text {
  font-size: 16px;
  color: #333;
  margin: 0 5px;
  line-height: 30px;
}

.day-tab {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 0 5px;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.day-tab.active {
  background: #007aff;
  color: #fff;
}

.schedule-list {
  flex: 1;
  overflow-y: scroll;
  padding-right: 10px;
  margin-bottom: 10px;
  max-height: calc(100% - 120px);
}

.schedule-item {
  display: flex;
  margin-bottom: 20px;
}

.time {
  width: 60px;
  color: #666;
  font-size: 14px;
}

.schedule-content {
  flex: 1;
  padding-left: 15px;
  border-left: 1px solid #eee;
}

.spot-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.transport {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 12px;
}

.transport-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
}

.html-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
