var g_params = {}, g_iframeIndex;

$(function() {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	// 取消按钮
	$("#layerCancel").click(function() {
		parent.layer.close(g_iframeIndex);
	});
	// 设置select的宽度为
	$('.selectpicker').selectpicker({
		width : '190px'
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
	// 判断是新增还是修改
	if (g_params.type == "edit") {
		$('#name').val(g_params.rows.name);
		$('#value').val(g_params.rows.value);
		$('#dictDesc').val(g_params.rows.dictDesc);
		$('#dispOrder').val(g_params.rows.dispOrder);
		if (g_params.rows.tenantsId == "-1") {
			$('#dataShare').val("-1");
		} else {
			if (g_params.rows.organizerId == "-1") {
				$('#dataShare').val("-2");
			} else {
				$('#dataShare').val("0");
			}
		}
	} else {
		if (g_params.shareType == 'S') {
			$('#dataShare').val("-1");
			$('#dataShare').attr("disabled", true);
		} else {
			$('#dataShare').val("0");
		}
	}
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
			},
			dispOrder : {
				required : true,
				digits : true
			}
		},
		messages : {
			name : {
				required : "请输入字典数据名称"
			},
			value : {
				required : "请输入字典数据值"
			},
			dispOrder : {
				required : "请输入字典数据显示顺序",
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
	// 定义提交数据
	var submitData = {};
	if (g_params.rows != null && g_params.rows != undefined)
		submitData['dictDataId'] = g_params.rows.dictDataId;
	submitData["dictTypeId"] = g_params.dictTypeId;
	submitData["name"] = $.trim($("#name").val());
	submitData["value"] = $.trim($("#value").val());
	submitData["dictDesc"] = $.trim($("#dictDesc").val());
//	submitData["dataShare"] = $("#dataShare").val();
	//统一设置为租户共享
	submitData["dataShare"] = "-1";
//	submitData["dispOrder"] = $("#dispOrder").val();
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