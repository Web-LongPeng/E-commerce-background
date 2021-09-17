<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片式图 -->
        <el-card>
            <el-row>
                <!-- 添加分类按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="addCategories"
                        >添加分类</el-button
                    >
                </el-col>
            </el-row>

            <!-- 商品分类表格展示 -->
            <Tree-table
                :data="categoriesList"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                border
                class="tree-table"
            >
                <template slot="isOk" slot-scope="scope">
                    <i
                        class="el-icon-error"
                        style="color: red"
                        v-if="scope.row.cat_deleted"
                    ></i>
                    <i
                        class="el-icon-success"
                        style="color: lightgreen"
                        v-else
                    ></i>
                </template>
                <template slot="level" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0"
                        >一级</el-tag
                    >
                    <el-tag
                        size="mini"
                        v-else-if="scope.row.cat_level === 1"
                        type="success"
                        >二级</el-tag
                    >
                    <el-tag size="mini" v-else type="warning">三级</el-tag>
                </template>

                <template slot="operate" slot-scope="scope">
                    <el-button
                        size="mini"
                        class="el-icon-edit"
                        type="primary"
                        @click="editCategories(scope.row)"
                        >编辑</el-button
                    >
                    <el-button
                        size="mini"
                        class="el-icon-delete"
                        type="danger"
                        @click="deleteCategories(scope.row.cat_id)"
                        >删除</el-button
                    >
                </template>
            </Tree-table>
            <!-- 编辑分类对话框 -->
            <el-dialog
                title="修改分类"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editClose()"
            >
                <el-form
                    :model="editCategoriesForm"
                    :rules="editCategoriesRules"
                    ref="editCategoriesForm"
                    label-width="80px"
                    class="editCategoriesForm"
                    status-icon
                >
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input
                            v-model="editCategoriesForm.cat_name"
                        ></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false"
                        >取 消</el-button
                    >
                    <el-button
                        type="primary"
                        @click="uniqueEditCategories(editCategoriesForm)"
                        >确 定</el-button
                    >
                </span>
            </el-dialog>
            <!-- 添加分类对话框 -->
            <el-dialog
                title="添加分类"
                :visible.sync="addDialogVisible"
                width="50%"
                @closed="addClose"
            >
                <el-form
                    :model="addCategoriesForm"
                    :rules="addCategoriesRules"
                    ref="addCategoriesForm"
                    label-width="80px"
                    status-icon
                >
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input
                            v-model="addCategoriesForm.cat_name"
                        ></el-input>
                    </el-form-item>

                    <el-form-item label="父级分类">
                        <el-cascader
                            v-model="selectedKeys"
                            :options="parentCategoriesList"
                            :props="cascadeProps"
                            @change="handleChange"
                            clearable
                        ></el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false"
                        >取 消</el-button
                    >
                    <el-button type="primary" @click="uniqueAddCategory"
                        >确 定</el-button
                    >
                </span>
            </el-dialog>

            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
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
            // 存储请求体
            queryInfo: {
                type: 3,
                pagenum: 0,
                pagesize: 5,
            },
            // 存储返回的用户数据总条数
            total: 0,
            // 存储获取的分类数据
            categoriesList: [],
            // 父级分类数据列表
            parentCategoriesList: [],
            // 存储表格的列配置对象
            columns: [
                {
                    label: "分类名称",
                    prop: "cat_name",
                },
                {
                    label: "是否有效",
                    // 将当前页定义为自定义模板内容，而不是数据的内容
                    type: "template",
                    // 当前列使用的模板名称
                    template: "isOk",
                },
                {
                    label: "登记",
                    // 将当前页定义为自定义模板内容，而不是数据的内容
                    type: "template",
                    // 当前列使用的模板名称
                    template: "level",
                },
                {
                    label: "操作",
                    // 将当前页定义为自定义模板内容，而不是数据的内容
                    type: "template",
                    // 当前列使用的模板名称
                    template: "operate",
                },
            ],
            // 存储编辑分类对话框的显示与隐藏
            editDialogVisible: false,
            // 存储添加分类对话框的显示与隐藏
            addDialogVisible: false,
            // 表单绑定对象
            addCategoriesForm: {
                cat_name: "", //分类名称
                cat_pid: 0,
                cat_level: 0,
            },
            // 存储级联的表单配置对象
            cascadeProps: {
                label: "cat_name",
                value: "cat_id",
                children: "children",
                expandTrigger: "hover",
                checkStrictly: true,
            },
            // 存储级联选择器选择的数组
            selectedKeys: [],
            // 存储编辑分类对话框中的input验证规则
            addCategoriesRules: {
                cat_name: [
                    {
                        required: true,
                        message: "请输入分类名称",
                        trigger: "blur",
                    },
                ],
            },
            // 存储编辑分类对话框打开时根据id请求后端返回的当前编辑的对象具体信息，然后展示在input框中
            editCategoriesForm: {},
            // 存储编辑分类对话框中的input验证规则
            editCategoriesRules: {
                cat_name: [
                    {
                        required: true,
                        message: "请输入分类名称",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    created() {
        this.getCategoriesList();
    },
    methods: {
        // 初始化请求分类参数
        async getCategoriesList() {
            const { data } = await this.$http.get("categories", {
                params: this.queryInfo,
            });
            console.log("数据详情：", data);
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }
            this.categoriesList = data.data.result;
            this.total = data.data.total;
        },
        //监听每页显示数据条数的改变
        handleSizeChange(pagesize) {
            this.queryInfo.pagesize = pagesize;
            this.getCategoriesList();
        },
        //监听当前页变动
        handleCurrentChange(pagenum) {
            this.queryInfo.pagenum = pagenum;
            this.getCategoriesList();
        },

        // 获取父级分类
        async getParentCateList() {
            const { data } = await this.$http.get("categories", {
                params: {
                    type: 2,
                },
            });

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }
            console.log("父级分类数据详情：", data);
            this.parentCategoriesList = data.data;
        },
        //监听添加分类按钮的点击事件
        addCategories() {
            this.addDialogVisible = true;
            this.getParentCateList();
        },
        // 监听级联选择器的改变
        handleChange() {
            console.log(this.selectedKeys);
            if (this.selectedKeys.length > 0) {
                this.addCategoriesForm.cat_pid =this.selectedKeys[this.selectedKeys.length - 1];
                this.addCategoriesForm.cat_level = this.selectedKeys.length;
            } else {
                this.addCategoriesForm.cat_pid = 0;
                this.addCategoriesForm.cat_level = 0;
            }
        },
        // 添加分类确定按钮的监听
        uniqueAddCategory() {
            this.$refs.addCategoriesForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.post(
                    "categories",
                    this.addCategoriesForm
                );
                if (data.meta.status !== 201) {
                    return this.$message({
                        type: "error",
                        message: data.meta.msg,
                    });
                }
                this.addDialogVisible = false;
                this.getCategoriesList();
                this.$message({
                    type: "success",
                    message: data.meta.msg,
                });
            });
        },
        // 监听添加对话框的关闭，重置数据
        addClose() {
            this.selectedKeys = [];
            this.$refs.addCategoriesForm.resetFields();
            this.addCategoriesForm.cat_pid = 0;
            this.addCategoriesForm.cat_level = 0;
        },

        // 点击编辑按钮事件的监听
        async editCategories(rowInfos) {
            // 弹出对话框
            const { data } = await this.$http.get(
                `categories/${rowInfos.cat_id}`
            );
            this.editDialogVisible = true;
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }
            this.editCategoriesForm = data.data;
        },
        async uniqueEditCategories(rebackInfos) {
            this.$refs.editCategoriesForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.put(
                    `categories/${rebackInfos.cat_id}`,
                    { cat_name: rebackInfos.cat_name }
                );
                console.log("编辑提交返回数据：", data);
                if (data.meta.status !== 200) {
                    return this.$message({
                        type: "error",
                        message: data.meta.msg,
                        duration: 2000,
                    });
                }
                this.$message({
                    type: "success",
                    message: data.meta.msg,
                    duration: 2000,
                });
                // 把返回的数据存储在定义好的变量中
                this.editCategoriesForm = data.data;
                this.getCategoriesList();
                this.editDialogVisible = false;
            });
        },
        // 监听编辑分类对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        editClose() {
            this.$refs.editCategoriesForm.resetFields();
        },
        // 监听'删除'分类事件
        deleteCategories(id) {
            this.$confirm("确定要删除这个分类吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(
                        `categories/${id}`
                    );

                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    this.getCategoriesList();
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
    },
};
</script>

<style lang='less' scoped>
.el-cascader {
    width: 100%;
}
.tree-table {
    margin-top: 10px;
}
</style>