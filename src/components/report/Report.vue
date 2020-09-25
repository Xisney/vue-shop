<template>
  <div>
    <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id="main" style="width: 750px; height: 500px"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import request from "network/request.js";
import _ from "lodash"

export default {
  data() {
    return {
      options: {
        title: {
          text: "用户来源",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3",
            },
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
      },
    };
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById("main"));
    //获取数据
    request({
      url: "reports/type/1",
    }).then(res => {
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      _.merge(res.data,this.options)
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(res.data);
    });
  },
};
</script>
 
<style lang="less" scoped>
</style>