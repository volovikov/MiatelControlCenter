define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsContent.js',
    'text!./templates/vats-property-atc-chime-list.html',
    'css!./css/vatsContent'
], function($, k, u, common, local, atcChimeList) {
    
    var atcChimeListTmpl = k.template(atcChimeList);
    
    var public = {
        myModuleName: 'VatsContentAtcChimeListModule',
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }            
            this.i18n = $.extend(common, local);            
            private.bindEvents.call(this);
            private.render.call(this); 
        }
    };
    var private = {
        bindEvents: function() {
            var that = this;
            
        },
        render: function() {
            var that = this;
            
            html = atcChimeListTmpl({
                i18n: that.i18n,
            });
            that.el.html(html);             
            that.el.find('.combobox').kendoComboBox();
            that.el.find('.tabstrip').kendoTabStrip({
                animation:  {
                    open: {
                        effects: "fadeIn"
                    }
                }
            }); 
            private.renderDiagramTable.call(this);            
        },
        renderDiagramTable: function() {
            this.el.find('#atc-chime-list').kendoGrid({
                columns: [{
                    field: 'id',
                    title: '№',
                    width: '40px'
                },{
                    field: 'chimeName',    
                    title: 'Имя'
                },{ 
                    field: 'chimeFilePreviewUrl',
                    title: 'Миниатюра',
                    template: function(row) {
                        if (row.chimeFilePreviewUrl) {
                            return '<div align="center"><img src="' + row.chimeFilePreviewUrl  + '"></div>';
                        } else {
                            return '';
                        }
                    }
                },{ 
                    field: 'chimeComment',
                    title: 'Коментарий'
                },{ 
                    field: 'chimeOrder',
                    title: 'Порядок сл.'
                },{
                    //command: ["edit", "destroy"], 
                    command: ["destroy"], 
                    title: "&nbsp;",
                    width: "110px"
                }],                
                dataSource: private.getDataSource.call(this),
                pageable: {
                    refresh: true,
                    pageSizes: app.getPageSizes(),
                    buttonCount: 5
                },
                sortable: {
                    mode: "single",
                    allowUnsort: false
                },
                toolbar: ["create"],
                editable: true
            });              
        },
        getDataSource: function() {
            var that = this; 

            return new kendo.data.DataSource({
                transport: {
                    read: function(options) {
                        var sort = {};

                        if (options.data.sort && options.data.sort.length) {
                            sort = {
                                field: options.data.sort[0].field,
                                dir: options.data.sort[0].dir
                            };
                        }
                        $.ajax({
                            url: app.voiceipServerUrl + 'private.php?method=get-atc-chime-list&mccRootPassword=' + app.getMccRootPassword(),
                            type: 'post',
                            data: {
                                sort: sort
                            },                            
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    options.success(r);
                                    app.publish('get-atc-chime-list', r.data);
                                } else {
                                    options.error();
                                }                                    
                            }
                        });
                    },
                    update: function(options)  {
                        $.ajax({
                            url: app.voiceipServerUrl + 'private.php?method=update-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                            type: 'post',
                            data: options.data.models[0],
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    options.success(r);
                                    app.publish('update-atc-chime', r.data);
                                } else {
                                    options.error();
                                }                                    
                            }
                        });                        
                    },
                    destroy: function(options) {
                        $.ajax({
                            url: app.voiceipServerUrl + 'private.php?method=del-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                            type: 'post',
                            data: options.data.models[0],
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    options.success(r);
                                    app.publish('del-atc-chime', options.data.models[0].id);
                                } else {
                                    options.error();
                                }                                    
                            }
                        });    
                    },
                    create: function(options) {
                        $.ajax({
                            url: app.voiceipServerUrl + 'private.php?method=add-atc-chime&mccRootPassword=' + app.getMccRootPassword(),
                            type: 'post',
                            data: options.data.models[0],
                            success: function(resp) {
                                var r = JSON.parse(resp);

                                if (r.success) {
                                    options.success(r);
                                    app.publish('add-atc-chime', r.data);
                                } else {
                                    options.error();
                                }                                    
                            }
                        });
                    },
                    parameterMap: function(options, operation) {
                        if (operation !== 'read' && options.models) {
                            return {models: kendo.stringify(options.models)};
                        }
                    }
                },
                schema: {
                    total: function(resp) {
                        return resp.data.total;
                    },
                    data: function(resp) {
                        if (typeof resp.data == 'undefined') {
                            app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err[203]);    
                        } else if (typeof resp.data.list == 'undefined') {
                            return resp.data;
                        } else {
                            return resp.data.list;
                        }                        
                    },
                    model: {
                        id: "id",
                        fields: {
                            id: {editable: false, nullable: true},
                            chimeName: {},
                            chimeFilePreviewUrl: {editable: false},
                            chimeComment: {},
                            chimeOrder: {defaultValue: 1} //<-- 0 - transparent image
                       }
                    }                    
                },
                autoSync: true,
                batch: true,
                pageSize: app.getGridPageSize(),                
                serverPaging: true,
                serverSorting: true
            });                 
        }
    };
    return public;
});