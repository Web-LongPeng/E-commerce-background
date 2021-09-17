<template>
  <div>

    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>欢迎页</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 数据统计展示 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <div class='statistics'
             style="background:#409eff">
          <div class="title">
            <p>用户统计</p>
            <el-tag size='mini'
                    type="success">实时</el-tag>
          </div>
          <div class="num">{{userTotal}}</div>
          <div class="tip">当前总用户数量</div>

        </div>
      </el-col>

      <el-col :span="6">
        <div class='statistics'
             style="background:#E6A23C">
          <div class="title">
            <p>商品统计</p>
            <el-tag size='mini'
                    type="warning">实时</el-tag>
          </div>
          <div class="num">{{goodsTotal}}</div>
          <div class="tip">当前总商品数量</div>

        </div>
      </el-col>

      <el-col :span="6">
        <div class='statistics'
             style="background:#67C23A">
          <div class="title">
            <p>订单统计</p>
            <el-tag size='mini'
                    type="danger">实时</el-tag>
          </div>
          <div class="num">{{orderTotal}}</div>
          <div class="tip">当前总订单数量</div>

        </div>
      </el-col>

      <el-col :span="6">
        <div class='statistics'
             style="background:#909399">
          <div class="title">
            <p>销售统计</p>
            <el-tag size='mini'
                    type="info">实时</el-tag>
          </div>
          <div class="num">{{salesVolumeTotal}}</div>
          <div class="tip">当前总销售额(元)</div>

        </div>
      </el-col>
    </el-row>

    <!-- 展示图表 -->
    <div id="echarts-container">
      <el-card id="chart1"></el-card>
      <el-card id="chart2"></el-card>
    </div>
  </div>

</template>

<script>
// 引入全部echats
import * as echarts from 'echarts';
export default {
  data () {
    return {
      // 用户总数
      userTotal: 0,
      // 商品总数
      goodsTotal: 0,
      // 订单总数
      orderTotal: 0,
      // 总销售额统计
      salesVolumeTotal: 0,
      // 存储订单信息
      orderInfoList: [],

    }
  },
  created () {
    this.getUserList()
    this.getGoodsList()
    this.getOrderList()
  },
  methods: {
    //获取用户数据
    async getUserList () {
      const { data } = await this.$http.get("users", {
        params: {
          pagenum: 1,
          pagesize: 1
        },
      });

      console.log("----用户列表信息----");
      console.log(data);
      if (data.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "获取用户列表数据错误！",
          duration: 2000,
        });
      }
      this.userTotal = data.data.total;
    },
    // 获取商品统计数据
    async getGoodsList () {
      const { data } = await this.$http.get("goods", {
        params: {
          pagenum: 1,
          pagesize: 1
        },
      });

      if (data.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: data.meta.msg,
        });
      }

      console.log("得到的全部商品信息：", data.data);
      this.goodsTotal = data.data.total;
    },
    // 获取订单统计数据
    async getOrderList () {
      const { data } = await this.$http.get('orders')
      console.log('得到全部订单列表信息：', data)
      if (data.meta.status !== 200) {
        this.$message({
          type: 'error',
          message: data.meta.msg,
        })
      }
      data.data.goods.forEach(item => {
        if (item.pay_status === '1') {
          this.salesVolumeTotal += item.order_price
        }

      })
      this.orderTotal = data.data.total

      this.orderInfoList = data.data.goods
      console.log("获取的订单信息：", this.orderInfoList)

      this.initChart1()
      this.initChart2()
    },

    // 实例化图表
    initChart1 () {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('chart1'));
      // 绘制图表
      // 订单趋势
      var option = {
        title: {
          text: '订单趋势',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
          },
        },
        xAxis: {
          type: 'category',
          data: [], // ['03.20', '03.21'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'line',
            smooth: true,
            data: [], // [260, 406]
          },
        ],
      }

      let newOption = []
      // 对数据进行升序，用于图表的升序
      this.orderInfoList.sort((a, b) => {
        return a.create_time - b.create_time
      })
      // 对数据进行处理（时间转换 仅需要支付的订单 相加同一天的订单额）
      for (let item of this.orderInfoList) {
        item.create_time = this.$moment(item.create_time * 1000).format(
          "YYYY-MM-DD"
        );
        // 如果是已经支付的状态
        if (item.pay_status === '1') {

          // 定义新的数组，把时间作为索引，如果该数组已经存在相同时间的索引，则把该索引的值累加；没有则设置
          if (newOption[item.create_time]) {
            newOption[item.create_time] += item.order_price

          }
          else {
            newOption[item.create_time] = item.order_price

          }
        }

      }
      // 将数据添加到option中
      for (let key in newOption) {
        option.xAxis.data.push(key)
        option.series[0].data.push(newOption[key])
      }
      console.log("获取的订单信息(处理后)：", this.orderInfoList)
      console.log("当天总额数组：", newOption)
      myChart.setOption(option)
    },
    initChart2 () {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('chart2'));
      // 订单状态
      var option = {
        title: {
          text: '订单状态',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'right',
          data: [],
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            // data: [
            //     {value: 335, name: '直接访问'},
            //     {value: 310, name: '邮件营销'},
            //     {value: 234, name: '联盟广告'},
            //     {value: 135, name: '视频广告'},
            //     {value: 1548, name: '搜索引擎'}
            // ],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }

      // 处理数据
      var newOption = [
        {
          name: '已付款',
          value: 0
        },
        {
          name: '未付款',
          value: 0
        },
      ]
      // 循环订单信息，把付款和未付款信息存入创建的数组中。(未)付款状态，value++
      this.orderInfoList.forEach(item => {
        if (item.pay_status === '1') {
          newOption[0].value++
        } else {
          newOption[1].value++
        }
      })

      // 把信息放到option中
      for(let item of newOption){
        option.legend.data.push(item.name)
        option.series[0].data.push(item)
      }


      myChart.setOption(option)
    }
  },

};
</script>

<style lang='less' scoped>
.el-row {
  padding: 0 9px;
  .statistics {
    color: #fff;
    height: 100px;
    border-radius: 4px;
    padding: 0 8px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      p {
        font-size: 13px;
        font-weight: bold;
      }
    }
    .num {
      font-size: 20px;
      text-align: center;
      font-weight: bold;
    }
    .tip {
      font-size: 12px;
    }
  }
}
#echarts-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  .el-card {
    height: 400px;
    width: 50%;
    margin: 0 8px;
    padding: 20px;
  }
}
</style>