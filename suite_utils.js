// Path to the blank image must point to a valid location on your server
Ext.BLANK_IMAGE_URL = 'ext/resources/images/default/s.gif';
 
/** URLS **/

var testsBlackHoleUrl = 'testsblackhole';
var commandsBlackHoleUrl = 'commandsblackhole';
var testListUrl = 'tests';
var areasListUrl = 'areas';
var saveSuiteUrl = 'savesuite';
var suiteListUrl = 'suitelist';

/** SuiteID and parameter handling (to discuss) **/
var subsuiteposition = '';
var params = '';
var suiteid = '';

function clearParams(){
    params = "";
}

function showWaitingBox(message)
{
    Ext.Msg.wait(message+"...");
}

function hideWaitingBox()
{
    Ext.Msg.hide();
}

Ext.getUrlParam = function(param) {
    var params = Ext.urlDecode(location.search.substring(1));
    return param ? params[param] : params;
};

function addParam(name, value) {
    if (value){
        params = params+name+"="+value+"&"
    }
}

function saveSuiteAJAX(async){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", saveSuiteUrl, async);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.setRequestHeader("Content-length", params.length);
    xmlHttp.setRequestHeader("Connection", "close");
    xmlHttp.send(params);
    return xmlHttp;
}

function serializeSuite(){
    showWaitingBox("Saving suite");
    addParam("savesuite", 1);
    var ajaxresponse = saveSuiteAJAX(true);
    ajaxresponse.onreadystatechange=function(){
        if(ajaxresponse.readyState==4){
            hideWaitingBox();
        }
    }
}

function getPosition(component){
    var relative = 0;
    while (component.previousSibling() != null){
        component = component.previousSibling();
        relative++;
    }
    return relative.toString();
}

function getNodePosition(component){
    var relative = 0;
    while (component.previousSibling != null){
        component = component.previousSibling;
        relative++;
    }
    return relative.toString();
}

function getSuiteTitle(panel){


    if (!panel.products || panel.products.length == 0 || panel.allproducts == "true"|| panel.allproducts == true){
        products = "All";
    }else{       
        products = panel.products.toString();
    }

    if (!panel.targets || panel.targets.length == 0 || panel.alltargets == "true" || panel.alltargets == true){
        targets = "All";
    }else{           
        targets = panel.targets.toString();
    }
    return "Products: "+products+" - Targets: "+targets
}

function addSubSuite(suite){
    clearParams();
    addParam("suiteid", suite);
    addParam("newsuite", "0");
    saveSuiteAJAX(true);
}

function removeSubsuite(suite, subsuite, panel){
    clearParams();
    addParam("suiteid", suite);
    addParam("removesuite", subsuite);
    saveSuiteAJAX(true);
    panel.destroy();
}

function addAreaToSuite(suite, name){
    clearParams();
    addParam("addarea", name);
    addParam("suiteid", suite);
    saveSuiteAJAX(false);
}
function removeAreaFromSuite(suite, key){
    clearParams();
    addParam("removearea", key);
    addParam("suiteid", suite);
    saveSuiteAJAX(false);
}

function addTagToSuite(suite, name){
    clearParams();
    addParam("addtag", name);
    addParam("suiteid", suite);
    saveSuiteAJAX(false);
}

function removeTagFromSuite(suite, name){
    clearParams();
    addParam("removetag", name);
    addParam("suiteid", suite);
    saveSuiteAJAX(false);
}

function addProductToSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("addproduct",name);
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function addTargetToSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("addtarget", name)
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function removeTargetFromSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("removetarget",name);
    saveSuiteAJAX(false);
}

function removeProductFromSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suiteid);
    addParam("suiteposition", subsuite);
    addParam("removeproduct",name);
    saveSuiteAJAX(false);
}


function addTestToSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("addtest",name);
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function positionTestAtSuite(suite, subsuite, name, position){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("addtest", name);
    addParam("positiontest",position);
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function removeTestFromSuite(suite, subsuite, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("removetest",name);
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function addCommandToSuite(suite, subsuite, event, name){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("event",event);
    addParam("addcommand",name);
    var ajaxRequest = saveSuiteAJAX(false);
    if(ajaxRequest.readyState==4){
        if(ajaxRequest.status == 202){//Test not allowed
            throw "Error: "+ajaxRequest.responseText.replace(/&apos;/gi, '"');
        }
    }
}

function positionCommandAtSuite(suite, subsuite, event, name, position){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition",subsuite);
    addParam("addcommand",name);
    addParam("event",event);
    addParam("positioncommand",position);
    saveSuiteAJAX(false);
}

function removeCommandFromSuite(suite, subsuite, event, position){
    clearParams();
    addParam("suiteid", suite);
    addParam("suiteposition", subsuite);
    addParam("event", event);
    addParam("removecommand", position);
    saveSuiteAJAX(false);
}

function disableRowsExceptAll(grid){
    for (var i in grid.getView().getRows()){
        if (i != 0){
            Ext.fly(grid.getView().getRow(i)).addClass("disabled");
        }
    }
}

function enableProductRows(grid, store){
    for (var i in (grid.getView().getRows())){
        if (i != 0 && !isNaN(i)){
            Ext.fly(grid.getView().getRow(i)).removeClass("disabled");
            checkRecord(store.getAt(i));
            addProductToSuite(suiteid, getPosition(grid.ownerCt.ownerCt), store.getAt(i).data.name);
        }
    }
}

function enableTargetRows(grid, store){
    for (var i in (grid.getView().getRows())){
        if (i != 0 && !isNaN(i)){
            Ext.fly(grid.getView().getRow(i)).removeClass("disabled");
            checkRecord(store.getAt(i));
            addTargetToSuite(suiteid, getPosition(grid.ownerCt.ownerCt), store.getAt(i).data.name);
        }
    }
}

function checkRecord(record){
    record.beginEdit();
    record.set('check', true);
    record.data.checked = true;
    record.modified = false;
    record.endEdit();
}

function unCheckRecord(record){
    record.beginEdit();
    record.set('check', false);
    record.data.checked = false;
    record.modified = false;
    record.endEdit();
}

function setPanelProducts(grid, panel, allproducts){
    var products = [];
    var length = grid.getView().getRows().length;
    var index = 0;
    if (allproducts){
        for (i=1;i<length;i++){
            products[index] = grid.store.getAt(i).data.name;
            index = index + 1;
        }
    }else{
        for (i=1;i<length;i++){
            if (grid.store.getAt(i).data.checked){
                products[index] = grid.store.getAt(i).data.name;
                index = index + 1;
            }
        }
    }            
    panel.products = products
}

function setPanelTargets(grid, panel, alltargets){
    var targets = [];
    var length = grid.getView().getRows().length;
    var index = 0;
    if (alltargets){
        for (i=1;i<length;i++){
            targets[index] = grid.store.getAt(i).data.name;
            index = index + 1;
        }
    }else{
        for (i=1;i<length;i++){
            if (grid.store.getAt(i).data.checked){
                targets[index] = grid.store.getAt(i).data.name;
                index = index + 1;
            }
        }
    }
    panel.targets = targets
}