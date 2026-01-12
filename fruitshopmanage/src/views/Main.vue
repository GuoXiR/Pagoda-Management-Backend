<template> 
    <el-container class="container">
    <el-header height="50px"> 
    <div class="sys-name">百果园微信商城-管理后台</div>
    <div class="right-box">
    <a href="#"><el-icon><ChatDotSquare /></el-icon></a>
    <a href="#"><el-icon><Setting /></el-icon></a>
    <el-button type="warning" circle><el-icon><User /></el-icon></el-button>
    <span>user</span>
    <a href="#" @click="logout"><i class="el-icon-switch-button"></i></a>
    </div> 
    </el-header>
    <el-container>
    <!-- 导航栏 -->
    <el-aside width="200px">
    <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="el-menu-vertical-demo" 
    text-color="#fff"
    router
    @open="handleOpen"
    @close="handleClose"
    >
    <el-menu-item index="/admin/index">
    <el-icon><House /></el-icon>
    <span>系统首页</span>
    </el-menu-item>
    <el-sub-menu index="2">
    <template #title>
    <el-icon><Handbag /></el-icon>
    <span>产品管理</span>
    </template>
    <el-menu-item-group>
    <el-menu-item index="/admin/category">分类管理</el-menu-item>
    <el-menu-item index="/admin/product-list">产品管理</el-menu-item>
    </el-menu-item-group> 
    </el-sub-menu> 
    <el-sub-menu index="3">
    <template #title>
    <el-icon><User /></el-icon>
    <span>用户管理</span>
    </template>
    <el-menu-item-group>
    <el-menu-item index="/admin/user-list">用户列表</el-menu-item> 
    </el-menu-item-group> 
    </el-sub-menu>
    </el-menu>
    </el-aside>
    <el-container>
    <el-main><router-view/></el-main>
    <el-footer>商城版权所有@All Rights Reserved.</el-footer>
    </el-container>
    </el-container>
    </el-container> 
    </template>
    <script>

    </script>
    <style scoped>
    .container{
    height: 100vh;
    }
    .el-header{
    background-color: #fff;
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    padding-right: 50px;
    line-height: 50px;
    }
    .sys-name{
    font-size: 24px;
    }
    .right-box{
    display: flex;
    align-items: center;
    justify-content: space-around;
    }
    .right-box i,
    .right-box span {
    margin: 0 10px;
    }
    .el-aside {
    background-color: #304156;
    color: #fff;
    }
    .el-main {
    background-color: #eaedf1;
    }
    .el-footer {
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    }
    .el-menu-item.is-active {
    background-color: rgb(67.74, 80) !important;
    }
    </style>