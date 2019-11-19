var g_params = {}, $tableDatabase = $('#tableListDatabase'), $tablePage = $('#tableListPage');
var databaseList = [], pageList = [], tableSelectRow = null, pageSelectRow = null ;
$(function () {
	$("#layerOk").click(function () {
		$("form").submit();
    });
	g_params = top.app.info.iframe.params;
	initDatabaseTable();
	initPageTable();
	initWizard();
	initView();
	//设置select的宽度为
	$('.selectpicker').selectpicker({
		width: '600px'
	});
});

/**
 * 初始化向导
 */
function initWizard(){
    var btnFinish = $('<button></button>').text('保存').attr("id","finishBtn").addClass('btn btn-info display-none').on('click', function(){ 
    		submitAction(); 
    	}); 
    var btnBack = $('<button></button>').text('返回').addClass('btn btn-info')	.on('click', function(){ 
    		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "gencode.html?_pid=" + pid; 
	});
    
     $('#smartwizard').smartWizard({ 
         selected: 0, 
         theme: 'arrows',
         transitionEffect:'fade',
         showStepURLhash: true,
         toolbarSettings: {toolbarPosition: 'bottom', toolbarExtraButtons: [btnFinish, btnBack] },
         lang:{next:'下一步', previous: '上一步'}
     });
	$("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {
        if(stepPosition === 'first'){
            $("#finishBtn").addClass('display-none');
            $("#prev-btn").addClass('disabled');
        }else if(stepPosition === 'final'){
            $("#next-btn").addClass('disabled');
            $("#finishBtn").removeClass('display-none');
        }else{
            $("#finishBtn").addClass('display-none');
            $("#prev-btn").removeClass('disabled');
            $("#next-btn").removeClass('disabled');
        }
     }); 
	$("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
        if(stepNumber == 0){
        	return formValidateBase();	
        }else if(stepNumber == 1){
        	return formValidateTable();
        }else if(stepNumber == 2){
        	return formValidatePage();
        }else return true;
     });
}


function initDatabaseTable(){
	//初始化列表
	$tableDatabase.bootstrapTable({
        uniqueId: 'columnName',
        height: 400,
        onClickRow: function(row, $el){
    		tableSelectRow = row;
    		$tableDatabase.find('.success').removeClass('success');
    		$el.addClass('success');
        }
    });
	$("#toolbarDatabaseAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		top.app.layer.editLayer('添加数据表字段', ['710px', '400px'], '/admin/system/gencode/gencode-table-edit.html', params, function(retParams){
			tableSelectRow = null;
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取返回内容失败！");
				return;
			}
			var dataRows = $tableDatabase.bootstrapTable('getData');
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == retParams[0].columnName){
					top.app.message.alert("字段名称不能重复！");
					return;
				}
			}
			var index = 0;
			if(dataRows != null && dataRows != undefined && dataRows.length > 0) index = dataRows.length;
			$tableDatabase.bootstrapTable('insertRow', {
				index: index, 
				row: retParams[0]
			});
			//重置高度
			resetTableHeight(dataRows.length + 1);
		});
    });
	$("#toolbarDatabaseEdit").click(function () {
		if(tableSelectRow == null || tableSelectRow == undefined){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = tableSelectRow;
		top.app.layer.editLayer('编辑数据表字段', ['710px', '400px'], '/admin/system/gencode/gencode-table-edit.html', params, function(retParams){
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取返回内容失败！");
				return;
			}
			var dataRows = $tableDatabase.bootstrapTable('getData');
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == tableSelectRow.columnName){
					index = i;
					break;
				}
			}
			$tableDatabase.bootstrapTable('updateRow', {
				index: index, 
				row: retParams[0]
			});
			tableSelectRow = null;
			//重置高度
			resetTableHeight(dataRows.length);
		});
    });
	$("#toolbarDatabaseDel").click(function () {
		if(tableSelectRow == null || tableSelectRow == undefined){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		$tableDatabase.bootstrapTable('removeByUniqueId', tableSelectRow.columnName);
		tableSelectRow = null;
    });
}

function initPageTable(){
	$tablePage.bootstrapTable({
        uniqueId: 'columnName',
        height: 400,
        onClickRow: function(row, $el){
        		pageSelectRow = row;
        		$tablePage.find('.success').removeClass('success');
        		$el.addClass('success');
        }
    });
	$("#toolbarPageEdit").click(function () {
		if(pageSelectRow == null || pageSelectRow == undefined){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = pageSelectRow;
		top.app.layer.editLayer('编辑页面字段', ['710px', '450px'], '/admin/system/gencode/gencode-page-edit.html', params, function(retParams){
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取返回内容失败！");
				return;
			}
			var dataRows = $tablePage.bootstrapTable('getData');
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == pageSelectRow.columnName){
					index = i;
					break;
				}
			}
			$tablePage.bootstrapTable('updateRow', {
				index: index, 
				row: retParams[0]
			});
			pageSelectRow = null;
			//重置高度
			resetTableHeight(dataRows.length);
		});
    });

	$("#toolbarPageSetDisplay").click(function () {
		var selectRows = $tablePage.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要设置的数据！");
			return;
		}
		var dataRows = $tablePage.bootstrapTable('getData');
		$(selectRows).each(function(i,row){
			if(row.isDisplay == 'Y') row.isDisplay = 'N';
			else row.isDisplay = 'Y';
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == row.columnName){
					index = i;
					break;
				}
			}
			$tablePage.bootstrapTable('updateRow', {
				index: index, 
				row: row
			});
		});
    });

	$("#toolbarPageSetSearch").click(function () {
		var selectRows = $tablePage.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要设置的数据！");
			return;
		}
		var dataRows = $tablePage.bootstrapTable('getData');
		$(selectRows).each(function(i,row){
			if(row.isSearch == 'Y') row.isSearch = 'N';
			else row.isSearch = 'Y';
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == row.columnName){
					index = i;
					break;
				}
			}
			$tablePage.bootstrapTable('updateRow', {
				index: i, 
				row: row
			});
		});
    });

	$("#toolbarPageSetEdit").click(function () {
		var selectRows = $tablePage.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要设置的数据！");
			return;
		}
		var dataRows = $tablePage.bootstrapTable('getData');
		$(selectRows).each(function(i,row){
			if(row.isEdit == 'Y') row.isEdit = 'N';
			else row.isEdit = 'Y';
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == row.columnName){
					index = i;
					break;
				}
			}
			$tablePage.bootstrapTable('updateRow', {
				index: i, 
				row: row
			});
		});
    });

	$("#toolbarPageSetVaildata").click(function () {
		var selectRows = $tablePage.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要设置的数据！");
			return;
		}
		var dataRows = $tablePage.bootstrapTable('getData');
		$(selectRows).each(function(i,row){
			if(row.isVaildata == 'Y') row.isVaildata = 'N';
			else row.isVaildata = 'Y';
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].columnName == row.columnName){
					index = i;
					break;
				}
			}
			$tablePage.bootstrapTable('updateRow', {
				index: i, 
				row: row
			});
		});
    });
}

function initView(){
	$('#divTreeNodeName').css("display", "none");
	$('#divTreeNodeOrder').css("display", "none");
	$('#pageType').on('changed.bs.select', function (e) {
		loadPageType();
	});
	if(g_params.rows != null && g_params.rows != undefined){
		$("#sysName").val(g_params.rows.sysName);
		$("#moduleName").val(g_params.rows.moduleName);
		$("#basePackage").val(g_params.rows.basePackage);
		$("#subPackage").val(g_params.rows.subPackage);
		$("#jdbcDriver").val(g_params.rows.jdbcDriver);
		$("#jdbcUrl").val(g_params.rows.jdbcUrl);
		$("#jdbcUsername").val(g_params.rows.jdbcUsername);
		$("#jdbcPassword").val(g_params.rows.jdbcPassword);
		$("#tableName").val(g_params.rows.tableName);
		$("#tableDesc").val(g_params.rows.tableDesc);
		$("#pageType").val(g_params.rows.pageType);
		$("#restfulPath").val(g_params.rows.restfulPath);
		$("#pagePath").val(g_params.rows.pagePath);
		
		var treeInfo = eval("(" + g_params.rows.treeInfo + ")");
		if(treeInfo != null && treeInfo != undefined){
			$("#treeNodeName").val(treeInfo.treeNodeName);
			$("#treeNodeOrder").val(treeInfo.treeNodeOrder);
		}

		var jsonData = eval("(" + g_params.rows.tableColumn + ")");
		if(jsonData != null && jsonData != undefined){
			pageList = jsonData.rows;
			jsonData.data = jsonData.rows; //新版更新为获取data，不是rows
			$tableDatabase.bootstrapTable('load', jsonData);
			//重置高度
			resetTableHeight(jsonData.total);
		}
		loadPageType();
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

function loadPageType(){
	if($('#pageType').val() == '1'){
		$('#divTreeNodeName').css("display", "none");
		$('#divTreeNodeOrder').css("display", "none");
	}else{
		$('#divTreeNodeName').css("display", "block");
		$('#divTreeNodeOrder').css("display", "block");
	}
}

/**
 * 重置高度
 * @param total
 */
function resetTableHeight(total){
//	$tableDatabase.bootstrapTable('resetView', {
//        height: 42 * total
//    });
//	$tablePage.bootstrapTable('resetView', {
//        height: 42 * total
//    });
}

/**
 * 表单验证
 */
function formValidateBase(){
	if($('#sysName').val() == '' || $('#moduleName').val() == '' || $('#basePackage').val() == '' || 
			$('#subPackage').val() == '' || $('#jdbcDriver').val() == ''
		 || $('#jdbcUrl').val() == '' || $('#jdbcUsername').val() == '' || $('#jdbcPassword').val() == ''){
		top.app.message.alert("输入框内容不能为空！");
		return false;
	}
	
	return true;
}

function formValidateTable(){
	if($('#tableName').val() == '' || $('#tableDesc').val() == ''){
		top.app.message.alert("输入框内容不能为空！");
		return false;
	}
	var rows = $tableDatabase.bootstrapTable('getData');
	if(rows == null || rows == undefined || rows.length == 0){
		top.app.message.alert("请输入数据表字段！");
		return false;
	}
	//加载数据
	$tablePage.bootstrapTable('load', saveDatabaseData());
	return true;
}

function formValidatePage(){
	if($('#restfulPath').val() == '' || $('#pagePath').val() == ''){
		top.app.message.alert("输入框内容不能为空！");
		return false;
	}
	savePageData();
	return true;
}

function saveDatabaseData(){
	var rows = $tableDatabase.bootstrapTable('getData');
	//保存数据表内容
	var databaseData = new Object();
	databaseList = [];
	var obj = null, isExist = false;
	//添加成员
	$(rows).each(function(i,row){
		obj = new Object();
		obj.columnName = row.columnName;
		obj.columnDesc = row.columnDesc;
		obj.columnType = row.columnType;
		obj.columnLen = row.columnLen;
		obj.columnFloat = row.columnFloat;
		obj.columnDefault = row.columnDefault;
		obj.isKey = row.isKey;
		obj.isNull = row.isNull;
		obj.valueType = row.valueType;
		obj.valueTypeDict = row.valueTypeDict;
		//添加页面配置内容
		for(var i = 0;i < pageList.length; i++){
			if(pageList[i].columnName == obj.columnName){
				obj.displayName = pageList[i].displayName;
				obj.isDisplay = pageList[i].isDisplay;
				obj.isSearch = pageList[i].isSearch;
				obj.searchType = pageList[i].searchType;
				obj.searchDict = pageList[i].searchDict;
				obj.isEdit = pageList[i].isEdit;
				obj.editType = pageList[i].editType;
				obj.editDict = pageList[i].editDict;
				obj.isVaildata = pageList[i].isVaildata;
				obj.vaildataRule = pageList[i].vaildataRule;
				isExist = true;
				break;
			}
		}
		//如果不存在，则添加默认值
		if(!isExist){
			obj.isDisplay = 'Y';
			obj.displayName = row.columnDesc;
			obj.isSearch = 'N';
			obj.searchType = '0';
			obj.searchDict = '';
			if(obj.isKey == 'Y'){
				obj.isEdit = 'N';
				obj.editType = '0';
			}else{
				obj.isEdit = 'Y';
				obj.editType = '1';
			}
			obj.editDict = '';
			obj.isVaildata = 'N';
			obj.vaildataRule = '0';
		}
		databaseList.push(obj);
		isExist = false;
	});
//	databaseData.rows = databaseList;
	databaseData.data = databaseList;
	databaseData.total = databaseList.length;
	return databaseData;
}

function savePageData(){
	var rows = $tablePage.bootstrapTable('getData');
	pageList = [];
	var obj = null;
	$(rows).each(function(i,row){
		obj = new Object();
		obj.columnName = row.columnName;
		obj.displayName = row.displayName;
		obj.isDisplay = row.isDisplay;
		obj.isSearch = row.isSearch;
		obj.searchType = row.searchType;
		obj.searchDict = row.searchDict;
		obj.isEdit = row.isEdit;
		obj.editType = row.editType;
		obj.editDict = row.editDict;
		obj.isVaildata = row.isVaildata;
		obj.vaildataRule = row.vaildataRule;
		pageList.push(obj);
	});
}

/**
 * 提交数据
 */
function submitAction(){
	//如果是树模式，则需要判断是否有parentId，同时是否设置了显示字段
	if($("#pageType").val() == '2'){
		if($('#treeNodeName').val() == '' || $('#treeNodeOrder').val() == '') {
			top.app.message.alert("树模式节点名称和排序字段不能为空！");
			return false;
		}
		var rows = $tablePage.bootstrapTable('getData');
		var hasParentId = false, hasTreeNodeName = false, hasTreeNodeOrder = false;
		$(rows).each(function(i,row){
			if(row.columnName == 'PARENT_ID'){
				hasParentId = true;
			}
			if(row.columnName == $('#treeNodeName').val()){
				hasTreeNodeName = true;
			}
			if(row.columnName == $('#treeNodeOrder').val()){
				hasTreeNodeOrder = true;
			}
		});
		if(!hasTreeNodeName){
			top.app.message.alert("数据库字段中不存在：" + $('#treeNodeName').val());
			return false;
		}
		if(!hasTreeNodeOrder){
			top.app.message.alert("数据库字段中不存在：" + $('#treeNodeOrder').val());
			return false;
		}
		if(!hasParentId){
			top.app.message.alert("树模式下需要一个父节点字段：PARENT_ID！");
			return false;
		}
	}
	//定义提交数据
	var submitData = {};
	if(g_params.rows != null && g_params.rows != undefined)
		submitData['codeId'] = g_params.rows.codeId;
	submitData["sysName"] = $("#sysName").val();
	submitData["moduleName"] = $("#moduleName").val();
	submitData["basePackage"] = $("#basePackage").val();
	submitData["subPackage"] = $("#subPackage").val();
	submitData["jdbcDriver"] = $("#jdbcDriver").val();
	submitData["jdbcUrl"] = $("#jdbcUrl").val();
	submitData["jdbcUsername"] = $("#jdbcUsername").val();
	submitData["jdbcPassword"] = $("#jdbcPassword").val();
	submitData["tableName"] = $("#tableName").val();
	submitData["tableDesc"] = $("#tableDesc").val();
	submitData["pageType"] = $("#pageType").val();
	submitData["restfulPath"] = $("#restfulPath").val();
	submitData["pagePath"] = $("#pagePath").val();
	savePageData();
	var tableColumn = new Object();
	var tmpData = saveDatabaseData();
	tableColumn.rows = tmpData.data;
	tableColumn.total = tmpData.total;
	submitData["tableColumn"] = JSON.stringify(tableColumn);

	if($("#pageType").val() == '2'){
		var treeInfo = new Object();
		treeInfo.treeNodeName = $('#treeNodeName').val();
		treeInfo.treeNodeOrder = $('#treeNodeOrder').val();
		submitData["treeInfo"] = JSON.stringify(treeInfo);
	}
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.notice("数据保存成功！");

	   			var pid = $.utils.getUrlParam(window.location.search,"_pid");
	   			window.location.href= "gencode.html?_pid=" + pid;
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

function serialNumberTable(value,row,index){
    var pageNumber = $tableDatabase.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tableDatabase.bootstrapTable('getOptions').pageSize;
    return (pageNumber-1) * pageSize+index+1;
}

function serialNumberPage(value,row,index){
    var pageNumber = $tablePage.bootstrapTable('getOptions').pageNumber;
    var pageSize = $tablePage.bootstrapTable('getOptions').pageSize;
    return (pageNumber-1) * pageSize+index+1;
}

function formatEditType(value,row,index){
	if(value == '1') return '文本框';
	else if(value == '2') return '密码';
	else if(value == '3') return '日期(yyyy-MM-dd)';
	else if(value == '4') return '日期(yyyy-MM-dd HH:mm:ss)';
	else if(value == '5') return '上传文件';
	else if(value == '6') return '上传图片';
	else if(value == '7') return '下拉框(字典:' + row.editDict + ')';
	else if(value == '8') return '富文本编辑器';
	else return '';
}

function formatVaildataType(value,row,index){
	if(value == '1') return '非空';
	else if(value == '2') return '数字';
	else if(value == '3') return '字母';
	else if(value == '4') return '邮政编码';
	else if(value == '5') return '手机号码';
	else if(value == '6') return '电话号码';
	else if(value == '7') return '电子邮箱';
	else if(value == '8') return '身份证';
	else if(value == '9') return '网址';
	else if(value == '10') return '日期';
	else return '';
}

function formatYesOrNot(value,row,index){
	if(value == 'Y') return '<font color="red">是</font>';
	else if(value == 'N') return '<font color="green">否</font>';
	else return '未知';
}

function formatSearchType(value,row,index){
	if(value == '1') return '普通查询';
	else if(value == '2') return '模糊查询';
	else if(value == '3') return '日期查询';
	else if(value == '4') return '下拉框(字典:' + row.searchDict + ')';
	else return '';
}

function formatValueType(value,row,index){
	if(value == '1') return '默认';
	else if(value == '2') return '字典(' + row.valueTypeDict + ')';
	else return '未知';
}