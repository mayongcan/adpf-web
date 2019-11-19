var g_params = {}, g_iframeIndex = null, g_comboBoxTree = null, g_filePath = null;

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
	//初始化树
	initTree();
	//初始化界面
	initView();
}

/**
 * 初始化树
 */
function initTree(){
	//创建下拉树菜单
	g_comboBoxTree = AppCombotree.createNew();
	g_comboBoxTree.init($('#comboOrganizer') , g_params.allTreeData);
}

/**
 * 初始化界面
 */
function initView(){
	top.app.addComboBoxOption($("#sex"), g_params.sexDict);
	$('#birthday').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	$('#beginDate').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	$('#endDate').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	//判断是新增还是修改
	if(g_params.type == "edit"){
		//不能修改登录账号
		$('#userCode').attr("readonly",true);
		$('#userCode').val(g_params.rows.userCode);
		$('#userName').val(g_params.rows.userName);
		$('#email').val(g_params.rows.email);
		$('#birthday').val(g_params.rows.birthday);
		$('#beginDate').val(g_params.rows.beginDate);
		$('#endDate').val(g_params.rows.endDate);
		$('#mobile').val(g_params.rows.mobile);
		$('#ipAddress').val(g_params.rows.ipAddress);
		$('#password').attr("placeholder", "若不修改密码，此处可不填");
		$('#passwordConfirm').attr("placeholder", "若不修改密码，此处可不填");
		$('#sex').val(g_params.rows.sex);
	}
	$('input[type="file"]').prettyFile({text:"请选择图片"});
	//设置组织节点
	g_comboBoxTree.setValue(g_params.node);
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	userCode: {required:true},
	        	userName: {required:true},
	        	password: {rangelength:[6,20]},
	        	passwordConfirm: {rangelength:[6,20], equalTo:"#password"},
	        	email: {email:true},
	        	mobile: {minlength: 11, isMobile:true},
	        	birthday: { dateISO:true},
	        	//beginDate: {required: true, dateISO:true},
            //endDate: {required: true, dateISO:true}
        },
        messages: {
			userCode:{required:"登录账号不能为空"},
			userName:{required:"用户名称不能为空"},
			password2:{equalTo: "两次输入的密码不一致" },
	        	mobile: {minlength: "确认手机不能小于11个字符", isMobile: "请正确填写您的手机号码" },
	        	birthday: {dateISO: "请输入不带时间的正确日期格式,如：2017-01-01"},
			//beginDate: {required: "请输入开始日期", dateISO: "请输入不带时间的正确日期格式,如：2017-01-01"},
            //endDate: {required: "请输入开始日期", dateISO: "请输入不带时间的正确日期格式,如：2017-01-01" }
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
        		ajaxUpload();
        }
    });
}

/**
 * 提交数据
 */
function submitAction(){
	if(!g_comboBoxTree.isSelectNode()){
		top.app.message.notice("请选择用户所属组织！");
		return;
	}
	
	//定义提交数据
	var submitData = {};
	if(g_params.rows != null && g_params.rows != undefined)
		submitData['userId'] = g_params.rows.userId;
	if(g_params.tenantsId != null && g_params.tenantsId != undefined)
		submitData['tenantsId'] = g_params.tenantsId;
	submitData["userCode"] = $.trim($("#userCode").val());
	submitData["userName"] = $.trim($("#userName").val());
	submitData["password"] = $("#password").val();
	submitData["organizerId"] = g_comboBoxTree.getNodeId();
	submitData["email"] = $.trim($("#email").val());
	submitData["beginDate"] = $("#beginDate").val();
	submitData["endDate"] = $("#endDate").val();
	submitData["mobile"] = $.trim($("#mobile").val());
	submitData["ipAddress"] = $.trim($("#ipAddress").val());
	submitData["sex"] = $("#sex").val();
	submitData["birthday"] = $("#birthday").val();
	if(g_filePath != null && g_filePath != undefined && g_filePath != '')
		submitData["photo"] = g_filePath;
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

/**
 * 提交图片
 */
function ajaxUpload(){
	if($("#photo")[0].files[0] == null || $("#photo")[0].files[0] == undefined){
		submitAction();
		return;
	}
	//上传图片到资源服务器
	top.app.uploadImage($("#photo")[0].files[0], function(data){
		g_filePath = data;
		//提交数据
		submitAction();
	});
}