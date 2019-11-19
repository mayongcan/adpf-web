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
		width : '505px'
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
	g_comboBoxTree.init($('#parentId'), g_params.allTreeData, '505px');
}

/**
 * 初始化界面
 */
function initView() {
	// 判断是新增还是修改
	if (g_params.type == "edit") {
		$('#permissionName').val(g_params.node.text);
		$('#permissionMemo').val(g_params.node.data.permissionMemo);
		$('#isFix').val(g_params.node.data.isFix);
		$('#dispOrder').val(g_params.node.data.dispOrder);
		g_comboBoxTree.setValue(g_params.parentNode);
	} else {
		g_comboBoxTree.setValue(g_params.node);
	}
	// 刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate() {
	$("#divEditForm").validate({
		rules : {
			permissionName : {
				required : true
			},
			permissionMemo : {
				required : true
			},
			dispOrder : {
				required : true,
				digits : true
			}
		},
		messages : {
			permissionName : {
				required : "请输入数据权限名称"
			},
			permissionMemo : {
				required : "请输入数据权限描述"
			},
			dispOrder : {
				required : "请输入数据显示顺序",
				digits : "必须为0－999999之间的数字"
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
	top.app.message.loading();
	// 定义提交数据
	var submitData = {};
	if (g_params.type == "add") {
		if (g_params.tenantsId != null && g_params.tenantsId != undefined) {
			submitData['tenantsId'] = g_params.tenantsId;
		}
		if (g_params.organizerId != null && g_params.organizerId != undefined) {
			submitData['organizerId'] = g_params.organizerId;
		}
	} else {
		submitData['permissionId'] = g_params.node.id;
		submitData['tenantsId'] = g_params.node.data.tenantsId;
		submitData['organizerId'] = g_params.node.data.organizerId;
	}
	submitData["parentId"] = g_comboBoxTree.getNodeId();
	submitData["permissionName"] = $.trim($("#permissionName").val());
	submitData["permissionMemo"] = $.trim($("#permissionMemo").val());
	submitData["dispOrder"] = $("#dispOrder").val();
	submitData["isFix"] = $("#isFix").val();
	// 异步处理
	$.ajax({
		url : g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
		method : 'POST',
		data : JSON.stringify(submitData),
		contentType : "application/json",
		success : function(data) {
			top.app.message.loadingClose();
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