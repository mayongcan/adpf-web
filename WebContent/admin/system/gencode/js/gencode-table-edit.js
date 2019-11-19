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
	$('#valueTypeDictDiv').css("display", "none");
	$('#valueType').on('changed.bs.select', function (e) {
		loadType();
	});
	if(g_params.type == "edit"){
		$('#columnName').val(g_params.rows.columnName);
		$('#columnDesc').val(g_params.rows.columnDesc);
		$('#columnType').val(g_params.rows.columnType);
		$('#columnLen').val(g_params.rows.columnLen);
		$('#columnFloat').val(g_params.rows.columnFloat);
		$('#columnDefault').val(g_params.rows.columnDefault);
		$('#isKey').val(g_params.rows.isKey);
		$('#isNull').val(g_params.rows.isNull);
		$('#valueType').val(g_params.rows.valueType);
		$('#valueTypeDict').val(g_params.rows.valueTypeDict);
		loadType();
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

function loadType(){
	if($('#valueType').val() == '2'){
		$('#valueTypeDictDiv').css("display", "block");
	}else{
		$('#valueTypeDictDiv').css("display", "none");
	}
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	columnName: {required: true},
	        	columnDesc: {required: true},
	        	columnLen: {required: true, number: true},
	        	columnFloat: {required: true, number: true}
        },
        messages: {
	        	columnName: {required: "请输入字段名称"},
	        	columnDesc: {required: "请输入字段描述"},
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
	var rowObj = [];
	rowObj.columnName = $.trim($('#columnName').val());
	rowObj.columnDesc = $.trim($('#columnDesc').val());
	rowObj.columnType = $.trim($('#columnType').val());
	rowObj.columnLen = $.trim($('#columnLen').val());
	rowObj.columnFloat = $.trim($('#columnFloat').val());
	rowObj.columnDefault = $.trim($('#columnDefault').val());
	rowObj.isKey = $.trim($('#isKey').val());
	rowObj.isNull = $.trim($('#isNull').val());
	rowObj.valueType = $.trim($('#valueType').val());
	rowObj.valueTypeDict = $.trim($('#valueTypeDict').val());
	parent.app.layer.retParams = [];
	parent.app.layer.retParams.push(rowObj);

	//关闭页面前设置结果
	parent.app.layer.editLayerRet = true;
	parent.layer.close(g_iframeIndex);
}