<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-role">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-button type="primary">添加角色</el-button>
      <!-- 表格区域 -->
      <el-table :data="rolesList" border style="width: 100%" stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(level1,l1) in scope.row.children"
              :key="level1.id"
              :class="['borderBottom',l1==0?'borderTop':'','hCenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  type="primary"
                  @close="deleteRightsById(scope.row,level1.id)"
                >{{level1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- v-for渲染二级权限 -->
                <el-row
                  :class="[l2===0?'':'borderTop','hCenter']"
                  v-for="(level2,l2) in level1.children"
                  :key="level2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="deleteRightsById(scope.row,level2.id)"
                    >{{level2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="level3 in level2.children"
                      closable
                      @close="deleteRightsById(scope.row,level3.id)"
                      :key="level3.id"
                      type="warning"
                    >{{level3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column align="center" prop="level" label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defCheckedRights"
        :props="treeProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  filters: {
    rolesLevelFilter(level) {
      switch (level) {
        case "0":
          return "一级";
          break;
        case "1":
          return "二级";
          break;
        case "2":
          return "三级";
          break;
        default:
          return "无";
      }
    },
    rolesTypeFilter(level) {
      switch (level) {
        case "0":
          return "";
          break;
        case "1":
          return "success";
          break;
        case "2":
          return "danger";
          break;
        default:
          return "";
      }
    }
  },
  data() {
    return {
      rolesList: [],

      // 分配权限对话框的显示和隐藏
      setRightsDialogVisible: false,

      // 树形权限列表
      rightsTree: [],

      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },

      // 默认选中的权限数组
      defCheckedRights: [],

      // 即将分配角色的ID
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    getRolesList() {
      this.$http.get(`roles`).then(({ data: res }) => {
        if (res.meta.status !== 200)
          return this.$message.error("获取角色列表失败");
        this.rolesList = res.data;
        console.log(this.rolesList);
      });
    },
    deleteRightsById(role, rightsId) {
      this.$msgBox
        .confirm("此操作将永久删除该权限, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(_ => {
          this.$http
            .delete(`roles/${role.id}/rights/${rightsId}`)
            .then(({ data: res }) => {
              if (res.meta.status !== 200) {
                return this.$message.error("删除失败");
              }
              this.$message.success("成功删除权限");

              // this.getRolesList()会使页面重新渲染，导致打开的表格项目关闭，而delete请求的响应数据是最新的权限数据所以只需更改
              role.children = res.data;
            });
        })
        .catch(_ => {
          this.$message.info("已取消删除");
        });
    },

    async showSetRightsDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return thie.$message.error("权限获取失败");
      this.getLeapKeys(role, this.defCheckedRights);
      this.rightsTree = res.data;
      this.setRightsDialogVisible = true;
    },

    // 递归获取该行角色下所有三级权限的id，并存取到数组中
    getLeapKeys(node, arr) {
      // 如果节点不包含子节点，则为三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeapKeys(item, arr));
    },

    // 监听分配角色对话框的关闭事件
    setRightsDialogClose() {
      this.defCheckedRights = [];
    },

    // 分配角色权限
   async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      console.log(keys);
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      });
      if (res.meta.status !== 200) return this.$message.error("分配权限失败");
      this.$message.success("分配权限成功");
      this.getRolesList();
      this.setRightsDialogVisible = false;
    }
  }
};
</script>

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top: solid 1px #eee;
}
.borderBottom {
  border-bottom: solid 1px #eee;
}
.hCenter {
  display: flex;
  align-items: center;
}
</style>