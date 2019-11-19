var g_params = {}, g_iframeIndex = null;

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
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#odsTime').val(g_params.rows.odsTime);
		$('#promoId').val(g_params.rows.promoId);
		$('#channelId').val(g_params.rows.channelId);
		$('#agentId').val(g_params.rows.agentId);
		$('#appId').val(g_params.rows.appId);
		$('#click').val(g_params.rows.click);
		$('#clickValid').val(g_params.rows.clickValid);
		$('#clickDistinct').val(g_params.rows.clickDistinct);
		$('#clickDistinctDay').val(g_params.rows.clickDistinctDay);
		$('#activeDistinct').val(g_params.rows.activeDistinct);
		$('#dau').val(g_params.rows.dau);
		$('#activeRegister').val(g_params.rows.activeRegister);
		$('#registerDistinct').val(g_params.rows.registerDistinct);
		$('#registerDistinctDay').val(g_params.rows.registerDistinctDay);
		$('#loginDay').val(g_params.rows.loginDay);
		$('#rangeFee').val(g_params.rows.rangeFee);
		$('#newFee').val(g_params.rows.newFee);
		$('#payDevice').val(g_params.rows.payDevice);
		$('#totalFee').val(g_params.rows.totalFee);
		$('#totalPayDevice').val(g_params.rows.totalPayDevice);
		
	}else{
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
        },
        messages: {
        	
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
        	submitAction();
        }
    });
}

/**
 * 提交数据
 */
function submitAction(){
	//定义提交数据
	var submitData = {};
	if(g_params.type == "edit")
		submitData["id"] = g_params.rows.id;
		
	submitData["odsTime"] = $("#odsTime").val();
	submitData["promoId"] = $("#promoId").val();
	submitData["channelId"] = $("#channelId").val();
	submitData["agentId"] = $("#agentId").val();
	submitData["appId"] = $("#appId").val();
	submitData["click"] = $("#click").val();
	submitData["clickValid"] = $("#clickValid").val();
	submitData["clickDistinct"] = $("#clickDistinct").val();
	submitData["clickDistinctDay"] = $("#clickDistinctDay").val();
	submitData["activeDistinct"] = $("#activeDistinct").val();
	submitData["dau"] = $("#dau").val();
	submitData["activeRegister"] = $("#activeRegister").val();
	submitData["registerDistinct"] = $("#registerDistinct").val();
	submitData["registerDistinctDay"] = $("#registerDistinctDay").val();
	submitData["loginDay"] = $("#loginDay").val();
	submitData["rangeFee"] = $("#rangeFee").val();
	submitData["newFee"] = $("#newFee").val();
	submitData["payDevice"] = $("#payDevice").val();
	submitData["totalFee"] = $("#totalFee").val();
	submitData["totalPayDevice"] = $("#totalPayDevice").val();
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


