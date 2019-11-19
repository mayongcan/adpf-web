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
	//下拉框变更事件
	$('#searchDictDiv').css("display", "none");
	$('#editDictDiv').css("display", "none");
	$('#searchType').on('changed.bs.select', function (e) {
		loadType();
	});
	$('#editType').on('changed.bs.select', function (e) {
		loadType();
	});
	if(g_params.type == "edit"){
		$('#columnName').val(g_params.rows.columnName);
		$('#isSearch').val(g_params.rows.isSearch);
		$('#searchType').val(g_params.rows.searchType);
		$('#searchDict').val(g_params.rows.searchDict);
		$('#isDisplay').val(g_params.rows.isDisplay);
		$('#displayName').val(g_params.rows.displayName);
		$('#isEdit').val(g_params.rows.isEdit);
		$('#editType').val(g_params.rows.editType);
		$('#editDict').val(g_params.rows.editDict);
		$('#isVaildata').val(g_params.rows.isVaildata);
		$('#vaildataRule').val(g_params.rows.vaildataRule);
		loadType();
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

function loadType(){
	if($('#searchType').val() == '4'){
		$('#searchDictDiv').css("display", "block");
	}else{
		$('#searchDictDiv').css("display", "none");
	}
	if($('#editType').val() == '7'){
		$('#editDictDiv').css("display", "block");
	}else{
		$('#editDictDiv').css("display", "none");
	}
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
        		columnName: {required: true},
        },
        messages: {
        		columnName: {required: "请输入字段名称"},
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
	rowObj.isSearch = $.trim($('#isSearch').val());
	rowObj.searchType = $.trim($('#searchType').val());
	rowObj.searchDict = $.trim($('#searchDict').val());
	rowObj.isDisplay = $.trim($('#isDisplay').val());
	rowObj.displayName = $.trim($('#displayName').val());
	rowObj.isEdit = $.trim($('#isEdit').val());
	rowObj.editType = $.trim($('#editType').val());
	rowObj.editDict = $.trim($('#editDict').val());
	rowObj.isVaildata = $.trim($('#isVaildata').val());
	rowObj.vaildataRule = $.trim($('#vaildataRule').val());
	parent.app.layer.retParams = [];
	parent.app.layer.retParams.push(rowObj);

	//关闭页面前设置结果
	parent.app.layer.editLayerRet = true;
	parent.layer.close(g_iframeIndex);
}