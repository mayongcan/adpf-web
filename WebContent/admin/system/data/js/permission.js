var $treeView = $('#treeView'), $tableUser = $('#tableListUser'), $comboxTenants = $('#tenantsBox'), g_allTreeData = null;
var g_searchPannelHeight = 0, g_selectUserRow = null, g_isFirstLoad = true;
var g_tenantsId = top.app.info.tenantsInfo.tenantsId, g_organizerId = null, g_selectNode = null;
var g_comboBoxTree = null;
$(function () {
	// 初始化权限
	initFunc();
	// 初始化树列表
	initTree();
	initTableUser();
	// 初始化权限功能按钮点击事件
	initDataPermissionBtnEvent();
	initUserBtnEvent();
	// 初始化下拉选择列表(租户和组织)
	initComboBoxList();
});

/**
 * 初始化权限
 */
function initFunc(){
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#treeToolbar").empty();
	$("#tableToolbarUser").empty();
	var htmlDataPermission = "", htmlUser = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		if(operRights[i].funcFlag.indexOf("userDataPermission") != -1){
			htmlUser += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}else{
			htmlDataPermission += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}
	}
	// 添加树列表的权限
	$("#treeToolbar").append(htmlDataPermission);
	$("#tableToolbarUser").append(htmlUser);
}

/**
 * 初始化树列表
 */
function initTree(){
	$treeView.jstree({
		'core': {
			"check_callback": true,
			'data': function (objNode, cb) {
				$.ajax({
				    url: top.app.conf.url.api.system.data.getDataPermissionTreeList,
				    method: 'GET',
				    data: {
					    	access_token: top.app.cookies.getCookiesToken(),
					    	tenantsId: g_tenantsId,
					    	organizerId: g_organizerId == null ? top.app.info.rootOrganizerId : g_organizerId,
				    },success: function(data){
					    	if(top.app.message.code.success == data.RetCode){
					    		g_allTreeData = data.RetData;
								cb.call(this, data.RetData);
					    	}else{
					    		top.app.message.error(data.RetMsg);
					    	}
					}
				});
			}
		},
		"plugins": ["types"],
		"types": {
			"default": {
				"icon": "fa fa-folder"
			}
		}
    });
	
	$treeView.bind("activate_node.jstree", function (obj, e) {
	    // 获取当前节点
		g_selectNode = e.node;
	    // 加载用户列表
	    $tableUser.bootstrapTable('refresh', {"url": top.app.conf.url.api.system.data.getUserListByDataPermission});
	});
	$treeView.bind("refresh.jstree", function (e, data) {
	    // 更新选中节点
		if(g_selectNode != null){
			g_selectNode = $treeView.jstree('get_node', g_selectNode);
		}
		if(e.target.firstChild.firstChild == null) return;
		// 展开根节点
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild);
	    
	    // 隐藏虚拟节点
	    if(rootNode.id == '-1') $treeView.jstree('hide_node', rootNode); 
	    // $treeView.jstree('open_node', rootNode);
	});
	// 展开根节点
	$treeView.bind("loaded.jstree", function (e, data) {
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	 
	    // 隐藏虚拟节点
	    if(rootNode.id == '-1') $treeView.jstree('hide_node', rootNode);
	    else $treeView.jstree('open_node', rootNode);
	});
	
	$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 128));
    $(window).resize(function () {
    		$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 128));
    });
}


/**
 * 初始化列表信息
 */
function initTableUser(){
	// 搜索参数
	var searchParamsUser = function (params) {
        var param = {   // 这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						// 页面大小
            page: params.offset / params.limit,  		// 当前页
            tenantsId: g_tenantsId,
            organizerId: g_organizerId,
            permissionId: g_selectNode.id,
            dataType: "in" 
        };
        return param;
    };
    // 初始化列表
	$tableUser.bootstrapTable({
        queryParams: searchParamsUser,										// 传递参数（*）
        uniqueId: 'userId',
        onClickRow: function(row, $el){
	        	g_selectUserRow = row;
	        	appTable.setRowClickStatus($tableUser, row, $el);
        }
    });
	// 加载数据成功后执行事件
	$tableUser.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($tableUser, g_searchPannelHeight + 34);
    });
	// 重置表格高度
	appTable.resetTableHeight($tableUser, g_searchPannelHeight + 34);

	// 权限--单选多选切换功能
	$("#toolbarMultiCheck").click(function () {
		appTable.multiCheck($tableUser, $("#toolbarMultiCheck i"));
    });
}

/**
 * 初始化角色功能按钮
 */
function initDataPermissionBtnEvent(){
	$("#dataPermissionAdd").click(function () {
		// 设置参数
		var params = {};
		params.type = 'add';
		params.tenantsId = g_tenantsId;
		params.organizerId = g_organizerId;
		params.node = g_selectNode;
		params.allTreeData = g_allTreeData;
		params.parentNode = getSelNodeParent();
		params.operUrl = top.app.conf.url.apigateway + $("#dataPermissionAdd").data('action-url');
		top.app.layer.editLayer('新增数据权限', ['710px', '350px'], '/admin/system/data/permission-edit.html', params, function(){
			// 重新加载
			$treeView.jstree(true).refresh();
		});
    });
	$("#dataPermissionEdit").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		// 设置参数
		var params = {};
		params.type = 'edit';
		params.node = g_selectNode;
		params.allTreeData = g_allTreeData;
		params.parentNode = getSelNodeParent();
		params.operUrl = top.app.conf.url.apigateway + $("#dataPermissionEdit").data('action-url');
		top.app.layer.editLayer('编辑数据权限', ['710px', '350px'], '/admin/system/data/permission-edit.html', params, function(){
			// 重新加载
			$treeView.jstree(true).refresh();
		});
    });
	$("#dataPermissionDel").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		if(!$treeView.jstree('is_leaf', g_selectNode)){
			top.app.message.alert("该节点存在子节点，请先删除子节点再删除数据！");
			return;
		}
		var submitData = {};
		submitData["idsList"] = g_selectNode.id;
		var operUrl = top.app.conf.url.apigateway + $("#dataPermissionDel").data('action-url');
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			top.app.message.loading();
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
						// 重新加载列表
						$treeView.jstree(true).refresh();
			   			top.app.message.alert("数据删除成功！");
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
}

/**
 * 初始化用户权限功能按钮
 */
function initUserBtnEvent(){
	$("#userDataPermissionAdd").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择一个数据权限！");
			return;
		}
		// 设置参数
		var params = {};
		params.tenantsId = g_tenantsId;
		params.organizerId = g_organizerId;
		params.permissionId = g_selectNode.id;
		params.operUrl = top.app.conf.url.apigateway + $("#userDataPermissionAdd").data('action-url');
		top.app.layer.editLayer('绑定用户所属数据权限', ['850px', '550px'], '/admin/system/data/permission-user.html', params, function(){
   			// 重新加载
			$tableUser.bootstrapTable('refresh');
		});
    });
	$("#userDataPermissionDel").click(function () {
		var selectRows = $tableUser.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要解绑的用户数据！");
			return;
		}
		var idsList = "";
		$.each(selectRows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.userId;
		});
		var operUrl = top.app.conf.url.apigateway + $("#userDataPermissionDel").data('action-url');
		top.app.message.confirm("确定要解绑选中的用户？", function(){
			top.app.message.loading();
			var submitData = {};
			submitData["permissionId"] = g_selectNode.id;
			submitData["userIds"] = idsList;
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			top.app.message.alert("解绑用户数据成功！");
			   			// 重新加载
						$tableUser.bootstrapTable('refresh');
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
}

/**
 * 初始化下拉选择列表(租户和组织)
 */
function initComboBoxList(){
	// 根租户的管理员才能管理多个租户下的组织
	if(top.app.info.tenantsInfo.isRoot == 'Y' && top.app.info.userInfo.isAdmin == 'Y'){
		// 设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '200px'
		});
		$('#divTenantsBox').css('display', 'block');
		$('#divDataPermissionBox').css('top', '63px');
		$('#divUserBox').css('top', '63px');
		g_searchPannelHeight += 68;
		// 重置高度
		$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 128));
		appTable.resetTableHeight($tableUser, g_searchPannelHeight + 34);
		
		// 如果只是租户管理员，则不能管理所有租户
		if(top.app.info.tenantsInfo.isRoot == 'Y'){
			// 获取租户数据
			top.app.getTenantsListBox($comboxTenants, function(){
				$('.selectpicker').selectpicker('refresh');
				g_tenantsId = $comboxTenants.val();
			});
			// 绑定租户下拉框变更事件
			$comboxTenants.on('changed.bs.select', function (e) {
				g_tenantsId = $comboxTenants.val();
				// 刷新树菜单
				g_comboBoxTree.refreshTree(true, function(){
					// 触发重新加载事件
					$("#btnReload").click();
				});
			});
		}else{
			$('#tenantsListDiv').css('display', 'none');
			$('#organizerListTitle').css('display', 'none');
			$('#tenantsListTitle').empty();
			$('#tenantsListTitle').append('<h5>当前正在编辑的组织：</h5>');
			g_tenantsId = top.app.info.tenantsInfo.tenantsId;
		}
		
		// 获取组织数据
		g_comboBoxTree = AppCombotree.createNew();
		g_comboBoxTree.init($('#organizerBox') , function (objNode, cb) {
			$.ajax({
			    url: top.app.conf.url.api.system.organizer.getOrganizerTree,
			    method: 'GET',
			    data: {
				    	access_token: top.app.cookies.getCookiesToken(),
				    	tenantsId: g_tenantsId,
				    	organizerId: (objNode == null) ? null : objNode.id,
				    	filterPost: true					// 过滤岗位
			    },success: function(data){
				    	if(top.app.message.code.success == data.RetCode){
							cb.call(this, data.RetData);
							// 第一次加载时需要设置组织列表的默认值
							if(g_isFirstLoad){
								setTimeout(function () {
									g_comboBoxTree.setValueById(top.app.info.organizerInfo.organizerId);
									g_organizerId = g_comboBoxTree.getNodeId();
							    }, 300);
								g_isFirstLoad = false;
							}
				    	}else{
				    		top.app.message.error(data.RetMsg);
				    	}
				}
			});
		}, '200px');
		// 设置点击回调
		g_comboBoxTree.setClickTreeEvent(function(node){
			$("#btnReload").click();
		});
		
		// 绑定重新加载事件
		$("#btnReload").click(function () {
			g_organizerId = g_comboBoxTree.getNodeId();
			// 清空权限树
			$treeView.jstree(true).refresh();
	    		// 重置变量
	    		g_selectNode = null;
	    		g_selectUserRow = null;
	    		// 清空用户表内容
			$tableUser.bootstrapTable('removeAll');
	    });
	}else{
		g_organizerId = top.app.info.rootOrganizerId; 
	}
}

/**
 * 获取当前选中节点的父节点信息
 * 
 * @returns
 */
function getSelNodeParent(){
	if(g_selectNode == null){
		return null;
	}else{
		var nodeId = $treeView.jstree('get_parent', g_selectNode);
		if(nodeId == '#') return null;
		else return $treeView.jstree('get_node', nodeId);
	}
}