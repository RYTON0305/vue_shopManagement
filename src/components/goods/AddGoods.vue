<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="info" :closable="false" show-icon center></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        status-icon
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <!-- 侧边标签栏 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
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
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catesList"
                :props="cascadeProps"
                @change="catesChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  v-for="(attr,index) in item.attr_vals"
                  :key="index"
                  :label="attr"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals" clearable></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="preViewDialogVisible" width="50%">
      <img class="previewImg" :src="previewPath" :alt="previewName" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";
export default {
  name: "AddGoods",
  data() {
    return {
      activeIndex: "0",

      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: []
      },

      // 添加商品的验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      catesList: [],
      selectedKeys: [],
      // 级联选择器配置对象
      cascadeProps: {
        expandTrigger: "hover",
        // checkStrictly: true,
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },

      manyTableData: [],
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 预览图片路径
      previewPath: "",
      previewName: "",
      preViewDialogVisible: false
    };
  },
  created() {
    this.getCatesList();
  },
  methods: {
    addUser() {
      this.$refs.addFormRef.validate(valid => {
        console.log(valid);
        if (!valid) return;
        // 发起网络请求
        this.$http.post("users", this.addForm).then(({ data: res }) => {
          console.log(res);
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
          this.$message.success(res.meta.msg);
          // 用户添加成功，隐藏添加用户对话框
          this.addDialogVisible = false;
          // 重新获取用户列表
          this.getUserList();
        });
      });
    },
    async getCatesList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.catesList = res.data;
      console.log(this.catesList);
    },
    catesChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
      // this.getParamsList();
    },
    // tab标签页切换判断
    beforeTabLeave(activeIndex, oldActiveIndex) {
      if (oldActiveIndex == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类");
        return false;
      }
    },
    async tabClick() {
      // console.log(this.activeIndex);
      if (this.activeIndex == 1) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = res.data;
        console.log(this.manyTableData);
        // this.$messaage.success(res.meta.msg)
      } else if (this.activeIndex == 2) {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.onlyTableData = res.data;
        console.log(this.onlyTableData);
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);

      this.previewPath = file.response.data.url;
      this.previewName = file.raw.name;
      this.preViewDialogVisible = true;
    },
    // 处理图片移除操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const index = this.addForm.pics.findIndex(x => {
        x.pic = filePath;
      });
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm);
    },
    handleSuccess(res) {
      console.log(res);
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
   addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        console.log(this.addForm);
        if (!valid) return this.$message.warning("请填写必要的表单项");
        const cloneForm = _.cloneDeep(this.addForm);
        cloneForm.goods_cat = cloneForm.goods_cat.join(",");
        // console.log("manyTableData", this.manyTableData);
        // console.log("onlyTableData", this.onlyTableData);
if(!(this.manyTableData&&this.onlyTableData)) return this.$message.warning('请依次填写表单')
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        cloneForm.attrs = this.addForm.attrs;
        console.log("addForm", this.addForm);

        console.log("cloneForm", cloneForm);
        const { data: res } = await this.$http.post('goods',cloneForm);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success('商品添加成功')
        this.$router.push('/goods')

      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
<style lang='less' scoped>
.el-steps {
  margin: 20px 0;
}
.el-cascader-panel {
  height: 300px;
}
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
  float: right;
}
</style>