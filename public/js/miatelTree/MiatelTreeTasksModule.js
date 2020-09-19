define([
    'jquery',
    'kendo',
    'util',
    'i18n!js/common/nls/ru-ru/main.js',
    'i18n!./nls/ru-ru/miatelTree.js',
    'js/common/tree/TreeModule',
    'css!./css/miatelTree'
], function($, k, u, common, local, treeModule) {
    
    var public = {
        myTreePrefix: 'tasks',
        myModuleName: 'MiatelTreeTasksModule',
        mySectionName: 'miatel',
        myStorageName: 'miatelTaskTreeStorage',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this,
                delay = 20;
            
            this.__proto__.bindsEvents.call(this);    
            
            app.subscribe('add-task', this.myModuleName, function(rec) {
                that.addNode(rec);
            });
            app.subscribe('del-task', this.myModuleName, function(rec) {
                that.delNode(rec.id);
            });
            app.subscribe('update-task', this.myModuleName, function(rec) {
                that.updateNode(rec);
            });
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
                
                setTimeout(function() {
                    private.setTaskUnselect.call(that, that.treeId);
                }, app.getReadTimeout());                  
            });            
            app.subscribe('set-tree-filter', this.myModuleName, function(q) {
                that.setTreeFilter.call(that, q);
            });
            app.subscribe('reset-tree-filter', this.myModuleName, function() {
                that.resetTreeFilter.call(that);
            });
            app.subscribe('tasks-tree-reload', this.myModuleName, function() {
                that.reload.call(that, function() {
                    setTimeout(function() {
                        treeModule.selectTreeNode.call(that, that.treeId);
                    }, delay);                    
                });
            });
            app.subscribe('tasks-tree-filter-set', this.myModuleName, function() {
                that.reload.call(that, function() {
                    setTimeout(function() {
                        treeModule.selectTreeNode.call(that, that.treeId);
                    }, delay);                    
                });                
            });
            app.subscribe('tasks-tree-filter-reset', this.myModuleName, function() {
                that.reload.call(that, function() {
                    setTimeout(function() {
                        treeModule.selectTreeNode.call(that, that.treeId);
                    }, delay);                    
                });                                
            });
            app.subscribe('set-task-read', this.myModuleName, function(data) {
                if (data.forceMode) {
                    private.setTaskUnselectForce.call(that, data.taskId);
                } else {
                    private.setTaskUnselect.call(that, data.taskId);
                }                
            });
            app.subscribe('set-task-unread', this.myModuleName, function(data) {
                if (data.forceMode) {
                    private.setTaskSelectForce.call(that, data.taskId);
                } else {
                    private.setTaskSelect.call(that, data.taskId);
                }                
            });
        },        
        run: function(params) {
            var that = this;
            
            for (var key in params) {
                this[key] = params[key];
            }       
            this.__proto__.run.call(this, params);          
            
            // BB
            // if first run module, hashChange dont work
            //
            setTimeout(function() {
                private.setTaskUnselect.call(that, that.treeId);
            }, app.getReadTimeout());             
        },
        dragNode: function(rec) {
            var mainNode = this.getNodeById(rec.id);
            
            if (!mainNode) {
                return;
            }
            var clonedNode = this.mainTree.dataItem(mainNode).toJSON(),
                referenceNode = this.getNodeById(rec.parentTaskId);
        
            clonedNode.parentId = rec.parentTaskId;
            
            if (!referenceNode[0]) {
                referenceNode = null;
            }
            this.delNode(rec.id);
            this.mainTree.append(clonedNode, referenceNode);    
        },
        addNode: function(rec) {
            var parentEl = this.getNodeById(rec.parentId || rec.parentTaskId);

            if (!parentEl) {
                return;
            }
            this.mainTree.append({
                text: rec.subject,
                id: rec.id,
                parentId: rec.parentId,
                status: rec.status                                
            }, parentEl);
            
            setTimeout(function() {
                var el = $('#' + rec.id);
                
                if (el) {
                    el.attr('data-status', rec.status);
                }
            }, 5);            
        },
        updateNode: function(rec) {
            var that = this,
                node = this.getNodeById(rec.id);

            var isNodeHasImage = function(domEl) {
                return $(domEl).children().children('span').children('img').length > 0 ? true: false;
            };
            var removeImageFromNode = function(domEl) {
                $(domEl).children().children('span').children('img').remove();
            };
            if (node) {
                if (rec.originParentTaskId && rec.originParentTaskId != rec.parentTaskId) {
                    this.dragNode(rec);
                }  else {
                    var dataItem = this.mainTree.dataItem(node);
                    dataItem.set('text', rec.subject);

                    if (rec.status == 'Закрыта') {
                        if (!isNodeHasImage(node)) {
                            dataItem.set('imageUrl', '/img/lock.gif');
                        }
                    } else {
                        dataItem.set('imageUrl', '');
                        removeImageFromNode(node);
                    }
                    setTimeout(function() {
                        var el = $('#' + rec.id);

                        if (el) {
                            el.attr('data-status', rec.status);
                        }
                    }, 5);
                }
            }
        },
        render: function(callback) {
            var that = this,                
                data = $.extend(private.getTasksFilterData.call(this), {
                    userHash: app.getActiveUserHash()
                });
          
            treeModule.showTreePreloader();
            
            u.ajaxRequest('task/get-task-list-tree', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.rawTreeArr = that.getNodeExpandedCond([resp.tree]);

                    var data = new k.data.HierarchicalDataSource({
                        data: that.rawTreeArr
                    });
                    that.mainTree = that.el.kendoTreeView({
                        template: function(rec) {
                            var item = rec.item,
                                icon = '';
        
                            if (item.status == 'Закрыта') {
                                icon = '<img class="k-image" alt="" src="/img/lock.gif">';
                            }
                            if (typeof item.userTaskRead == 'undefined') {
                                return icon + '<div id="node-' + item.id + '" class="node normal" data-id="' + item.id + '" data-status="' + item.status + '">' + item.text + '</div>';                                                            
                            } else if (!item.userTaskRead) {
                                return icon + '<div id="node-' + item.id + '" class="node bold" data-id="' + item.id + '" data-status="' + item.status + '">' + item.text + '</div>';
                            } else {
                                return icon + '<div id="node-' + item.id + '" class="node normal" data-id="' + item.id + '" data-status="' + item.status + '">' + item.text + '</div>';                                                            
                            }
                        },
                        loadOnDemand: true,
                        autoScroll: true,
                        dragAndDrop: true,
                        dataSource: data,               
                        dataTextField: 'text',
                        dataValueField: 'id',
                        change: function(e) {
                            var selected = this.select(),                            
                                item = that.mainTree.dataItem(selected);

                            if (item) {
                                window.location.hash = '#section/' + that.mySectionName + '/tree/' + that.myTreePrefix + '/task/' + item.id;        
                            }
                        },
                        expand: function(e) {
                            that.setNodeExpandCond(e.node);
                        },
                        collapse: function(e) {
                            that.unsetNodeExpandCond(e.node);                             
                        }
                    }).data('kendoTreeView');  

                    that.mainTree.bind('dragstart', function(e) {
                        that.onDragStart.call(that, e);
                    });
                    that.mainTree.bind('dragend', function(e) {
                        that.onDragStop.call(that, e);
                    }); 
                    callback && callback();
                }
            });
        },
        onDragStart: function(e) {
            
        },
        onDragStop: function(e) {
            var that = this,
                src = this.mainTree.dataItem(e.sourceNode),
                dst = this.mainTree.dataItem(e.destinationNode),                
                data = {
                    sourceParentTaskId: src.parentId,
                    sourceTaskId: src.id,
                    targetTaskId: dst.id,
                    id: src.id,
                    userHash: app.getActiveUserHash()
                };

            u.ajaxRequest('task/update-task', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });            
        }
    }; 
    var private = {
        setTaskSelectForce: function(taskId) {
            var treeNode = this.getNodeById(taskId);
            
            if (!taskId) {
                return;
            } 
            private.setTaskUnread.call(this, taskId, true);
            treeNode.find('.normal').removeClass('normal').addClass('bold');                
        },
        setTaskUnselectForce: function(taskId) {
            var treeNode = this.getNodeById(taskId);
            
            if (!taskId) {
                return;
            } 
            private.setTaskRead.call(this, taskId, true);
            treeNode.find('.bold').removeClass('bold').addClass('normal');    
        },
        setTaskSelect: function(taskId) { 
            if (!taskId) {
                return false;
            }
            var dataSource = this.mainTree.dataSource,                
                taskNode = dataSource.get(taskId),
                parentTaskNode = taskNode && dataSource.get(taskNode.parentId);
        
            $('#node-' + taskId).removeClass('normal').addClass('bold');
            private.setTaskUnread.call(this, taskId);

            if (taskNode && !private.isTaskHasChildren.call(this, taskNode)) {
                if (parentTaskNode && !private.isTaskRead.call(this, parentTaskNode.id)) {
                    app.publish('set-task-unread', {
                        taskId: parentTaskNode.id,
                        userHash: app.getActiveUserHash()
                    });
                }
            }            
        },
        setTaskUnselect: function(taskId) {
            var that = this;
            
            if (!taskId) {
                return false;
            }
            if (!this.mainTree) {
                return false;
            }
            var dataSource = this.mainTree.dataSource,                
                task = dataSource.get(taskId),
                parentTask = task && dataSource.get(task.parentId);                
            
            if (private.isTaskAlreadyRead.call(this, taskId)) {
                return false;    
            } else {
                $('#node-' + taskId).removeClass('bold').addClass('normal');
                private.setTaskRead.call(this, taskId);
            }
            if (parentTask) {
                private.isTaskRead.call(that, parentTask.id, function(result) {
                    if (result) {
                        app.publish('set-task-read', {
                            taskId: parentTask.id,
                            userHash: app.getActiveUserHash()
                        });
                    }
                });
            }
        },
        setTaskRead: function(taskId, forceMode) {
            var data = {
                taskId: taskId,
                forceMode: forceMode || false,
                userHash: app.getActiveUserHash()
            };
            u.ajaxRequest('task/set-task-read', data, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                }
            });            
        },
        setTaskUnread: function(taskId, forceMode) {
            var data = {
                taskId: taskId,
                forceMode: forceMode || false,
                userHash: app.getActiveUserHash()
            };
            u.ajaxRequest('task/set-task-unread', data, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                }
            });            
        },         
        isTaskRead: function(taskId, callback) {
            var data = {
                userHash: app.getActiveUserHash(),
                taskId: taskId
            };
            u.ajaxRequest('task/is-task-read', data, function(err, data) {
                callback && callback(!err);
            });         
        },       
        isTaskAlreadyRead: function(taskId) {
            var treeNode = this.getNodeById(taskId);
            
            if (treeNode && treeNode.find('.bold').length) {
                return false;
            } else {
                return true;
            }
        },
        isTaskAlreadyUnread: function(task) {
            return !private.isTaskAlreadyRead.call(this, task);
        },        
        isTaskHasChildren: function(task) {
            return task.hasChildren;
        },
        getTasksFilterData: function() {
            var storage = app.getStorage(),
                tasksFilter = storage.get('tasks-filter');
        
            if (!tasksFilter) {
                return {};
            }
            switch (tasksFilter) {
                case 'tasks-for-me-all':
                    return {
                        taskExecutorId: app.getActiveUser().id
                    };
                    
                case 'tasks-for-me-new':
                    return {
                        taskExecutorId: app.getActiveUser().id,
                        status: 'Новая'
                    };
                    
                case 'tasks-for-me-inwork':
                    return {
                        taskExecutorId: app.getActiveUser().id,
                        status: 'В работе'
                    };
                    
                case 'tasks-from-me-all':
                    return {
                        taskAuthorId: app.getActiveUser().id
                    };
                    
                case 'tasks-from-me-new':
                    return {
                        taskAuthorId: app.getActiveUser().id,
                        status: 'Новая'
                    };                    
                    
                case 'tasks-from-me-inwork':
                    return {
                        taskAuthorId: app.getActiveUser().id,
                        status: 'В работе'
                    };                                        
            }
        },
        findTaskByStatus: function(taskId, status) {
            var el = this.el.find('#node-' + taskId),
                list = el.closest('li').find('ul li').toArray(),
                math = [];

            if (el && list) {
                for (var i in list) {
                    var el = $(list[i]).find('.node'),
                        s = el.attr('data-status');

                    if (s == status) {
                        math.push(el);
                    }
                }
                return math;
            }
        },
        getSubtaskCount: function(taskId) {
            var el = this.el.find('#node-' + taskId),
                list = el.closest('li').find('ul li').toArray();
            
            return list.length;
        },
        updateTaskRecursive: function(task) {
            var that = this,
                changeRootTaskFlag = false;    
                data;

            if (task.parentTaskId && task.parentTaskId != 0 && task.parentTaskId != 'null') {
                var math = {
                    'total': private.getSubtaskCount.call(that, task.parentTaskId),
                    'new': private.findTaskByStatus.call(that, task.parentTaskId, 'Новая').length,
                    'inprogress': private.findTaskByStatus.call(that, task.parentTaskId, 'В работе').length
                };
                var currentStatusTaskCount = private.findTaskByStatus.call(that, task.parentTaskId, task.status).length;
                
                if (math.total == currentStatusTaskCount) {
                    changeRootTaskFlag = true;                  
                } else if (math.new) {
                    changeRootTaskFlag = true;
                } else if (math.inprogress) {
                    changeRootTaskFlag = true;
                }
                if (changeRootTaskFlag) {
                    var data = {
                        id: task.parentTaskId,
                        status: task.status,
                        userHash: app.getActiveUserHash()
                    };  
                    u.ajaxRequest('task/update-task', data, function(err, data) {
                        if (err) {
                            app.showPopupErrors(data);
                        } else {
                            app.showPopupMsg('good', that.i18n.info.title, that.i18n.info.saveComplete);
                        }                    
                    });                    
                }
            }
        }
    };
    public.__proto__ = treeModule;
    
    return public;
});