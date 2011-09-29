// Main application entry point
Ext.onReady(function(){

    Ext.QuickTips.init();
    var ui = "";

    function getElements(store){
        var elements = ""
        for (var i in store.data.items){
            if (!isNaN(i)){
                elements=elements+store.data.items[i].data.name+"+"
            }
        }
        return elements
    }

    function loadList(){
        //This function has to pack the data of the 4 search stores as parameters
        //and call elementsStore.load using those params        
        elementsStore.reloadData()

    }

    function onItemToggle(item, toggle){
        if (toggle){
            Ext.getCmp("search_panels").object_content = item.id
            ui = item.id
            loadUI(ui)
            loadList()
        }
    }

    var dataRow = Ext.data.Record.create([{
        name: "name",
        id: "id"
    }]);

    var areasTreeLoader = new Ext.tree.TreeLoader({
        dataUrl: areasListUrl,
        baseParams: {
            id: ""
        }
    });

    areasListener = function(areasTreeLoader, node){
        areasTreeLoader.baseParams.id = node.attributes.key;
    }
    areasTreeLoader.on("beforeload", areasListener, this);



    var searchAreasStore = new Ext.data.JsonStore({
        id: "search_areas_store",
        fields: ["name", "id"]
    });


    var searchTagsStore = new Ext.data.JsonStore({
        id: "search_tags_store",
        fields: ["name", "id"]
    });


    var searchProductsStore = new Ext.data.JsonStore({
        id: "search_products_store",
        fields: ["name", "id"]
    });


    var searchTargetsStore = new Ext.data.JsonStore({
        id: "search_targets_store",
        fields: ["name", "id"]
    });


    var areasTree = new Ext.tree.TreePanel({
        id: "areasTree",
        title: "Select Areas",
        autoScroll:true,
        animate:true,
        height: 239,
        containerScroll: true,
        scroll: "vertical",
        frame: true,
        useArrows:true,
        loader: areasTreeLoader,
        root: new Ext.tree.AsyncTreeNode({
            expanded: true,
            text: 'Areas',
            key: 'Areas',
            leaf: false
        }),
        rootVisible: false,
        listeners: {
            checkchange: function(node, checked){
                showWaitingBox("Loading");
                if(checked){
                    //add to areas grid
                    searchAreasStore.add(new dataRow({
                        name: node.attributes.key,
                        id: node.id
                    }));                    
                    loadList();
                }else{
                    //remove from areas grid
                    searchAreasStore.removeAt(searchAreasStore.find("name", node.attributes.key));
                    loadList();
                }
            }
        }
    });

    var tagsStore = new Ext.data.JsonStore({
        // store configs
        //autoDestroy: true,
        autoLoad: true,
        url: 'tags',
        fields: ["name", "checked"]
    });


    var tagsSm = new Ext.grid.CheckboxSelectionModel({
        listeners: {
            rowselect: function(sm, ri) {
                showWaitingBox("Loading");
                searchTagsStore.add(new dataRow({
                    name: tagsStore.getAt(ri).data.name,
                    id: tagsStore.getAt(ri).data.name
                }));
                loadList();
            },
            rowdeselect: function(sm, ri){
                showWaitingBox("Loading");
                searchTagsStore.removeAt(searchTagsStore.find("name", tagsStore.getAt(ri).data.name));
                loadList();
            }
        }
    });


    var tagsGrid = new Ext.grid.GridPanel({
        id: "tagsGrid",
        stripeRows: true,
        height: 239,
        hideHeaders: true,
        store: tagsStore,
        cm: new Ext.grid.ColumnModel({
            defaults: {
                width: 120,
                sortable: true
            },
            columns: [
            tagsSm,
            {
                id:'name',
                header: "All",
                sortable: true,
                dataIndex: 'name'
            }
            ]
        }),
        sm: tagsSm,
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Select Tags'
    });

    var productsStore = new Ext.data.JsonStore({
        // store configs
        //autoDestroy: true,
        autoLoad: true,
        baseParams: {
            search: "true"
        },
        url: 'products',
        fields: ["name"]
        });

    var targetsStore = new Ext.data.JsonStore({
        // store configs
        //autoDestroy: true,
        autoLoad: true,
        baseParams: {
            search: "true"
        },
        url: 'targets',
        fields: ["name"]
        });


    var elementsStore = new Ext.data.JsonStore({
        // store configs
        //autoDestroy: true,
        url: "search",
        fields: ["name"],
        reloadData: function(){
            this.load({
                params: {
                    search: Ext.getCmp("search_panels").object_content,
                    areas: getElements(searchAreasStore),
                    tags: getElements(searchTagsStore),
                    products: getElements(searchProductsStore),
                    targets: getElements(searchTargetsStore)
                }
            });
        },
        listeners: {
            load: function(){
                hideWaitingBox();
            }
        },
        sortInfo:{field: 'name', direction: "ASC"}
    });



    var productsSm = new Ext.grid.CheckboxSelectionModel({
        listeners: {
            rowselect: function(sm, ri) {
                showWaitingBox("Loading");
                searchProductsStore.add(new dataRow({
                    name: productsStore.getAt(ri).data.name,
                    id: productsStore.getAt(ri).data.name
                }));
                loadList();
            },
            rowdeselect: function(sm, ri){
                showWaitingBox("Loading");
                searchProductsStore.removeAt(searchProductsStore.find("name", productsStore.getAt(ri).data.name));
                loadList();
            }
        }
    });

    var targetsSm = new Ext.grid.CheckboxSelectionModel({
        listeners: {
            rowselect: function(sm, ri) {
                showWaitingBox("Loading");
                searchTargetsStore.add(new dataRow({
                    name: targetsStore.getAt(ri).data.name,
                    id: targetsStore.getAt(ri).data.name
                }));
                loadList();
            },
            rowdeselect: function(sm, ri){
                showWaitingBox("Loading");
                searchTargetsStore.removeAt(searchTargetsStore.find("name", targetsStore.getAt(ri).data.name));
                loadList();
            }
        }
    });

    var productsGrid = new Ext.grid.GridPanel({
        id:'products_grid',
        height: 225,
        iconCls: "product",
        stripeRows: true,
        store: productsStore ,
        hideHeaders: true,
        cm: new Ext.grid.ColumnModel([
            productsSm,
            {
                id:'name',
                header: "All",
                sortable: true,
                dataIndex: 'name'
            }
            ]),
        sm: productsSm,
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Product list'
    });

    var targetsGrid = new Ext.grid.GridPanel({
        id:'targets_grid',
        iconCls: "target",
        height: 239,
        stripeRows: true,
        hideHeaders: true,
        store: targetsStore ,
        cm: new Ext.grid.ColumnModel([
            targetsSm,
            {
                id:'name',
                header: "All",
                sortable: true,
                dataIndex: 'name'
            }
            ]),
        sm: targetsSm,
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Target list'
    });

    var searchPanels = new Ext.Panel({
        object_content: "suite",
        id: 'search_panels',
        region: 'north',
        height: 250,
        title: "Search fields",
        layoutConfig:{
            animate:true
        },
        containerScroll: true,
        enableDD:true,
        border:false,
        collapsible: true,
        layout: 'column',
        // defaults are applied to all child items unless otherwise specified by child item
        defaults: {
            columnWidth: '.25',
            border: false
        },
        items: [productsGrid, targetsGrid, areasTree, tagsGrid]
    });

    var elementsGrid = new Ext.grid.GridPanel({
        id: "elements_grid",
        iconCls: "icon-grid",
        title: "List",
        header: false,
        containerScroll: true,
        store: elementsStore ,
        stripeRows: true,
        flex: 1.8,
        columns: [
        {
            id       :'name',
            header   : 'Name',
            sortable : true,
            dataIndex: 'name'
        },{
            xtype: 'actioncolumn',
            header: "Edit",
            width: 35,
            items: [{
                icon   : '../public/images/grid.png',  // Use a URL in the icon config
                tooltip: 'Edit',
                handler: function(grid, rowIndex, colIndex) {
                    if (Ext.getCmp("search_panels").object_content == "suite"){
                    window.open("http://"+location.host+"/editor.html?suiteid="+elementsStore.getAt(rowIndex).data.name);
                    }else{
                       alert("At the moment the editor is just implemented for suite");
                    }
            }
            }]
            }
    ],
        tbar: new Ext.Toolbar({
            cls: 'x-panel-header',
            height: 25,
            items: [
            '<span style="color:#15428B; font-weight:bold; font-size:11px; font-family:tahoma,arial,verdana,sans-serif;">List</span>',
            '->',
            {
                text: 'Suites',
                id: "suite",
                enableToggle: true,
                toggleGroup: "elements",
                toggleHandler: onItemToggle,
                pressed: true
            },"-",
            {
                text: 'Tests',
                id: "test",
                enableToggle: true,
                toggleGroup: "elements",
                toggleHandler: onItemToggle,
                pressed: false
            },"-",
            {
                text: 'Commands',
                id: "command",
                enableToggle: true,
                toggleGroup: "elements",
                toggleHandler: onItemToggle,
                pressed: false
            }
            ]
        }),
        autoExpandColumn: "name",
        listeners: {
            rowclick: function(grid, rowIndex, event){
                var record = grid.getStore().getAt(rowIndex);
                propertyMultiStore.load({
                    params: {
                        fields: "areas_tags",
                        elementid: grid.getStore().getAt(rowIndex).data.name,
                        type: Ext.getCmp("search_panels").object_content
                    }
                });
                detailsPropertyMultiStore.load({
                    params: {
                        fields: "details",
                        elementid: grid.getStore().getAt(rowIndex).data.name,
                        type: Ext.getCmp("search_panels").object_content
                    }
                });

            }
        }
    });

    tb = new Ext.Toolbar({
        items: [{
            text:'New',
            id: "new_button",
            tooltip:'Create a new element',
            iconCls:'add',
            handler: function(grid, rowIndex, colIndex) {
                //TODO redirect to right editor, now we just have suite
                if (Ext.getCmp("search_panels").object_content == "suite"){
                    window.open("http://"+location.host+"/editor.html");
                }else{
                    alert("At the moment the editor is just implemented for suite");
                }
                
            }
        }
    ]
});
elementsGrid.add(tb);

    var multireader = new Ext.data.JsonReader({
        fields: [ { 
            name: "name"
        },{
            name: "group"
        }]
    });


    var propertyMultiStore = new Ext.data.GroupingStore({
        baseParams: {
            fields: "areas_tags"
        },
        reader: multireader,
        url: 'properties',
        groupField:'group'
        //sortInfo:{field: 'name', direction: "ASC"},
    });


    var propertiesGridMulti = new Ext.grid.GridPanel({
        region: "center",
        id:'propertiesGridMulti',
        stripeRows: true,
        //autoHeight: true,
        store: propertyMultiStore ,
        hideHeaders: true,
        cm: new Ext.grid.ColumnModel([
            {
            id:'name',
            sortable: false,
            dataIndex: 'name'
        },{
            id:'group',
            sortable: true,
            dataIndex: 'group',
            hidden: true
        }]),
        view: new Ext.grid.GroupingView({
            forceFit:true,
            groupTextTpl: '{group} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
        }),
        viewConfig: {
            forceFit:true
        },
        columnLines: false
    });

    var detailsMultireader = new Ext.data.JsonReader({
        fields: [ {
            name: "name"
        },{
            name: "group"
        },{
            name: "value"
        }]
    });

    var detailsPropertyMultiStore = new Ext.data.GroupingStore({
        baseParams: {
            fields: "details"
        },
        reader: detailsMultireader,
        url: 'properties',
        groupField:'group'
        //sortInfo:{field: 'name', direction: "ASC"},
    });



    var detailsPropertiesGridMulti = new Ext.grid.GridPanel({
        region: "north",
        id:'detailsPropertiesGridMulti',
        stripeRows: true,
        height: 155,
        //autoHeight: true,
        store: detailsPropertyMultiStore ,
        hideHeaders: true,
        cm: new Ext.grid.ColumnModel({
        columns: [
            {
            id:'name',
            sortable: false,
            dataIndex: 'name',
            width: 30
        },{
            id:'group',
            sortable: true,
            dataIndex: 'group',
            hidden: true
          },{
            id:'value',
            sortable: false,
            dataIndex: 'value',
            width: 150
        }
        ]}),
        view: new Ext.grid.GroupingView({
            forceFit:true,
            groupTextTpl: '{group} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            
        }),
        viewConfig: {
            forceFit:true
        },
        columnLines: true
    });

    var elementProperties = new Ext.Panel({
        layout: "border",
        id: "element_properties",
        iconCls: "icon-grid",
        title: "Properties",
        containerScroll: true,
        frame: true,
        flex: 1,
        items: [detailsPropertiesGridMulti, propertiesGridMulti]

    });





    var suitePanels = new Ext.Panel({
        id: 'element_panels',
        region: 'center',
        layoutConfig:{
            animate:true,
            align: "stretch"
        },
        containerScroll: true,
        layout: 'hbox',
        items: [elementsGrid, elementProperties]
    });


    var managerPanel = new Ext.Panel({
        title: "Fast Manager 0.1",
        layout: 'border',
        items: [
        searchPanels,
        suitePanels
        ]
    });



    // End of reporting UI
    var reportPanel = new Ext.Panel({
        title: "Reports",
        layout: 'border',
        disabled: true
    });

    var mainTabs = new Ext.TabPanel({
        region: 'center',
        activeTab: 0,
        border: false,
        items: [
        managerPanel,
        reportPanel
        ]
    });

    var view = new Ext.Viewport({
        layout: 'border',
        renderTo: Ext.getBody(),
        items: [
        mainTabs
        ]
    });



    function loadUI(type){
        if (type == null){
            type = "suite"
            ui = "suite";
        }
        elementsStore.load({
            params: {
                "search": type
            }
        });

    }

    ui = Ext.getUrlParam("search");
    loadUI(ui);

});

