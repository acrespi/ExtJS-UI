
testsBlackHoleTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    constructor: function() {
        testsBlackHoleTreeLoader.superclass.constructor.call(this, {
            dataUrl: testsBlackHoleUrl,
            baseParams: {
                suiteid: suiteid,
                subsuiteposition: subsuiteposition
            }
        });
    }

});


commandsBlackHoleTreeLoader = Ext.extend(Ext.tree.TreeLoader, {
    constructor: function() {
        testsBlackHoleTreeLoader.superclass.constructor.call(this, {
            dataUrl: commandsBlackHoleUrl,
            baseParams: {
                suiteid: suiteid,
                subsuiteposition: subsuiteposition,
                event: "events"
            }
        });
    }
});



productsStore = Ext.extend(Ext.data.JsonStore, {    
    constructor: function() {
        productsStore.superclass.constructor.call(this, {
            autoLoad: false,
            url: 'products',
            baseParams: {
                suiteid: suiteid,
                subsuiteposition: subsuiteposition
            },
            fields: ["name", "checked"]
        });
    },
    listeners: {
        load: function(store, records, options){
            var title=""
            if(options.params.removeall == true){
                options.Xpanel.allproducts = false;
                enableProductRows(options.Xgrid, store);
                setPanelProducts(options.Xgrid, options.Xpanel, false);
                title = getSuiteTitle(options.Xpanel);
                options.Xpanel.setTitle(title);
            }
        }
    }
});


targetsStore = Ext.extend(Ext.data.JsonStore, {
    constructor: function() {
        targetsStore.superclass.constructor.call(this, {
            autoLoad: false,
            url: 'targets',
            baseParams: {
                suiteid: suiteid,
                subsuiteposition: subsuiteposition
            },
            fields: ["name", "checked"]
        });
    },
    listeners: {
        load: function(store, records, options){
            var title=""
            if(options.params.removeall == true){
                options.Xpanel.alltargets = false;
                enableTargetRows(options.Xgrid, store);
                setPanelTargets(options.Xgrid, options.Xpanel, false);
                title = getSuiteTitle(options.Xpanel);
                options.Xpanel.setTitle(title);
            }
        }
    }
});

productsCheck = Ext.extend(Ext.grid.CheckColumn, {
    dataIndex: "checked",
    width: 5,
    listeners: {
        click: function(element, event, record){
            var panel = element.grid.ownerCt.ownerCt;
            var grid = element.grid;
            var title = "";
            var store = record.store;
            
            if (record.data.checked == true){
                if (record.data.name == "All"){                    
                    //Disable all, server side will have to setAllProducts
                    try{
                        addProductToSuite(suiteid, getPosition(panel),"All");                        
                    }catch(error){
                        alert(error);
                        unCheckRecord(record);
                        return false;
                    }
                    panel.allproducts = true;
                    disableRowsExceptAll(grid);
                    setPanelProducts(grid, panel, true);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                    
                }else{
                    try {
                        addProductToSuite(suiteid, getPosition(panel),record.data.name);                        
                    }catch(error){
                        alert(error);
                        unCheckRecord(record);
                        return false;
                    }
                    setPanelProducts(grid, panel, false);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                }                
            }else{                
                if (record.data.name == "All"){
                    //Enable and set all but no "All"
                    store.load({
                        params: {
                            "removeall":true                            
                        },
                        Xpanel: panel,
                        Xgrid: grid
                    });
                    
                }else{
                    //If all are eliminated, return to All??
                    removeProductFromSuite(suiteid, getPosition(grid.ownerCt.ownerCt), record.data.name);
                    setPanelProducts(grid, panel, false);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                }                
            }
        }
    }
});

targetsCheck = Ext.extend(Ext.grid.CheckColumn, {
    dataIndex: "checked",
    width: 5,
    listeners: {
        click: function(element, event, record){
            var panel = element.grid.ownerCt.ownerCt;
            var title = "";
            var grid = element.grid;
            var store = record.store;
            if (record.data.checked == true){
                if (record.data.name == "All"){
                    //Disable all, server side will have to setAllTargets
                    try{
                        addTargetToSuite(suiteid, getPosition(grid.ownerCt.ownerCt), "All");                        
                    }catch(error){
                        alert(error);
                        unCheckRecord(record);
                        return false;
                    }
                    panel.alltargets = true;
                    disableRowsExceptAll(grid);
                    setPanelTargets(grid, panel, true);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                }else{
                    try{
                        addTargetToSuite(suiteid, getPosition(grid.ownerCt.ownerCt), record.data.name)
                        
                    }catch(error){
                        alert(error);
                        unCheckRecord(record);
                        return false;
                    }
                    setPanelTargets(grid, panel, false);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                }
            }else{
                if (record.data.name == "All"){
                    //Enable and set all but no "All"
                    store.load({
                        params: {
                            "removeall":true
                        },
                        Xpanel: panel,
                        Xgrid: grid
                    });
                   
                }else{
                    //Controll case of no targets = All?
                    removeTargetFromSuite(suiteid,getPosition(grid.ownerCt.ownerCt), record.data.name);
                    setPanelTargets(grid, panel, false);
                    title = getSuiteTitle(panel);
                    panel.setTitle(title);
                }
            }
        }
    }
});

productsGrid = Ext.extend(Ext.grid.GridPanel,{
    
    initComponent: function(){
        var psm = new productsCheck({});
        var pst = new productsStore({});
        Ext.apply(this, {
            title: 'Products',
            iconCls: 'product',
            stripeRows: true,
            hideHeaders: true,
            store: pst ,
            //hideHeaders: true,
            sm: psm,
            cm: new Ext.grid.ColumnModel([
                psm,
                {
                    id:'name',
                    sortable: true,
                    dataIndex: 'name'
                }
                ]),
            viewConfig: {
                forceFit:true
            },
            columnLines: true,
            frame:true,
            autoScroll:true,
            animate:true,
            containerScroll: true,
            scroll: 'vertical'
        });
        productsGrid.superclass.initComponent.apply(this, arguments);
        productsListener = function(pst){
            pst.baseParams.subsuiteposition = subsuiteposition;
        }
        pst.on("beforeload", productsListener, this);        
    }
});



targetsGrid = new Ext.extend(Ext.grid.GridPanel,{
    
    initComponent: function(){
        var tsm = new targetsCheck({});
        var tst = new targetsStore({});
        Ext.apply(this, {            
            title: 'Targets',
            iconCls: 'target',
            stripeRows: true,
            store: tst ,
            hideHeaders: true,
            //hideHeaders: true,
            sm: tsm,
            cm: new Ext.grid.ColumnModel([
                tsm,
                {
                    id:'name',
                    sortable: true,
                    dataIndex: 'name'
                }
                ]),
            viewConfig: {
                forceFit:true
            },
            columnLines: true,
            frame:true,
            autoScroll:true,
            animate:true,
            containerScroll: true,
            scroll: 'vertical'
        });
        targetsGrid.superclass.initComponent.apply(this, arguments);
        targetsListener = function(tst){
            tst.baseParams.subsuiteposition = subsuiteposition;
        }
        tst.on("beforeload", targetsListener, this);
    }
});


testsTree = new Ext.extend(Ext.tree.TreePanel, {
    initComponent: function(){
        var testsTreeLoader = new testsBlackHoleTreeLoader({});
        Ext.apply(this, {
            enableDD: true,
            border: false,
            ddGroup: "tests",
            useArrows:true,
            loader: testsTreeLoader,
            rootVisible: false,
            hideHeaders: true,
            root: new Ext.tree.AsyncTreeNode({
                expanded: true,
                allowDrag: false,
                allowDrop: false,
                children: [{
                    text: 'Tests',
                    iconCls: 'icon-grid',
                    key: 'tests',
                    leaf: false,
                    allowDrag: false
                }]
            })
        });
        testsTree.superclass.initComponent.apply(this, arguments);
        testsBlackHoleListener = function(testsBlackHoleTreeLoader){
            testsBlackHoleTreeLoader.baseParams.subsuiteposition = getPosition(this.ownerCt.ownerCt);
        }
        testsTreeLoader.on("beforeload", testsBlackHoleListener, this);
    },
    listeners:
    {
        beforenodedrop: function (dropEvent) {
            // Does this node come from the tests list (tree)
            if (dropEvent.source.tree.id !== dropEvent.tree.id) {
                dropEvent.target.expand();
                try{
                    addTestToSuite(suiteid, getPosition(dropEvent.tree.ownerCt.ownerCt), dropEvent.dropNode.attributes.text);
                }catch(error){
                    alert(error);
                    return false;
                }
                // Update remote object
                var node = dropEvent.dropNode;
                var nodeCopy = new Ext.tree.TreeNode(
                    Ext.apply({}, node.attributes)
                    );
                nodeCopy.id = Ext.id(null,'newnode') + '_' + node.id;
                nodeCopy.allowDrop = false;                
                dropEvent.target.appendChild(nodeCopy);
                dropEvent.dropStatus = true;
                return false;
            } 
            return true;
        },
        movenode: function (tree, node, oldParent, newParent, index) {
            positionTestAtSuite(suiteid, getPosition(tree.ownerCt.ownerCt), node.attributes.text, index.toString());
            
        },
        beforeremove: function (tree, parent, node) {
            removeTestFromSuite(suiteid, getPosition(tree.ownerCt.ownerCt), getNodePosition(node));
        }

    },
    onRender: function(){
        testsTree.superclass.onRender.apply(this, arguments);
    }

});

commandsTree = new Ext.extend(Ext.tree.TreePanel, {
    initComponent: function(){
        var commandsTreeLoader = new commandsBlackHoleTreeLoader({});
        Ext.apply(this, {
            enableDD:true,
            border: false,
            useArrows:true,
            ddGroup: "commands",
            loader: commandsTreeLoader,
            rootVisible: false,
            root: new Ext.tree.AsyncTreeNode({
                expanded: true,
                allowDrag: false,
                allowDrop: false,
                children: [{
                    text: 'Events',
                    iconCls: 'clock',
                    key: 'events',
                    leaf: false,
                    allowDrag: false,
                    allowDrop: false
                }]
            })
        });
        commandsTree.superclass.initComponent.apply(this, arguments);
        commandsBlackHoleListener = function(commandsBlackHoleTreeLoader, node){
            commandsBlackHoleTreeLoader.baseParams.subsuiteposition = getPosition(this.ownerCt.ownerCt);
            commandsBlackHoleTreeLoader.baseParams.event = node.attributes.text;
        }
        commandsTreeLoader.on("beforeload", commandsBlackHoleListener, this);
    },
    listeners:
    {
        beforenodedrop: function (dropEvent) {
            if (dropEvent.source.tree.id !== dropEvent.tree.id) {
                // Update remote object
                dropEvent.target.expand();
                try{
                    addCommandToSuite(suiteid, getPosition(dropEvent.tree.ownerCt.ownerCt), dropEvent.target.attributes.text, dropEvent.dropNode.attributes.text);
                }catch(error){
                    alert(error);
                    return false;
                }
                var node = dropEvent.dropNode;
                var nodeCopy = new Ext.tree.TreeNode(
                    Ext.apply({}, node.attributes)
                    );
                nodeCopy.id = Ext.id(null,'newnode') + '_' + node.id;
                nodeCopy.allowDrop = false;                
                dropEvent.target.appendChild(nodeCopy);
                dropEvent.dropStatus = true;
                return false;
            }
            return true;
        },
        movenode: function (tree, node, oldParent, newParent, index) {
            positionCommandAtSuite(suiteid, getPosition(tree.ownerCt.ownerCt), newParent.attributes.text, node.attributes.text, index.toString());
        },
        beforeremove: function (tree, parent, node) {
            removeCommandFromSuite(suiteid, getPosition(tree.ownerCt.ownerCt), parent.attributes.text, getNodePosition(node) );
        }
    },
    onRender: function(){
        commandsTree.superclass.onRender.apply(this, arguments);
    }

});

itemsPanel = new Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.apply(this, {            
            //autoScroll:true,
            animate:true,
            //scroll:'vertical',
            minHeight: 400,
            //containerScroll: true,
            border:false,
            items:[
            new testsTree({}),
            new commandsTree({})
            ]
        });
        itemsPanel.superclass.initComponent.apply(this, arguments);
    },
    onRender: function(){
        itemsPanel.superclass.onRender.apply(this, arguments);
    }

});

configPanel = new Ext.extend(Ext.Panel, {
    initComponent: function(){
        Ext.apply(this, {            
            layout: 'column',
            border: false,
            //hidden: true,
            height: 145,
            // defaults are applied to all child items unless otherwise specified by child item
            defaults: {
                columnWidth: '.5',
                border: false,
                height: 145
            },
            items:[
            new productsGrid({}),
            new targetsGrid({})
            ]
        });
        configPanel.superclass.initComponent.apply(this, arguments);
    },
    onRender: function(){
        configPanel.superclass.onRender.apply(this, arguments);
    }
});



suitePanel = Ext.extend(Ext.Panel, {
        
    initComponent: function(){
        Ext.apply(this, {
            border: false,
            //autoScroll: true,
            animate:true,
            //scroll:'vertical',
            //containerScroll: true,
            title: "Products: All - Targets: All", //better getSuiteTitle
            layout: new Ext.layout.BorderLayout(),
            tools: [{
                id: 'print',
                qtip: "Select products and targets",
                handler: function(event, toolEl, panel){
                    subsuiteposition = getPosition(panel);
                    var productsGrid = panel.items.items[0].items.items[0];
                    var targetsGrid = panel.items.items[0].items.items[1];
                    var productTargetsPanel = panel.items.items[0];
                    
                    productsGrid.store.load();
                    targetsGrid.store.load();
                    try{
                        if (panel.collapsed){
                            panel.toggleCollapse();
                        }
                        if (productTargetsPanel.collapsed){
                            productTargetsPanel.toggleCollapse();
                            productTargetsPanel.show();                            
                        } else {
                            productTargetsPanel.hide();
                            productTargetsPanel.toggleCollapse();
                        }
                    }catch(err){}
                }
            },{
                id: 'close',
                qtip: "Remove suite",
                handler: function(event, toolEl, panel){
                    if (confirm("This will destroy test suite, do you want to proceed?")){
                        removeSubsuite(suiteid, getPosition(panel), panel);
                    }
                    
                }
            }],
            items: [
            new configPanel({
                region: 'north'
            }),
            new itemsPanel({
                region: 'center'
            })
            ]
        });
       
        suitePanel.superclass.initComponent.apply(this, arguments);
    },
    onRender: function(){
        suitePanel.superclass.onRender.apply(this, arguments);
        var productsGrid = this.items.items[0].items.items[0];
        var targetsGrid = this.items.items[0].items.items[1];
        productsGrid.store.load();
        targetsGrid.store.load();
    }
});

