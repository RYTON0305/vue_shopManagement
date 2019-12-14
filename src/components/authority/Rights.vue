<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 表格区域 -->
      <el-table :data="rightsList" border style="width: 100%" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column align="center" prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag :type="scope.row.level|rightsTypeFilter">{{scope.row.level|rightsLevelFilter}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  filters: {
    rightsLevelFilter (level) {
      switch (level) {
        case '0':
          return '一级'
          break
        case '1':
          return '二级'
          break
        case '2':
          return '三级'
          break
        default:
          return '无'
      }
    },
    rightsTypeFilter (level) {
      switch (level) {
        case '0':
          return ''
          break
        case '1':
          return 'success'
          break
        case '2':
          return 'danger'
          break
        default:
          return ''
      }
    }
  },
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    getRightsList () {
      this.$http.get(`rights/list`).then(({ data: res }) => {
        console.log(res)
        if (res.meta.status !== 200) { return this.$message.error('获取权限列表失败') }
        this.rightsList = res.data
        console.log(this.rightsList)
      })
    }
  }
}
</script>

<style lang='less' scoped>
</style>
