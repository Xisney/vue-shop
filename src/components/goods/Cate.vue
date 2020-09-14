<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :show-row-hover="false"
        :index-text="'#'"
        show-index
        :selection-type="false"
        border
        :expand-type="false"
        class="tree-table"
      >
        <!-- 自定义渲染列 -->
        <template v-slot:isOk="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>

        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="info" v-if="scope.row.cat_level===2">三级</el-tag>
        </template>

        <template v-slot:opts="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCateClick(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addGooddialogVisible"
      width="50%"
      @close="addGooddialogClose"
    >
      <el-form
        ref="addGoodCateForm"
        :model="addGoodCateForm"
        label-width="80px"
        :rules="addGoodCateRules"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addGoodCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="选择类别">
          <el-cascader
            v-model="selectAddCate"
            :options="cateAddList"
            :props="cateAddProps"
            @change="handleAddCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addGooddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "network/request.js";

export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      cateList: [],
      queryInfo: {
        type: "",
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      columns: [
        { label: "分类名称", prop: "cat_name" },
        // 定义为模板列，自定义渲染内容
        { label: "是否有效", type: "template", template: "isOk" },
        // 定义为模板列，自定义渲染内容
        { label: "等级", type: "template", template: "order" },
        { label: "操作", type: "template", template: "opts" },
      ],
      addGooddialogVisible: false,
      addGoodCateForm: {
        cat_name: "",
        // 默认为一级分类,父分类为0
        cat_pid: 0,
        // 分类层级默认为0，表示一级分类
        cat_level: 0,
      },
      addGoodCateRules: {
        cat_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" },
        ],
      },
      cateAddList: [],
      cateAddProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true,
      },
      selectAddCate: [],
    };
  },
  methods: {
    getCateList() {
      request({
        url: "categories",
        params: this.queryInfo,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        console.log(res);
        this.total = res.data.total;
        this.cateList = res.data.result;
      });
    },
    // 添加角色的方法
    addCate() {
      this.getCateAddList();
      this.addGooddialogVisible = true;
    },
    handleSizeChange(size) {
      this.queryInfo.pagesize = size;
      this.getCateList();
    },
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num;
      this.getCateList();
    },
    // 获取前两层的分类数据
    getCateAddList() {
      request({
        url: "categories",
        params: { type: 2 },
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.cateAddList = res.data;
      });
    },
    handleAddCateChange() {
      // 选项发生变化，更新相应参数
      if (this.selectAddCate.length !== 0) {
        this.addGoodCateForm.cat_pid = this.selectAddCate[
          this.selectAddCate.length - 1
        ];
        this.addGoodCateForm.cat_level = this.selectAddCate.length;
      } else {
        this.addGoodCateForm.cat_pid = 0;
        this.addGoodCateForm.cat_level = 0;
      }
    },
    // 确认添加分类
    confirmAddCate() {
      // 验证表单
      this.$refs.addGoodCateForm.validate((valid) => {
        if (!valid) return;
        request({
          url: "categories",
          method: "POST",
          data: this.addGoodCateForm,
        }).then((res) => {
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
          this.$message.success(res.meta.msg);
          this.getCateList();
          this.addGooddialogVisible = false;
        });
      });
    },
    addGooddialogClose() {
      this.$refs.addGoodCateForm.resetFields();
      this.selectAddCate = [];
    },
    deleteCateClick(cid) {
      this.$confirm("此操作将永久删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 发起请求删除角色
          request({
            url: `categories/${cid}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) return this.$message.error("删除失败");
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.getCateList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>