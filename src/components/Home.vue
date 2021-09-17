/* eslint-disable no-mixed-spaces-and-tabs */
<template>
    <el-container>
        <!-- header -->
        <el-header>
            <div class="left">
                <img src="../assets/imgs/shop.png" alt="" />
                <span>电商后台管理系统</span>
            </div>
            <div class="right">
                <span v-if="userInfo">欢迎您：{{ userInfo.username }}</span>
                <el-button type="danger" size="mini" @click="logout"
                    >退出</el-button
                >
            </div>
        </el-header>

        <el-container>
			


            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 侧边栏菜单 -->
				<div class="toggle-button" @click="isCollapse = !isCollapse">|||</div>

                <el-menu :default-active="$route.path" unique-opened router :collapse='isCollapse' :collapse-transition='false'>
                    <el-submenu
                        :index="item.id + ''"
                        v-for="item in menuList"
                        :key="item.id"
                    >
                        <template #title>
                            <i :class="iconList[item.id]"></i>
                            <span>{{ item.authName }}</span>
                        </template>

                        <el-menu-item
                            :index="'/' + itemDetail.path"
                            v-for="itemDetail in item.children"
                            :key="itemDetail.id"
                            ><i class="el-icon-menu"></i
                            >{{ itemDetail.authName }}</el-menu-item
                        >
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-main>
				<router-view></router-view>
			</el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            userInfo: null, //存储用户信息

            menuList: [], //存储左侧菜单数据

            //存储左侧一级菜单图标
            iconList: {
                201: "iconfont icon-shouye",
                125: "iconfont icon-users",
                103: "iconfont icon-tijikongjian",
                101: "iconfont icon-shangpin",
                102: "iconfont icon-danju",
            },

			// 存储点击左侧按钮折叠菜单变量
			isCollapse:false
        };
    },
    mounted() {
        this.userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
        this.getMenuList();
    },
    methods: {
        // 退出
        logout() {
            this.$confirm("确定要退出登录吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    sessionStorage.clear();
                    this.$router.push("/login");
                })
                .catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消退出登录",
                        duration: 1000,
                    });
                });
        },

        //获取左侧菜单列表
        async getMenuList() {
            const { data } = await this.$http.get("menus");
            console.log("----商品data----");
            console.log(data);
            if (data.meta.status !== 200) {
                return this.$message.error(data.meta.msg);
            }
            this.menuList = data.data;
            console.log(this.menuList);
        },
    },
};
</script>

<style lang='less' scoped>
.el-container {
    height: 100%;
}

.el-header {
    background: url("../assets/imgs/header_bg.gif") repeat-x center;
    height: 50px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;

    .left {
        display: flex;
        justify-content: space-between;
        align-items: center;
        img {
            width: 40px;
            margin-right: 20px;
        }
        span {
            font-size: 20px;
            margin: 0;
        }
    }

    .right {
        display: flex;
        justify-content: space-between;
        align-items: center;
        span {
            margin-right: 10px;
        }
    }
}

.el-aside {
	.toggle-button{
		cursor: pointer;
		background-color: #60779d;
		font-size: 10px;
		line-height: 24px;
		text-align: center;
		color: #fff;
		letter-spacing: 0.2rem;
	}
    .el-menu {
		border-right: 0;
        .el-submenu {
            i {
                margin-right: 10px;
            }
        }
    }
}

.el-main{
	background-color: rgba(231, 223, 223, 0.883);
}
</style>