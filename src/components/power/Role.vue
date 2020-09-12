<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加用户按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 数据展示区域 -->
      <el-table :data="roleDataList" style="width: 100%" stripe border>
        <el-table-column type="expand">
          <!-- 展示用户角色权限信息 -->
          <template v-slot="scope">
            <el-row
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['bbClass',index1===0?'tbClass':'','vcenter']"
            >
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag closable @close="removeRoleRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2 ,index2) in item1.children"
                  :key="item2.id"
                  :class="[index2!==0?'tbClass':'']"
                >
                  <!-- 二级权限区域 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRoleRight(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限区域 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRoleRight(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleClick(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoleClick(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showAssignDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="adddialogClose"
    >
      <!-- 输入框区域 -->
      <el-form ref="addRoleForm" :model="addRoleForm" label-width="80px" :rules="addRoleRules">
        <el-form-item label="角色名:" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confiemAddRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 输入框区域 -->
      <el-form ref="editRoleForm" :model="editRoleForm" label-width="80px" :rules="editRoleRules">
        <el-form-item label="角色名:" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述:" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confiemEditRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightdialogVisible" width="50%" @close="defaileCheckedNodes=[]">
      <el-tree
        :data="rolesRightList"
        :props="defaultRightProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defaileCheckedNodes"
        ref="roleRightTree"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAssignRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "network/request.js";

export default {
  created() {
    this.getRoleList();
  },
  data() {
    return {
      roleDataList: [],
      addRoleDialogVisible: false,
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      addRoleRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      editRoleDialogVisible: false,
      editRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      editRoleRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      setRightdialogVisible: false,
      defaultRightProps: {
        label: "authName",
        children: "children",
      },
      rolesRightList: [],
      // 分配权限对话框中，默认选中的结点
      defaileCheckedNodes:[],
      // 分配权限所要使用的id
      rightRoleId:''
    };
  },
  methods: {
    // 获取角色列表
    getRoleList() {
      request({
        url: "roles",
      }).then((res) => {
        if (res.meta.status !== 200)
          return this.$message.error("获取角色列表失败");
        this.roleDataList = res.data;
      });
    },
    // 添加角色
    addRole() {
      this.addRoleDialogVisible = true;
    },
    adddialogClose() {
      this.$refs.addRoleForm.resetFields();
    },
    // 确认添加角色
    confiemAddRole() {
      this.$refs.addRoleForm.validate((valid) => {
        // 不合法则直接返回
        if (!valid) return;
        // 发起请求
        request({
          url: "roles",
          method: "post",
          data: this.addRoleForm,
        }).then((res) => {
          if (res.meta.status !== 201)
            return this.$message.error("添加角色失败");
          this.$message.success(res.meta.msg);
          this.addRoleDialogVisible = false;
          this.getRoleList();
        });
      });
    },
    editRoleClick(role) {
      // 根据id查询角色信息
      request({
        url: `roles/${role.id}`,
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.editRoleForm = res.data;
      });
      this.editRoleDialogVisible = true;
    },
    confiemEditRole() {
      this.$refs.editRoleForm.validate((valid) => {
        if (!valid) return;
        request({
          url: `roles/${this.editRoleForm.roleId}`,
          method: "put",
          data: {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          },
        }).then((res) => {
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          this.getRoleList();
          this.$message.success("编辑角色成功");
          this.editRoleDialogVisible = false;
        });
      });
    },
    deleteRoleClick(id) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 发起请求删除角色
          request({
            url: `roles/${id}`,
            method: "delete",
          }).then((res) => {
            if (res.meta.status !== 200) return this.$message.error("删除失败");
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.getRoleList();
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    removeRoleRight(role, rightId) {
      // 移除对应角色权限
      request({
        url: `roles/${role.id}/rights/${rightId}`,
        method: "delete",
      }).then((res) => {
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error("删除权限失败");
        role.children = res.data;
      });
    },
    showAssignDialog(role) {
      request({
        url: "rights/tree",
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error("获取权限失败");
        this.rolesRightList = res.data;
      });
      this.getDefaultNode(role,this.defaileCheckedNodes)
      this.setRightdialogVisible = true;
      this.rightRoleId = role.id;
    },
    // 递归获取默认要显示的三级节点id
    getDefaultNode(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item=>{
        this.getDefaultNode(item,arr)
      })
    },
    confirmAssignRights(){
      const rightIds = [
        ...this.$refs.roleRightTree.getCheckedKeys(),
        ...this.$refs.roleRightTree.getHalfCheckedKeys(),
      ]
      
      // 发起请求授予权限
      request({
        url:`roles/${this.rightRoleId}/rights`,
        method:'post',
        data:{rids:rightIds.join(',')
        }
      }).then(res=>{
        console.log(res);
        if(res.meta.status!==200) return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        this.getRoleList()
        this.setRightdialogVisible = false
      }) 
    }
  },
};
</script>

<style lang="less" scoped>
</style>