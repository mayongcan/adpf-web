var g_params = {}, g_iframeIndex = null;
var channelList = [];
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
	channelList = findByChannelId();
	for(var i = 0;i <= channelList.length-1;i++){
		var option = "";
		option += "<option value = '"+channelList[i].id+"'>"+channelList[i].name+"</option>"
		$("select").append(option)
	}
	
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#channelId').val(g_params.rows.channelId);
		$('#urlType').val(g_params.rows.urlType);
		$('#macro').val(g_params.rows.macro);
		$('#myparam').val(g_params.rows.myparam);
		$('#staue').val(g_params.rows.staue);
		$('#createTime').val(g_params.rows.createTime);
		
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
		
	submitData["channelId"] = $("#channelId").val();
	submitData["urlType"] = $("#urlType").val();
	submitData["macro"] = $("#macro").val();
	submitData["myparam"] = $("#myparam").val();
	submitData["staue"] = $("#staue").val();
	submitData["createTime"] = $("#createTime").val();
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
function findByChannelId(){	
	var channelList = [];
	$.ajax({
		url: top.app.conf.url.apigateway+"/api/adpf/tracking/channel/getList"+"?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'GET',
		//data:JSON.stringify(submitData),
	    async: false,
		contentType: "application/json",
		success: function(data){			
			if(top.app.message.code.success == data.RetCode){
				channelList = data.rows;				
	   		}
        }	
	});	
	return channelList;
}




