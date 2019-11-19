var g_params = {}, g_iframeIndex = null;
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	//设置select的宽度
	$('.selectpicker').selectpicker({
		width: '225px'
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
	top.app.addComboBoxOption($("#tenantsStatus"), g_params.tenantsStatusDict);
	$('#beginDate').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	$('#endDate').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#tenantsName').val(g_params.rows.tenantsName);
		$('#tenantsStatus').val(g_params.rows.status);
		$('#maxUsers').val(g_params.rows.maxUsers);
		$('#tenantsDesc').val(g_params.rows.tenantsDesc);
		$('#beginDate').val($.date.dateFormat(g_params.rows.beginDate, "yyyy-MM-dd"));
		$('#endDate').val($.date.dateFormat(g_params.rows.endDate, "yyyy-MM-dd"));
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
	        	tenantsName: {required: true},
	        	maxUsers:  {required: true, digits:true},
	        	beginDate: {required: true, dateISO:true},
            endDate: {required: true, dateISO:true}
        },
        messages: {
            tenantsName: {required: "请输入租户名称"},
            maxUsers: {required: "请输入用户数量", digits: "用户数量必须为0－999999之间的数字"},
			beginDate: {required: "请输入开始日期", dateISO: "请输入不带时间的正确日期格式,如：2017-01-01"},
            endDate: {required: "请输入开始日期", dateISO: "请输入不带时间的正确日期格式,如：2017-01-01" }
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
	if(g_params.rows != null && g_params.rows != undefined)
		submitData['tenantsId'] = g_params.rows.tenantsId;
	submitData["tenantsName"] = $.trim($("#tenantsName").val());
	submitData["status"] = $("#tenantsStatus").val();
	submitData["maxUsers"] = $.trim($("#maxUsers").val());
	submitData["tenantsDesc"] = $("#tenantsDesc").val();
	submitData["beginDate"] = $("#beginDate").val();
	submitData["endDate"] = $("#endDate").val();
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