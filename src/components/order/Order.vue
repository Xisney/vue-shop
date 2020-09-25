<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 首部区域，搜索与添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单号" prop="order_number"></el-table-column>
        <el-table-column label="商品价格" prop="order_price"></el-table-column>
        <el-table-column label="是否支付" prop="order_pay">
          <template v-slot="scope">
            <el-tag v-if="scope.row.order_pay===1" type="success">已支付</el-tag>
            <el-tag v-else type="danger">未支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发出时间">
          <template v-slot="scope">{{scope.row.create_time | dateFilter}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini">编辑</el-button>
            <el-button type="danger" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

       <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import request from "network/request.js";

export default {
  created(){
    this.getOrderList()
  },
  data(){
    return {
      ordersList:[],
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:5
      },
      total:0
    }
  },
  methods:{
    getOrderList(){
      request({
        url:'orders',
        params:this.queryInfo
      }).then(res=>{
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.ordersList = res.data.goods;
        this.total = res.data.total;
      })
    },
    // 每页显示条数改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getOrderList();
    },
    // 当前页码改变
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrderList();
    },
  },
  filters:{
     dateFilter(value) {
      let date = new Date(value);
      return date.toLocaleString();
    },
  }
}
</script>

<style lang="less" scoped>

</style>