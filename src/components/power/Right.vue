<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加用户按钮区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加权限</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="rightDataList" style="width: 100%" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot="scope">
            <el-tag type="danger" v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="info" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from "network/request.js";

export default {
  created() {
    this.getRightData();
  },
  data() {
    return {
      rightDataList: [],
    };
  },
  methods: {
    getRightData() {
      request({
        url: `rights/list`,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.rightDataList = res.data;
        console.log(this.rightDataList);
      });
    },
  },
};
</script>

<style lang="less" scoped>
</style>