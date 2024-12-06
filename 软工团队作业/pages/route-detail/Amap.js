import AMapLoader from '@amap/amap-jsapi-loader';

export default {
  methods: {
    initMap(containerId, scheduleData, currentDay) {
		AMapLoader.reset()
		window._AMapSecurityConfig = {
		    securityJsCode: "5ee8a6eb6e5eb6313947acf3e6ae18eb",
		  };
      AMapLoader.load({
        key: 'fc3c6e846fefdab859fd1ebf42729dac', // 替换为你的高德地图 API Key
        version: '2.0',
        plugins: ['AMap.Driving']
      }).then((AMap) => {
        const map = new AMap.Map(containerId, {
          zoom: 10,
          center: [119.2978, 26.0829]
        });

        const updateMapRoute = (day) => {
          const daySchedule = scheduleData[day - 1];
          if (!daySchedule || daySchedule.length < 2)
		  {
			  console.log('updateMapRoute failed');
			  return ;
		  }
		  console.log('updateMapRoute begin');
          const origin = new AMap.LngLat(daySchedule[0].longitude, daySchedule[0].latitude);
          const destination = new AMap.LngLat(daySchedule[daySchedule.length - 1].longitude, daySchedule[daySchedule.length - 1].latitude);
          const waypoints = daySchedule.slice(1, -1).map(item => new AMap.LngLat(item.longitude, item.latitude));

			console.log('origin:', origin)
			console.log('desination:', destination)
			console.log('waypoints:', waypoints)
			
          AMap.plugin("AMap.Driving", function () {
            const driving = new AMap.Driving({
              map: map,
              policy: 0, // 驾车路线规划策略，0是速度优先的策略
              //panel: "panel"
            });

            driving.search(
              origin, destination, waypoints,
              (status, result) => {
				  console.log('driving search status:', status);
                if (status === 'complete') {
					console.log('获取路线成功');
                  const path = result.routes[0].steps.flatMap(step => step.path);
                  const polyline = new AMap.Polyline({
                    path,
                    strokeColor: "#3366FF",
                    strokeWeight: 5,
                  });
                  map.add(polyline);
                } else {
                  console.error('获取驾车数据失败：' + result);
                }
              }
            );
          });
        };

        updateMapRoute(currentDay);
      }).catch(e => {
        console.error(e);
      });
    }
  }
};