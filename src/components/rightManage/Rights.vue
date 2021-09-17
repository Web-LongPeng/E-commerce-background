<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!-- 权限列表数据 -->
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column
                    prop="authName"
                    label="权限名称"
                ></el-table-column>
                <el-table-column prop="path" label="路径"></el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template  slot-scope="scope">
                        <el-tag v-if="scope.row.level==='0'">一级</el-tag>
                        <el-tag type="success" v-if="scope.row.level==='1'">二级</el-tag>
                        <el-tag type="info" v-if="scope.row.level==='2'">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rightsList: [],
        };
    },
    async created() {
        const { data } = await this.$http.get("rights/list");
        console.log('权限列表：',data.data);
        if (data.meta.status !== 200) {
            return this.$message({
                type: "error",
                message: data.meta.msg,
                duration: 2000,
            });
        }
        this.rightsList = data.data;
    },
};
</script>

<style>
</style>