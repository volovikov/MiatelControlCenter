define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelTree.js',
    'text!./templates/miatel-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/miatelTree'
], function($, k, u, common, local, miatelTree, treeModule) {
    
    var miatelTreeTmpl = k.template(miatelTree);
    
    var public = {        
        treeModules: {},
        myModuleName: 'ContentTreeModule',
        mySectionName: 'miatel',     
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
                searchEl = '#main-page-miatel-tree .k-i-search',
                resetSearchEl = '#main-page-miatel-tree .k-i-close';
            
            this.__proto__.bindsEvents.call(this);      
         
            $(document).off('click', searchEl).on( 'click', searchEl, function() {
                that.onClickSearchBtn.call(that, $(this));
            });
            $(document).off('click', resetSearchEl).on( 'click', resetSearchEl, function() {
                that.onClickResetSearchBtn.call(that, $(this));
            });  
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
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
            this.__proto__.run.call(this, params);            
        },
        render: function() {
            var html = miatelTreeTmpl({
                i18n: this.i18n
            });
            this.el.html(html);  
            this.renderToolbar();
            this.renderTree();
        },
        renderToolbar: function() {
            var that = this,
                storage = app.getStorage(),
                tasksFilter = storage.get('tasks-filter') || null,
                inputField = treeModule.getSearchField();
        
            this.toolbar = this.el.find('.tree-toolbar').kendoToolBar({
                items: [{
                    template: inputField,
                    overflow: 'never',
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
                        text: 'Все задачи для меня',
                        icon: 'search',
                        togglable: true,       
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-for-me-all',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-for-me-all');
                        }
                    },{
                        text: 'Все новые задачи для меня',
                        icon: 'search',
                        togglable: true,
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-for-me-new',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-for-me-new');                            
                        }
                    },{
                        text: 'Все задачи в работе для меня',
                        icon: 'search', // columns, hbars, vbars, sum, more
                        togglable: true,
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-for-me-inwork',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-for-me-inwork');                            
                        }
                    },{
                        text: '<div class="k-separator"></div>',
                        attributes: { 
                            'class': 'split-buttons-separator' 
                        }
                    },{
                        text: 'Все задачи от меня',
                        icon: 'search',
                        togglable: true,
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-from-me-all',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-from-me-all');                            
                        }                        
                    },{
                        text: 'Все новые задачи от меня',
                        icon: 'search',
                        togglable: true,
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-from-me-new',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-from-me-new');                            
                        }                        
                    },{
                        text: 'Все задачи в работе от меня',
                        icon: 'search',
                        togglable: true,
                        group: 'tasks',
                        selected: tasksFilter == 'tasks-from-me-inwork',
                        toggle: function(e) {
                            that.onToggleTasksFilterBtn.call(that, e, 'tasks-from-me-inwork');                            
                        }                        
                    },{
                        text: '<div class="k-separator"></div>',
                        attributes: { 
                            'class': 'split-buttons-separator' 
                        }
                    },{
                        text: 'Пометить группу как прочитанное',
                        click: function() {
                            that.onClickSetNodeRead.call(that);
                        }
                    },{
                        text: 'Пометить группу как не прочитанное',
                        click: function() {
                            that.onClickSetNodeUnread.call(that);
                        }
                    }]
                }],                
            }).data('kendoToolBar');
        },
        getSectionTreeAccess: function(sectionAccessCode) {
            var treeAccess = [];

            if (app.isFullAccessCode(sectionAccessCode)) {
                sectionAccessCode = [{
                    name: 'Задачи',
                    section: 'Миател'
                },{
                    name: 'Сотрудники',
                    section: 'Миател'
                },{
                    name: 'Сайт',
                    section: 'Миател'
                }];
            }
            for (var i in sectionAccessCode) {
                var el = sectionAccessCode[i];

                if (el.section == this.i18n.mainPanel.tabs.miatel) {
                    treeAccess.push(el.name);
                }                
            }
            treeAccess.push('Сотрудники'); //<-- for all
            return treeAccess;
        },        
        renderTree: function() {
            var user = app.getActiveUser(),
                access = eval(user.sectionAccessCode),
                treeAccess = this.getSectionTreeAccess(access);

            if (treeAccess.indexOf("Задачи") != -1) {
                this.renderTasksTree();
            }
            if (treeAccess.indexOf("Сотрудники") != -1) {
                this.renderCompanyMembersTree();
            }
            if (treeAccess.indexOf("Сайт") != -1) {
                this.renderCompanySiteTree();
            }            
        }, 
        renderTasksTree: function() {
            var that = this; 

            requirejs(['js/miatelTree/MiatelTreeTasksModule'], function(module) {
                that.treeModules['tasks'] = module;
                
                module.run({
                    el: that.el.find('#tree-task'),
                    treeId: that.treeId
                });
            });
        },
        renderCompanyMembersTree: function() {
            var that = this;

            requirejs(['js/miatelTree/MiatelTreeMembersModule'], function(module) {
                that.treeModules['members'] = module;
                
                module.run({
                    el: that.el.find('#tree-company-members'),
                    treeId: that.treeId
                });
            });            
        },
        renderCompanySiteTree: function() {
            var that = this;

            requirejs(['js/miatelTree/MiatelTreeSiteModule'], function(module) {
                that.treeModules['site'] = module;
                
                module.run({
                    el: that.el.find('#tree-company-site'),
                    treeId: that.treeId
                });
            });            
        },        
        onToggleTasksFilterBtn: function(e, filterName) {
            var toggleBtn = this.el.find('.k-overflow-anchor');
            
            var storage = app.getStorage(),
                tasksFilter = storage.get('tasks-filter') || false;

            if (tasksFilter) {
                if (tasksFilter == filterName) {
                    toggleBtn.removeClass('selected');
                    storage.remove('tasks-filter');
                    app.publish('tasks-tree-filter-reset');
                    this.toolbar.toggle(e.target, false);
                } else {
                    toggleBtn.addClass('selected');
                    storage.set('tasks-filter', filterName);
                    app.publish('tasks-tree-filter-set', filterName);
                    this.toolbar.toggle(e.target, true);
                }
            } else {
                toggleBtn.addClass('selected');
                storage.set('tasks-filter', filterName);
                app.publish('tasks-tree-filter-set', filterName);
                this.toolbar.toggle(e.target, true);
            }            
        },
        onClickSetNodeRead: function() {
            app.publish('set-task-read', {
                taskId: this.treeId,
                forceMode: true
            });
        },
        onClickSetNodeUnread: function() {
            app.publish('set-task-unread', {
                taskId: this.treeId,
                forceMode: true
            });
        }
    };
    public.__proto__ = treeModule;
    
    return public;
});