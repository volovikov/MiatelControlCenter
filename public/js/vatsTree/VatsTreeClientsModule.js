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
        myTreePrefix: 'clients',
        myModuleName: 'VatsTreeClientsModule',
        mySectionName: 'vats',
        myStorageName: 'clientsTreeStorage',
        rawTreeArr: [],
        bindEvents: function() {
            var that = this;
            
            this.__proto__.bindsEvents.call(this);    
            
            $(document).off('click', '.client-tree-filter').on('click', '.client-tree-filter', function(e) {
                that.onClickClientTreeSearchLink.call(that, $(this));
            });            
            app.subscribe('add-client', this.myModuleName, function(rec) {
                that.addNode(rec);
            });
            app.subscribe('del-client', this.myModuleName, function(rec) {
                that.delNode(rec.id);
            });
            app.subscribe('update-client', this.myModuleName, function(rec) {
                that.updateNode(rec);
            });
            app.subscribe('hash-change', that.myModuleName, function(hashRec) {
                that.treeKey = hashRec[1] && hashRec[1].value;
                that.treeId = hashRec[2] && hashRec[2].value;
                
                setTimeout(function() {
                    private.setClientUnselect.call(that, that.treeId);
                }, app.getReadTimeout());                  
            });            
            app.subscribe('set-tree-filter', this.myModuleName, function(q) {
                that.setTreeFilter.call(that, q);
            });
            app.subscribe('reset-tree-filter', this.myModuleName, function() {
                that.resetTreeFilter.call(that);
            });
            app.subscribe('clients-tree-reload', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });
            });
            app.subscribe('clients-tree-filter-set', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });                
            });
            app.subscribe('clients-tree-filter-reset', this.myModuleName, function() {
                that.reload.call(that, function() {
                    treeModule.selectTreeNode.call(that, that.treeId);
                });                                
            });
            app.subscribe('set-client-read', this.myModuleName, function(data) {
                if (data.forceMode) {
                    private.setClientUnselectForce.call(that, data.clientId);
                } else {
                    private.setClientUnselect.call(that, data.clientId);
                }                
            });
            app.subscribe('set-client-unread', this.myModuleName, function(data) {
                if (data.forceMode) {
                    private.setClientSelectForce.call(that, data.clientId);
                } else {
                    private.setClientSelect.call(that, data.clientId);
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
                private.setClientUnselect.call(that, that.treeId);
            }, app.getReadTimeout());             
        },       
        render: function(callback) {
            var that = this,                
                data = $.extend(private.getClientsFilterData.call(this), {
                    userHash: app.getActiveUserHash()
                });

            treeModule.showTreePreloader();
            
            u.ajaxRequest('client/get-client-list-tree', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                } else {
                    that.rawTreeArr = that.getNodeExpandedCond([resp.tree]);

                    var data = new k.data.HierarchicalDataSource({
                        data: that.rawTreeArr,
                        sort: {
                            field: 'id',
                            dir: 'desc'
                        }
                    });
                    that.mainTree = that.el.kendoTreeView({
                        template: function(rec) {
                            var item = rec.item,
                                icon = '';
        
                            if (item.status == 'disable') {
                                icon = '<img class="k-image" alt="" src="/img/lock.gif">';
                            }
                            if (!item.userClientRead) {
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
                                window.location.hash = '#section/' + that.mySectionName + '/tree/' + that.myTreePrefix + '/client/' + item.id;        
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
            var parentEl = this.getNodeById(rec.parentId || rec.parentClientId);

            if (!parentEl) {
                return;
            }
            this.mainTree.append({
                text: rec.subject,
                id: rec.id,
                parentId: rec.parentClientId,
                status: rec.clientStatus
            }, parentEl);
            
            setTimeout(function() {
                var el = $('#' + rec.id);
                
                if (el) {
                    el.attr('data-status', rec.clientStatus);
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
                if (rec.originParentClientId && rec.originParentClientId != rec.parentClientId) {
                    this.dragNode(rec);
                }  else {
                    var dataItem = this.mainTree.dataItem(node),
                        el = this.mainTree.findByUid(dataItem.uid).find('.k-in');

                    dataItem.set('text', rec.subject);

                    if (rec.clientStatus == 'disable') {
                        if (!isNodeHasImage(node)) {
                            // BB
                            // делаю именно так
                            // иначе почему то ставится две картинки
                            //
                            el.prepend('<img class="k-image" alt="" src="/img/lock.gif">');                            
                        }
                    } else {
                        dataItem.set('imageUrl', '');
                        removeImageFromNode(node);
                    }
                    setTimeout(function() {
                        var el = $('#' + rec.id);

                        if (el) {
                            el.attr('data-status', rec.clientStatus);
                        }
                    }, 5);
                }
            }
        },        
        onDragStart: function(e) {
            
        },
        onDragStop: function(e) {
            var that = this,
                a = this.mainTree.dataItem(e.sourceNode),
                b = this.mainTree.dataItem(e.destinationNode),
                data = {
                    parentClientId: b.id,
                    id: a.id,
                    userHash: app.getActiveUserHash()
                };
        
            u.ajaxRequest('client/update-client', data, function(err, resp) {
                if (err) {
                    app.showPopupMsg('bad', that.i18n.err.title, that.i18n.err.crytical);
                }
            });            
        },
        onClickClientTreeSearchLink: function(link) {
            var search = link.attr('data-search'),
                input = $('#main-page-vats-tree input[type="text"]'),
                btn = $('#main-page-vats-tree .search-field');

            if (search) {
                input.val(search);                
                app.publish('set-tree-filter', search);                
            }
        }
    }; 
    var private = {
        setClientSelectForce: function(clientId) {
            var treeNode = this.getNodeById(clientId);
            
            if (!clientId) {
                return;
            } 
            private.setClientUnread.call(this, clientId, true);
            treeNode.find('.normal').removeClass('normal').addClass('bold');                
        },
        setClientUnselectForce: function(clientId) {
            var treeNode = this.getNodeById(clientId);
            
            if (!clientId) {
                return;
            } 
            private.setClientRead.call(this, clientId, true);
            treeNode.find('.bold').removeClass('bold').addClass('normal');    
        },
        setClientSelect: function(clientId) { 
            if (!clientId) {
                return false;
            }
            var dataSource = this.mainTree.dataSource,                
                clientNode = dataSource.get(clientId),
                parentClientNode = clientNode && dataSource.get(clientNode.parentId);
        
            $('#node-' + clientId).removeClass('normal').addClass('bold');
            private.setClientUnread.call(this, clientId);

            if (clientNode && !private.isClientHasChildren.call(this, clientNode)) {
                if (parentClientNode && !private.isClientRead.call(this, parentClientNode.id)) {
                    app.publish('set-client-unread', {
                        clientId: parentClientNode.id,
                        userHash: app.getActiveUserHash()
                    });
                }
            }            
        },
        setClientUnselect: function(clientId) {
            var that = this;
            
            if (!clientId) {
                return false;
            }            
            var dataSource = this.mainTree.dataSource,                
                client = dataSource.get(clientId),
                parentClient = client && dataSource.get(client.parentId);                
            
            if (private.isClientAlreadyRead.call(this, clientId)) {
                return false;    
            } else {
                $('#node-' + clientId).removeClass('bold').addClass('normal');
                private.setClientRead.call(this, clientId);
            }
            if (parentClient) {
                private.isClientRead.call(that, parentClient.id, function(result) {
                    if (result) {
                        app.publish('set-client-read', {
                            clientId: parentClient.id,
                            userHash: app.getActiveUserHash()
                        });
                    }
                });
            }
        },
        setClientRead: function(clientId, forceMode) {
            var data = {
                clientId: clientId,
                forceMode: forceMode || false,
                userHash: app.getActiveUserHash()
            };
            u.ajaxRequest('client/set-client-read', data, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                }
            });            
        },
        setClientUnread: function(clientId, forceMode) {
            var data = {
                clientId: clientId,
                forceMode: forceMode || false,
                userHash: app.getActiveUserHash()
            };
            u.ajaxRequest('client/set-client-unread', data, function(err, resp) {
                if (err) {
                    app.showPopupErrors(resp);
                }
            });            
        },         
        isClientRead: function(clientId, callback) {
            var data = {
                userHash: app.getActiveUserHash(),
                clientId: clientId
            };
            u.ajaxRequest('client/is-client-read', data, function(err, data) {
                callback && callback(!err);
            });         
        },       
        isClientAlreadyRead: function(clientId) {
            var treeNode = this.getNodeById(clientId);
            
            if (treeNode && treeNode.find('.bold').length) {
                return false;
            } else {
                return true;
            }
        },
        isClientAlreadyUnread: function(client) {
            return !private.isClientAlreadyRead.call(this, client);
        },        
        isClientHasChildren: function(client) {
            return client.hasChildren;
        },
        getClientsFilterData: function() {
            var storage = app.getStorage(),
                clientsFilter = storage.get('clients-filter');
        
            if (!clientsFilter) {
                return {};
            }
            switch (clientsFilter) {
                case 'clients-for-me':
                    return {
                        clientOwnerId: app.getActiveUser().id
                    };    
                
                case 'clients-enable':
                    return {
                        clientStatus: 'enable'
                    };
                    
                case 'clients-disable':
                    return {
                        clientStatus: 'disable'
                    };
            }
        },
        findClientByStatus: function(clientId, status) {
            var el = this.el.find('#node-' + clientId),
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
        getSubclientCount: function(clientId) {
            var el = this.el.find('#node-' + clientId),
                list = el.closest('li').find('ul li').toArray();
            
            return list.length;
        },
        updateClientRecursive: function(client) {
            var that = this,
                changeRootClientFlag = false;    
                data;

            if (client.parentClientId && client.parentClientId != 0 && client.parentClientId != 'null') {
                var math = {
                    'total': private.getSubclientCount.call(that, client.parentClientId),
                    'new': private.findClientByStatus.call(that, client.parentClientId, 'Новая').length,
                    'inprogress': private.findClientByStatus.call(that, client.parentClientId, 'В работе').length
                };
                var currentStatusClientCount = private.findClientByStatus.call(that, client.parentClientId, client.status).length;
                
                if (math.total == currentStatusClientCount) {
                    changeRootClientFlag = true;                  
                } else if (math.new) {
                    changeRootClientFlag = true;
                } else if (math.inprogress) {
                    changeRootClientFlag = true;
                }
                if (changeRootClientFlag) {
                    var data = {
                        id: client.parentClientId,
                        status: client.status,
                        userHash: app.getActiveUserHash()
                    };  
                    u.ajaxRequest('client/update-client', data, function(err, data) {
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