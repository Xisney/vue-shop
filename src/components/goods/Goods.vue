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
        <el-col :span="8">
          <el-button type="primary" @click="addGoodClick">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域，展示数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="80px"></el-table-column>
        <el-table-column label="商品数量" prop="goods_number" width="80px"></el-table-column>
        <el-table-column label="上架时间" width="200px">
          <template v-slot="scope">{{scope.row.add_time | dateFilter}}</template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template v-slot="scope">
            <el-button type="primary" size="mini">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteGoodClick(scope.row.goods_id)">删除</el-button>
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
  created() {
    this.getGoodsList();
  },
  data() {
    return {
      queryInfo: {
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
    };
  },
  methods: {
    getGoodsList() {
      request({
        url: "goods",
        params: this.queryInfo,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.goodsList = res.data.goods;
        this.total = res.data.total;
      });
    },
    // 每页显示条数改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.goodsList();
    },
    // 当前页码改变
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getGoodsList();
    },
    // 删除商品
    deleteGoodClick(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          request({
            url: `goods/${id}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200)
              return this.$message.error(res.meta.msg);
            this.getGoodsList();
          });
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
    addGoodClick(){
      this.$router.push('/goods/add')
    }
  },
  filters: {
    dateFilter(value) {
      let date = new Date(value);
      return date.toLocaleString();
    },
  },
};
</script>

<style lang="less" scoped>
</style>