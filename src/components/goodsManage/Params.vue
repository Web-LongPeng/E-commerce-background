<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片式图 -->
        <el-card>
            <!-- 提示信息 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                show-icon
                :closable="false"
            >
            </el-alert>

            <!-- 级联选择器 -->
            <el-row class="select_cat">
                <el-col>
                    选择商品分类：
                    <el-cascader
                        v-model="selectedKeys"
                        :options="categoryList"
                        :props="cascadeProps"
                        @change="handleChange"
                        clearable
                        class="cascader"
                    ></el-cascader>
                </el-col>
            </el-row>

            <!-- 标签页 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="btnSwitch"
                        @click="addDialogVisible = true"
                        >添加参数</el-button
                    >
                    <el-table :data="paramsDatas" border stripe>
                        <el-table-column label="明细" type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                    :key="index"
                                    v-for="(item, index) in scope.row.attr_vals"
                                    closable
                                    @close="handleClose(scope.row, index)"
                                >
                                    {{ item }}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="
                                        handleInputConfirm(scope.row)
                                    "
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                    >+ New Tag</el-button
                                >
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="序号"
                            type="index"
                        ></el-table-column>
                        <el-table-column
                            label="参数名称"
                            prop="attr_name"
                        ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                    >编辑</el-button
                                >
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                    >删除</el-button
                                >
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <el-tab-pane label="静态属性" name="only">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="btnSwitch"
                        @click="addDialogVisible = true"
                        >添加属性</el-button
                    >
                    <el-table :data="paramsDatas" border stripe>
                        <el-table-column label="明细" type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                    :key="index"
                                    v-for="(item, index) in scope.row.attr_vals"
                                    closable
                                    @close="handleClose(scope.row, index)"
                                >
                                    {{ item }}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="
                                        handleInputConfirm(scope.row)
                                    "
                                    @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                    >+ New Tag</el-button
                                >
                            </template>
                        </el-table-column>
                        <el-table-column
                            label="序号"
                            type="index"
                        ></el-table-column>
                        <el-table-column
                            label="属性名称"
                            prop="attr_name"
                        ></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                    >编辑</el-button
                                >
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                    >删除</el-button
                                >
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 动态参数与静态属性对话框复用一个对话框 -->
        <el-dialog
            :title="'添加' + title"
            :visible.sync="addDialogVisible"
            width="70%"
            @closed="addClose"
        >
            <el-form
                :model="addForm"
                :rules="addFormRules"
                ref="addForm"
                label-width="80px"
                status-icon
            >
                <el-form-item :label="title" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueAdd">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改对话框 -->
        <el-dialog
            :title="'修改' + title"
            :visible.sync="editDialogVisible"
            width="70%"
            @closed="editClose"
        >
            <el-form
                :model="editForm"
                :rules="editFormRules"
                ref="editForm"
                label-width="80px"
                status-icon
            >
                <el-form-item :label="title" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 分类总的数据
            categoryList: [],
            // 级联选择器配置对象
            cascadeProps: {
                label: "cat_name",
                value: "cat_id",
                children: "children",
                expandTrigger: "hover",
            },
            // 级联选择器U型安泽的数组
            selectedKeys: [],
            // 标签页激活的名称
            activeName: "many",
            // 按钮是否激活
            btnSwitch: true,
            // 参数返回数据
            paramsDatas: [],
            // 添加对话框的显示与隐藏
            addDialogVisible: false,
            //编辑对话框的显示与隐藏
            editDialogVisible: false,
            // 添加对话框的表单数据
            addForm: {},
            // 编辑对话框的表单数据
            editForm: {},
            addFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur",
                    },
                ],
            },
            editFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    computed: {
        catId() {
            return this.selectedKeys.length === 3 ? this.selectedKeys[2] : null;
        },
        // 对话框标题
        title() {
            return this.activeName === "many" ? "动态参数" : "静态属性";
        },
    },
    created() {
        this.getCategoryList();
    },
    mounted() {},
    methods: {
        // 获取所有的分类，用于级联选择器中
        async getCategoryList() {
            const { data } = await this.$http.get("categories");
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }
            this.categoryList = data.data;
            console.log("参数设置中获取所有分类数据：", data);
        },
        // 级联选择器改变的监听
        handleChange() {
            if (this.selectedKeys.length === 3) {
                this.btnSwitch = false;
                this.getParamsDatas();
                return;
            }
            this.btnSwitch = true;
            this.selectedKeys = [];
            this.paramsDatas = [];
        },

        // 标签页切换时间监听
        handleClick() {
            this.getParamsDatas();
            console.log("激活的标签名称:", this.activeName);
        },
        // 用来获取参数分类的数据
        async getParamsDatas() {
            // 判断是否选择三级分类，如果不是则清空选择
            if (this.selectedKeys.length !== 3) {
                this.selectedKeys = [];
                return;
            }
            // 根据分类进行请求
            const { data } = await this.$http.get(
                `categories/${this.catId}/attributes`,
                {
                    params: {
                        sel: this.activeName,
                    },
                }
            );

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }
            console.log("参数数据：", data);
            data.data.forEach((item) => {
                item.attr_vals = item.attr_vals
                    ? item.attr_vals.split(" ")
                    : [];

                // 给明细添加两个属性，用于显示标签的显示与隐藏
                item.inputVisible = false;
                item.inputValue = ""; //文本框输入的值
            });
            this.paramsDatas = data.data;
        },
        // 确认添加
        async uniqueAdd() {
            this.$refs.addForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.post(
                    `categories/${this.catId}/attributes`,
                    {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName,
                    }
                );

                if (data.meta.status !== 201) {
                    return this.$message({
                        type: "error",
                        message: data.meta.msg,
                    });
                }
                console.log("添加参数返回数据：", data);
                this.getParamsDatas();
                this.addDialogVisible = false;
                this.$message({
                    type: "success",
                    message: data.meta.msg,
                });
            });
        },
        // 添加对话框关闭
        addClose() {
            this.$refs.addForm.resetFields();
        },
        async showEditDialog(id) {
            const { data } = await this.$http.get(
                `categories/${this.catId}/attributes/${id}`,
                {
                    params: {
                        attr_sel: this.activeName,
                    },
                }
            );

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }

            this.editForm = data.data;
            this.editDialogVisible = true;
        },
        // 编辑对话框关闭
        editClose() {
            this.$refs.editForm.resetFields();
        },
        // 编辑确认
        uniqueEdit() {
            this.$refs.editForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.put(
                    `categories/${this.catId}/attributes/${this.editForm.attr_id}`,
                    {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName,
                        attr_vals: this.editForm.attr_vals,
                    }
                );

                if (data.meta.status !== 200) {
                    return this.$message({
                        type: "error",
                        message: data.meta.msg,
                    });
                }
                console.log("确认编辑返回数据：", data);
                this.getParamsDatas();
                this.editDialogVisible = false;
                this.$message({
                    type: "success",
                    message: data.meta.msg,
                });
            });
        },
        // 删除事件的监听
        removeParams(id) {
            this.$confirm("确定要删除这个参数吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(
                        `categories/${this.catId}/attributes/${id}`
                    );

                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    this.getParamsDatas();
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
        // 明细标签的关闭
        handleClose(row, index) {
            row.attr_vals.splice(index, 1);
            this.updateParamsDetails(row);
        },
        // 明细输入框的显示
        showInput(row) {
            row.inputVisible = true;
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 输入框响应回车键和失去焦点事件
        handleInputConfirm(row) {
            row.inputVisible = false;
            if (row.inputValue.trim()) {
                row.attr_vals.push(row.inputValue.trim());
                this.updateParamsDetails(row);
            }
            row.inputVisible = false;
            row.inputValue = "";
        },
        // 更新参数名字
        async updateParamsDetails(row) {
            const { data } = await this.$http.put(
                `categories/${this.catId}/attributes/${row.attr_id}`,
                {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(" "),
                }
            );
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }
            this.$message({
                type: "success",
                message: data.meta.msg,
            });
        },
    },
};
</script>

<style scoped lang="less">
.select_cat {
    margin-top: 16px;
}
.cascader {
    width: 30%;
}
.el-tag {
    margin-right: 10px;
}
.el-input {
    width: 160px;
}
.ql-editor{
    min-height: 300px;
}
</style>
