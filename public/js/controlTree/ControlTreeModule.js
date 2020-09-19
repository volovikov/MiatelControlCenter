/**
 * Control section tree
 * 
 * @param {type} $
 * @param {type} k
 * @param {type} u
 * @param {type} common
 * @param {type} local
 * @param {type} controlTree
 * @param {type} treeModule
 * @returns {Object}
 */
define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/controlTree.js',
    'text!./templates/control-tree.html',
    'js/common/tree/TreeModule',
    'css!./css/controlTree'
], function($, k, u, common, local, controlTree, treeModule) {
    
    var controlTreeTmpl = k.template(controlTree);
    
    var public = {
        treeModules: {},
        myModuleName: 'ContentTreeModule',
        mySectionName: 'control',     
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
                searchEl = '#main-page-control-tree .k-i-search',
                resetSearchEl = '#main-page-control-tree .k-i-close';
            
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
                
                //that.treeKey = hashRec[1] && hashRec[1].value;
                //that.treeId = hashRec[2] && hashRec[2].value;
            });
        },      
        run: function(params) {
            var that = this;
            
            this.treeKey = params && params[0] && params[0].value;
            this.treeId = params && params[1] && params[1].value;            
            this.__proto__.run.call(this, params);
        },
        render: function() {
            var html = controlTreeTmpl({
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
        renderTree: function() {
            //this.renderServedTree();
            //this.renderNotServedTree();
            this.renderTasksTree();
        }, 
        renderServedTree: function() {
            var that = this; 
            
            var data = new k.data.HierarchicalDataSource({
                data: [{
                    id: 1,
                    text: 'Обслуженные клиенты',
                    expanded: false,
                    items: [{
                        id: 2,
                        text: 'Позвонить в течении дня',
                        items: [{
                            id: 22,
                            text: 'Иванов Иван (Сбербанк)'
                        }, {
                            id: 23,
                            text: 'Петров Андрей (Миател)'
                        }]
                    },{
                        id: 4,
                        text: 'Ждем оплаты',
                        items: [{
                            id: 44,
                            text: 'Васечкин Андрей (Рога и Копыта)'
                        }]
                    },{
                        id: 5,
                        text: 'Оплатили',
                        items: [{
                            id: 55,
                            text: 'Синякин Андрей (РЖД)'
                        }]
                    }]
                }]
            });
            this.servedTree = that.el.find('#tree-served').kendoTreeView({
                dragAndDrop: true,
                dataSource: data,               
                dataTextField: 'text',
                dataValueField: 'id',
                change: function(e) {
                    var selected = this.select(),                            
                        item = that.servedTree.dataItem(selected);

                    if (typeof item != 'undefined') {
                        window.location.hash = '#section/' + that.mySectionName + '/tree/served/user/' + item.id;        
                    }
                }
            }).data('kendoTreeView');                
            
        },
        renderNotServedTree: function() {
            var that = this; 
            
            var data = new k.data.HierarchicalDataSource({
                data: [{
                    id: 1,
                    text: 'Не обслуженные клиенты',
                    expanded: false,
                    items: [{
                        id: 2,
                        text: 'Жмуриков Вася (ВЭБ)'
                    },{
                        id: 4,
                        text: 'Воловиков В (Нита)'
                    }]
                }]
            });
            this.notServedTree = that.el.find('#tree-not-served').kendoTreeView({
                dragAndDrop: true,
                dataSource: data,               
                dataTextField: 'text',
                dataValueField: 'id',
                change: function(e) {
                    var selected = this.select(),                            
                        item = that.notServedTree.dataItem(selected);

                    if (typeof item != 'undefined') {
                        window.location.hash = '#section/' + that.mySectionName + '/tree/notServed/user/' + item.id;   
                    }
                }
            }).data('kendoTreeView');                            
            
        },
        renderTasksTree: function() {
            var that = this; 

            requirejs(['js/controlTree/ControlTreeTasksModule'], function(module) {
                that.treeModules['tasks'] = module;
                
                module.run({
                    el: that.el.find('#tree-task'),
                    treeId: that.treeId
                });
            });
        },
        onToggleTasksFilterBtn: function(e, filterName) {
            var storage = app.getStorage(),
                tasksFilter = storage.get('tasks-filter') || false;

            if (tasksFilter) {
                if (tasksFilter == filterName) {
                    storage.remove('tasks-filter');
                    app.publish('tasks-tree-filter-reset');
                    this.toolbar.toggle(e.target, false);
                } else {
                    storage.set('tasks-filter', filterName);
                    app.publish('tasks-tree-filter-set', filterName);
                    this.toolbar.toggle(e.target, true);
                }
            } else {
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