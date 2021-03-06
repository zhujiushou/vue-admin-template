<template>
  <div class="base-layout">


    <div class="layout-menu-p">
      <vue-scroll :ops="scrollOptions">

        <div class="layout-menu"
             :class="{
            'layout-menu-collapse': __menuCollapseStatus,
            'exist-logo': __logo,
            'fixed-logo': __logo && __logo.fixed
         }">

          <div v-if="__logo" class="logo" :style="{backgroundColor: __logo.backgroundColor}">
            <img :src="__menuCollapseStatus ? __logo.miniPath : __logo.path"/>
          </div>

          <el-menu :default-active="$route.name" @select="onMenuSelect" background-color="#2a3f54" text-color="#ffffff"
                   class="layout-menu-ls" :collapse="__menuCollapseStatus">
            <menu-component :menu-list="__menuFormatList"/>
          </el-menu>
        </div>
      </vue-scroll>
    </div>

    <div class="layout-content" :class="{'layout-content-collapse': __menuCollapseStatus}">
      <div class="layout-header">
        <header-component/>
      </div>
      <div class="layout-page-tags">
        <page-tags-component/>
      </div>
      <div class="layout-body" :class="[$route.name + '-page-body']">
        <section v-for="item in __tagsList" :key="item.id">
          <keep-alive>
            <router-view v-if="$route.name === item.routeName"/>
          </keep-alive>
        </section>
      </div>
    </div>
  </div>
</template>

<script>

  import {sleep} from '../../utils/utils';
  import vueScroll from 'vuescroll';

  const MenuComponent = () => import('../components/menu.component');
  const HeaderComponent = () => import('../components/header.component');
  const PageTagsComponent = () => import('../components/page-tags.component');


  export default {
    components: {
      MenuComponent,
      HeaderComponent,
      PageTagsComponent,
      vueScroll
    },
    data() {
      return {
        scrollOptions: {
          rail: {
            opacity: 0,
          },
          bar: {
            size: '6px',
            showDelay: 500,
            keepShow: false,
            background: '#ffffff',
            opacity: .2,
            specifyBorderRadius: '0',
            onlyShowBarOnScroll: false
          }
        }
      };
    },

    async created() {

      this.__initStoreConfig(['menuList', 'menuCollapseStatus', 'logo']);
      // -------------
      if (this.__menuList.length > 0) {
        this.__onRouteUpdate();
      }

    },
    watch: {
      $route() {
        this.__onRouteUpdate();
      }
    },
    methods: {
      /**
       * @description 监听菜单选中
       * @doc https://element.eleme.cn/#/zh-CN/component/menu
       * */
      onMenuSelect(index, path, itemVm) {
        // 优先级 routeName -> link
        let item = itemVm.$attrs['data-item'];

        if (!item.hasOwnProperty('routeName')
          && !item.hasOwnProperty('link')
        ) {
          return this.routeTo404();
        }
        // 匹配
        let resolved = this.$router.resolve({
          name: item.routeName
        });

        if (resolved.resolved.matched.length === 0) {
          return this.routeTo404();
        }

        if (item.hasOwnProperty('routeName')) {
          return this.$router.push2({
            path: item.routeName
          });
        }
        // 外部链接
        if (item.hasOwnProperty('link') && /^http/.test(item.link)) {
          window.open(item.link);
        }
      },
      /**
       * @description 未匹配到路由跳转至 404
       * */
      routeTo404() {
        return this.$router.push2({path: '/404'});
      },

    }

  };
</script>

<style scoped lang="scss">

</style>
