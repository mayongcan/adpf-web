/*!
 * 作者：zzd
 * 时间：2017-04-19
 * 描述：表格工具类
 */
var appTable = appTable || {};
(function() {
	//表格分页工具条高度
	appTable.paginationHeight = 0;
	//1为单选，2为多选
	appTable.multiCheckStatus = 1;
	//1为单选，2为多选
	appTable.selections = [];
	//所有列表的选中行
	appTable.allPageSelections = [];
	appTable.searchPannelHeight = -1;
	//是否正在导出
	appTable.isExport = false;
	appTable.exportType = 'excel';
	appTable.exportDefPageSize = 15;
	
	/**
	 * 格式化日期为：yyyy-MM-dd
	 */
	appTable.tableFormatDate = function(value, row){
		return $.date.dateFormat(value, "yyyy-MM-dd");
	}
	
	/**
	 * 格式化金额
	 */
	appTable.tableFormatMoney = function(value, row){
		return accounting.formatMoney(value, "¥");
	}

	/**
	 * 格式化序列号
	 */
	appTable.tableFormatSerialNumber = function(table, index){
		var pageNumber = table.bootstrapTable('getOptions').pageNumber;
	    var pageSize = table.bootstrapTable('getOptions').pageSize;
	    return (pageNumber-1) * pageSize + index + 1;
	}
	
	/**
	 * 格式化表格字典值
	 */
	appTable.tableFormatDictValue = function(dict, value){
		if($.utils.isNull(dict) || $.utils.isNull(value)) return "";
		var i = dict.length;
		while (i--) {
			if(dict[i].ID == value){
				return dict[i].NAME;
			}
		}
		return "未知";
	}
	
	/**
	 * 格式化checkbox，判断是否有默认选中
	 * @param value
	 * @param row
	 * @returns {Boolean}
	 */
	appTable.tableFormatCheckbox = function(value, row) {
		if($.utils.isNull(appTable.allPageSelections)) return false;
		row.tableMulti = false;
		var hasVal = false;
		var length = appTable.allPageSelections.length;
		for(var i = 0; i < length; i++){
			if($.utils.objectEqual(appTable.allPageSelections[i], row)){
				hasVal = true;
				break;
			} 
		}
		return hasVal;
	}
	
	/**
	 * 格式化组织机构路径
	 * @param value
	 * @param row
	 * @returns {String}
	 */
	appTable.tableFormatOrganizerName = function(value, row) {
		if(row.namePath == null || row.namePath == undefined || row.namePath == '') return "";
//		//判断所有用户的组织类型是否为岗位
//		if(row.organizerType == '3'){
//			var orgList = row.namePath.split(">>");
//			if(orgList == null || orgList == undefined || orgList == '' || orgList.length <= 1){
//				return row.namePath;
//			}else{
//				var retVal = "";
//				for(var i = 0; i < orgList.length - 1; i++){
//					if(i != orgList.length - 2)
//						retVal += orgList[i] + ">>";
//					else
//						retVal += orgList[i];
//				}
//				return retVal;
//			}
//		}else{
//			return row.namePath;
//		}
		return row.namePath;
	}

	/**
	 * 格式化岗位
	 * @param value
	 * @param row
	 * @returns {String}
	 */
	appTable.tableFormatUserPost = function(value, row) {
		if(row.namePath == null || row.namePath == undefined || row.namePath == '') return "";
		if(row.organizerType == '3'){
			var orgList = row.namePath.split(">>");
			if(orgList == null || orgList == undefined || orgList == '' || orgList.length <= 1){
				return "";
			}else{
				return orgList[orgList.length - 1];
			}
		}else{
			return "";
		}
	}
	
	/**
	 * 初始化表格信息
	 */
	appTable.initTable = function(table, reset){
		if(appTable.searchPannelHeight == -1)
			appTable.searchPannelHeight = $('#searchPannel').outerHeight(true);//+ $('#tableToolbar').outerHeight(true);
		if($.utils.isNull(appTable.searchPannelHeight)){
			appTable.searchPannelHeight = 0;
		}
		if($.utils.isNull(reset)){
			//加载数据成功后执行事件
			table.on('load-success.bs.table', function (data) {
				appTable.resetTableHeightOnLoad(table, appTable.searchPannelHeight);
		    });
			//重置表格高度
			appTable.resetTableHeight(table, appTable.searchPannelHeight);
		}
		
		//checkbox监听事件
		table.on('check.bs.table', function (row, rowData) {
			if($.utils.isNull(appTable.allPageSelections)) {
				appTable.allPageSelections = [];
				appTable.allPageSelections.push(rowData);
			}
			else appTable.allPageSelections.push(rowData);
	    });
		table.on('check-all.bs.table', function (rows, rowsData) {
			if($.utils.isNull(appTable.allPageSelections)) appTable.allPageSelections = rowsData;
			else{
				var length = appTable.allPageSelections.length;
				var tmpLength = rowsData.length;
				var isExist = false;
				for(var i = 0; i < tmpLength; i++){
					isExist = false;
					for(var j = 0; j < length; j++){
						if($.utils.objectEqual(rowsData[i], appTable.allPageSelections[j])){
							isExist = true;
							break;
						} 
					}
					if(!isExist){
						appTable.allPageSelections.push(rowsData[i]);
					}
				}
			}
	    });
		table.on('uncheck.bs.table', function (row, rowData) {
			if($.utils.isNull(appTable.allPageSelections)) return;
			else{
				for(var i = 0; i < appTable.allPageSelections.length; i++){
					if($.utils.objectEqual(rowData, appTable.allPageSelections[i])){
						appTable.allPageSelections.splice(i, 1);
						break;
					} 
				}
			}
	    });
		table.on('uncheck-all.bs.table', function (rows, rowsData) {
			if($.utils.isNull(appTable.allPageSelections)) return;
			else{
				var tmpLength = rowsData.length;
				for(var i = 0; i < tmpLength; i++){
					for(var j = 0; j < appTable.allPageSelections.length; j++){
						if($.utils.objectEqual(rowsData[i], appTable.allPageSelections[j])){
							appTable.allPageSelections.splice(j, 1);
							break;
						} 
					}
				}
			}
	    });
		//刷新table后，重置选中行
		table.on('refresh.bs.table', function () {
			appTable.allPageSelections = [];
	    });
		
		//权限--导出功能
		$("#toolbarExport").click(function () {
			appTable.exportTable($table);
	    });
		//权限--单选多选切换功能
		$("#toolbarMultiCheck").click(function () {
			appTable.multiCheck($table, $("#toolbarMultiCheck i"));
	    });
	}
	
	/**
	 * 添加默认的权限功能按钮
	 */
	appTable.addDefaultFuncButton = function() {
		return "<button type='button' class='btn btn-outline btn-default' id='toolbarExport'>" + 
			    	"<i class='glyphicon glyphicon-export' aria-hidden='true'></i> 导出" +
				"</button>" +
				"<button type='button' class='btn btn-outline btn-default' id='toolbarMultiCheck'>" + 
				    "<i class='glyphicon glyphicon-unchecked' aria-hidden='true'></i> 开启多选" +
				"</button>";
		//return "";
	}
	
	/**
	 * 添加权限菜单按钮
	 */
	appTable.addFuncButton = function(toolBar){
		var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
		toolBar.empty();
		var html = "";
		var length = operRights.length;
		for (var i = 0; i < length; i++) {
			html += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
						"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
					"</button>";
		}
		html += appTable.addDefaultFuncButton();
		toolBar.append(html);
	}
	
	/**
	 * 获取表格自适应高度
	 */
	appTable.getTableHeight = function(pannelHeight, paginationHeight) {
		if(pannelHeight == null || pannelHeight == undefined || !$.isNumeric (pannelHeight)) 
			pannelHeight = 0;
		if(paginationHeight == null || paginationHeight == undefined || !$.isNumeric (paginationHeight)) 
			paginationHeight = 0;
	    return $(window).height() - pannelHeight - paginationHeight - 10;
	}
	
	/**
	 * 重置表格高度
	 */
	appTable.resetTableHeight = function(table, searchPannelHeight){
		//重置视图
	    setTimeout(function () {
	    	table.bootstrapTable('resetView', {
	            height: appTable.getTableHeight(searchPannelHeight, appTable.paginationHeight)
	        });
	    }, 200);
	    $(window).resize(function () {
	    	table.bootstrapTable('resetView', {
	            height: appTable.getTableHeight(searchPannelHeight, appTable.paginationHeight)
	        });
	    });
	}
	
	/**
	 * 加载数据成功后，重置表格高度
	 */
	appTable.resetTableHeightOnLoad = function(table, searchPannelHeight){
		//判断是否有分页工具条
		if(table.parent().parent().parent().find('.fixed-table-pagination').length != 0 && table.parent().parent().parent().find('.fixed-table-pagination').css('display') != 'none'){
			//动态修改css
			table.parent().parent().parent().parent().css("padding-bottom","0px");
			//重置高度(减去分页工具条的高度)
			var height = table.parent().parent().parent().find('.fixed-table-pagination').height();
			if(height != null && height != undefined && $.isNumeric (height)) {
				//这里是减去上面动态修改的css高度
				height = height - 20;
				appTable.paginationHeight = height;
				table.bootstrapTable('resetView', {
		            height: appTable.getTableHeight(searchPannelHeight, appTable.paginationHeight)
		        });
			}
		}else{
			table.parent().parent().parent().parent().css("padding-bottom","20px");
			appTable.paginationHeight = 0;
			table.bootstrapTable('resetView', {
	            height: appTable.getTableHeight(searchPannelHeight, appTable.paginationHeight)
	        });
		}
		//判断是否正在导出数据
		if(appTable.isExport){
			appTable.exportTableAllFinish(table);
		}
	}
	
	/**
	 * 多选单选切换
	 */
	appTable.multiCheck = function(table, checkBtn){
		appTable.selections = [];
		appTable.allPageSelections = [];
		table.bootstrapTable('uncheckAll');
		if(appTable.multiCheckStatus == 1){
			table.bootstrapTable('showColumn', 'tableMulti');
        	appTable.multiCheckStatus = 2;
        	checkBtn.removeClass("glyphicon-unchecked");
        	checkBtn.addClass("glyphicon-check");
        }else{
        	table.bootstrapTable('hideColumn', 'tableMulti');
        	appTable.multiCheckStatus = 1;
        	checkBtn.removeClass("glyphicon-check");
        	checkBtn.addClass("glyphicon-unchecked");
        }
	}
	
	/**
	 * 获取选中内容
	 */
	appTable.getSelectionRows = function(table){
		if(appTable.isMultiCheck()){
//			var selectRows = table.bootstrapTable('getSelections');
//			if(selectRows != null && selectRows != undefined && selectRows.length > 0){
//				appTable.selections = selectRows;
//			}
			return appTable.allPageSelections;
		}else{
			return appTable.selections;
		}
		
	}
	
	/**
	 * 设置表格点击状态
	 */
	appTable.setRowClickStatus = function(table, row, el){
    	if(!appTable.isMultiCheck()){
    		table.find('.success').removeClass('success');
    		el.addClass('success');
    		appTable.selections = [];
    		appTable.selections.push(row);
    	}else{
    		appTable.selections.push(row);
    	}
	};
	
	/**
	 * 判断表格是否多选
	 */
	appTable.isMultiCheck = function(){
		if(appTable.multiCheckStatus == 1){
			return false;
        }else{
			return true;
        }
	}
	
	/**
	 * 导出数据
	 */
	appTable.exportTable = function(table){
		top.app.layer.exportLayer(function(ret, exportScope, exportType){
			//判断是否确定导出
			if(ret != 1) return;
			if(exportScope == ""){
				appTable.exportTableDef($table, exportType);
			}else if(exportScope == "selected"){
				appTable.exportTableSelect($table, exportType);
			}else if(exportScope == "all"){
				appTable.exportTableAll($table, exportType);
			}
		});
	}
	
	/**
	 * 导出数据(默认当前页)
	 */
	appTable.exportTableDef = function(table, exportType){
		table.tableExport({
            type: exportType,
            escape: false
      	});
	}
	
	/**
	 * 导出数据(选中内容)
	 */
	appTable.exportTableSelect = function(table, exportType){
		//备份旧数据
		var dataField = table.bootstrapTable('getOptions').dataField;
		var totalRows = table.bootstrapTable('getOptions').totalRows;
		var bakData = {total: totalRows};
		bakData[dataField] = table.bootstrapTable('getData');
		//判断是否已经选中内容
		//var rows = appTable.getSelectionRows(table);
		var rows = appTable.allPageSelections;
		if(rows.length == 0){
			top.app.message.alert("当前选中内容为空");
			return;
		}
		top.app.message.loading();
		var selectedData = {total: rows.length};
        selectedData[dataField] = rows;
        //加载选中数据
        table.bootstrapTable('load', selectedData);
        appTable.exportTableDef(table, exportType);
        //加载备份数据
        table.bootstrapTable('load', bakData);
		top.app.message.loadingClose();
	}
	
	/**
	 * 导出数据(所有内容)
	 */
	appTable.exportTableAll = function(table, exportType){
		//备份旧数据
		var options = table.bootstrapTable('getOptions');
		if(options.totalRows / options.pageSize > 50){
			top.app.message.alert("不允许导出内容超过50页");
			return;
		}
		top.app.message.loading();
		//设置导出类型
		appTable.isExport = true;
		appTable.exportType = exportType;
		appTable.exportDefPageSize = options.pageSize;
		//重新加载条数
		table.bootstrapTable('refreshOptions', {"pageSize": "5000"});
	}
	
	/**
	 * 导出数据(所有内容),完成
	 */
	appTable.exportTableAllFinish = function(table){
		appTable.exportTableDef(table, appTable.exportType);
		//重新加载条数
		table.bootstrapTable('refreshOptions', {"pageSize": appTable.exportDefPageSize});
		appTable.isExport = false;
		top.app.message.loadingClose();
	}
	
	/**
	 * 删除数据
	 */
	appTable.delData = function(table, actionUrl, idsList){
		var operUrl = top.app.conf.url.apigateway + actionUrl;
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			top.app.message.loading();
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: idsList,
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			//重新加载列表
						table.bootstrapTable('refresh');
			   			top.app.message.notice("数据删除成功！");
			   			appTable.selections = [];
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
	}

	/**
	 * Post数据
	 */
	appTable.postData = function(table, actionUrl, params, notice, successMsg){
		var operUrl = top.app.conf.url.apigateway + actionUrl;
		top.app.message.confirm(notice, function(){
			top.app.message.loading();
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: params,
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			//重新加载列表
						table.bootstrapTable('refresh');
			   			top.app.message.notice(successMsg);
			   			appTable.selections = [];
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
	}
})();