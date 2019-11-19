var g_params = {}, g_iframeIndex;

$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
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
	top.app.addComboBoxOption($("#resourceIds"), g_params.g_resourceIdDict);
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#clientId').val(g_params.rows.clientId);
		$('#clientSecret').val(g_params.rows.clientSecret);
		$('#resourceIds').selectpicker('val', g_params.rows.resourceIds.split(','));
		$('#scope').selectpicker('val', g_params.rows.scope.split(','));
		$('#authorizedGrantTypes').selectpicker('val', g_params.rows.authorizedGrantTypes.split(','));
		$('#accessTokenValidity').val(g_params.rows.accessTokenValidity);
		$('#refreshTokenValidity').val(g_params.rows.refreshTokenValidity);
	}
	//设置select的宽度
	$('.selectpicker').selectpicker({
		width: '535px'
	});
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	clientId: {required: true},
	        	clientSecret: {required: true},
	        	accessTokenValidity: {digits:true},
	        	refreshTokenValidity: {digits:true}
        },
        messages: {
	        	clientId: {required: "请输入授权客户端ID"},
	        	clientSecret: {required: "请输入授权客户端密码"},
	        	accessTokenValidity: {digits: "access_token有效期必须为0－99999999之间的数字"},
	        	refreshTokenValidity: {digits: "refresh_token有效期必须为0－99999999之间的数字"}
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
	if($("#resourceIds").val() == null){
		top.app.message.notice("请选择客户端的授权资源列表！");
		return;
	}
	if($("#scope").val() == null){
		top.app.message.notice("请选择客户端的授权范围！");
		return;
	}
	if($("#authorizedGrantTypes").val() == null){
		top.app.message.notice("请选择客户端的授权类型！");
		return;
	}
	//定义提交数据
	var submitData = {};
	//如果变更了clientId，则需要传送到后端
	if(g_params.type == "edit" && $.trim($("#clientId").val()) != g_params.rows.clientId)
		submitData["oldClientId"] = g_params.rows.clientId;
	submitData["clientId"] = $.trim($("#clientId").val());
	submitData["clientSecret"] = $.trim($("#clientSecret").val());
	submitData["resourceIds"] = $.trim($("#resourceIds").val());
	submitData["scope"] = $.trim($("#scope").val());
	submitData["authorizedGrantTypes"] = $.trim($("#authorizedGrantTypes").val());
	submitData["accessTokenValidity"] = $.trim($("#accessTokenValidity").val());
	submitData["refreshTokenValidity"] = $.trim($("#refreshTokenValidity").val());
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
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