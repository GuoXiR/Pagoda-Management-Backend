<template>
    <div class="container">
    <div class="login-box">
    <div class="left-box">
    <img src="@/assets/slogn.png" alt="">
    </div>
    <div class="right-box">
    <div class="logo">
    <img src="@/assets/logo.png" alt="">
    </div>
    <p>百果园管理后台</p>
    <div class="input-box">
    <img src="@/assets/account.png" class="prefix-icon" alt="">
    <el-input v-model="account" placeholder="请输入账号" class="input-inner"/>
    </div>
    <div class="input-box">
    <img src="@/assets/password.png" class="prefix-icon" alt="">
    <el-input v-model="password" placeholder="请输入密码" class="input-inner"/>
    </div>
    <el-button type="primary" class="login-btn" @click="login">登录</el-button>
    <el-button @click="logout" class="login-btn">退出</el-button>
    </div> 
    </div>
    </div>
    </template>
<script setup>
    import axios from "axios";
    import{ref} from 'vue'
    import{ElMessage} from 'element-plus'
    import{useRouter} from 'vue-router'
    const router=useRouter()

    const account = ref()
    const password = ref()
    const login=async()=>{
    // 数据校验
    if (account.value == "" || password.value == "") {
    ElMessage.error("请输入用户名和密码");
    return;
    }
    let loginForm = {
    username: account.value,
    password: password.value,
    };
    try {
    const { data: res } = await axios.post(`http://127.0.0.1:8088/sysapi/login`, 
    loginForm);
    console.log(res);
    if (res.meta.status !== 200) {
    ElMessage.error("登录失败");
    return
    }
    ElMessage.success("登录成功");
    window.localStorage.setItem("token", res.data.token);
    router.push('/admin/index')
    } catch (e) { 
    console.log("登录失败"+e);
    ElMessage.error("网络错误或服务器异常");
    }
    }
    const logout=async()=>{
    //退出
    window.sessionStorage.clear();
    router.push('/login')
    }
    </script>
    <style scoped>
    .container{
    width: 100vw;
    height: 100vh;
    background-color: #f3f7fa;
    display: flex;
    justify-content: center;
    align-items: center;
    }
    .login-box{
    width: 1000px;
    height: 600px;
    background-color:#fff;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    }
    .left-box{
    width: 424px;
    background-color: #333;
    }
    .left-box img{
    width: 100%;
    height: 100%;
    }
    .right-box{
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    }
    .logo{
    width: 70px;
    height: 70px;
    margin-top: 90px;
    border-radius: 50%;
    overflow: hidden;
    }
    .logo img{
    width: 100%;
    height: 100%;
    }
    .right-box p{
    font-size: 24px;
    font-family: Microsoft YaHei-Bold,Microsoft YaHei;
    font-weight: bold;
    color:#272727;
    margin-bottom: 40px;
    }
    .input-box{
    width: 328px;
    height: 50px;
    background-color:#f1f2f7;
    border-radius: 25px;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    }
    .prefix-icon{
    width: 23px;
    height: 23px;
    margin: 0 8px 0 22px;
    }
    .input-inner{
    width: 240px;
    }
    .login-btn{
    width: 328px;
    height: 45px;
    margin-top: 25px;
    box-sizing: border-box;
    }
    </style>