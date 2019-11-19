var g_params = {}, g_iframeIndex = null;

$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	//设置select的宽度为
	$('.selectpicker').selectpicker({
		width: '515px'
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
	$('#paramValue').val(g_params.rows.paramValue);
	if(g_params.rows.paramValue == '当天开始' || g_params.rows.paramValue == '当天结束' 
		|| g_params.rows.paramValue == '昨天开始' || g_params.rows.paramValue == '昨天结束'){
		$('#paramValueType').val(getParamTypeKey(g_params.rows.paramValue));
		$('#paramValue').attr("readonly","readonly");
	}
	
	//绑定下拉框变更事件
	$('#paramValueType').on('changed.bs.select', function (e) {
		if($('#paramValueType').val() == '${custom}'){
			$('#paramValue').removeAttr("readonly");
			$('#paramValue').val('');
		}else {
			$('#paramValue').attr("readonly","readonly");
			$('#paramValue').val(getParamTypeText($('#paramValueType').val()));
		}
	});
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

function getParamTypeText(val){
	switch(val){
		case "${currDateSt}":
			return "当天开始";
		case "${currDateEd}":
			return "当天结束";
		case "${preDateSt}":
			return "昨天开始";
		case "${preDateEd}":
			return "昨天结束";
		case "${custom}":
			return "自定义";
		default:
			return "自定义";
	}
}

function getParamTypeKey(val){
	switch(val){
		case "当天开始":
			return "${currDateSt}";
		case "当天结束":
			return "${currDateEd}";
		case "昨天开始":
			return "${preDateSt}";
		case "昨天结束":
			return "${preDateEd}";
		case "自定义":
			return "${custom}";
		default:
			return "${custom}";
	}
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
        		paramValue: {required: true}
        },
        messages: {
        		paramValue: {required: "请输入参数值内容"}
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
	g_params.rows.paramValue = $('#paramValue').val();
	parent.app.layer.retParams = [];
	parent.app.layer.retParams.push(g_params.rows);

	//关闭页面前设置结果
	parent.app.layer.editLayerRet = true;
	parent.layer.close(g_iframeIndex);
}