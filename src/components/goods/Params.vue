<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 警告区域 -->
      <el-alert title="警告：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>

      <el-row>
        <el-col>
          <span>请选择分类：</span>
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            :props="props"
            @change="handleCateChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 选项卡区域 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="disabled" @click="addParamsClick">添加参数</el-button>
          <!-- 表格区域 -->
          <el-table :data="paramsList" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="deleteTagClick(scope.row,index)">{{item}}</el-tag>
                <!-- 输入框于btn切换，实现添加效果 -->
                <el-input
                  class="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParamsClick(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="disabled" @click="addParamsClick">添加参数</el-button>
          <!-- 表格区域 -->
          <el-table :data="paramsList" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="deleteTagClick(scope.row,index)">{{item}}</el-tag>
                <!-- 输入框于btn切换，实现添加效果 -->
                <el-input
                  class="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParamsClick(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加'+title"
      :visible.sync="addParamsdialogVisible"
      width="50%"
      @close="addParamsdialogClose"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsRules"
        ref="addParamsForm"
        label-width="100px"
      >
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddParamsClick">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改'+title"
      :visible.sync="editParamsdialogVisible"
      width="50%"
      @close="editParamsdialogClose"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsRules"
        ref="editParamsForm"
        label-width="100px"
      >
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditParamsClick">确 定</el-button>
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
      activeTabName: "many",
      props: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      // 获取所有分类列表
      cateList: [],
      selectCateKeys: [],
      // 动态或静态参数
      paramsList: [],
      // 添加属性对话框是否可见
      addParamsdialogVisible: false,
      addParamsForm: {
        attr_name: "",
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: "请输入属性名称", trigger: "blur" },
        ],
      },
      // 修改对话框的相关属性
      editParamsdialogVisible: false,
      editParamsForm: {
        attr_name: "",
      },
      editParamsRules: {
        attr_name: [
          { required: true, message: "请输入属性名称", trigger: "blur" },
        ],
      },
      inputVisible:false
    };
  },
  methods: {
    // 监听选项卡点击
    handleTabClick() {
      this.getParamsList();
    },
    handleCateChange() {
      this.getParamsList();
    },
    getCateList() {
      request({
        url: "categories",
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.cateList = res.data;
      });
    },
    getParamsList() {
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.paramsList=[]
        return;
      }
      request({
        url: `categories/${this.cateId}/attributes`,
        params: { sel: this.activeTabName },
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        // 将字符串转变为数组
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          item.inputVisible = false;
          item.inputValue = "";
        });
        this.paramsList = res.data;
      });
    },
    // 添加属性对话框的关闭
    addParamsdialogClose() {
      this.$refs.addParamsForm.resetFields();
    },
    // 点击添加参数的按钮
    addParamsClick() {
      this.addParamsdialogVisible = true;
    },
    // 确认添加参数
    confirmAddParamsClick() {
      // 表单验证
      this.$refs.addParamsForm.validate((valid) => {
        if (!valid) return;
        request({
          url: `categories/${this.cateId}/attributes`,
          method: "post",
          data: {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeTabName,
          },
        }).then((res) => {
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
          this.$message.success(res.meta.msg);
          this.addParamsdialogVisible = false;
          this.getParamsList();
        });
      });
    },
    editParamsdialogClose() {
      this.$refs.editParamsForm.resetFields();
    },
    // 修改参数
    confirmEditParamsClick() {
      this.$refs.editParamsForm.validate((valid) => {
        if (!valid) return;
        request({
          url: `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          method: "put",
          data: {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeTabName,
          },
        }).then((res) => {
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          this.$message.success(res.meta.msg);
          this.editParamsdialogVisible = false;
          this.getParamsList();
        });
      });
    },
    showEditDialog(attrId) {
      // 根据id查询参数
      request({
        url: `categories/${this.cateId}/attributes/${attrId}`,
        params: {
          attr_sel: this.activeTabName,
        },
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.editParamsForm = res.data;
      });
      this.editParamsdialogVisible = true;
    },
    deleteParamsClick(attrId) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 发起请求删除角色
          request({
            url: `categories/${this.cateId}/attributes/${attrId}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) return this.$message.error("删除失败");
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.getParamsList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 确认输入
    handleInputConfirm(row) {
      if(row.inputValue.trim().length===0){
        row.inputValue = ''
        row.inputVisible = false;
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      this.handleAttr(row)
    },
    // 展示输入框
    showInput(row) {
      row.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除tag
    deleteTagClick(row,index){
      row.attr_vals.splice(index,1)
      this.handleAttr(row)
    },
    // 发起网络请求
    handleAttr(row){
      request({
        url:`categories/${this.cateId}/attributes/${row.attr_id}`,
        method:'put',
        data: {
          attr_name:row.attr_name,
          attr_sel:this.activeTabName,
          attr_vals:row.attr_vals.join(' ')
        }
      }).then(res=>{
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg)
        row.inputValue = ''
        row.inputVisible = false;
      })
    }
  },
  computed: {
    disabled() {
      if (this.selectCateKeys.length !== 3) return true;
      return false;
    },
    cateId() {
      if (this.selectCateKeys.length !== 3) return null;
      return this.selectCateKeys[2];
    },
    title() {
      if (this.activeTabName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.el-row {
  margin: 15px 0;
}
.saveTagInput {
  width: 150px;
}
</style>