<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片式图 -->
        <el-card>
            <el-row :gutter="20">
                <!-- 搜索和添加 -->
                <el-col :span="8">
                    <el-input
                        placeholder="请输入内容"
                        class="input-with-select"
                        v-model="queryInfo.query"
                        clearable
                        @clear="getUserList"
                        ><template #append>
                            <el-button
                                icon="el-icon-search"
                                @click="getUserList"
                            ></el-button> </template
                    ></el-input>
                </el-col>

                <!-- 添加用户按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="dialogVisible = true"
                        >添加用户</el-button
                    >
                </el-col>
            </el-row>

            <!-- 用户数据 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column
                    prop="role_name"
                    label="角色"
                ></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.mg_state"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            @change="userStateChange(scope.row)"
                        >
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-edit"
                            @click="editUser(scope.row.id)"
                        ></el-button>
                        <el-button
                            size="mini"
                            type="danger "
                            icon="el-icon-delete"
                            @click="deleteUser(scope.row.id)"
                        ></el-button>
                        <el-tooltip
                            effect="dark"
                            content="分配角色"
                            placement="top"
                            :enterable="false"
                        >
                            <el-button
                                size="mini"
                                type="warning "
                                icon="el-icon-setting"
                                @click="setRole(scope.row)"
                            ></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

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

        <!-- 点击添加用户弹出对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="dialogVisible"
            width="50%"
            @close="addClose()"
        >
            <el-form
                :model="addUserForm"
                :rules="addUserRules"
                ref="addUserForm"
                label-width="70px"
                class="addUserForm"
                status-icon
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueAddUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editClose()"
        >
            <el-form
                :model="editUserForm"
                :rules="editUserRules"
                ref="editUserForm"
                label-width="70px"
                class="editUserForm"
                status-icon
            >
                <el-form-item label="用户名" prop="username">
                    <el-input
                        v-model="editUserForm.username"
                        disabled
                    ></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input
                        v-model="editUserForm.email"
                        ref="email"
                    ></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input
                        v-model="editUserForm.mobile"
                        ref="mobile"
                    ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueEditUser"
                    >确 定</el-button
                >
            </span>
        </el-dialog>

        <!-- 删除功能没有用到对话框的视图组件，使用的是消息弹出 -->

        <!-- '分配用户角色'对话框 -->
        <el-dialog
            title="分配角色"
            :visible.sync="roleDialogVisible"
            width="50%"
            @close="roleClose"
        >
            <div>
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role_name }}</p>
            </div>
            <el-select v-model="r_id" placeholder="请选择">
                <el-option
                    v-for="item in roles"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
                >
                </el-option>
            </el-select>

            <span slot="footer" class="dialog-footer">
                <el-button @click="roleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueRole">确 定</el-button>
            </span>
        </el-dialog>
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
                pagesize: 5, //页大小
            },
            //存储用户数据(存储scope下的用户数据)
            userInfo: {},
            //存储用户数据(是数组包含多个对象的形式)
            userList: [],
            // 存储返回的用户数据总条数
            total: 0,
            // 控制添加用户被点击是否打开对话框的开关
            dialogVisible: false,
            // 控制编辑按钮被点击是否打开对话框的开关
            editDialogVisible: false,
            // 控制'分配角色'被点击是否打开对话框的开关
            roleDialogVisible: false,

            // 添加用户时用来存取表单信息
            addUserForm: {
                username: "",
                password: "",
                email: "",
                mobile: "",
            },
            // 添加用户时的表单验证规则
            addUserRules: {
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 10,
                        message: "长度在 3 到 10 个字符",
                        trigger: "blur",
                    },
                ],
                password: [
                    {
                        required: true,
                        message: "请输入密码",
                        trigger: "blur",
                    },
                    {
                        min: 6,
                        max: 15,
                        message: "长度在 6 到 15 个字符",
                        trigger: "blur",
                    },
                ],
                email: [
                    {
                        required: true,
                        message: "请输入邮箱",
                        trigger: "blur",
                    },
                    {
                        pattern:
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: "邮箱格式不正确",
                        trigger: "blur",
                    },
                ],
                mobile: [
                    {
                        required: true,
                        message: "请输入手机号",
                        trigger: "blur",
                    },
                    {
                        pattern:
                            /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
                        message: "手机号格式不正确",
                        trigger: "blur",
                    },
                ],
            },
            // 编辑用户存储返回的数据
            editUserForm: {},
            // 编辑用户时的表单验证规则
            editUserRules: {
                email: [
                    {
                        required: true,
                        message: "请输入邮箱",
                        trigger: "blur",
                    },
                    {
                        pattern:
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: "邮箱格式不正确",
                        trigger: "blur",
                    },
                ],
                mobile: [
                    {
                        required: true,
                        message: "请输入手机号",
                        trigger: "blur",
                    },
                    {
                        pattern:
                            /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
                        message: "手机号格式不正确",
                        trigger: "blur",
                    },
                ],
            },
            // 存储总的用户角色类
            roles: [],
            // 存储用户选择的角色id
            r_id: "",
            //存储用户列表编辑功能里面的老的邮箱和电话号码
            oldEmail:'',
            oldMobile:''
        };
    },
    mounted() {
        this.getUserList();
    },
    methods: {
        //获取用户数据
        async getUserList() {
            const { data } = await this.$http.get("users", {
                params: this.queryInfo,
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
            this.userList = data.data.users;
            this.total = data.data.total;
        },

        //监听每页显示数据条数的改变
        handleSizeChange(pagesize) {
            this.queryInfo.pagesize = pagesize;
            this.getUserList();
        },

        //监听当前页变动
        handleCurrentChange(pagenum) {
            this.queryInfo.pagenum = pagenum;
            this.getUserList();
        },

        // 监听用户状态的改变
        async userStateChange(userInfo) {
            const { data } = await this.$http.put(
                `users/${userInfo.id}/state/${userInfo.mg_state}`
            );
            // 更新失败时
            if (data.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message({
                    type: "error",
                    message: "用户状态更新失败！",
                    duration: 2000,
                });
            }
            return this.$message({
                type: "success",
                message: "用户状态更新成功！",
                duration: 2000,
            });
        },

        // 监听添加用户对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        addClose() {
            this.$refs.addUserForm.resetFields();
        },

        // 监听点击对话框的'确定'按钮添加用户
        uniqueAddUser() {
            this.$refs.addUserForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.post(
                    "users",
                    this.addUserForm
                );
                console.log("add用户：", data.data);
                if (data.meta.status !== 201) {
                    return this.$message({
                        type: "error",
                        message: "添加用户失败！",
                        duration: 2000,
                    });
                }
                // 关闭对话框
                this.dialogVisible = false;

                // 刷新用户列表
                this.getUserList();
                // 添加用户成功
                this.$message({
                    type: "success",
                    message: "添加用户成功！",
                    duration: 2000,
                });
            });
        },
        // 点击编辑按钮事件的监听
        async editUser(id) {
            // 弹出对话框

            this.editDialogVisible = true;
            const { data } = await this.$http.get(`users/${id}`);

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }

            // 把返回的数据存储在定义好的变量中
            this.editUserForm = data.data;
            this.oldEmail = data.data.email
            this.oldMobile = data.data.mobile
        },
        // 点击编辑对话框'确认'编辑的事件监听
        uniqueEditUser() {
            this.$refs.editUserForm.validate(async (valid) => {
                if (!valid) {
                    return this.$message({
                        type: "waring",
                        message: "格式有误喔！",
                        duration: 1500,
                    });
                } else {
                    if (
                        this.$refs.email.value === this.oldEmail &&
                        this.$refs.mobile.value === this.oldMobile
                    ) {
                        return this.$message({
                            type: "waring",
                            message: "您的修改还是和以前一样！",
                            duration: 2000,
                        })
                        
                    }
                    const { data } = await this.$http.put(
                        `users/${this.editUserForm.id}`,
                        {
                            email: this.editUserForm.email,
                            mobile: this.editUserForm.mobile,
                        }
                    );
                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: "编辑用户失败！",
                            duration: 2000,
                        });
                    }

                    // 刷新用户列表
                    this.getUserList();
                    // 添加用户成功
                    this.$message({
                        type: "success",
                        message: "编辑用户成功！",
                        duration: 2000,
                    });
                    // 关闭对话框
                    this.editDialogVisible = false;
                }
            });
        },
        // 监听编辑用户对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        editClose() {
            this.$refs.editUserForm.resetFields();
        },

        // 监听'删除'用户事件
        deleteUser(id) {
            this.$confirm("确定要删除这个用户吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(`users/${id}`);

                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    this.getUserList();
                    this.$message({
                        type: "success",
                        message: "删除成功!",
                    });
                })
                .catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消删除",
                    });
                });
        },

        // 监听分配角色被点击事件
        async setRole(userInfo) {
            this.roleDialogVisible = true;
            this.userInfo = userInfo;

            const { data } = await this.$http.get("roles");
            this.roles = data.data;
            console.log("role:", this.roles);
        },
        // 监听分配角色'确认'被点击事件
        async uniqueRole() {
            if (this.r_id) {
                const { data } = await this.$http.put(
                    `users/${this.userInfo.id}/role`,
                    { rid: this.r_id }
                );
                if (data.meta.status !== 200) {
                    return this.$message({
                        type: "error",
                        message: "分配角色错误!",
                    });
                }
                this.$message({
                    type: "success",
                    message: "分配角色成功!",
                });
                this.getUserList();
                this.roleDialogVisible = false;
            } else {
                this.$message({
                    type: "warning",
                    message: "请选择分配的角色!",
                });
            }
        },
        // 监听'分配角色'对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        roleClose() {
            this.r_id = null;
        },
    },
};
</script>

<style lang='less' scoped>
.el-table__row {
    width: 100%;
}
</style>