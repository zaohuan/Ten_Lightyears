<template>
  <view class="container">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="section-title">基本信息</view>
    <view class="info-group">
      <view class="info-item" @click="handleNickname">
        <text class="label">昵称</text>
        <view class="value">
          <text>{{ userInfo.nickname || '用户1022' }}</text>
          <text class="arrow">></text>
        </view>
      </view>
      
      <view class="info-item" @click="handlePhone">
        <text class="label">手机号</text>
        <view class="value">
          <text>{{ userInfo.phone || '10086' }}</text>
          <text class="arrow">></text>
        </view>
      </view>
      
      <view class="info-item" @click="handleSignature">
        <text class="label">个性签名</text>
        <view class="value">
          <text>{{ userInfo.signature || '少时诗诗书' }}</text>
          <text class="arrow">></text>
        </view>
      </view>
      
      <view class="info-item" @click="handlePassword">
        <text class="label">登录密码</text>
        <view class="value">
          <text>********</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="section-title">其他</view>
    <view class="info-group">
      <view class="info-item" @click="handleClearCache">
        <text class="label">清理内存</text>
        <view class="value">
          <text>18.00MB</text>
          <text class="arrow">></text>
        </view>
      </view>
      
      <view class="info-item">
        <text class="label">版本更新</text>
        <view class="value">
          <text>1.0.0</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const userInfo = ref({
      nickname: '',
      phone: '',
      signature: '',
    });

    const handleNickname = () => {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            userInfo.value.nickname = res.content;
          }
        }
      });
    };

    const handlePhone = () => {
      uni.showToast({
        title: '暂不支持修改手机号',
        icon: 'none'
      });
    };

    const handleSignature = () => {
      uni.showModal({
        title: '修改个性签名',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            userInfo.value.signature = res.content;
          }
        }
      });
    };

    const handlePassword = () => {
      uni.showToast({
        title: '暂不支持修改密码',
        icon: 'none'
      });
    };

    const handleClearCache = () => {
      uni.showLoading({ title: '清理中...' });
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '清理完成',
          icon: 'success'
        });
      }, 1500);
    };

    const handleLogout = () => {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  // 这里可以添加退出登录的逻辑
                  uni.reLaunch({
                    url: '/pages/index/index'
                  });
                }, 1500);
              }
            });
          }
        }
      });
    };

    return {
      userInfo,
      handleNickname,
      handlePhone,
      handleSignature,
      handlePassword,
      handleClearCache,
      handleLogout
    };
  }
});
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.avatar-section {
  background-color: #007AFF;
  height: 200rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid #fff;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 30rpx;
}

.info-group {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #333;
  font-size: 28rpx;
}

.value {
  color: #666;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.arrow {
  margin-left: 10rpx;
  color: #999;
}

.logout-btn {
  margin: 40rpx 30rpx;
  background-color: #fff;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff3b30;
  font-size: 32rpx;
}
</style>