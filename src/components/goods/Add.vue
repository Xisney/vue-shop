<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 表格区域 -->
    <el-card>
      <!-- 提示信息区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
      ></el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 选项卡区域,整个为一个表单 -->
      <el-form
        :model="addForm"
        ref="addForm"
        label-width="80px"
        label-position="top"
        :rules="addRules"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="props"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in paramsList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(value, index) in item.attr_vals"
                  :key="index"
                  :label="value"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in cateStaticList"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="upPicObj"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>

            <!-- 上传图片的大图对话框 -->
            <el-dialog
              :title="picName"
              :visible.sync="picDialogVisible"
              width="30%"
            >
              <img :src="uploadPicUrl" alt="" class="uploadBigPic" />
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import request from "network/request.js";

// 富文本编辑器
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillEditor } from "vue-quill-editor";

export default {
  created() {
    this.getCateList();
    this.getParams()
    this.getCateStaticList()
  },
  data() {
    return {
      activeIndex: "0",
      addRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入相应数字", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入相应数字", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入相应数字", trigger: "blur" },
        ],
      },
      addForm: {
        goods_name: "",
        goods_cat:[],
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 上传的图片的临时路径，item为对象
        pics: [],
        // 商品介绍
        goods_introduce: "",
        attrs:[]
      },
      // 级联选择器的属性
      props: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      cateList: [],
      paramsList: [],
      cateStaticList: [],
      // 上传url
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      upPicObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      picDialogVisible: false,
      uploadPicUrl: "",
      picName: "",
    };
  },
  methods: {
    // 处理级联选择器
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 获取数据
    getCateList() {
      request({
        url: "categories",
      }).then((res) => {
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.cateList = res.data;
      });
    },
    beforeLeave(activeName, oldActiveName) {
      // 若未选商品分类则拒绝跳转
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    // 选项卡点击事件监听
    tabClick(tab) {
      let index = tab.index;

      if (index === "1") {
        this.getParams();
      } else if (index === "2") {
        this.getCateStaticList();
      }
    },
    // 获取商品参数
    getParams() {
      if (this.cateId) {
        request({
          url: `categories/${this.cateId}/attributes`,
          params: {
            sel: "many",
          },
        }).then((res) => {
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          res.data.forEach((el) => {
            el.attr_vals =
              el.attr_vals.length === 0 ? [] : el.attr_vals.split(" ");
          });
          this.paramsList = res.data;
        });
      }
    },
    // 获取商品属性
    getCateStaticList() {
      if (this.cateId) {
        request({
          url: `categories/${this.cateId}/attributes`,
          params: {
            sel: "only",
          },
        }).then((res) => {
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
          this.cateStaticList = res.data;
        });
      }
    },
    // 点击已上传的文件时的钩子
    handlePreview(file) {
      this.picName = file.name;
      this.uploadPicUrl = file.response.data.url;
      this.picDialogVisible = true;
    },
    // 点击移除文件时的钩子
    handleRemove(file) {
      let tem_path = file.response.data.tmp_path;
      let index = this.addForm.pics.findIndex((el) => el.pic === tem_path);
      this.addForm.pics.splice(index, 1);
    },
    // 上传成功的回调
    uploadSuccess(res) {
      let x = { pic: res.data.tmp_path };
      this.addForm.pics.push(x);
    },
    // 递归实现深拷贝
    deepClone(obj) {
      let cloneObj = Array.isArray(obj) ? [] : {};
      // 不为空且进行深拷贝的为对象
      if (obj && typeof obj === "object") {
        // 遍历key
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (obj[key] && typeof obj[key] === "object") {
              cloneObj[key] = this.deepClone(obj[key])
            }else{
              cloneObj[key] = obj[key]
            }
          }
        }
      }
      return cloneObj
    },
    add(){
      this.$refs.addForm.validate(valid=>{
        if(!valid) return this.$message.error('请完善表单后再进行提交')
        let form = this.deepClone(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理静态参数
        console.log(this.paramsList);
        this.cateStaticList.forEach(el=>{
          this.addForm.attrs.push({
            attr_id:el.attr_id,
            attr_value:el.attr_value
          })
        })
        // 处理动态属性
        this.paramsList.forEach(el=>{
          this.addForm.attrs.push({
            attr_id:el.attr_id,
            attr_value:el.attr_value
          })
        })
        form.attrs = this.addForm.attrs
        request({
          url:'goods',
          method:'post',
          data:form
        }).then(res=>{
          if (res.meta.status!==201) this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          setTimeout(()=>{
            this.$router.back()
          },100)
        })
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
    },
  },
  components: {
    quillEditor,
  },
};
</script>

<style lang="less">
.el-step__title {
  font-size: 13px;
}
.el-steps {
  margin: 15px 0;
}
.ql-editor {
  min-height: 300px;
}
.addBtn {
  margin-top: 15px;
}
.uploadBigPic {
  width: 100%;
}
</style>