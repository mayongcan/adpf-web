var g_params = {}, g_iframeIndex = null, vaildRule = {};
$(function() {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	// 取消按钮
	$("#layerCancel").click(function() {
		parent.layer.close(g_iframeIndex);
	});
	// 设置select的宽度
	$('.selectpicker').selectpicker({
		width : '225px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * 
 * @param value
 */
function receiveParams(value) {
	g_params = value;
	// 添加内容
	if (g_params.formType == '1') addDivContent();
	else addPageContent();
	// 初始化界面
	initView();
}

/**
 * 动态添加控件
 */
function addDivContent() {
	$("#divEditFromContent").empty();
	var htmlTable = "";
	for (var i = 0; i < g_params.data.length; i++) {
		var isRequest = "";
		if (g_params.data[i].isRequest)
			isRequest = "required";
		var isWritable = "";
		if (!g_params.data[i].isWritable)
			isWritable = "readonly";
		if (g_params.data[i].type == 'date') {
			htmlTable += '<div class="form-group edit-group-style">' + 
							'<label class="col-sm-2 control-label edit-layer-title">' + g_params.data[i].name + '</label>' + 
							'<div class="input-group date edit-layer-input" id="div' + g_params.data[i].id + '" style="width:550px;">' + 
								'<input type="text" class="form-control" id="' + g_params.data[i].id + '"  ' + isRequest + ' ' + isWritable + '/>' + 
								'<span class="input-group-addon">' + 
									'<span class="glyphicon glyphicon-calendar"></span>' + 
								'</span>' + 
							'</div>' + 
						'</div>';
		} else if (g_params.data[i].type == 'boolean') {
			htmlTable += '<div class="form-group edit-group-style">' + 
							'<label class="col-sm-2 control-label edit-layer-title">' + g_params.data[i].name + '</label>' + 
							'<select class="selectpicker" id="' + g_params.data[i].id + '">' + 
								'<option value="1">是</option>' + 
								'<option value="0">否</option>' + 
							'</select>' + 
						'</div>';
		} else if (g_params.data[i].type == 'enum') {
			htmlTable += '<div class="form-group edit-group-style">' + 
							'<label class="col-sm-2 control-label edit-layer-title">' + g_params.data[i].name + '</label>' + 
							'<select class="selectpicker" id="' + g_params.data[i].id + '">';
			for ( var key in g_params.data[i].enumData) {
				htmlTable += '<option value="' + key + '">' + g_params.data[i].enumData[key] + '</option>';
			}
			htmlTable += '</select>' + '</div>';
		} else if (g_params.data[i].type == 'long') {
			htmlTable += '<div class="form-group edit-group-style">' + 
							'<label class="col-sm-2 control-label edit-layer-title">' + g_params.data[i].name + '</label>' + 
							'<input type="text" id="' + g_params.data[i].id + '" name="' + g_params.data[i].id + '" class="form-control m-b edit-layer-input digits" style="width:550px" ' + isRequest + ' ' + isWritable + '>' + 
						'</div>';
		} else {
			htmlTable += '<div class="form-group edit-group-style">' + 
							'<label class="col-sm-2 control-label edit-layer-title">' + g_params.data[i].name + '</label>' + 
							'<input type="text" id="' + g_params.data[i].id + '" name="' + g_params.data[i].id + '" class="form-control m-b edit-layer-input" style="width:550px" ' + isRequest + ' ' + isWritable + '>' + 
						'</div>';
		}
	}
	$("#divEditFromContent").append(htmlTable);
}

/**
 * 输出整个页面(表单在后台配置的字符串)
 */
function addPageContent() {
	$("#divEditFromContent").empty();
	$("#divEditFromContent").append(g_params.data);
}

/**
 * 初始化界面
 */
function initView() {
	// 设置select的宽度为
	$('.selectpicker').selectpicker({
		width : '540px'
	});
	formValidate();
	// 将验证写入控件中
	$.metadata.setType("attr", "validate");

	// 初始化控件
	for (var i = 0; i < g_params.data.length; i++) {
		if (g_params.data[i].type == 'date') {
			$('#div' + g_params.data[i].id).datetimepicker({
				locale : 'zh-CN',
				format : 'YYYY-MM-DD',
				allowInputToggle : true
			});
		}
	}
	// 判断是新增还是修改
	if (g_params.type == "edit") {
		// 这里只能要求和数据库的字段一直，否则没法读取
		$('#amount').val(g_params.rows.amount);
		$('#reason').val(g_params.rows.reason);
	}

	// 刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate() {
	$("#divEditForm").validate({
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
		submitData['id'] = g_params.rows.id;
	if (g_params.formType == '1') {
		for (var i = 0; i < g_params.data.length; i++) {
			submitData[g_params.data[i].id] = $("#" + g_params.data[i].id).val();
		}
	} else {
		for (var i = 0; i < g_params.idList.length; i++) {
			submitData[g_params.idList[i]] = $("#" + g_params.idList[i]).val();
		}
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