<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片式图 -->
        <el-card>
            <el-row :gutter="20">
                <!-- 搜索和添加 -->
                <el-col :span="8">
                    <el-input
                        placeholder="请输入商品名称"
                        class="input-with-select"
                        v-model="queryInfo.query"
                        clearable
                        @clear="getGoodsList"
                        ><template #append>
                            <el-button
                                icon="el-icon-search"
                                @click="getGoodsList"
                            ></el-button> </template
                    ></el-input>
                </el-col>

                <!-- 添加用户按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品数据 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column
                    prop="goods_name"
                    label="商品名称"
                ></el-table-column>
                <el-table-column
                    prop="goods_price"
                    label="商品价格（元）"
                    width="100px"
                ></el-table-column>
                <el-table-column
                    prop="goods_weight"
                    label="商品重量"
                    width="70px"
                ></el-table-column>
                <el-table-column
                    prop="add_time"
                    label="创建时间"
                    width="150px"
                ></el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-edit"
                            @click="goEditPage(scope.row.goods_id)"
                        ></el-button>
                        <!-- 删除按钮 -->
                        <el-button
                            size="mini"
                            type="danger "
                            icon="el-icon-delete"
                            @click="deleteGoods(scope.row.goods_id)"
                        ></el-button>
                    </template>
                </el-table-column>
            </el-table>




            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            >
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //查询用户列表时的参数对象
            queryInfo: {
                query: "",
                pagenum: 1, //页码
                pagesize: 10, //页大小
            },
            // 商品总记录数
            total: 0,
            // 商品数据
            goodsList: [],
        };
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        //获取商品列表
        async getGoodsList() {
            const { data } = await this.$http.get("goods", {
                params: this.queryInfo,
            });

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }

            // 对后台传回来的日期进行处理，后台返回数据是以秒为单位
            for (let item of data.data.goods) {
                item.add_time = this.$moment(item.add_time * 1000).format(
                    "YYYY-MM-DD HH:mm:ss"
                );
            }
            console.log("得到的全部商品信息：", data.data);
            this.total = data.data.total;
            this.goodsList = data.data.goods;
        },
        // 分页条目选择的改变
        handleSizeChange(pagesize) {
            this.queryInfo.pagesize = pagesize;
            this.getGoodsList();
        },
        // 分页当前页的改变
        handleCurrentChange(pagenum) {
            this.queryInfo.pagenum = pagenum;
            this.getGoodsList();
        },
        // 监听'删除'商品事件
        deleteGoods(id) {
            this.$confirm("确定要删除这个商品吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(`goods/${id}`);

                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    this.getGoodsList();
                    this.$message({
                        type: "success",
                         message: data.meta.msg,
                    });
                })
                .catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消删除",
                    });
                });
        },
        // 点击添加按钮路由的跳转
        goAddPage(){
           this.$router.push('/goods/add') 
        },
         // 点击添加按钮路由的跳转
        goEditPage(id){
           this.$router.push('/goods/edit?id='+id) 
        },
    },
};
</script>

<style lang='less' scoped>
.el-table__row {
    width: 100%;
}
</style>