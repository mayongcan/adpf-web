var g_params = {}, g_iframeIndex = null;

$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	//设置select的宽度为200px
	$('.selectpicker').selectpicker({
		width: '550px'
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
}

/**
 * 初始化界面
 */
function initView(){
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#roleName').val(g_params.rows.roleName);
		$('#roleMemo').val(g_params.rows.roleMemo);
		$('#isFix').val(g_params.rows.isFix);
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	roleName: {required: true},
	        	roleMemo: {required: true}
        },
        messages: {
	        	roleName: {required: "请输入角色名称"},
	        	roleMemo: {required: "请输入角色描述"}
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
	top.app.message.loading();
	//定义提交数据
	var submitData = {};
	if(g_params.rows != null && g_params.rows != undefined){
		submitData['roleId'] = g_params.rows.roleId;
		submitData['tenantsId'] = g_params.rows.tenantsId;
		submitData['organizerId'] = g_params.rows.organizerId;
	}
	if(g_params.type == "add"){
		if(g_params.tenantsId != null && g_params.tenantsId != undefined){
			submitData['tenantsId'] = g_params.tenantsId;
		}
		if(g_params.organizerId != null && g_params.organizerId != undefined){
			submitData['organizerId'] = g_params.organizerId;
		}
	}
	submitData["roleName"] = $.trim($("#roleName").val());
	submitData["roleMemo"] = $.trim($("#roleMemo").val());
	submitData["isFix"] = $("#isFix").val();
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
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