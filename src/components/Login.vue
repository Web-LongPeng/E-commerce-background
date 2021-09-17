<template>
  <div class="login-container">
    <div class="login-left">
      <img src="../assets/imgs/login_img.png" />
    </div>
    <div class="login-box">
      <!-- 头像 -->
      <div class="head-sculpture">
        <img src="../assets/imgs/login_logo.png" />
      </div>
      <!-- 标题 -->
      <div class="title">电商后台管理系统</div>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef"
               class="login-form"
               :model="loginForm"
               :rules="loginFormRules">
        <el-form-item prop='username'>
          <el-input placeholder="请输入用户名"
                    prefix-icon="iconfont icon-user"
                    v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop='password'>
          <el-input placeholder="请输入密码"
                    prefix-icon="iconfont icon-lock_fill"
                    v-model="loginForm.password"
                    show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     class="login-btn"
                     @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 存取表单数据
      loginForm: {
        username: 'admin',
        password: '123456',

      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录账户！', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码！', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      //判断是否校验成功
      this.$refs.loginFormRef.validate(async (a) => {
        if (a) {
          const { data } = await this.$http.post('login', this.loginForm)
          console.log(data)
          if (data.meta.status !== 200) {
            return this.$message({
              type: 'error',
              message: data.meta.msg,
              duration: 2000
            })
          }
          this.$message({
            type: 'success',
            message: data.meta.msg,
            duration: 1000
          })

          sessionStorage.setItem('userInfo', JSON.stringify(data.data))
          this.$router.push('/home')
        }
        return
      })
    }
  },

};
</script>
	
<style lang="less" scoped>
.login-container {
  background-color: #93defe;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-left {
    margin-right: 100px;
  }

  .login-box {
    width: 400px;
    height: 350px;
    background-color: #fff;
    padding: 50px;
    border-radius: 6px;
    box-sizing: border-box;
    position: relative;

    .head-sculpture {
      width: 120px;
      height: 120px;
      border: 5px solid #93defe;
      border-radius: 100px;
      text-align: center;
      line-height: 110px;
      position: absolute;
      top: -60px;
      right: 140px;
      background-color: #fff;
    }

    .title {
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translate(-50%);
      font-size: 18px;
      color: #444;
    }

    .login-form {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
      padding: 20px;
      box-sizing: border-box;
      width: 80%;

      .login-btn {
        width: 100%;
      }
    }
  }
}
</style>