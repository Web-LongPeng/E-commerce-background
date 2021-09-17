<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="修改商品信息"
                type="info"
                show-icon
                :closable="false"
                center>
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :active="stepsIndex * 1"
                finish-status="success"
                align-center
                space="200px">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单内容 -->
      <el-form :model="editForm"
               :rules="editFormrules"
               ref="editForm"
               label-width="100px"
               label-position="top">
        <!-- 垂直标签页 -->
        <el-tabs tab-position="left"
                 v-model="stepsIndex"
                 :before-leave="beforeTagsLeave"
                 @tab-click="tabChange">
          <el-tab-pane label="基本信息"
                       name="0">
            <!-- 商品名称 -->
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <!-- 商品价格 -->
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model.number="editForm.goods_price"
                        type="number"></el-input>
            </el-form-item>
            <!-- 商品重量 -->
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model.number="editForm.goods_weight"
                        type="number"></el-input>
            </el-form-item>
            <!-- 商品数量 -->
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model.number="editForm.goods_number"
                        type="number"></el-input>
            </el-form-item>
            <!-- 商品分类级联选择器 -->
            <el-form-item label="商品分类">
              <!-- 级联选择器 -->
              <el-cascader v-model="editForm.goods_cat"
                           :options="categoriesList"
                           :props="cascadeProps"
                           @change="handleChange"
                           clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数"
                       name="1">
            <el-form-item v-for="item in manyData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="value"
                             v-for="(value, i) in item.attr_vals"
                             :key="i"
                             border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性"
                       name="2">
            <el-form-item v-for="item in onlyData"
                          :key="item.attr_id"
                          :label="item.attr_name">
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片"
                       name="3">
            <!-- action:图片要上传的后台api地址 -->
            <el-upload :action="uploadURL"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       :on-success="handleSuccess"
                       list-type="picture"
                       :headers="headerObj"
                       :file-list="fileList">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容"
                       name="4">
            <quill-editor v-model="editForm.goods_introduce">
            </quill-editor>

            <!-- 添加商品按钮 -->
            <el-button type="primary"
                       size="mini"
                       style="margin-top: 15px"
                       @click="editGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片时展示的对话框 -->
    <el-dialog title="图片预览"
               :visible.sync="previewVisible"
               width="50%">
      <img :src="previewPath"
           :alt="altName"
           width="100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  data () {
    return {
      // 用于绑定步骤条的当前步骤数字
      stepsIndex: "0",

      // 存储根据id返回的请求表单数据
      editForm: {
        goods_name: "",
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        pics: [], //上传图片路径
        goods_introduce: "", //富文本编辑器
        attrs: [], //商品的参数数据
      },
      // 表单验证规则
      editFormrules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
      },
      // 总商品分类用于级联选择器显示
      categoriesList: [],
      // 存储级联的表单配置对象
      cascadeProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
        expandTrigger: "hover",
      },
      // 存储动态参数数据
      manyData: [],
      // 存储静态属性数据
      onlyData: [],
      // 图片上传的服务器地址
      uploadURL: "http://www.tangxiaoyang.vip:8888/api/v2/upload",
      // 文件上传时的请求头信息
      headerObj: {
        Authorization: JSON.parse(sessionStorage.getItem("userInfo"))
          .token,
      },
      // 图片预览对话框的显示与隐藏
      previewVisible: false,
      // 预览图片路径
      previewPath: "",
      // 图片不出来时，辅助用户知道图片是什么
      altName: "",
      // 用于修改商品时显示已经有的图片
      fileList: [],
    };
  },
  computed: {
    catId () {
      return this.editForm.goods_cat.length === 3
        ? this.editForm.goods_cat[2]
        : null;
    },
  },
  created () {
    this.getGoodsById()
    this.getCategoriesList();
  },
  methods: {
    // 得到级联选择器的商品分类数据
    async getCategoriesList () {
      const { data } = await this.$http.get("categories", {
        params: {},
      });
      console.log("分类数据详情：", data);
      if (data.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: data.meta.msg,
          duration: 2000,
        });
      }
      this.categoriesList = data.data;
    },

    // 得到根据id返回的数据
    async getGoodsById () {
      const { data } = await this.$http.get(`goods/${this.$route.query.id}`);
      console.log("根据id获取的数据详情：", data);
      if (data.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: data.meta.msg,
          duration: 2000,
        });
      }
      // 处理good_cat为数组
      data.data.goods_cat = data.data.goods_cat.split(',').map(item => {
        return item * 1
      })
      // 处理图片信息，用于回显图片
      data.data.pics.forEach(item => {
        this.fileList.push({
          name: item.pics_id,
          url: item.pics_big_url.replace('127.0.0.1', 'shop.tangxiaoyang.vip'),   //改为服务器地址
          tmp_path:item.pics_big
        })
        item.pic = item.pics_big_url
      })

      this.editForm = data.data;
      console.log('editForm:', this.editForm)
    },

    // 监听级联选择器的改变
    handleChange () {
      console.log(this.editForm.goods_cat);
      if (this.editForm.goods_cat.length < 3) {
        this.editForm.goods_cat = [];
        return;
      }
    },
    // 监听标签页之前是否选择级联选择器
    beforeTagsLeave (activeName, oldName) {
      if (this.editForm.goods_cat.length < 3) {
        console.log(activeName, oldName);
        this.$message({
          type: "error",
          message: "请选择商品分类",
        });
        return false;
      }
    },

    // 监听标签页的点击切换
    tabChange () {
      this.getParamsDatas();
    },
    // 用来获取参数分类的数据
    async getParamsDatas () {
      if (this.stepsIndex === "1") {
        // 根据分类进行请求
        let { data } = await this.$http.get(
          `categories/${this.catId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (data.meta.status !== 200) {
          return this.$message({
            type: "error",
            message: data.meta.msg,
          });
        }
        console.log("分类详细动态数据(明细是数组)：", data);
        data.data.forEach((item) => {
          item.attr_vals = item.attr_vals
            ? item.attr_vals.split(" ")
            : [];
        });
        this.manyData = data.data;
      } else if (this.stepsIndex === "2") {
        // 根据分类进行请求
        let { data } = await this.$http.get(
          `categories/${this.catId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (data.meta.status !== 200) {
          return this.$message({
            type: "error",
            message: data.meta.msg,
          });
        }
        console.log("分类详细静态数据(明细不是数组)：", data);
        this.onlyData = data.data;
      }
    },
    // 预览图片的监听(点击上传的图片时)
    handlePreview (file) {
      console.log('预览图片时返回的对象：',file);
      this.previewVisible = true;
      this.previewPath = file.url;
      this.altName = file.name;
    },
    // 移出图片的监听
    handleRemove (file) {
      console.log('删除图片时返回的对象：', file)
      const filePath = file.tmp_path || file.response.data.tmp_path;
      this.editForm.pics.splice(
        this.editForm.pics.findIndex((item) => {
          item.pic === filePath
        }),1);
      console.log("删除上传图片后总的上传对象：", this.editForm);
    },
    // 图片上传成功时的监听
    handleSuccess (res) {
      console.log("图片上传成功时返回的对象：",res)
      this.editForm.pics.push({
        pic: res.data.tmp_path,
      });
      console.log("上传成功图片后总的上传对象：", this.editForm);
    },
    // 添加商品
    editGoods () {
      this.$refs.editForm.validate(async (valid) => {
        if (!valid) {
          this.$message({
            type: "error",
            message: "请填写必要的表单信息",
          });
        }
        // 发送请求之前需要处理数据格式
        // 安装lodash插件进行对象深拷贝，需要把goods_cat以`,`逗号分割的分类列表，但是不能改变editForm中的值，因为它关联着级联选择器
        const cloneEditForm = _.cloneDeep(this.editForm);
        cloneEditForm.goods_cat = cloneEditForm.goods_cat.join(",");

        // 处理动态参数
        this.manyData.forEach((item) => {
          cloneEditForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          });
        });
        // 处理静态属性
        this.onlyData.forEach((item) => {
          cloneEditForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          });
        });
        // 给后端发送数据
        const { data } = await this.$http.put(`goods/${this.editForm.goods_id}`, cloneEditForm);
        console.log('确认修改返回的数据：',data)
        if (data.meta.status !== 200) {
          return this.$message({
            type: "error",
            message: data.meta.msg,
          });
        }

        // 修改成功后，路由跳转
        this.$message({
          type: "success",
          message: '修改商品成功',
          duration: 1000,
        });
        this.$router.push('/goods')
      });
    },
  },
};
</script>

<style scoped lang="less">
.el-checkbox {
  margin-right: 10px;
}
</style>
