<template>
  <el-aside :width="isCollapse ? '64px' : '240px'" class="aside">
    <div class="logo">
      <span class="logo-icon">
        <svg
          t="1783339735294"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="28445"
          width="200"
          height="200"
        >
          <path
            d="M883.909124 560.94872l-27.9965-28.01095 27.924251-27.454633-344.013772-340.408546-26.038552 26.038552-26.038552-26.038552-291.055231 288.006322-0.650241 1.293258-52.532272 51.325713 22.801795 22.4261 4.320492 4.248243-28.003725 27.996501-1.575029 1.408856 76.143256 75.355742h4.038721l268.311235 265.500748 26.038552-26.038552 26.038552 26.038552 343.854824-340.264048-1.567804-1.423306zM367.863178 336.203652L491.958118 218.047583l21.067818 21.082268 0.75139-0.758615 0.75139 0.758615 21.067818-21.082268 128.964525 122.772782c-0.75139 1.062061-0.686366 2.882736 0.758615 5.909971 3.496853 7.326052 3.814749 13.293822 2.853837 17.910536l-1.314933 0.903112L581.893715 450.183727V332.005983H449.128891v112.412271L365.002117 363.744983l0.187847 0.0289c0.021675-0.01445-9.334575-12.217312 2.673214-27.570231z m-36.904806 358.434679L187.153896 557.719188l21.999831-24.160076-23.054667-24.282901 135.315215-128.848926c0.274546-0.072249 0.455169-0.057799 0.75139-0.137273 10.952953-3.00556 18.156182-0.33957 22.563373 2.882737l3.511303 3.937572 1.878475 1.820676 0.36847 0.635791 0.072249-0.216747 85.347783 82.631219H312.77329v121.920244h124.882455L339.584907 691.611097a21.024469 21.024469 0 0 1-8.626535 3.027234z m332.909096 32.837186c-1.567804 1.705077-2.261395 3.02001-2.499816 4.118195l-123.964892 118.040471-21.067818-21.067818-0.75139 0.75139-0.75139-0.75139-21.067818 21.067818-132.663675-126.30576c-1.264358-7.723422 0.946462-13.264923 3.395704-16.81235l3.75695-3.178958 80.918918-79.878531v112.238873h132.757598V613.31482l87.739227 84.921513-1.090961-0.173397c-0.050574-0.021675 9.984816 13.380521-4.710637 29.412581z m49.721785-45.581915c-0.577992 0.086699-1.054836 0.101149-1.770101 0.281771-6.618011 1.697852-11.856066 1.365507-15.930912 0.130048l-3.164508-4.320492-87.681427-84.0762h108.698671V471.988485H602.593063l88.815737-87.666977a21.075043 21.075043 0 0 1 14.695453-3.894223l135.091243 128.632179-23.856631 25.106539 23.871081 26.190275-127.620693 121.537324z"
            fill="#d81e06"
            p-id="28446"
          ></path>
        </svg>
      </span>
      <span v-show="!isCollapse" class="logo-text">护理质量管理系统</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      @select="handleSelect"
    >
      <template v-for="item in menuData" :key="item.index">
        <!-- 无子菜单 -->
        <el-menu-item v-if="!item.children" :index="item.index">
          <el-icon><component :is="getIcon(item.icon)" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
        <!-- 有子菜单 -->
        <el-sub-menu v-else :index="item.index">
          <template #title>
            <el-icon><component :is="getIcon(item.icon)" /></el-icon>
            <span>{{ item.title }} </span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue';
import { menuData } from '@/config/menuData';
import * as Icons from '@element-plus/icons-vue';

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
  activeMenu: {
    type: String,
    default: '/nurseHome',
  },
});

const emit = defineEmits(['menu-select']);

const getIcon = (iconName) => {
  return Icons[iconName] || Icons.Menu;
};

const handleSelect = (index) => {
  emit('menu-select', index);
  console.log(index);
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.aside {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  transition: width 0.3s;
  overflow-y: auto;
  border-right: 1px solid $border-light;

  .logo {
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(135deg, #2980b9, #3498db);
    color: #fff;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 1px;
    display: flex;
    flex-direction: row;
    justify-items: center;
    .logo-icon {
      font-size: 32px;
      font-weight: 300;
      .icon {
        width: 50px;
      }
    }

    .logo-text {
      white-space: nowrap;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    background: transparent;
    padding-top: 8px;

    .el-menu-item,
    .el-sub-menu__title {
      margin: 2px 10px;
      border-radius: 8px;
      color: #495057;
      height: 42px;
      line-height: 42px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(52, 152, 219, 0.06);
        color: #2980b9;
      }

      .el-icon {
        color: #6c757d;
        font-size: 18px;
      }
    }

    .el-menu-item.is-active {
      background: rgba(52, 152, 219, 0.1);
      color: #2980b9;
      font-weight: 500;

      .el-icon {
        color: #2980b9;
      }
    }

    .el-sub-menu.is-opened {
      > .el-sub-menu__title {
        color: #2980b9;
        font-weight: 500;
      }
    }

    .el-menu--inline {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      margin: 0 10px;
      padding: 4px 0;

      .el-menu-item {
        padding-left: 50px !important;
        font-size: 13px;
        height: 36px;
        line-height: 36px;
      }
    }
  }
}
</style>
