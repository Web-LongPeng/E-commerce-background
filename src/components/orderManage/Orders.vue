<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索和添加 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    @clear="getOrderList"
                    clearable>
            <template #append>
              <el-button icon="el-icon-search"
                         @click="getOrderList"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单数据 -->
      <el-table :data="orderList"
                @expand-change="getOrderDetail"
                border
                stripe>
        <el-table-column type="expand"
                         label="明细">
          <template slot-scope="scope">
            <el-table :data="scope.row.detail"
                      border
                      stripe>
              <el-table-column label="封面"
                               width="100px"
                               header-align="center"
                               align="center">
                <template slot-scope="scopes">
                  <el-popover placement="top-start"
                              width="200"
                              trigger="hover">
                    <img :src="scopes.row.url"
                         width="150px"
                         height="150px">
                    <img :src="scopes.row.url"
                         width="50px"
                         height="50px"
                         slot="reference">
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column label="商品名称"
                               prop="goods_name"></el-table-column>
              <el-table-column label="商品重量"
                               prop="goods_weight"
                               width="100px"></el-table-column>
              <el-table-column label="商品数量"
                               prop="goods_number"
                               width="100px"></el-table-column>
              <el-table-column label="商品价格（元）"
                               prop="goods_price"
                               width="100px"></el-table-column>
              <el-table-column label="总价（元）"
                               prop="goods_total_price"
                               width="100px"></el-table-column>
            </el-table>
          </template>

        </el-table-column>
        <el-table-column type="index"
                         label="序号"></el-table-column>
        <el-table-column prop="order_number"
                         label="订单编号"></el-table-column>
        <el-table-column prop="order_price"
                         label="订单价格（元）"></el-table-column>
        <el-table-column label="是否付款">

          <template slot-scope="scope">
            <el-tag type="success"
                    size="mini"
                    effect="dark"
                    v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger"
                    size="mini"
                    effect="dark"
                    v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send"
                         label="是否发货"></el-table-column>
        <el-table-column prop="create_time"
                         label="下单时间"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark"
                        content="修改收货地址"
                        placement="top"
                        :enterable="false">
              <el-button size="mini"
                         type="primary"
                         icon="el-icon-edit"
                         @click="editAddress(scope.row.order_id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark"
                        content="查看物流信息"
                        placement="top"
                        :enterable="false">
              <el-button size="mini"
                         type="warning "
                         icon="el-icon-setting"
                         @click="showProcessInfo"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20,50,100]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改收货地址对话框 -->
    <el-dialog title="修改收获地址"
               :visible.sync="editDialogVisible"
               width="50%"
               @close="editClose">

      <el-form :model="editAddressForm"
               :rules="editAddressRules"
               ref="editAddressForm"
               label-width="100px"
               status-icon>
        <el-form-item label="省市区/县"
                      prop="address1">
          <el-cascader :options="cityData"
                       :props="cascadeProps"
                       v-model="editAddressForm.address1"
                       clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址"
                      prop="address2">
          <el-input v-model="editAddressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="uniqueEditAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 查看物流信息对话框 -->
    <el-dialog title="修改收获地址"
               :visible.sync="processDialogVisible"
               width="50%"
               @close="processDialogVisible=false">

      <el-timeline :reverse="false">
        <el-timeline-item v-for="(activity, index) in processInfo"
                          :key="index"
                          :icon='activity.icon'
                          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

  </div>
</template>

<script>
import cityData from './citydata';
export default {
  data () {
    return {
      // 修改地址对话框的显示与隐藏
      editDialogVisible: false,
      // 物流信息对话框的显示与隐藏
      processDialogVisible: false,
      // 地址表单数据
      editAddressForm: {
        address1: [],
        address2: ''
      },
      // 地址表单校验规则
      editAddressRules: {
        address1: [
          {
            required: true,
            message: "请选择地址",
            trigger: "blur",
          },
        ],
        address2: [
          {
            required: true,
            message: "请选择地址",
            trigger: "blur",
          },]
      },
      // 查询信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 查询订单信息总数
      total: 0,
      // 存储订单信息
      orderList: [],
      // 根据id获取的订单明细数据信息
      orderDetailList: [],
      // 城市数据
      cityData: cityData,
      // 存储级联的表单配置对象
      cascadeProps: {
        label: "label",
        value: "value",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: false,
      },
      // 编辑收获地址操作的订单id
      aOrderId: '',
      // 存储物流信息
      processInfo:[]
    };
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data } = await this.$http.get('orders', { params: this.queryInfo })
      console.log('得到全部订单列表信息：', data)
      if (data.meta.status !== 200) {
        this.$message({
          type: 'error',
          message: data.meta.msg,
        })

      }
      // 对后台传回来的日期进行处理，后台返回数据是以秒为单位
      for (let item of data.data.goods) {
        item.create_time = this.$moment(item.create_time * 1000).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        // 给每个对象添加一个detail属性，方便后面用于明细功能
        item.detail = [];
      }
      this.total = data.data.total
      // 判断订单信息是否查询到了
      if (this.total === 0) {
        this.$message({
          type: 'error',
          message: '暂无查询的订单信息，请核对后继续查询',
          duration: 2000
        })
      }
      this.orderList = data.data.goods
    },
    // 分页条目选择的改变
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getOrderList();
    },
    // 分页当前页的改变
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrderList();
    },
    // 明细事件的监听
    async getOrderDetail (row) {
      const { data } = await this.$http.get(`orders/${row.order_id}`)
      console.log('根据订单id获取的明细信息：', data)
      if (data.meta.status !== 200) {
        this.$message({
          type: 'error',
          message: data.meta.msg,
        })
      }

      row.detail = data.data.goods

      // 获取商品更加详细的数据信息
      row.detail.forEach(async item => {
        const { data } = await this.$http.get(`goods/${item.goods_id}`)
        if (data.meta.status !== 200) {
          this.$message({
            type: 'error',
            message: data.meta.msg,
          })
        }
        // 正常返回,补全信息
        this.$set(item, 'goods_name', data.data.goods_name)   //响应式的添加相对应的信息
        this.$set(item, 'goods_weight', data.data.goods_weight)
        this.$set(item, 'url', data.data.pics[0].pics_big_url)

      })
      console.log("完整的信息：", row.detail)


    },
    // 修改收获地址事件
    editAddress (id) {
      this.editDialogVisible = true
      this.aOrderId = id
    },
    // 收获地址对话框关闭事件的监听
    editClose () {
      this.$refs.editAddressForm.resetFields()
      this.editDialogVisible = false
    },
    // 修改收货地址的确认按钮被点击事件
    uniqueEditAddress () {
      console.log(this.editAddressForm.address1.join(',') + "," + this.editAddressForm.address2)
      this.$refs.editAddressForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写对应的表单信息')
        }

        const { data } = await this.$http.put(`orders/${this.aOrderId}/address`, {
          consignee_addr: this.editAddressForm.address1.join(',') + "," + this.editAddressForm.address2
        })
        console.log('修改地址返回的数据：', data)
        if (data.meta.status !== 200) {
          this.$message({
            type: 'error',
            message: data.meta.msg,
          })

        }
        this.getOrderList()  //重新刷新订单列表
        this.$message({
          type: 'success',
          message: data.meta.msg,
        })
        this.editDialogVisible = false
      })

    },
    // 物流信息查看事件
    async showProcessInfo () {
      const { data } = await this.$http.get('/kuaidi/815294206237577')
      console.log("物流信息：",data)
      this.processInfo = data.data
      this.processInfo.forEach(item=>{
        item.icon='el-icon-s-promotion'
      })
      this.processDialogVisible = true
    }
  }
};
</script>

<style scoped lang="less">
.el-cascader {
  width: 100%;
}
</style>
