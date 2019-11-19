var g_params = {}, g_iframeIndex = null, $treeView = $('#treeView');
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
});

/**
 * 获取从父窗口传送过来的值
 * @param value
 */
function receiveParams(value){
	g_params = value;
	//初始化界面
	initView();
	loadFuncTree();
}

/**
 * 初始化界面
 */
function initView(){
	$treeView.jstree({
		'core': {
			"check_callback": true
		},
		"plugins": ["types", "checkbox"],
		"types": {
			"default": {
				"icon": "fa fa-folder"
			}
		},
		"checkbox": {
			"keep_selected_style": false
		}
    });

	$treeView.bind("loaded.jstree", function (e, data) {
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	    $treeView.jstree('open_node', rootNode);
	});
	//刷新节点后获取根节点
	$treeView.bind("refresh.jstree", function (e, data) {
		var inst = data.instance;  
		var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	    $treeView.jstree('open_node', rootNode);
	});
}

/**
 * 加载权限树
 */
function loadFuncTree(){
	$.ajax({
		//url: top.app.conf.url.api.system.tenants.getTenFuncTree,
		url: top.app.conf.url.api.system.func.getFuncTree,
	    method: 'GET',
	   	data:{
	   		access_token: top.app.cookies.getCookiesToken()
	   	},
      	success: function(data){
      		if(top.app.message.code.success == data.RetCode){
		    		$treeView.jstree(true).settings.core.data = data.RetData;
		    		$treeView.jstree(true).refresh();
		    		//加载权限树选中状态
		    		setTimeout(function () {
		    			loadFuncTreeByTenantsId();
		    	    }, 300);
		    	}else{
		    		top.app.message.error(data.RetMsg);
		    	}
	   	}
    });
}


/**
 * 加载权限树选中状态
 */
function loadFuncTreeByTenantsId(){
	$.ajax({
		url: top.app.conf.url.api.system.tenants.getFuncIdByTenantsId,
	    method: 'GET',
	   	data:{
		    	access_token: top.app.cookies.getCookiesToken(),
		    	tenantsId: g_params.rows.tenantsId
	   	},
      	success: function(data){
      		//取消所有节点选中
      		$treeView.jstree(true).uncheck_all();
      		if(top.app.message.code.success == data.RetCode){
	      		for(var i = 0;i < data.RetData.length; i++){
		        		var node = $treeView.jstree(true).get_node(data.RetData[i]);
		        		if(node != null && node != undefined && $treeView.jstree(true).is_leaf(node)){
		          			$treeView.jstree(true).check_node(node);
		        		}
		        	}
		    	}else{
		    		top.app.message.error(data.RetMsg);
		    	}
	   	}
    });
}


/**
 * 提交数据
 */
function submitAction(){
	top.app.message.loading();
	var funcIds = getAllCheckFuncId();
	var submitData = {};
	submitData["tenantsId"] = g_params.rows.tenantsId;
	submitData["funcIds"] = funcIds;
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data: JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.notice("保存权限数据成功！");
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

/**
 * 获取所有勾选的权限ID
 */
function getAllCheckFuncId(){
	var nodeArray = $treeView.jstree(true).get_checked(true);
	var parentNodeId, node, nodeMap = {}, nodeIdList = "";
	for(var i = 0;i < nodeArray.length; i++){
		node = nodeArray[i];
		nodeMap[node.id] = node.id;
		while(parentNodeId = $treeView.jstree('get_parent', node)){
   		  node = parentNodeId; 
   		  nodeMap[node] = node;
	   }   
	}
	for(var key in nodeMap){
		if(nodeMap[key] != null && nodeMap[key] != undefined)
			nodeIdList = nodeIdList + nodeMap[key] + ",";
	}
	nodeIdList = nodeIdList.substring(0, nodeIdList.length - 1);
	return nodeIdList;  
}