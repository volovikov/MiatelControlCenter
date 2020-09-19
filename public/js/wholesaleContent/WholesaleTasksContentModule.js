define([
  'jquery',
  'kendo',
  'util',
  'i18n!../../js/common/nls/main.js',
  'i18n!./nls/wholesaleContent.js',
  'css!./css/wholesaleContent'
], function ($, k, u, common, local) {

  var public = {
    myModuleName: 'WholesaleTasksContentModule',
    run: function (params) {
      this.treeId = params.treeId;
      this.el = params.el;
      this.i18n = $.extend(common, local);
      private.bindEvents.call(this);
      private.render.call(this);
    }
  };
  var private = {
    bindEvents: function () {
      var that = this;
    },
    render: function () {
      var that = this,
              splitTreeId = this.treeId.split('-');

      if (this.treeId == 8) {
        requirejs(['js/wholesaleContent/WholesaleCrmTasksList.js'], function (module) {
          module.run({
            el: that.el,
            treeId: that.treeId
          });
        });
      } else {
        if (splitTreeId[1] == 1) {//task type
          switch (splitTreeId[2]) {//task level
            case '1':
            case '2':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskAgreement.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '3':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskContractDownload.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '4':
            case '5':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskApplication.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '6':
              requirejs(['js/wholesaleContent/WholesaleCrmTasksMvts.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '7':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskEntryRoutePlans.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '8':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskEntryRatePlans.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '9':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskTesting.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
            case '10':
              requirejs(['js/wholesaleContent/WholesaleCrmTaskClose.js'], function (module) {
                module.run({
                  el: that.el,
                  treeId: that.treeId
                });
              });
              break;
          }
        }
      }
    }
  };
  return public;
});