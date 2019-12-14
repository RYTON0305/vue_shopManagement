<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索订单区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格 -->
      <el-table :data="ordersList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==1">已付款</el-tag>
            <el-tag type="danger" v-if="scope.row.order_pay==0">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editOrders"></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showLogisticsProgress"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            expand-trigger="hover"
            :options="cityOptions"
            :value="city"
            @change="changeProvince"
            change-on-select
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度 -->
    <el-dialog title="物流进度" :visible.sync="logisticsDialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logisticInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityOptions from "@/assets/provinces-china/city_data2017_element.js";
export default {
  name: "Orders",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      ordersList: [],

      // 修改地址对话框的显示和隐藏
      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressRules: {
        address1: [
          {
            required: true,
            message: "请选择省/区市县",
            trigger: "blur"
          }
        ],
        address2: [
          {
            required: true,
            message: "请输入详细地址",
            trigger: "blur"
          }
        ]
      },

      // 省市数据
      cityOptions: cityOptions,
      city: 0,

      logisticsDialogVisible: false,

      // 物流信息列表
      logisticInfo: []
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
    },
    async getOrdersList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      // this.$message.success(res.meta.msg)
      this.ordersList = res.data.goods;
      this.total = res.data.total;
      console.log(res.data);
    },

    editOrders() {
      this.editDialogVisible = true;
    },

    editDialogClose() {
      this.$refs.addressFormRef.resetFields();
    },

    changeProvince() {},
    // 展示物流信息
    async showLogisticsProgress() {
      this.logisticsDialogVisible = true;

      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.message);
      this.logisticInfo = res.data;
      console.log(this.logisticInfo);
      // this.$message.success(res.meta.message);
    }
  }
};
</script>
<style lang='less' scoped>
@import '../../plugins/timeline/timeline.css';
@import '../..//plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%;
}
</style>