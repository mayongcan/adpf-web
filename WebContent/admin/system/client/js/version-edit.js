var g_params = {}, g_filePath = null, g_iframeIndex = null, g_fileSize = 0;
$(function() {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	// 取消按钮
	$("#layerCancel").click(function() {
		parent.layer.close(g_iframeIndex);
	});
	// 设置select的宽度为
	$('.selectpicker').selectpicker({
		width : '550px'
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
	// top.app.addComboBoxOption($("#isOption"), g_params.clientIsOption);
	// 判断是新增还是修改
	if (g_params.type == "edit") {
		$('#name').val(g_params.rows.name);
		$('#version').val(g_params.rows.version);
		$('#verDesc').val(g_params.rows.verDesc);
		$('#isOption').val(g_params.rows.g_params);
	}
	$('input[type="file"]').prettyFile({
		text : "请选择文件"
	});
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
			version : {
				required : true
			},
		},
		messages : {
			name : {
				required : "请输入APP名称"
			},
			version : {
				required : "请输入APP版本号"
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
			ajaxUpload();
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
		submitData['id'] = g_params.rows.clientId;
	submitData["name"] = $.trim($("#name").val());
	submitData["version"] = $("#version").val();
	submitData["verDesc"] = $("#verDesc").val();
	submitData["isOption"] = $("#isOption").val();
	submitData["fileSize"] = g_fileSize;
	if (g_filePath != null && g_filePath != undefined)
		submitData["url"] = g_filePath;
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

/**
 * 提交图片
 */
function ajaxUpload() {
	if ($("#url")[0].files[0] == null || $("#url")[0].files[0] == undefined) {
		// 如果是编辑内容，可以不修改,直接进入提交数据
		if (g_params.type == "edit") {
			submitAction();
			return;
		} else {
			top.app.message.notice("请选择要上传的文件！");
			return;
		}
	}
	// 上传图片到资源服务器
	top.app.uploadFile($("#url")[0].files[0], function(data) {
		g_filePath = data;
		g_fileSize = $("#url")[0].files[0].size / 1024;
		g_fileSize = g_fileSize.toFixed(2);
		// 提交数据
		submitAction();
	});
}