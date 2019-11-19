var g_params = {}, g_iframeIndex = null, g_comboBoxTree = null, g_manager = "", g_dataPermissionTree = null;
var g_defRoleId = "", g_defPermissionId = "";
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#btnClear").click(function () {
		g_dataPermissionTree.setValue(null);
    });
	//设置select的宽度为200px
	$('.selectpicker').selectpicker({
		width: '220px'
	});
	$('#areaProvince').selectpicker({
		width: '192px'
	});
	$('#areaCity').selectpicker({
		width: '192px'
	});
	$('#areaDistrict').selectpicker({
		width: '192px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * @param value
 */
function receiveParams(value){
	g_params = value;
	top.app.message.loading();
	//初始化树
	initTree();
	initDistrict();
	if(g_params.type == "edit"){
		getDefRoleAndData();
	}
	getRoleAndDataList();
	//初始化界面
	initView();
	top.app.message.loadingClose();
}

//获取默认角色和默认数据权限
function getDefRoleAndData(){
	$.ajax({
	    url: top.app.conf.url.api.system.organizer.getRoleAndData,
	    method: 'GET',
	    async: false,
	   	timeout:5000,
	    data: {
	    		access_token: top.app.cookies.getCookiesToken(),
	    		organizerId: g_params.node.id
	    },success: function(data){
	    		g_defRoleId = data.RetData.roleId;
	    		g_defPermissionId = data.RetData.permissionId;
		}
	});
}

//获取角色和数据权限列表
function getRoleAndDataList(){
	//获取列表
	$.ajax({
		url: top.app.conf.url.api.system.role.getRoleKeyVal,
		method: 'GET',
		data: {
			access_token: top.app.cookies.getCookiesToken(),
	    		organizerId: top.app.info.rootOrganizerId,
		},
		success: function(data) {
			if(top.app.message.code.success == data.RetCode) {
				if(data.RetData != null && data.RetData != undefined && data.RetData.length > 0) {
					top.app.addComboBoxOption($("#defRole"), data.RetData, true, ' ');
					//刷新数据，否则下拉框显示不出内容
					if(g_params.type == "edit") {
						$('#defRole').val(g_defRoleId);
					}
					$('.selectpicker').selectpicker('refresh');
				}
			} else {
				top.app.message.error(data.RetMsg);
			}
		}
	});
	//创建下拉树菜单
	g_dataPermissionTree = AppCombotree.createNew();
	g_dataPermissionTree.init($('#defData') , function (objNode, cb) {
		$.ajax({
		    url: top.app.conf.url.api.system.data.getDataPermissionTreeList,
		    method: 'GET',
		    data: {
			    	access_token: top.app.cookies.getCookiesToken(),
			    	tenantsId: g_params.tenantsId,
			    	//organizerId: top.app.info.rootOrganizerId,
		    },success: function(data){
			    	if(top.app.message.code.success == data.RetCode){
					cb.call(this, data.RetData);
					setTimeout(function () {
						if(g_params.type == "edit" && g_defPermissionId != null && g_defPermissionId != undefined)
							g_dataPermissionTree.setValueById(g_defPermissionId);
				    }, 300);
			    	}else{
			    		top.app.message.error(data.RetMsg);
			    	}
			}
		});
	}, '220px');
}

/**
 * 初始化省市区
 */
function initDistrict(){
	if(g_params.type == "edit"){
		var areaCode = g_params.node.data.areaCode;
		//if($.utils.isEmpty(areaCode)) areaCode = '13';
		top.app.initDistrict($("#areaProvince"), $("#areaCity"), $("#areaDistrict"), areaCode, true);
	}else{
		//top.app.initDistrict($("#areaProvince"), $("#areaCity"), $("#areaDistrict"), '13', true);
		top.app.initDistrict($("#areaProvince"), $("#areaCity"), $("#areaDistrict"), '', true);
	}
}

/**
 * 初始化树
 */
function initTree(){
	//创建下拉树菜单
	g_comboBoxTree = AppCombotree.createNew();
	g_comboBoxTree.init($('#parentOrgId') , g_params.allTreeData, '220px');
}

/**
 * 初始化界面
 */
function initView(){
	top.app.addComboBoxOption($("#organizerLevel"), g_params.organizerLevelDict);
	top.app.addComboBoxOption($("#organizerType"), g_params.organizerTypeDict);
	top.app.addComboBoxOption($("#organizerFunc"), g_params.organizerFuncDict);
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#organizerName').val(g_params.node.text);
		g_comboBoxTree.setValue(g_params.parentNode);
		$('#organizerType').val(g_params.node.data.organizerType);
		$('#organizerLevel').val(g_params.node.data.organizerLevel);
		$('#organizerCode').val(g_params.node.data.organizerCode);
		$('#organizerFunc').val(g_params.node.data.organizerFunc);
		$('#principle').val(g_params.node.data.principle);
		$('#principleTel').val(g_params.node.data.principleTel);
		$('#managerTel').val(g_params.node.data.managerTel);
		$('#address').val(g_params.node.data.address);
		$('#email').val(g_params.node.data.email);
		$('#fax').val(g_params.node.data.fax);
		//g_manager = g_params.node.data.manager.split(String.fromCharCode(0));
		g_manager = g_params.node.data.manager;
		if(g_manager != null && g_manager != undefined){
			var array = g_manager.split(String.fromCharCode(0));
			if(array[2] != null && array[2] != undefined )
				$('#manager').val(array[2]);
		}
		//禁止修改
		if(g_params.parentNode == null){
			g_comboBoxTree.setDisable();
		}
	}else{
		g_comboBoxTree.setValue(g_params.node);
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');

	//部门负责人选择按钮
	$("#manager").click(function () {
		//设置参数
		var params = {};
		params.manager = g_manager;
		
		top.app.layer.editLayer('选择机构管理员', ['900px', '550px'], '/admin/system/organizer/organizer-manager.html', params, function(retParams){
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取返回内容失败！");
				return;
			}
			$("#manager").val(retParams[0].userNameList);
			g_manager = retParams[0].manager;
		});
    });
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
        		organizerName: {required: true},
        },
        messages: {
        		organizerName: {required: "请输入机构名称"},
        },
        //重写showErrors
        showErrors: function (errorMap, errorList) {
            $.each(errorList, function (i, v) {
                //在此处用了layer的方法
                layer.tips(v.message, v.element, { tips: [1, '#3595CC'], time: 2000 });
                return false;
            });  
        },
        //失去焦点时不验证
        onfocusout: false,
        submitHandler: function () {
            //提交内容
        		submitAction();
        }
    });
}

/**
 * 提交数据
 */
function submitAction(){
	//同时需要判断父节点是否为空，如果传送过来的父节点为空，说明是根节点，根节点不用选择父节点
	if(!g_comboBoxTree.isSelectNode() && !g_comboBoxTree.isDisable()){
		top.app.message.alert("请选择主管单位！");
		return;
	}
	//定义提交数据
	var submitData = {};
	if(g_params.node != null && g_params.node != undefined && g_params.type == "edit"){
		submitData['organizerId'] = g_params.node.id;
		//判断当前编辑的父ID和组织ID是否一致
		if(g_params.node.id == g_comboBoxTree.getNodeId()){
			top.app.message.alert("主管单位不能与当前组织机构一致！");
			return;
		}
	}
	submitData["organizerName"] = $.trim($("#organizerName").val());
	//当编辑的节点为根节点时，不用传送节点ID
	if(g_params.parentNode == null && g_params.type == "edit"){
		
	}else{
		submitData["parentOrgId"] = g_comboBoxTree.getNodeId();
	}
	submitData["tenantsId"] = g_params.tenantsId;
	submitData["status"] = "1";
	submitData["organizerType"] = $("#organizerType").val();
	
	//设置区域内容
	if($("#areaDistrict").val() != null && $("#areaDistrict").val() != undefined && $("#areaDistrict").val() != '')
		submitData["areaCode"] = $("#areaProvince").val() + "," + $("#areaCity").val() + "," + $("#areaDistrict").val();
	else submitData["areaCode"] = $("#areaProvince").val() + "," + $("#areaCity").val();
	if($("#areaDistrict").find("option:selected").text() != null && $("#areaDistrict").find("option:selected").text() != undefined && $("#areaDistrict").find("option:selected").text() != '')
		submitData["areaName"] = $("#areaProvince").find("option:selected").text() + "-" + $("#areaCity").find("option:selected").text() + "-" + $("#areaDistrict").find("option:selected").text();
	else submitData["areaName"] = $("#areaProvince").find("option:selected").text() + "-" + $("#areaCity").find("option:selected").text();

	submitData["organizerLevel"] = $("#organizerLevel").val();
	submitData["organizerCode"] = $("#organizerCode").val();
	submitData["organizerFunc"] = $("#organizerFunc").val();
	submitData["principle"] = $("#principle").val();
	submitData["principleTel"] = $("#principleTel").val();
	submitData["manager"] = g_manager;
	submitData["managerTel"] = $("#managerTel").val();
	submitData["address"] = $("#address").val();
	submitData["email"] = $("#email").val();
	submitData["fax"] = $("#fax").val();

	submitData["roleId"] = $("#defRole").val();
	submitData["permissionId"] = g_dataPermissionTree.getNodeId();
	
	submitData["auditStatus"] = "4";
	submitData["editStatus"] = "";
	submitData["editCache"] = "";
	
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
	    dataType: "json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}