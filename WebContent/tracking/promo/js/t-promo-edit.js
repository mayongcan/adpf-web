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
    //var channelIdDict = top.app.getDictDataByDictTypeValue('');
	top.app.addComboBoxOption($("#channelId"), g_params.channelIdDict);
    //var anentIdDict = top.app.getDictDataByDictTypeValue('');
	top.app.addComboBoxOption($("#anentId"), g_params.anentIdDict);
    //var appIdDict = top.app.getDictDataByDictTypeValue('');
	top.app.addComboBoxOption($("#appId"), g_params.appIdDict);
	$('#divCreateTime').datetimepicker({locale: 'zh-CN',format: 'YYYY-MM-DD'});
	
	findByTagId(1,"channelId");
	findByTagId(2,"anentId");
	findByTagId(3,"appId");
	
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#name').val(g_params.rows.name);
		$('#channelId').val(g_params.rows.channelId);
		$('#anentId').val(g_params.rows.anentId);
		$('#appId').val(g_params.rows.appId);
		$('#clickUrl').val(g_params.rows.clickUrl);
		$('#showUrl').val(g_params.rows.showUrl);
		//$('#createTime').val(g_params.rows.createTime);
		$('#landingUrl').val(g_params.rows.landingUrl);
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
	
	submitData["name"] = $("#name").val();
	submitData["channelId"] = $("#channelId").val();
	submitData["anentId"] = $("#anentId").val();
	submitData["appId"] = $("#appId").val();
	//submitData["clickUrl"] = $("#clickUrl").val();
	//submitData["clickUrl"] = "http://www.myrul.com/qd/"+$("#channelId").val();
	if(g_params.type == "edit"){
		submitData["clickUrl"] = $("#clickUrl").val();
	}else{
		submitData["clickUrl"] = top.app.conf.url.apigateway;
	}	
	submitData["showUrl"] = $("#showUrl").val();
	//submitData["createTime"] = $("#createTime").val();
	submitData["channelName"] = $("#channelId").find("option:selected").text();
	submitData["anentName"] = $("#anentId").find("option:selected").text();
	submitData["appName"] = $("#appId").find("option:selected").text();
	submitData["landingUrl"] = $("#landingUrl").val();
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
function findByTagId(param,id){	
	var dataList = [];
	var url = "";
	if(param == 1) url = top.app.conf.url.apigateway+"/api/adpf/tracking/channelurl/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	else if(param == 2) url = top.app.conf.url.apigateway+"/api/adpf/tracking/agent/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	else if(param == 3) url = top.app.conf.url.apigateway+"/api/adpf/tracking/app/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	$.ajax({
		url: url,
	    method: 'GET',
		//data:JSON.stringify(submitData),
	    async: false,
		contentType: "application/json",
		success: function(data){			
			if(top.app.message.code.success == data.RetCode){
				dataList = data.rows;				
	   		}
			//channelList = findByChannelId();
			for(var i = 0;i <= dataList.length-1;i++){
				var option = "";
				option += "<option value = '"+dataList[i].id+"'>"+dataList[i].name+"</option>"
				//$("select").append(option)
				$("#"+id+"").append(option);
			}
        }	
	});	
	//return dataList;
}

