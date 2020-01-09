var g_params = {}, g_iframeIndex = null;

$(function() {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	// 取消按钮
	$("#layerCancel").click(function() {
		parent.layer.close(g_iframeIndex);
	});
	// 设置select的宽度为
	$('.selectpicker').selectpicker({
		width : '515px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * 
 * @param value
 */
function receiveParams(value) {
	g_params = value;
	// 初始化界面
	initView();
}

/**
 * 初始化界面
 */
function initView() {
	if(top.app.info.userInfo.isAdmin == 'Y' && top.app.info.tenantsInfo.isRoot == 'Y'){
		$("#divShareType").css("display", "");
		$("#divTenantsId").css("display", "");
		top.app.addComboBoxOption($("#shareType"), g_params.dictShareTypeDict);
		top.app.getTenantsListBox($('#tenantsId'), function(){$('.selectpicker').selectpicker('refresh');});
	}
	// 判断是新增还是修改
	if (g_params.type == "edit") {
		$('#name').val(g_params.rows.name);
		$('#value').val(g_params.rows.value);
		$('#shareType').val(g_params.rows.shareType);
		$('#tenantsId').val(g_params.rows.tenantsId);
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
			name : {
				required : true
			},
			value : {
				required : true
			}
		},
		messages : {
			name : {
				required : "请输入字典类型名称"
			},
			value : {
				required : "请输入字典类型值"
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
	// 定义提交数据
	var submitData = {};
	if (g_params.rows != null && g_params.rows != undefined)
		submitData['dictTypeId'] = g_params.rows.dictTypeId;
	submitData["name"] = $.trim($("#name").val());
	submitData["value"] = $.trim($("#value").val());
	if(top.app.info.userInfo.isAdmin == 'Y' && top.app.info.tenantsInfo.isRoot == 'Y'){
		submitData["shareType"] = $("#shareType").val();
		if($("#shareType").val() == 'S') submitData["tenantsId"] = "";
		else submitData["tenantsId"] = $("#tenantsId").val();
	}else{
		//默认为用户字典
		submitData["shareType"] = "B";
		submitData["tenantsId"] = top.app.info.userInfo.tenantsId;
	}
	// 异步处理
	$.ajax({
		url : g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
		method : 'POST',
		data : JSON.stringify(submitData),
		contentType : "application/json",
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