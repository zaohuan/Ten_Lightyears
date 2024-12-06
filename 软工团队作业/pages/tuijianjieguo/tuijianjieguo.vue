<!-- PTR-FR-002 -->
<template>
  <view class="container">
    <!-- 加载动画 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <view class="loading-text">正在努力为您生成个性化推荐，请耐心等待哦</view>
        <view class="loading-progress-bar">
          <view class="progress-inner" :style="{ width: progressWidth + '%' }"></view>
        </view>
      </view>
    </view>

    <!-- 推荐路线列表 -->
    <view class="route-list" v-else>
      <view class="route-card" 
            v-for="(route, index) in recommendRoutes" 
            :key="index"
            @click="navigateToDetail(route)">
        <view class="route-title">{{ route.title }}</view>
        <view class="route-path">
          <template v-for="(spot, spotIndex) in route.spots" :key="spotIndex">
            <text>{{ spot.name }}</text>
            <text v-if="spotIndex !== route.spots.length - 1"> → </text>
          </template>
        </view>
        <view class="route-budget">预算：{{ route.budget }}元/人</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

// 统一的数据接口
interface SpotItem {
  name: string
  isAdjusted?: boolean  // 可选,用于标记调整后的景点
}

interface RouteItem {
  title: string        // 路线标题
  spots: SpotItem[]    // 景点数组
  budget: string      // 可选,用于推荐结果页显示预算
}

export default defineComponent({
  setup() {
    const isLoading = ref(true)
    const progressWidth = ref(0)
    let progressTimer: any = null

    // 模拟进度增加
    const startProgress = () => {
      progressWidth.value = 0
      progressTimer = setInterval(() => {
        if (progressWidth.value < 90) {
          progressWidth.value += Math.random() * 15
        }
      }, 500)
    }

    // 完成加载
    const completeProgress = () => {
      progressWidth.value = 100
      setTimeout(() => {
        clearInterval(progressTimer)
        isLoading.value = false
      }, 500)
    }

    // 初始化为空数组，实际数据会在 generateRecommendations 中设置
    const recommendRoutes = ref<RouteItem[]>([])

    const navigateToDetail = (route: RouteItem) => {
      // 获取当前页面栈
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2]; // 获取上一个页面
      const formData = prevPage.$vm.formData; // 获取表单数据
      
      uni.navigateTo({
        url: '/pages/route-detail/route-detail',
        success: (res) => {
          // 同时传递路线数据和表单数据
          res.eventChannel.emit('acceptRouteData', {
            routeData: route,
            formData: formData
          });
        }
      });
    }

    // 获取推荐路线
    const generateRecommendations = (formData: any) => {
      isLoading.value = true
      startProgress()
      
      uniCloud.callFunction({
        name: 'getAccessToken',
        success: (tokenRes) => {
          const accessToken = tokenRes.result.data.access_token;
          if (!accessToken) {
            uni.showToast({
              title: '获取AccessToken失败',
              icon: 'none'
            });
            return;
          }
    
          // 调用 getTuiJianJieGuo 云函数生成推荐路线
          uniCloud.callFunction({
            name: 'getTuiJianJieGuo',
            data: {
              accessToken: accessToken,
              formData: formData,  // 传递用户的表单数据
              modelurl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro'  // 替换为实际的API URL
            },
            success: (res) => {
              if (res.result) {
                console.log('云函数返回结果:', res.result);
                recommendRoutes.value = res.result.data.routes || [];
                completeProgress()
              } else {
                console.error('云函数返回数据异常:', res);
                completeProgress()
                uni.showToast({
                  title: '未能获取有效的推荐数据',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('调用云函数失败, 错误详情:', err);
              console.error('错误堆栈:', err.stack);
              completeProgress()
              uni.showToast({
                title: '请求失败，请稍后再试',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          completeProgress()
          uni.showToast({
            title: '获取AccessToken失败',
            icon: 'none'
          });
        }
      })
    }

    onMounted(() => {
      // 获取当前页面栈
      const pages = getCurrentPages()
	  
      // 获取当前页面对象
      const currentPage = pages[pages.length - 1]

      // 获取事件通道
      const eventChannel = currentPage.getOpenerEventChannel()
      
      // 监听acceptFormData事件
      eventChannel.on('acceptFormData', (data) => {
        console.log('接收到的表单数据：', JSON.stringify(data))
        generateRecommendations(data)
      })
    })

    return {
      isLoading,
      progressWidth,
      recommendRoutes,
      navigateToDetail
    }
  }
})
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
}

.route-title {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.route-path {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.route-budget {
  font-size: 14px;
  color: #666;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-content {
  width: 80%;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.loading-progress-bar {
  width: 100%;
  height: 4px;
  background-color: #f3f3f3;
  border-radius: 2px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: #ff6b6b;
  transition: width 0.3s ease-in-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
