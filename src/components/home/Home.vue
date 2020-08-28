<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="~/assets/img/heima.png" alt="logo" />
        <span>后台管理系统</span>
      </div>
      <el-button @click="exit" type="info">退出</el-button>
    </el-header>

    <el-container>
      <el-aside :width="isCollapse ? '64px' :'200px'">
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"	
        >
          <div class="toggle-button" @click="toggle">|||</div>
          <!-- 一级菜单 -->
          <el-submenu :index="'/'+item.path" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="icon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 一级菜单菜单项 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="activePathSet('/'+subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <!-- 路由模板 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import request from "network/request";

export default {
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      icon:{
        125:'iconfont icon-user',
        103:'iconfont icon-tijikongjian',
        101:'iconfont icon-shangpin',
        102:'iconfont icon-danju',
        145:'iconfont icon-baobiao'
      },
      isCollapse:false,
      activePath:''	
    };
  },
  methods: {
    exit() {
      window.sessionStorage.clear();
      this.$router.replace("/login");
    },
    getMenuList() {
      request({
        url: "/menus",
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) return this.$message(res.meta.msg);
        this.menuList = res.data;
      });
    },
    toggle(){
      this.isCollapse = !this.isCollapse
    },
    activePathSet(path){
      this.activePath = path
      window.sessionStorage.setItem('activePath',path)
    }
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 20px;
  padding: 5px 0;
  padding-right: 10px;
  div {
    display: flex;
    align-items: center;
    span{
      margin-left: 10px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}

.iconfont{
  margin-right: 10px;
}

.toggle-button{
  background-color: #4A5064;
  font-size: 14px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  letter-spacing: .2em;
  cursor: pointer;
}
</style>