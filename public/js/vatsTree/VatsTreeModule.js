define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsTree.js',
    'text!./templates/vats-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/vatsTree'
], function($, k, u, common, local, vatsTree, treeModule) {
    
    var vatsTreeTmpl = k.template(vatsTree);

    var public = {
        treeModules: {},
        myModuleName: 'VatsTreeModule',
        mySectionName: 'vats',
        deselectAllNode: function(hashRec) {
            var that = this,
                currentTreeKey = hashRec[1] && hashRec[1].value;

            $.each(that.treeModules, function(key, module) {
                if (key != currentTreeKey) {
                    module.unselectTreeNode();
                }
            });            
        },
        selectActiveNode: function(hashRec) {
            var that = this,
                currentTreeKey  = hashRec[1] && hashRec[1].value,
                currentNodeId = hashRec[2] && hashRec[2].value;
        
            $.each(that.treeModules, function(key, module) {
                if (key == currentTreeKey) {
                    module.selectTreeNode(currentNodeId);
                }
            });
        },
        bindEvents: function() {
            var that = this,
                searchEl = '#main-page-vats-tree .k-i-search',
                resetSearchEl = '#main-page-vats-tree .k-i-close';                    
            
            this.__proto__.bindsEvents.call(this);        

            $(document).off('click', searchEl).on( 'click', searchEl, function() {
                that.onClickSearchBtn.call(that, $(this));
            });
            $(document).off('click', resetSearchEl).on( 'click', resetSearchEl, function() {
                that.onClickResetSearchBtn.call(that, $(this));
            });  
            app.subscribe('hash-change', this.myModuleName, function(hashRec) {
                that.deselectAllNode(hashRec);
                that.selectActiveNode(hashRec);
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;                
            });    
        },          
        run: function(params) {
            var that = this; 
            
            this.treeKey = params && params[0] && params[0].value;
            this.treeId = params && params[1] && params[1].value;                        
            this.i18n = $.extend(common, local); 
            
            this.__proto__.run.call(this, params);
            
            setTimeout(function() {                
                if (that.treeId && that.treeKey) {
                    var scope = that.treeModules[that.treeKey];
                    
                    if (typeof scope.selectTreeNode != 'undefined') {
                        scope.selectTreeNode.call(scope, that.treeId);
                    }
                }
            }, 1000);
        },
        render: function() {
            var that = this;
            
            var html = vatsTreeTmpl({
                i18n: this.i18n
            });            
            this.el.html(html);  
            this.renderToolbar();
            this.renderTree();
        },
        renderToolbar: function() {
            var that = this,
                storage = app.getStorage(),    
                clientsFilter = storage.get('clients-filter') || null,
                inputField = treeModule.getSearchField();
            
            this.toolbar = this.el.find('.tree-toolbar').kendoToolBar({
                items: [{
                    template: inputField,
                    overflow: 'never'
                },{
                    type: 'splitButton',
                    text: 'Действия',
                    overflow: 'always',
                    menuButtons: [{
                        text: 'Перезагрузить дерево',
                        icon: 'refresh',
                        click: function() {
                            if (typeof that.treeId == 'undefined') {
                                for (var moduleName in that.treeModules) {
                                    app.publish(moduleName + '-tree-reload');
                                }                                
                            } else {
                                app.publish(that.treeKey + '-tree-reload');
                            }
                        }
                    },{
                        text: '<div class="k-separator"></div>',
                        attributes: { 
                            'class': 'split-buttons-separator' 
                        }
                    },{
                        text: 'Все мои клиенты',
                        icon: 'search',
                        togglable: true,       
                        group: 'clients',
                        selected: clientsFilter == 'clients-for-me',
                        toggle: function(e) {
                            that.onToggleClientsFilterBtn.call(that, e, 'clients-for-me');
                        }
                    },{
                        text: 'Все активные клиенты',
                        icon: 'search',
                        togglable: true,       
                        group: 'clients',
                        selected: clientsFilter == 'clients-enable',
                        toggle: function(e) {
                            that.onToggleClientsFilterBtn.call(that, e, 'clients-enable');
                        }                        
                    },{
                        text: 'Все пассивные клиенты',
                        icon: 'search',
                        togglable: true,       
                        group: 'clients',
                        selected: clientsFilter == 'clients-disable',
                        toggle: function(e) {
                            that.onToggleClientsFilterBtn.call(that, e, 'clients-disable');
                        }                                                
                    }]
                }],                
            }).data('kendoToolBar');
        },
        getSectionTreeAccess: function(sectionAccessCode) {
            var treeAccess = [];

            if (app.isFullAccessCode(sectionAccessCode)) {
                sectionAccessCode = [{
                    name: 'Клиенты',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Компании',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Телефоны',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Тарифы',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Схемы',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Свойства',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Сервера',
                    section: 'Виртуальная АТС'
                },{
                    name: 'Тесты',
                    section: 'Виртуальная АТС'
                }];
            }
            for (var i in sectionAccessCode) {
                var el = sectionAccessCode[i];
                
                if (el.section == this.i18n.mainPanel.tabs.vats) {
                    treeAccess.push(el.name);
                }                
            }
            return treeAccess;
        },                
        renderTree: function() {
            var user = app.getActiveUser(),
                access = eval(user.sectionAccessCode),
                treeAccess = this.getSectionTreeAccess(access);

            if (treeAccess.indexOf('Клиенты') != -1) {
                this.renderClientsTree();
            }
            if (treeAccess.indexOf('Компании') != -1) {
                this.renderCompanyTree();
            }
            if (treeAccess.indexOf('Телефоны') != -1) {
                this.renderPhonesTree();
            }
            if (treeAccess.indexOf('Тарифы') != -1) {
                this.renderTarifsTree();
            }
            if (treeAccess.indexOf('Схемы') != -1) {
                this.renderChimesTree();
            }            
            if (treeAccess.indexOf('Свойства') != -1) {
                this.renderPropertyTree();
            }
            if (treeAccess.indexOf('Сервера') != -1) {
                this.renderServersTree();
            }
            if (treeAccess.indexOf('Тесты') != -1) {
                this.renderTestsTree();
            }            
        },
        onToggleClientsFilterBtn: function(e, filterName) {
            var toggleBtn = this.el.find('.k-overflow-anchor');
            
            var storage = app.getStorage(),
                clientsFilter = storage.get('clients-filter') || false;

            if (clientsFilter) {
                if (clientsFilter == filterName) {
                    toggleBtn.removeClass('selected');
                    storage.remove('clients-filter');
                    app.publish('clients-tree-filter-reset');
                    this.toolbar.toggle(e.target, false);
                } else {
                    toggleBtn.addClass('selected');
                    storage.set('clients-filter', filterName);
                    app.publish('clients-tree-filter-set', filterName);
                    this.toolbar.toggle(e.target, true);
                }
            } else {
                toggleBtn.addClass('selected');
                storage.set('clients-filter', filterName);
                app.publish('clients-tree-filter-set', filterName);
                this.toolbar.toggle(e.target, true);
            }            
        },        
        renderClientsTree: function() {
            var that = this;

            requirejs(['js/vatsTree/VatsTreeClientsModule'], function(module) {
                that.treeModules['clients'] = module;

                module.run({
                    el: that.el.find('#tree-clients'),
                    treeId: that.treeId
                });
            });
        },
        renderCompanyTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeCompanyModule'], function(module) {
                that.treeModules['company'] = module;

                module.run({
                    el: that.el.find('#tree-company'),
                    treeId: that.treeId
                });
            }); 
        },
        renderPhonesTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreePhonesModule'], function(module) {
                that.treeModules['phone'] = module;
                
                module.run({
                    el: that.el.find('#tree-phone'),
                    treeId: that.treeId
                });
            });
        },
        renderTarifsTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeTariffModule'], function(module) {
                that.treeModules['tariff'] = module;
                
                module.run({
                    el: that.el.find('#tree-tariff'),
                    treeId: that.treeId
                });
            });            
        },
        renderChimesTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeChimeModule'], function(module) {
                that.treeModules['chime'] = module;
                
                module.run({
                    el: that.el.find('#tree-chime'),
                    treeId: that.treeId
                });
            });
        },
        renderPropertyTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreePropertyModule'], function(module) {
                that.treeModules['property'] = module;
                
                module.run({
                    el: that.el.find('#tree-property'),
                    treeId: that.treeId
                });
            });
        },
        renderServersTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeServersModule'], function(module) {
                that.treeModules['servers'] = module;
                
                module.run({
                    el: that.el.find('#tree-servers'),
                    treeId: that.treeId
                });
            });
        },
        renderTasksTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeTasksModule'], function(module) {
                that.treeModules['tasks'] = module;
                
                module.run({
                    el: that.el.find('#tree-tasks'),
                    treeId: that.treeId
                });
            });            
        },
        renderTestsTree: function() {
            var that = this; 

            requirejs(['js/vatsTree/VatsTreeTestsModule'], function(module) {
                that.treeModules['tests'] = module;
                
                module.run({
                    el: that.el.find('#tree-tests'),
                    treeId: that.treeId
                });
            });            
        }        
    };
    public.__proto__ = treeModule;

    return public;
});