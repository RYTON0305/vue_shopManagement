<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            @keyup.enter.native="getGoodsList"
            clearable
            @clear="getGoodsList"
            v-model="queryInfo.query"
            placeholder="请输入内容"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="500"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">{{scope.row.add_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column width="130px" label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row)"
              size="mini"
            ></el-button>

            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoodsById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    return {
      // 获取商品参数列表的对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      total: 0
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo
      });
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // this.$message.success("获取商品列表成功");
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },

goAddPage(){
  this.$router.push('/goods/addGoods')
},
    // 展示修改商品 的对话框
    showEditDialog(id) {
      this.editDialogVisible = true;
      this.$http.get(`users/${id}`).then(({ data: res }) => {
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        // this.$message.success(res.meta.msg)
        // console.log('qian',this.editForm)

        this.editForm = res.data;
        console.log("editForm", this.editForm);
      });
    },

    // 监听修改商品 对话框关闭的操作
    editDialogClose() {
      // this.$msgBox
      //   .confirm("确认关闭？")
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
      this.$refs.editFormRef.resetFields();
    },

    // 修改商品表单 提交
    editFormChange() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put(`users/${this.editForm.id}`, {
            mobile: this.editForm.mobile,
            email: this.editForm.email
          })
          .then(({ data: res }) => {
            console.log("res", res);
            if (res.meta.status !== 200)
              return this.$message.error("更新商品信息失败");
            this.editDialogVisible = false;
            this.getGoodsList();
            this.$message.success("修改成功");
          });
      });
    },

    // 删除商品
    deleteGoodsById(id) {
      this.$msgBox
        .confirm("此操作将永久删除该商品, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(_ => {
          this.$http.delete(`goods/${id}`, id).then(({ data: res }) => {
            if (res.meta.status !== 200) return this.$message.error("删除失败");
          });
          this.$message.success("删除成功");
          this.getGoodsList();
        })
        .catch(_ => {
          this.$message.info("已取消删除");
        });
    }
  }
};
</script>

<style lang='less' scoped>
</style>