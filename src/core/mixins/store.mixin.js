import {mapState, mapMutations} from 'vuex';
import {deepCopy, getParentJson} from '../utils/utils';
import * as storeConfig from '../../store.config';

export default {

  computed: {
    ...mapState({
      /**
       * @description 菜单折合状态
       * @type {Boolean}
       * */
      __menuCollapseStatus: state => state.__menu.collapse,
      /**
       * @description 当前菜单的路由父子集合
       * @type {Array}
       * */
      __menuCurrentPaths: state => state.__menu.currentPaths,
      /**
       * @description 原始菜单数据
       * @type {Array}
       * */
      __menuList: state => state.__menu.list,
      /**
       * @description 格式化后的菜单数据
       * @type {Array}
       * */
      __menuFormatList: state => state.__menu.formatList,

    }),
    ...mapState({

      /**
       * @description tags 对象集合
       * @type {Array}
       * */
      __tagsList: state => state.__tags.list,
    }),
    ...mapState({
      /**
       * @description logo 配置
       * @type {Null | Object}
       * */
      __logo: state => state.__base.logo,

    }),
    /**
     * @description 当前路由菜单项
     * @type {Array}
     * */
    __currentRoute() {
      return this.__menuCurrentPaths[this.__menuCurrentPaths.length - 1];
    }

  },
  methods: {
    ...mapMutations('__menu', {
      /**
       * @description 设置菜单的折合状态
       * @param {Boolean}
       * */
      __setMenuCollapseStatus: 'setCollapseStatus',
      /**
       * @description 设置当前菜单的路由父子集合
       * @param {Array}
       * */
      __setMenuCurrentPaths: 'setCurrentPaths',
      /**
       * @description 设置原始菜单数据
       * @param {Array}
       * */
      __setMenuList: 'setList',
    }),
    ...mapMutations('__tags', {
      /**
       * @description 往 tsgs 集合里添加一项
       * @param {Object}
       * */
      __pushTagsList: 'pushList',
      /**
       * @description 删除 tags 的一项
       * @param id {Number}
       * */
      __sliceTagsOneItem: 'sliceOneItem',
      /**
       * 根据 ID 设置一项为 active
       * @param id {Number}
       * */
      __setTagsOneItemActive: 'setOneItemActive'
    }),
    ...mapMutations('__base', {

      __setBaseLogo: 'setLogo',

    }),

    /**
     * @description 设置当前菜单的路由父子集合
     * */
    __initMenuCurrentPaths() {
      let routerName = this.$route.name;
      let activeRouteItem = this.__menuList.find(item => {
        return item.routeName === routerName;
      });
      // 匹配首页
      let homeRouteName = this.$router.resolve('/').resolved.name;
      let home = this.__menuList.find(item => {
        return item.routeName === homeRouteName;
      });

      let paths = home ? [home] : [];
      if (activeRouteItem) {

        // 合并其他
        paths = paths.concat(getParentJson(this.__menuList, activeRouteItem.id).map(item => {
          item = deepCopy(item);
          return item;
        }).reverse());

        // 去重,两个都是首页的情况
        if (paths[0].routeName === paths[1].routeName) {
          paths.length = 1;
        }

        this.__setMenuCurrentPaths(paths);

      } else {

        paths = paths.concat([{routerName: '404', title: '404', children: []}]);
        // 404
        this.__setMenuCurrentPaths(paths);
      }
      this.__setDocumentTitle();
    },
    /**
     * @description 设置文档标题
     * */
    __setDocumentTitle() {
      let __menuCurrentPaths = deepCopy(this.__menuCurrentPaths);
      if (__menuCurrentPaths.length >= 2) {
        __menuCurrentPaths.splice(0, 1);
      }
      document.title = __menuCurrentPaths.map(item => item.title).join('-') + ' - 后台管理系统';
    },
    /**
     * @description 初始化全局 store config
     * @param itemKey {Array}
     * */
    __initStoreConfig(itemKey) {

      Object.keys(storeConfig).forEach(item => {
        if (!itemKey.includes(item)) return;
        this.__setStoreConfig(item, storeConfig[item]);
      });

    },
    /**
     * @description 设置全局 store config
     * @param key {String}
     * @param value {*}
     * */
    __setStoreConfig(key, value) {
      //
      switch (key) {
        case 'menuList':
          this.__setMenuList(deepCopy(value));
          this.__onRouteUpdate();
          break;
        case 'menuCollapseStatus':
          this.__setMenuCollapseStatus(value);
          break;
        case 'logo':
          if (!value) {
            return this.__setBaseLogo(null);
          }

          if (value.hasOwnProperty('path')) {
            if (/^http/.test(value.path)) {
              this.__setBaseLogo({
                path: value.path,
              });
            } else {
              let logo = value.path.split('/');
              logo.splice(0, 1);
              let logoPath = require('../../' + logo.join('/'));
              this.__setBaseLogo({
                path: logoPath,
              });
            }
          }
          if (value.hasOwnProperty('miniPath')) {
            if (/^http/.test(value.miniPath)) {
              this.__setBaseLogo({
                miniPath: value.miniPath,
              });
            } else {
              let miniLogo = value.miniPath.split('/');
              miniLogo.splice(0, 1);
              let miniLogoPath = require('../../' + miniLogo.join('/'));
              this.__setBaseLogo({
                miniPath: miniLogoPath,
              });
            }

          }
          if (value.hasOwnProperty('fixed')) {
            this.__setBaseLogo({
              fixed: value.fixed
            });
          }

          if (value.hasOwnProperty('backgroundColor')) {
            this.__setBaseLogo({
              backgroundColor: value.backgroundColor,
            });
          }

          break;

      }
    },
    /**
     * @description 获取全局 store config
     * @param key {String}
     * */
    __getStoreConfig(key) {

      switch (key) {
        case 'menuList':
          return deepCopy(this.__menuList);
        case 'menuCollapseStatus':
          return this.__setMenuCollapseStatus;
        case 'logo':
          return this.__logo;
      }
    },

  }
};

