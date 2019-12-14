<template>
  <div>
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>
      <el-row class="cate_opt">
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedKeys"
          :options="catesList"
          :props="cascadeProps"
          @change="catesChange"
        ></el-cascader>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="btnDisable" @click="showAddDialog">添加参数</el-button>
          <el-table :data="manyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="primary"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="item"
                  closable
                  @close="deleteAttrVal(index,scope.row)"
                >{{item}}</el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" border stripe>
              <template slot-scope="scope">
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
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="btnDisable" @click="showAddDialog">添加属性</el-button>
          <el-table :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  type="primary"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="item"
                  closable
                  @close="deleteAttrVal(index,scope.row)"
                >{{item}}</el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作" border stripe>
              <template slot-scope="scope">
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
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加参数表单 -->

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 修改参数表单 -->

      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      catesList: [],
      // 级联选择器配置对象
      cascadeProps: {
        expandTrigger: 'hover',
        // checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 级联选择器选中分类的id数组
      selectedKeys: [],

      // 被激活的页签名称
      activeName: 'many',

      // 参数列表
      manyTableData: [],
      onlyTableData: [],

      // 添加属性的显示隐藏
      addDialogVisible: false,
      editDialogVisible: false,

      // 添加参数表单
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editForm: {},
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCatesList()
  },
  methods: {
    async getCatesList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类失败') }
      this.catesList = res.data
      console.log(this.catesList)
    },
    // 分类级联选择器选项变化后触发
    catesChange () {
      this.getParamsList()
    },
    // 切换Tab进行的操作
    handleTabClick () {
      this.getParamsList()

      console.log(this.activeName)
    },

    // 获取参数列表
    async getParamsList () {
      // 验证是否为三级分类，不是则清空选中数组
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      // 根据选择的分类获取对应的参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      console.log('参数列表', res)

      if (res.meta.status !== 200) { return this.$message.error('获取参数列表失败') }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制每行参数的文本框显示与隐藏
        item.inputVisible = false
        // 每行参数添加文本框的值
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else if (this.activeName === 'only') {
        this.onlyTableData = res.data
      }
      console.log('paramesList', res.data)
      console.log(this.selectedKeys)
    },

    // 显示添加参数对话框
    showAddDialog () {
      this.addDialogVisible = true
    },
    async showEditDialog (attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('获取参数信息失败') }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')

        this.addDialogVisible = false
        this.getParamsList()
      })
    },

    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_sel: this.activeName,
            attr_name: this.editForm.attr_name
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsList()
      })
    },

    deleteParams (attr_id) {
      this.$msgBox
        .confirm('此操作将永久删除该参数, 是否继续?', '删除参数', {
          confirmButtonText: '删除',
          confirmButtonClass: 'deleteButton',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(async () => {
          console.log(attr_id)
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attr_id}`
          )
          console.log(res)
          if (res.meta.status !== 200) { return this.$message.error('参数删除失败') }
          this.$message.success('参数删除成功')

          this.$message({
            type: 'success',
            message: '删除成功!'
          })

          this.getParamsList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVal(row)
    },
    async saveAttrVal (row) {
      // 发起添加参数属性请求
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('修改参数项成功')
    },

    showInput (row) {
      row.inputVisible = true
      // 使文本框获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    deleteAttrVal (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVal(row)
    }
  },
  computed: {
    btnDisable () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    cateId () {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    },
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang='less' scoped>
.cate_opt {
  margin: 15px 0;
}
.deleteButton {
  background-color: red !important;
}

.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
