
function addSuitePanel(prods, targs, allprods, alltargs) {
    var new_panel = new suitePanel({products: prods,
    targets: targs, allproducts: allprods, alltargets:alltargs});
    Ext.getCmp('blackhole').add(new_panel);    
    Ext.getCmp('blackhole').doLayout();
    return new_panel;
}

function getName(){
    return Ext.getCmp('suite_set_name').getValue();
}

function getCreator(){
    return Ext.getCmp('suite_set_owner').getValue();
}

function getDescription(){
    return Ext.getCmp('suite_set_description').getValue();
}

function getDate(){
    return Ext.getCmp('suite_set_date').getValue();
}

// Main application entry point
Ext.onReady(function(){	
  
    Ext.QuickTips.init();
    
    var dataRow = Ext.data.Record.create([{
        name: "name",
        id: "id"
    }]);

    var areasTreeLoader = new Ext.tree.TreeLoader({
        dataUrl: areasListUrl,
        baseParams: {
            id: "",
            suiteid: suiteid
        }
    });

    areasListener = function(areasTreeLoader, node){
        areasTreeLoader.baseParams.id = node.attributes.key;
        areasTreeLoader.baseParams.suiteid = suiteid;
    }
    areasTreeLoader.on("beforeload", areasListener, this);

    var areasStore = new Ext.data.JsonStore({
        id: "areasStore",
        // store configs
        //autoDestroy: true,
        url: areasListUrl,
        baseParams: {
            loadgrid: true,
            suiteid: suiteid
        },
        fields: ["name", "id"]
    });

    var suitesStore = new Ext.data.JsonStore({
        id: "suitesStore",
        // store configs
        //autoDestroy: true,
        url: suiteListUrl,
        baseParams: {
            suiteid: suiteid
        },
        fields: ["index", "products", "targets", "allproducts", "alltargets"]
    });

    var areasTree = new Ext.tree.TreePanel({
        id: "areasTree",
        title: "Select Areas",
        autoScroll:true,
        animate:true,
        height: 200,
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
                if(checked){
                    //add to areas grid
                    areasStore.add(new dataRow({
                        name: node.attributes.key,
                        id: node.id
                    }));
                    addAreaToSuite(suiteid, node.attributes.key);
                }else{
                    //remove from areas grid
                    areasStore.removeAt(areasStore.find("name", node.attributes.key));
                    removeAreaFromSuite(suiteid, node.attributes.key);                  
                }
            }
        }
    });

    var areasGrid = new Ext.grid.GridPanel({
        id: "areasGrid",
        stripeRows: true,
        height: 200,
        store: areasStore,
        columns: [
        {
            id:'name',
            header: "Key",
            sortable: true,
            dataIndex: 'name'
        },
        {
            xtype: 'actioncolumn',
            width: 10,
            items: [{
                icon: "../public/images/blue_cross.png",
                tooltip: "Remove area",
                handler: function(grid, rowIndex, colIndex){
                    //uncheck element@areasTree, listener there will do the rest of the job
                    try{
                        areasTree.getNodeById(areasStore.getAt(rowIndex).data.id).ui.toggleCheck();
                    } catch (err) { //No node found, tree was not expanded enough
                        removeAreaFromSuite(suiteid, areasStore.getAt(rowIndex).data.id);
                        areasStore.removeAt(rowIndex);
                    }                    
                }
            }]
        }
        ],
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Areas'
    });

    var areasTabs = new Ext.TabPanel({
        id: "areasTabs",
        height: 210,
        activeTab: 0,
        frame: true,
        items: [
        areasGrid,
        areasTree
        ]
    });

    var editTagsStore = new Ext.data.JsonStore({
        // store configs
        //autoDestroy: true,
        url: 'tags',
        baseParams: {
            suiteid: suiteid
        },
        fields: ["name", "checked"]
    });

    var tagsStore = new Ext.data.JsonStore({
        id: "tagsStore",
        // store configs
        //autoDestroy: true,
        autoLoad: false,
        url: 'tags',
        baseParams: {
            suiteid: suiteid,
            loadgrid: true
        },
        fields: ["name"]
    });


    var tagsCheck = new Ext.grid.CheckColumn({
        id: "tagsCheck",
        dataIndex: "checked",
        width: 10,
        listeners: {
            click: function(element, event, record){
                if (record.data.checked == true){
                    tagsStore.add(new dataRow({
                        name: record.data.name 
                    }));
                    addTagToSuite(suiteid, record.data.name);
                }else{
                    tagsStore.removeAt(tagsStore.find("name", record.data.name));
                    removeTagFromSuite(suiteid, record.data.name);
                }                
            }
        }
    });
    
    var editTagsGrid = new Ext.grid.GridPanel({
        id: "editTagsGrid",
        stripeRows: true,
        height: 200,
        store: editTagsStore,
        hideHeaders: true,
        cm: new Ext.grid.ColumnModel({
            defaults: {
                width: 120,
                sortable: true
            },
            columns: [
            tagsCheck,
            //           sm,
            {
                id:'name',
                header: "Name",
                sortable: true,
                dataIndex: 'name'
            }
            ]
        }),
        sm: tagsCheck,
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Select Tags'

    });


    var tagsGrid = new Ext.grid.GridPanel({
        stripeRows: true,
        height: 200,
        store: tagsStore,
        columns: [
        {
            id:'name',
            header: "Name",
            sortable: true,
            dataIndex: 'name'
        },
        {
            xtype: 'actioncolumn',
            width: 10,
            items: [{
                icon: "../public/images/blue_cross.png",
                tooltip: "Remove tag",
                handler: function(grid, rowIndex, colIndex){
                    //set checked@editTagsGrid, fire click event
                    var record = editTagsStore.getAt(editTagsStore.find("name", tagsStore.getAt(rowIndex).data.name));
                    unCheckRecord(record);
                    tagsCheck.fireEvent('click', null, null, record);
                }
            }]
        }
        ],
        viewConfig: {
            forceFit:true
        },
        columnLines: true,
        frame:true,
        title:'Tags'
    });



    var tagsTabs = new Ext.TabPanel({
        id: "tagsTabs",
        height: 210,
        activeTab: 0,
        frame: true,
        items: [
        tagsGrid,
        editTagsGrid
        ]
    });


    var individual = [{        
        bodyStyle: 'padding-right:5px;',
        frame: true,
        items: {
            id: 'suite_info',
            xtype: 'fieldset',
            title: 'Information',
            autoHeight: true,
            items: [{
                xtype: 'textfield',
                name: 'suite_set_name',
                id:'suite_set_name',
                fieldLabel: 'Name',
                anchor: '100%',
                width: "100%"
            }, {
                xtype: 'textfield',
                id: 'suite_set_owner',
                name: 'suite_set_owner',
                fieldLabel: 'Creator',
                anchor: '100%',
                width: "100%"
            }, {
                xtype: 'datefield',
                id: 'suite_set_date',
                name: 'suite_set_date',
                fieldLabel: 'Creation date',
                anchor: '100%',
                width: "100%"
            },{
                fieldLabel: 'Description',
                height: 75,
                xtype: 'textarea',
                id: 'suite_set_description',
                name: 'suite_set_description',
                anchor: '100%',
                width: "100%"
            }
           ]
        }
    }, areasTabs, tagsTabs
    ];


    var blackHoleProperties = new Ext.Panel({
        id: 'blackhole_properties',
        region: 'north',
        height: 260,
        title: "Suite Manager 0.1",
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
            columnWidth: '.3333333333333333333333333333333333333333333333333333',
            border: false
        },
        tbar: [{
            text:'Save',
            tooltip:'Save suite manager',
            iconCls:'save',
            // Place a reference in Suite panel
            ref: '../saveSuite',
            handler: function(){
                clearParams();
                if (getName()){
                    addParam("name", getName());
                    addParam("creator", getCreator());
                    addParam("date", getDate());
                    addParam("description", getDescription());
                    addParam("suiteid", suiteid);
                    suiteid = getName();
                    serializeSuite();
                } else {
                    alert("Name is required to create a Suite Design ")
                }
            }
        }, "-"],
        items: individual   
        
    });

    var blackHole = new Ext.Panel({
        id: 'blackhole',
        region: 'center',
        layout: 'accordion',
        titleCollapse: true,
        layoutConfig:{
            animate:true
        },
        autoScroll:true,
        animate:true,
        scroll:'vertical',
        containerScroll: true,
        enableDD:true,        
        border:false,
        items:[
        ],//End of accordion items (suites)
        
        tbar: [
        {
            text:'New',
            tooltip:'Create a new suite',
            iconCls:'add',
            // Place a reference in Suite panel
            ref: '../addSuite',
            handler: function(){
                addSuitePanel();
                addSubSuite(suiteid);
            }
        },"-"]
    });

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
        }
        ]),
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
        height: 135,
        //autoHeight: true,
        store: detailsPropertyMultiStore ,
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
        },{
            id:'value',
            sortable: false,
            dataIndex: 'value'
        }
        ]),
        view: new Ext.grid.GroupingView({
            forceFit:true,
            groupTextTpl: '{group} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'

        }),
        viewConfig: {
            forceFit:true
        },
        columnLines: true
    });

    var propertiesGrid = new Ext.Panel({
        layout: "border",
        id: "element_properties",
        iconCls: "icon-grid",
        region: "south",
        width: 300,
        height: 350,
        title: "Properties",
        containerScroll: true,
        frame: true,
        flex: 1,
        items: [detailsPropertiesGridMulti, propertiesGridMulti
        ]
    });


    var testGrid = new Ext.tree.TreePanel({
        iconCls: 'icon-grid',
        title: 'Test List',
        autoScroll:true,
        animate:true,
        enableDD:true,
        ddGroup: "tests",
        isTarget: false,
        containerScroll: true,
        rootVisible: false,
        frame: true,
        root: {
            nodeType: 'async'
        },
        // auto create TreeLoader
        dataUrl: 'tests',
        listeners: {
            beforenodedrop: function (dropEvent) {
                // Does this node come from the blackhole tree?
                if (dropEvent.source.tree.id !== dropEvent.tree.id) {
                    // The node should be discarded.
                    dropEvent.dropNode.parentNode.removeChild(dropEvent.dropNode, false);

                    // The node has been discarded, return drop succeeded.
                    dropEvent.dropStatus = true;
                    return false;
                }
                return true;
            },
            nodedragover: function (dragevent) {
                // If the node comes from the right tree, it is allowed to be dropped here.
                if (dragevent.source.tree.id !== dragevent.tree.id) {
                    return true;
                }
                // A node from this tree is not allowed to be dropped.
                return false;
            },
            click: function(n){
                propertyMultiStore.load({
                    params: {
                        fields: "areas_tags",
                        elementid:  n.attributes.text,
                        type: "test"
                    }
                });
                detailsPropertyMultiStore.load({
                    params: {
                        fields: "details",
                        elementid: n.attributes.text,
                        type: "test"
                    }
                });

            }
        }

    });

    var commandGrid = new Ext.tree.TreePanel({
        iconCls: 'command',
        title: 'Command List',
        autoScroll:true,
        animate:true,
        enableDD:true,
        ddGroup: "commands",
        containerScroll: true,
        rootVisible: false,
        frame: true,
        root: {
            nodeType: 'async'
        },
        dataUrl: 'commands',
        listeners: {
            beforenodedrop: function (dropEvent) {
                if (dropEvent.source.tree.id !== dropEvent.tree.id) {
                    dropEvent.dropNode.parentNode.removeChild(dropEvent.dropNode, false );
                    dropEvent.dropStatus = true;
                    return false;
                }
                return true;
            },
            nodedragover: function (dragevent) {
                if (dragevent.source.tree.id !== dragevent.tree.id) {
                    return true;
                }
                return false;
            },
            click: function(n){
                propertyMultiStore.load({
                    params: {
                        fields: "areas_tags",
                        elementid:  n.attributes.text,
                        type: "command"
                    }
                });
                detailsPropertyMultiStore.load({
                    params: {
                        fields: "details",
                        elementid: n.attributes.text,
                        type: "command"
                    }
                });

            }
        }

    }); 

    var testcommandTabs = new Ext.TabPanel({
        region: "center",
        width: 375,
        activeTab: 0,
        border: false,
        frame:true,
        items:[
        testGrid,
        commandGrid
        ]
    });


    var main = new Ext.Panel({
        region: 'center',
        layout: 'border',
        items:[
        blackHoleProperties,
        blackHole
        ]
    });

    var rightRegion = new Ext.Panel({
        id: "rightRegion",
        border: false,
        width: 375,
        region: 'east',
        layout: 'border',
        items:[
        testcommandTabs,
        propertiesGrid
        ]
    });
	
    var view = new Ext.Viewport({
        layout: 'border',
        renderTo: Ext.getBody(),
        items: [
        main,
        rightRegion
        ]        
    });

    var suiteDetailsReader = new Ext.data.JsonReader({
        fields: [ {
            name: "name"
        },{
            name: "group"
        },{
            name: "value"
        }]
    });

    var suiteDetailsStore = new Ext.data.GroupingStore({
        id: "suiteDetailsStore",
        baseParams: {
            fields: "details"
        },
        reader: suiteDetailsReader,
        url: 'properties',
        groupField:'group'       
        //sortInfo:{field: 'name', direction: "ASC"},
    });


    function loadSuiteDetails(suite){
        suiteDetailsStore.load({
            params: {
                fields: "details",
                elementid: suite,
                type: "suite"
            },
            callback: function(){
                var comp = Ext.StoreMgr.get("suiteDetailsStore");
                try {
                    var date = new Date(comp.getById("Date").data.value);
                }catch(err){}
                try{
                    Ext.getCmp("suite_set_owner").setValue(comp.getById("Creator").data.value);
                }catch(err){}
                try{
                    Ext.getCmp("suite_set_date").setValue(date.getDate());
                }catch(err){}
                try{
                    Ext.getCmp("suite_set_description").setValue(comp.getById("Description").data.value);
                }catch(err){}
            }
        });
    }
    
    function loadAreasGrid(suite){
        areasStore.load({
            params: {
                "suiteid":suite
            }
        });
    }

    function loadTagsGrid(suite){
        editTagsStore.load({
            params: {
                "suiteid":suite
            }
        });
        tagsStore.load({
            params: {
                "suiteid":suite,
                "loadgrid":true
            }
        });
    }

    function loadSuiteSet(suite){
        suitesStore.load({
           params: {
               "suiteid":suite
           }
        });
    }


    function loadSuite(suite){
        Ext.getCmp('suite_set_name').setValue(suite);
        // Load areas grid
        loadSuiteDetails(suite);
        loadAreasGrid(suite);
        loadTagsGrid(suite);
        loadSuiteSet(suite);
        if(!suite){
            addSuitePanel();
            addSubSuite(suiteid);
        }
    }

    //LISTENERS
    suitesStore.on("load", function(){            
            this.each(function(record){
               var suitepanel = addSuitePanel(record.data.products, record.data.targets, record.data.allproducts, record.data.alltargets);
               var title = getSuiteTitle(suitepanel);
               suitepanel.setTitle(title);
            });
    });
    suiteid = Ext.getUrlParam("suiteid");
    loadSuite(suiteid);
});
