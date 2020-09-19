define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/vatsTree.js',
    'js/common/tree/TreeModule',
    'css!./css/vatsTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myModuleName: 'VatsTreeTestsModule',
        mySectionName: 'vats',
        myStorageName: 'testsTreeStorage',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);
            
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
            });   
        },    
        run: function(params) {
            for (var key in params) {
                this[key] = params[key];
            }  
            this.__proto__.run.call(this, params); 
        },     
        render: function(callback) {
            var that = this;
                
            // BB
            // Функция в место где должно выводиться дерево
            // рисует слово Loading..
            // И когда дерево в это место рендерится, то автоматически
            // слово это стирается
            //
            treeModule.showTreePreloader();
            
            private.getSettingsTreeData.call(this, function(tree) {
                that.rawTreeArr = that.getNodeExpandedCond([tree]);

                var data = new k.data.HierarchicalDataSource({
                    data: that.rawTreeArr
                });
                that.mainTree = that.el.kendoTreeView({
                    dragAndDrop: true,
                    dataSource: data,               
                    dataTextField: 'text',
                    dataValueField: 'id',
                    change: function(e) {
                        var selected = this.select(),                            
                            item = that.mainTree.dataItem(selected);

                        if (item) {
                            window.location.hash = '#section/' + that.mySectionName + '/tree/tests/tests/' + item.id;        
                        }
                    },
                    expand: function(e) {
                        that.setNodeExpandCond(e.node);
                    },
                    collapse: function(e) {
                        that.unsetNodeExpandCond(e.node);                             
                    }
                }).data('kendoTreeView');      
                
                callback && callback();
            });               
        }
    };    
    public.__proto__ = treeModule;
    
    var private = {
        getSettingsTreeData: function(callback) {
            /**
             * ВВ
             * 
             * В эту переменную добавь название твоих тестов. 
             * Тесты могут быть любой вложенности
             * 
             * @type type
             */
            var tree = {
                parentId: 0,
                id: 0,
                text: 'Тесты',
                items: [{
                    id: '1',
                    text: 'Публичные методы',
                    parentId: 0,
					items: [{
						id: '10',
						text: 'Public',
						parentId: 1
                }]
                },{
                    id: '2',
                    text: 'Методы с авторизацией',
                    parentId: 0,
                    items:[
					{
                        id: '20',
                        text: 'Private',
                        parentId: 1
                    },{
                        id: '22',
                        text: 'Atc',
                        parentId: 1},
                        {
                        id: '23',
                        text: 'Bills',
                        parentId: 1
                    },{
                        id: '24',
                        text: 'Messages',
                        parentId: 1
                    },{
                        id: '25',
                        text: 'Documents',
                        parentId: 1}]
                },{
                    id: '3',
                    text: 'Регистрация компании',
                    parentId: 0
                },{
                    id: '4',
                    text: 'Удаление компании',
                    parentId: 0
                },{
                    id: '5',
                    text: 'SORM',
                    parentId: 0
                },{
                    id: '6',
                    text: 'Тest Production',
                    parentId: 0
                },{
                    id: '7',
                    text: 'Сетевые тесты',
                    parentId: 0
                }]
            };
            callback(tree);
        }
    };
    return public;
});