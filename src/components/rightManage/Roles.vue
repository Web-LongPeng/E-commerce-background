<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片式图 -->
        <el-card>
            <el-row>
                <!-- 添加角色按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="addRole"
                        >添加角色</el-button
                    >
                </el-col>
            </el-row>

            <!-- 角色数据 -->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand" label="明细">
                    <template slot-scope="scope">
                        <el-row
                            v-for="(item1, index1) in scope.row.children"
                            :key="item1.id"
                            :class="{
                                bdbottom: true,
                                bdtop: index1 === 0,
                                valign: true,
                            }"
                        >
                            <el-col :span="5">
                                <el-tag
                                    closable
                                    @close="deleteRight(scope.row, item1.id)"
                                >
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row
                                    v-for="(item2, index2) in item1.children"
                                    :key="item2.id"
                                    :class="{
                                        bdbottom: true,
                                        bdtop: index2 !== 0,
                                        valign: true,
                                    }"
                                >
                                    <el-col :span="5">
                                        <el-tag
                                            closable
                                            type="success"
                                            @close="
                                                deleteRight(scope.row, item2.id)
                                            "
                                        >
                                            {{ item2.authName }}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag
                                            type="warning"
                                            closable
                                            v-for="item3 in item2.children"
                                            :key="item3.id"
                                            @close="
                                                deleteRight(scope.row, item3.id)
                                            "
                                        >
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column
                    prop="roleName"
                    label="角色名称"
                ></el-table-column>
                <el-table-column
                    prop="roleDesc"
                    label="角色描述"
                ></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-edit"
                            @click="editRole(scope.row.id)"
                            >编辑</el-button
                        >
                        <el-button
                            size="mini"
                            type="danger "
                            icon="el-icon-delete"
                            @click="deleteRole(scope.row.id)"
                            >删除</el-button
                        >

                        <el-button
                            size="mini"
                            type="warning "
                            icon="el-icon-setting"
                            @click="setRight(scope.row)"
                            >分配权限</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- '添加'角色对话框 -->
        <el-dialog
            title="添加角色"
            :visible.sync="dialogVisible"
            width="50%"
            @close="addClose"
        >
            <el-form
                :model="addRolesForm"
                :rules="addRolesRules"
                ref="addRolesForm"
                label-width="100px"
                class="addRolesForm"
                status-icon
            >
                <el-form-item label="角色名称：" prop="roleName">
                    <el-input v-model="addRolesForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述：" prop="roleDesc">
                    <el-input v-model="addRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueAddRole"
                    >确 定</el-button
                >
            </span>
        </el-dialog>
        <!-- '编辑'角色对话框 -->
        <el-dialog
            title="修改角色"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editClose"
        >
            <el-form
                :model="editRolesForm"
                :rules="editRolesRules"
                ref="editRolesForm"
                label-width="100px"
                class="editRolesForm"
                status-icon
            >
                <el-form-item label="角色名称：" prop="roleName">
                    <el-input v-model="editRolesForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述：" prop="roleDesc">
                    <el-input v-model="editRolesForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="uniqueEditRole"
                    >确 定</el-button
                >
            </span>
        </el-dialog>

        <!-- 删除功能没有用到对话框的视图组件，使用的是消息弹出 -->

        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="closeSetRight"
        >
            <el-tree ref="treeRef" :data="treeRightsList" default-expand-all :props="configObj" node-key='id' show-checkbox :default-checked-keys='defaultSelectedKeys'> </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false"
                    >取 消</el-button
                >
                <el-button type="primary" @click="uniqueSetRight"
                    >确 定</el-button
                >
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 存储角色列表
            rolesList: [],
            // 存储'树形'权限列表
            treeRightsList: {},
            // 控制'添加角色'对话框的显示与隐藏
            dialogVisible: false,
            // 控制'编辑角色'对话框的显示与隐藏
            editDialogVisible: false,
            // 控制'分配权限'对话框的显示与隐藏
            setRightDialogVisible: false,
            // 存储角色信息
            addRolesForm: {
                roleName: "",
                roleDesc: "",
            },
            // '添加角色'时的表单验证规则
            addRolesRules: {
                roleName: [
                    {
                        required: true,
                        message: "请输入角色名称",
                        trigger: "blur",
                    },
                ],
                roleDesc: [
                    {
                        required: false,
                        message: "请输入角色描述",
                        trigger: "blur",
                    },
                ],
            },
            // '编辑'角色时的查询本角色信息
            editRolesForm: {},
            //存储角色'编辑'功能里面的老的'角色名称'和'角色描述'
            oldRoleName: "",
            oldRoleDesc: "",
            // '编辑'角色时的表单验证规则
            editRolesRules: {
                roleName: [
                    {
                        required: true,
                        message: "请输入角色名称",
                        trigger: "blur",
                    },
                ],
                roleDesc: [
                    {
                        required: false,
                        message: "请输入角色描述",
                        trigger: "blur",
                    },
                ],
            },
            // 存储树形展示的权限列表的配置对象
            configObj:{
                label:'authName',
                children:'children'
            },
            //存储树形结构默认选择的key,它是一个数组
            defaultSelectedKeys:[],
            // 存储用户操作权限的用户id
            setRightUserId:'',
        };
    },
    created() {
        this.getRolesList();
    },

    methods: {
        // 获取角色列表
        async getRolesList() {
            const { data } = await this.$http.get("roles");
            console.log("角色列表：", data.data);
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }
            this.rolesList = data.data;
        },

        //点击“添加角色”事件
        addRole() {
            this.dialogVisible = true;
        },
        // 监听添加角色对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        addClose() {
            this.$refs.addRolesForm.resetFields();
        },
        // 监听添加角色对话框的关闭事件，没有对作出修改确定或点击关闭，下一次点击则刷新输入框
        editClose() {
            this.$refs.editRolesForm.resetFields();
        },
        // 监听'添加角色'对话框的'确认'事件
        uniqueAddRole() {
            this.$refs.addRolesForm.validate(async (valid) => {
                if (!valid) {
                    return;
                }
                const { data } = await this.$http.post(
                    "roles",
                    this.addRolesForm
                );
                console.log("add角色：", data.data);
                if (data.meta.status !== 201) {
                    return this.$message({
                        type: "error",
                        message: "添加角色失败！",
                        duration: 2000,
                    });
                }
                // 关闭对话框
                this.dialogVisible = false;
                this.getRolesList();
                // 添加用户成功
                this.$message({
                    type: "success",
                    message: "添加角色成功！",
                    duration: 2000,
                });
            });
        },
        // 点击角色'编辑'按钮事件的监听
        async editRole(id) {
            // 弹出对话框
            this.editDialogVisible = true;
            const { data } = await this.$http.get(`roles/${id}`);

            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                    duration: 2000,
                });
            }

            // 把返回的数据存储在定义好的变量中
            this.editRolesForm = data.data;
            this.oldRoleName = data.data.roleName;
            this.oldRoleDesc = data.data.roleDesc;
        },
        // 监听'编辑'角色对话框的'确认'事件
        uniqueEditRole() {
            this.$refs.editRolesForm.validate(async (valid) => {
                if (!valid) {
                    return this.$message({
                        type: "waring",
                        message: "格式有误喔！",
                        duration: 1500,
                    });
                }
                const { data } = await this.$http.put(
                    `roles/${this.editRolesForm.roleId}`,
                    {
                        roleName: this.editRolesForm.roleName,
                        roleDesc: this.editRolesForm.roleDesc,
                    }
                );
                console.log("编辑角色：", data.data);
                if (data.meta.status !== 200) {
                    return this.$message({
                        type: "error",
                        message: "编辑角色失败！",
                        duration: 2000,
                    });
                }
                // 关闭对话框
                this.editDialogVisible = false;
                this.getRolesList();
                // 添加用户成功
                this.$message({
                    type: "success",
                    message: "编辑角色成功！",
                    duration: 2000,
                });
            });
        },
        // 监听'删除角色'事件
        deleteRole(id) {
            this.$confirm("确定要删除这个角色吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(`roles/${id}`);
                    console.log("删除角色：", data);
                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    this.getRolesList();
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
        // 监听'删除'角色'权限'
        deleteRight(role, rightId) {
            this.$confirm("确定要删除这个权限吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    const { data } = await this.$http.delete(
                        `roles/${role.id}/rights/${rightId}`
                    );
                    console.log("删除权限：", data);
                    if (data.meta.status !== 200) {
                        return this.$message({
                            type: "error",
                            message: data.meta.msg,
                        });
                    }
                    role.children = data.data;
                    this.$message({
                        type: "success",
                        message: "删除权限成功!",
                    });
                })
                .catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消删除",
                    });
                });
        },
        // 监听'分配权限'事件
        async setRight(rights) {
            const { data } = await this.$http.get('rights/tree');
            console.log("所有权限树形：", data);
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }
           this.treeRightsList = data.data
           
           this.setRightUserId = rights.id  //操作的用户id
           
           this.getRightkeys(rights)  //调用方法获取树形权限的三级key数组
            this.$message({
                type: "success",
                message: "获取权限成功!",
            });
            this.setRightDialogVisible = true;
        },
        // 监听'确定'设置权限事件
        async uniqueSetRight(){
            const checkedkeys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys()).join(",")
            console.log('被选中的权限id：',checkedkeys)
            const { data } = await this.$http.post(`roles/${this.setRightUserId}/rights`,{
                rids:checkedkeys
            });
            console.log("权限更新返回数据：", data);
            if (data.meta.status !== 200) {
                return this.$message({
                    type: "error",
                    message: data.meta.msg,
                });
            }
           this.getRolesList()
            this.$message({
                type: "success",
                message: data.meta.msg,
            });
            this.setRightDialogVisible = false;
            
        },
        // 监听关闭设置权限对话框事件，重置树形结构选择的key数组
        closeSetRight() {
            this.defaultSelectedKeys = []
        },
        // 定义一个回调函数，用来循环遍历权限对象
        getRightkeys(rights){
           
            if(!rights.children){
                return this.defaultSelectedKeys.push(rights.id)
            }
            
            rights.children.forEach(element => {
                this.getRightkeys(element)
            });
        }
    },
};
</script>

<style lang='less' scoped>
.el-table__row {
    width: 100%;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.bdtop {
    border-top: 1px solid #eee;
}
.valign {
    display: flex;
    align-items: center;
}
.el-tag {
    margin: 10px;
}
</style>