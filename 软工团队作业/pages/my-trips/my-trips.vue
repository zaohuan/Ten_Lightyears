<template>
  <view class="my-trips">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-icon" @click="goBack">
        <image src="/static/icons/back.png" mode="widthFix"></image>
      </view>
      <text class="title">我的行程</text>
    </view>

    <!-- 行程列表 -->
    <view class="trip-list">
      <view
        class="trip-item"
        v-for="(trip, index) in tripList"
        :key="index"
        @click="goToTripDetail(trip)"
      >
        <view class="trip-header">
          <text class="city">{{ trip.routeData?.title }}</text>
          <text class="day">{{ formatDate(trip.created_at) }}</text>
        </view>
        <view class="trip-route" v-if="trip.routeData?.spots">
          <text>路线: {{ formatSpots(trip.routeData.spots) }}</text>
        </view>
        <view class="trip-budget" v-if="trip.routeData?.budget">
          <text>预算：{{ trip.routeData.budget }}元/人</text>
        </view>
        <view class="trip-actions">
          <!-- 删除实时调整按钮，只保留删除按钮 -->
          <view class="action-btn delete" @click.stop="deleteTrip(trip, index)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tripList: [],
    };
  },
  methods: {
    goBack() {
      uni.switchTab({
        url: "/pages/shouye/shouye",
      });
    },
    goToTripDetail(trip) {
      if (trip && trip.routeData && trip.routeData.title) {
        const encodedTitle = encodeURIComponent(trip.routeData.title);
        uni.navigateTo({
          url: `/pages/trip-detail/trip-detail?id=${encodedTitle}`,
          success: (res) => {
            console.log("页面跳转成功", res);
          },
          fail: (err) => {
            console.error("页面跳转失败", err);
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        uni.showToast({
          title: '行程信息不完整',
          icon: 'none'
        });
      }
    },
    // 删除行程
    async deleteTrip(trip, index) {
      const userInfo = uni.getStorageSync("userInfo");
      if (!userInfo) {
        uni.showToast({
          title: "用户未登录",
          icon: "none",
        });
        return;
      }

      const title = trip.routeData?.title;  // 获取行程的标题

      if (!title) {
        uni.showToast({
          title: "行程标题不完整",
          icon: "none",
        });
        return;
      }

      try {
        const res = await uniCloud.callFunction({
          name: "deleteMyTrip",  // 云函数名称
          data: {
            userInfo: userInfo,
            title: title,  // 传递标题
          },
        });

        if (res.result && res.result.success) {
          // 如果删除成功，从 tripList 中移除该行程
          this.tripList.splice(index, 1);
          uni.showToast({
            title: "行程已删除",
            icon: "success"
          });
        } else {
          uni.showToast({
            title: res.result.message || "删除失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("删除行程失败:", error);
        uni.showToast({
          title: "请求失败，请稍后再试",
          icon: "none",
        });
      }
    },

    fetchData() {
      const userInfo = uni.getStorageSync("userInfo");
      if (!userInfo) {
        uni.showToast({
          title: "用户未登录",
          icon: "none",
        });
        return;
      }

      uniCloud.callFunction({
        name: "getMyRoutes",
        data: {
          userInfo: userInfo,
        },
        success: (res) => {
          if (res.result && res.result.success) {
            this.tripList = res.result.data;
            console.log("行程列表:", JSON.stringify(this.tripList, null, 2)); // 输出获取到的数据到终端
          } else {
            uni.showToast({
              title: "获取行程失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("获取行程失败:", err);
          uni.showToast({
            title: "请求失败，请稍后再试",
            icon: "none",
          });
        },
      });
    },
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("zh-CN", options);
    },
    formatSpots(spots) {
      return spots.map((spot) => spot.name).join(" -> ");
    },
  },
  onLoad() {
    this.fetchData();
  },
};
</script>

<style lang="scss" scoped>
.my-trips {
  min-height: 100vh;
  background-color: #f5f5f5;

  .header {
    background-color: #1890ff;
    padding: 40rpx 20rpx;
    display: flex;
    align-items: center;
    color: #fff;

    .back-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 20rpx;

      image {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      font-size: 32rpx;
      font-weight: 500;
    }
  }

  .trip-list {
    padding: 20rpx;

    .trip-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-5px);
      }

      .trip-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;

        .city {
          font-size: 32rpx;
          color: red; /* 设置大标题为红色 */
          font-weight: 500;
        }

        .day {
          font-size: 28rpx;
          color: #666;
        }
      }

      .trip-route {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
      }

      .trip-budget {
        font-size: 26rpx;
        color: #666;
      }

      .trip-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20rpx;
        gap: 20rpx;

        .action-btn {
          padding: 10rpx 30rpx;
          border-radius: 30rpx;
          font-size: 27rpx;
          cursor: pointer;

          &.real-time {
            background-color: #1890ff;
            color: #fff;
          }

          &.delete {
            background-color: #ff4d4f;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>
