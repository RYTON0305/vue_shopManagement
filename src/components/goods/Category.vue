<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <tree-table
        class="TreeTable"
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i v-if="!scope.row.cat_deleted" class="el-icon-success"></i>
          <i v-else class="el-icon-error"></i>
        </template>

        <!-- 分类等级 -->
        <template slot="catesLevel" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level==0" type="primary">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
          <el-tag v-else-if="scope.row.cat_level==2" type="warning">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="catesOpt" slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" type="primary">编辑</el-button>
          <el-button size="mini" icon="el-icon-delete" type="danger">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类 的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 添加分类的验证表单 -->
      <el-form
        status-icon
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 父级分类级联选择框 -->
          <el-cascader
            clearable
            v-model="selectedKeys"
            :options="parentCatesList"
            :props="cascadeProps"
            @change="parentCatesChange"
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 的对话框 -->
    <!-- <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose"> -->
    <!-- 修改用户 的表单 -->
    <!-- <el-form
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
    </el-dialog>-->

    <!-- 分配角色 的对话框 -->
    <!-- <el-dialog
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
    </el-dialog>-->
  </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    return {
      // 获取用户参数列表的对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catesList: [],
      total: 0,

      // 控制添加分类对话框的显示和隐藏
      addDialogVisible: false,

      // 添加分类的表单数据
      addForm: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        cat_level: 0
      },
      addFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },

      // TreeTable的列属性
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '分类等级',
          type: 'template',
          template: 'catesLevel'
        },
        {
          label: '操作',
          type: 'template',
          template: 'catesOpt'
        }
      ],

      // 父级分类列表
      parentCatesList: [],

      // 级联选择器配置对象
      cascadeProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 级联选择器选中分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCatesList()
  },
  methods: {
    async getCatesList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类失败') }
      this.catesList = res.data.result
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCatesList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getCatesList()
    },

    // 监听添加用户对话框关闭的操作
    addDialogClose (done) {
      console.log(done)
      // this.$msgBox
      //   .confirm("确认关闭？")
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm = {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      }
    },
    // 点击按钮，添加新分类
    addCate () {
      this.$refs.addFormRef.validate(valid => {
        console.log(valid)
        if (!valid) return
        // 发起网络请求
        this.$http.post('categories', this.addForm).then(({ data: res }) => {
          console.log(res)
          if (res.meta.status !== 201) return this.$message.error('分类添加失败')
          this.$message.success('分类添加成功')
          // 分类添加成功，隐藏添加分类对话框
          this.addDialogVisible = false
          // 重新获取分类列表
          this.getCatesList()
        })
      })
    },

    // 获取父级分类的数据列表
    getParentCatesList () {
      this.$http.get('categories').then(({ data: res }) => {
        console.log(res)
        if (res.meta.status !== 200) { return this.$message.error('获取父级分类失败') }
        // 存取父级分类列表
        this.parentCatesList = res.data
        console.log(this.parentCatesList)
      })
    },
    // 展示添加分类对话框
    showAddDialog () {
      this.getParentCatesList()
      this.addDialogVisible = true
    },

    // 父级分类级联选择器选项变化后触发
    parentCatesChange () {
      // 选中的分类长度为0，默认为一级分类
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
      console.log(this.selectedKeys)
    },

    // 展示修改用户 的对话框
    showEditDialog (id) {
      this.editDialogVisible = true
      this.$http.get(`users/${id}`).then(({ data: res }) => {
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // this.$message.success(res.meta.msg)
        // console.log('qian',this.editForm)

        this.editForm = res.data
        console.log('editForm', this.editForm)
      })
    },

    // 监听修改用户 对话框关闭的操作
    editDialogClose () {
      // this.$msgBox
      //   .confirm("确认关闭？")
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
      this.$refs.editFormRef.resetFields()
    },

    // 修改用户表单 提交
    editFormChange () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return
        this.$http
          .put(`users/${this.editForm.id}`, {
            mobile: this.editForm.mobile,
            email: this.editForm.email
          })
          .then(({ data: res }) => {
            console.log('res', res)
            if (res.meta.status !== 200) { return this.$message.error('更新用户信息失败') }
            this.editDialogVisible = false
            this.getUserList()
            this.$message.success('修改成功')
          })
      })
    },

    // 删除用户
    deleteUserById (id) {
      this.$msgBox
        .confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(_ => {
          this.$http.delete(`users/${id}`, id).then(({ data: res }) => {
            if (res.meta.status !== 200) return this.$message.error('删除失败')
          })
          this.$message.success('删除成功')
          this.getUserList()
        })
        .catch(_ => {
          this.$message.info('已取消删除')
        })
    },

    // 分配角色
    async allotRoles (userInfo) {
      console.log(userInfo)
      this.userInfo = userInfo
      // 请求角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败') }
      this.rolesList = res.data
      console.log('rolesList', this.rolesList)

      this.allotDialogVisible = true
    },

    // 提交 分配角色
    async saveRoleInfo () {
      if (!this.selectRolesId) return this.$message.error('请选择要分配的角色')
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          id: this.userInfo.id,
          rid: this.selectRolesId
        }
      )
      if (res.meta.status !== 200) return this.$message.error('角色分配失败')
      this.$message.success('分配角色成功')
      this.allotDialogVisible = false

      this.getUserList()
    },

    // 监听分配用户对话框的关闭
    allotRolesDialogClose () {
      this.selectRolesId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang='less' scoped>
.el-icon-success {
  color: #0e9eb0;
  font-size: 15px;
}
.el-icon-error {
  color: #f56c6c;
  font-size: 15px;
}
.TreeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
