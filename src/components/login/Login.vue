<template>
  <div id="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="~assets/img/logo.png" alt="logo" />
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginForm" :model="form" label-width="0px" class="login-form" :rules="rules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user"
          v-model="form.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" show-password
          v-model="form.password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">login</el-button>
          <el-button type="info" @click="resetLoginForm">reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import request from 'network/request';


export default {
  name: 'login',
  data(){
    return{
      form:{
        username:'admin',
        password:'123456'
      },
      rules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        password:[
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
          { required: true, message: '请输入密码名', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    // 重置表单数据
    resetLoginForm(){
      console.log(this);
      this.$refs.loginForm.resetFields();
    },
    // 检验输入是否合法并通过
    login(){
      // 获取form实例
      this.$refs.loginForm.validate(valid=>{
        // 验证输入是否合法
        if(valid){
          request({
            url:'/login',
            method:'POST',
            params: {
              username:this.form.username,
              password:this.form.password
            }
          }).then(res=>{
            if(res.meta.status===200){
              // 登录成功则保存token
              window.sessionStorage.setItem('token',res.data.token)
              this.$router.replace('/home')
            }
            else{
              this.$message({
                message: '登陆失败',
                type:'error'
              })
            }
          })
        }
      })
      
    }
  }
};
</script>

<style scoped>
#login-container {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  position: absolute;
  width: 450px;
  height: 300px;
  top: 50%;
  left: 50%;
  background-color: #fff;
  transform: translate(-50%, -50%);
  border-radius: 3px;
}

.avatar-box {
  position: absolute;
  width: 130px;
  height: 130px;
  padding: 10px;
  border: 2px solid #eee;
  background-color: #fff;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow: 0 0 1px #ddd;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}

.login-form{
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  padding: 0 18px;
}

.btns{
  display: flex;
  justify-content: flex-end;
}
</style>