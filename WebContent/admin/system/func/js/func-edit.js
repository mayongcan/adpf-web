var g_params = {}, g_iframeIndex = null, g_comboBoxTree = null;

$(function() {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	// 取消按钮
	$("#layerCancel").click(function() {
		parent.layer.close(g_iframeIndex);
	});
	// 设置select的宽度为200px
	$('.selectpicker').selectpicker({
		width : '205px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * 
 * @param value
 */
function receiveParams(value) {
	g_params = value;
	// 初始化树
	initTree();
	// 初始化界面
	initView();
}

/**
 * 初始化树
 */
function initTree() {
	// 创建下拉树菜单
	g_comboBoxTree = AppCombotree.createNew();
	if(g_params.allTreeData == null || g_params.allTreeData == undefined){
		g_comboBoxTree.init($('#parentFunc'), function (objNode, cb) {
			$.ajax({
			    url: top.app.conf.url.api.system.func.getFuncTree,
			    method: 'GET',
			    data: {
			    		access_token: top.app.cookies.getCookiesToken()
			    },success: function(data){
				    	if(top.app.message.code.success == data.RetCode){
				    		cb.call(this, data.RetData);
				    	}else{
				    		top.app.message.error(data.RetMsg);
				    	}
				}
			});
		}, '205px');
	}else{
		g_comboBoxTree.init($('#parentFunc'), g_params.allTreeData, '205px');	
	}
}

/**
 * 初始化界面
 */
function initView() {// 判断是新增还是修改
	if (g_params.type == "edit") {
		$('#funcName').val(g_params.node.text);
		g_comboBoxTree.setValue(g_params.parentNode);
		$('#funcType').val(g_params.node.data.funcType);
		$('#funcLink').val(g_params.node.data.funcLink);
		$('#funcFlag').val(g_params.node.data.funcFlag);
		$('#funcIcon').val(g_params.node.data.funcIcon);
		$('#dispOrder').val(g_params.node.data.dispOrder);
		$('#isBase').val(g_params.node.data.isBase);
		$('#isShow').val(g_params.node.data.isShow);
		$('#isBlank').val(g_params.node.data.isBlank);
		$('#funcDesc').val(g_params.node.data.funcDesc);
		$('#dispPosition').val(g_params.node.data.dispPosition);
		// 禁止修改
		if (g_params.parentNode == null) {
			g_comboBoxTree.setDisable();
		}
	} else {
		g_comboBoxTree.setValue(g_params.node);
	}
	// 刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');

	// 权限类型下拉框变更事件
	$('#funcType').on('changed.bs.select',
		function(e) {
			if ($('#funcType').val() == '100200') {
				$('#funcLink').attr("placeholder", "示例：#");
				$('#funcFlag').attr("placeholder", "示例：systemManager");
			} else if ($('#funcType').val() == '100300') {
				$('#funcLink').attr("placeholder", "用于显示该菜单页面的地址，示例：/admin/module/func.html");
				$('#funcFlag').attr("placeholder", "用于记录操作日志的API路径(函数可为空)，示例：/api/module/index");
			} else if ($('#funcType').val() == '100400') {
				$('#funcLink').attr("placeholder", "执行该权限的API接口地址，示例：/api/module/addFunc");
				$('#funcFlag').attr("placeholder", "用于绑定前端页面权限按钮的ID，示例：funcAdd");
			}
		}
	);
}

/**
 * 表单验证
 */
function formValidate() {
	$("#divEditForm").validate({
		rules : {
			funcName : {
				required : true
			},
			// funcLink: {required: true},
			funcFlag : {
				required : true
			},
			dispOrder : {
				required : true,
				digits : true
			}
		},
		messages : {
			funcName : {
				required : "请输入权限名称"
			},
			// funcLink: {required: "请输入权限链接"},
			funcFlag : {
				required : "请输入权限标识"
			},
			dispOrder : {
				required : "请输入显示次序",
				digits : "显示次序必须为0－999999之间的数字"
			}
		},
		// 重写showErrors
		showErrors : function(errorMap, errorList) {
			$.each(errorList, function(i, v) {
				// 在此处用了layer的方法
                layer.tips(v.message, v.element, { tips: [1, '#3595CC'], time: 2000 });
				return false;
			});
		},
		// 失去焦点时不验证
		onfocusout : false,
		submitHandler : function() {
			// 提交内容
			submitAction();
		}
	});
}

/**
 * 提交数据
 */
function submitAction() {
	// 同时需要判断父节点是否为空，如果传送过来的父节点为空，说明是根节点，根节点不用选择父节点
	if (!g_comboBoxTree.isSelectNode() && !g_comboBoxTree.isDisable()) {
		top.app.message.alert("请选择权限父节点！");
		return;
	}
	// 定义提交数据
	var submitData = {};
	if (g_params.node != null && g_params.node != undefined
			&& g_params.type == "edit") {
		submitData['funcId'] = g_params.node.id;
		// 判断当前编辑的父ID和ID是否一致
		if (g_params.node.id == g_comboBoxTree.getNodeId()) {
			top.app.message.alert("权限父节点不能与当前权限节点一致！");
			return;
		}
	}
	submitData["funcName"] = $.trim($("#funcName").val());
	submitData["parentFuncId"] = g_comboBoxTree.getNodeId();
	submitData["funcType"] = $("#funcType").val();
	submitData["funcLink"] = $.trim($("#funcLink").val());
	submitData["funcFlag"] = $.trim($("#funcFlag").val());
	submitData["funcIcon"] = $.trim($("#funcIcon").val());
	submitData["dispOrder"] = $("#dispOrder").val();
	submitData["isBase"] = $('#isBase').val();
	submitData["isShow"] = $('#isShow').val();
	submitData["isBlank"] = $('#isBlank').val();
	submitData["funcDesc"] = $("#funcDesc").val();
	submitData["dispPosition"] = $("#dispPosition").val();
	// 异步处理
	$.ajax({
		url : g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
		method : 'POST',
		data : JSON.stringify(submitData),
		contentType : "application/json",
		dataType : "json",
		success : function(data) {
			if (top.app.message.code.success == data.RetCode) {
				// 关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
				top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
			} else {
				top.app.message.error(data.RetMsg);
			}
		}
	});
}