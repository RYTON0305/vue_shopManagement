<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索用户区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            @keyup.enter.native="getUserList"
            clearable
            @clear="getUserList"
            v-model="queryInfo.query"
            placeholder="请输入内容"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
          </template>
        </el-table-column>
        <el-table-column width="180px" label="操作">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              size="mini"
            ></el-button>

            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            ></el-button>

            <!-- 分配角色 文字提示 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <!-- 分配角色 按钮 -->
              <el-button
                @click="allotRoles(scope.row)"
                type="warning"
                icon="el-icon-s-tools"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1,2,5,10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户 的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 添加用户的验证表单 -->
      <el-form
        status-icon
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- 修改用户 的表单 -->
      <el-form
        status-icon
        :model="editForm"
        :rules="addFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editFormChange">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色 的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="allotDialogVisible"
      width="50%"
      @close="allotRolesDialogClose"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectRolesId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="allotDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱地址"));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
      if (regMobile.test(value)) {
        // 合法的手机号
        return cb();
      }
      cb(new Error("请输入合法的手机号码"));
    };
    return {
      // 获取用户参数列表的对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,

      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,

      // 添加用户的表单数据
      addForm: {
        username: "",
        password: ""
      },

      // 添加用户的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
        ],
        mobile: [
          { required: false, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ],
        email: [
          { required: false, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ]
      },

      // 修改用户对话框的显示和隐藏
      editDialogVisible: false,

      // 查询到的用户数据
      editForm: {
        username: "",
        mobile: "",
        email: ""
      },

      // 分配角色用户对话框的显示和隐藏
      allotDialogVisible: false,

      // 需要被分配的用户信息
      userInfo: {},

      // 角色列表
      rolesList: [],

      // 已选中的角色id
      selectRolesId: ""
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userList = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听Switch开关状态的改变
    async userStateChange(userInfo) {
      console.log("userInfo", userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    // 监听添加用户对话框关闭的操作
    addDialogClose(done) {
      console.log(done);
      // this.$msgBox
      //   .confirm("确认关闭？")
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮，添加新用户
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

    // 展示修改用户 的对话框
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

    // 监听修改用户 对话框关闭的操作
    editDialogClose() {
      // this.$msgBox
      //   .confirm("确认关闭？")
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
      this.$refs.editFormRef.resetFields();
    },

    // 修改用户表单 提交
    editFormChange() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put(`users/${this.editForm.id}`, {
            mobile: this.editForm.mobile,
            email: this.editForm.email
          })
          .then(({ data: res }) => {
            console.log("777777777777777777777777777777777777");
            console.log("res", res);
            if (res.meta.status !== 200)
              return this.$message.error("更新用户信息失败");
            this.editDialogVisible = false;
            this.getUserList();
            this.$message.success("修改成功");
          });
      });
    },

    // 删除用户
    deleteUserById(id) {
      this.$msgBox
        .confirm("此操作将永久删除该用户, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(_ => {
          this.$http.delete(`users/${id}`, id).then(({ data: res }) => {
            if (res.meta.status !== 200) return this.$message.error("删除失败");
          });
          this.$message.success("删除成功");
          this.getUserList();
        })
        .catch(_ => {
          this.$message.info("已取消删除");
        });
    },

    // 分配角色
    async allotRoles(userInfo) {
      console.log(userInfo);
      this.userInfo = userInfo;
      // 请求角色列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
      console.log("rolesList", this.rolesList);

      this.allotDialogVisible = true;
    },

    // 提交 分配角色
    async saveRoleInfo() {
      if (!this.selectRolesId) return this.$message.error("请选择要分配的角色");
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          id: this.userInfo.id,
          rid: this.selectRolesId
        }
      );
      if (res.meta.status !== 200) return this.$message.error("角色分配失败");
      this.$message.success("分配角色成功");
      this.allotDialogVisible = false;

      this.getUserList();
    },

    // 监听分配用户对话框的关闭
    allotRolesDialogClose() {
      this.selectRolesId = "";
      this.userInfo = {};
    }
  }
};
</script>

<style lang='less' scoped>
</style>