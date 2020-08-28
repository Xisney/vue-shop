<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 内容卡片 -->
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addUserVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 数据展示区域 -->
      <el-table style="width: 100%" :data="userList" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="用户身份"></el-table-column>
        <el-table-column label="当前状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!-- 相关操作要使用到内部的数据，故而使用作用域插槽 -->
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUserInfo(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserInfo(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="权限操作"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addUserVisible" width="50%" @close="closeAddDialog">
        <el-form ref="addUserForm" :model="addUserForm" label-width="80px" :rules="addUserRules">
          <el-form-item label="用户名:" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="password">
            <el-input v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱:" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话:" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmAddUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户区域 -->
      <el-dialog title="修改用户信息" :visible.sync="editUserVisible" width="50%">
        <el-form ref="editUserForm" :model="editUserForm" label-width="80px" :rules="editUserRules">
          <el-form-item label="用户名:">
            <el-input v-model="editUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱:" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话:" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editUserVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmUserEdit">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import request from "network/request.js";

export default {
  created() {
    this.getUserList();
  },
  data() {
    var checkEmail = (rule, value, callback) => {
      const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

      if (!reg.test(value)) callback(new Error("请输入正确的邮箱"));
      else callback();
    };

    var checkMobile = (rule, value, callback) => {
      const reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;

      if (!reg.test(value)) callback(new Error("请输入正确的手机号"));
      else callback();
    };

    return {
      userList: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      total: 0,
      addUserVisible: false,
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "长度在 6 到 16 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editUserVisible: false,
      editUserForm: {
        username: "",
        email: "",
        mobile: "",
      },
      editUserRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    getUserList() {
      request({
        url: "/users",
        params: this.queryInfo,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message(res.meta.msg);
        this.userList = res.data.users;
        this.total = res.data.total;
      });
    },
    handleSizeChange(nowSize) {
      this.queryInfo.pagesize = nowSize;
      this.getUserList();
    },
    handleCurrentChange(nowPage) {
      this.queryInfo.pagenum = nowPage;
      this.getUserList();
    },
    changeUserState(userInfo) {
      request({
        url: `/users/${userInfo.id}/state/${userInfo.mg_state}`,
        method: "put",
      }).then((res) => {
        if (res.meta.status !== 200) {
          this.$message.error("更新用户状态失败");
          userInfo.mg_state = !userInfo.mg_state;
        } else {
          this.$message.success("更新用户状态成功");
        }
      });
    },
    closeAddDialog() {
      this.$refs.addUserForm.resetFields();
    },
    confirmAddUser() {
      this.$refs.addUserForm.validate((valid) => {
        if (!valid) return;
        // 发起网络请求
        request({
          url: "users",
          method: "post",
          data: this.addUserForm,
        }).then((res) => {
          if (res.meta.status !== 201)
            return this.$message.error("添加用户失败");
          this.getUserList();
          this.$message.success("添加用户成功");
          this.addUserVisible = false;
        });
      });
    },
    editUserInfo(id) {
      this.editUserVisible = true;
      // 发送网络请求
      request({
        url: `users/${id}`,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.editUserForm = res.data;
      });
    },
    confirmUserEdit() {
      this.$refs.editUserForm.validate((valid) => {
        if (!valid) return;

        // 验证有效发送请求更改信息
        request({
          url: `users/${this.editUserForm.id}`,
          method: "put",
          data: {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile,
          },
        }).then((res) => {
          if (res.meta.status !== 200) return this.error(res.meta.msg);
          // 更新成功，重新获取数据
          this.getUserList();
          this.$message.success("更新成功");
          this.editUserVisible = false;
        });
      });
    },
    deleteUserInfo(id) {
      this.$confirm("此操作将永久删除该用户信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 发送请求删除用户信息
          request({
            url: `users/${id}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200)
              return this.$message.error(res.meta.msg);
            this.getUserList()
            this.$message({
              type: "success",
              message: "删除成功!",
            });
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

<style>
</style>