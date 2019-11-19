var g_params = {}, g_iframeIndex = null, $table = $('#tableList');
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
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
	initFuncBtn();
}

/**
 * 初始化界面
 */
function initView(){
	//搜索参数
	var searchParams = function (p) {
        var retParam = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
		    dbType: g_params.dbType,
		    dbUrl: g_params.dbUrl,
		    dbUser: g_params.dbUser,
		    dbPwd: g_params.dbPwd,
		    dbName: g_params.dbName,
		    procName: g_params.procName
        };
        return retParam;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.scheduler.getProcParams,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'paramIndex',
        height: 420,
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//加载数据成功后执行事件
	$table.on('load-success.bs.table', function (data) {
		var dataRows = $table.bootstrapTable('getData');
		if(dataRows != null && dataRows != undefined && dataRows.length > 0 && g_params.procParams != null && g_params.procParams != undefined){
			for(var i = 0; i < dataRows.length; i++){
				for(var j = 0; j < g_params.procParams.length; j++){
					if(dataRows[i].paramName == g_params.procParams[j].paramName){
						dataRows[i].paramValue = g_params.procParams[j].paramValue;
						$table.bootstrapTable('updateRow', {
							index: i, 
							row: dataRows[i]
						});
						break;
					}
				}
			}
		}
    });
}

function initFuncBtn(){
	$("#tableEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		top.app.layer.editLayer('编辑参数值', ['710px', '300px'], '/admin/system/scheduler/proc-params-edit.html', params, function(retParams){
			if(retParams != null && retParams != undefined && retParams.length > 0){
				var dataRows = $table.bootstrapTable('getData');
				var index = 0;
				for(var i = 0; i < dataRows.length; i++){
					if(dataRows[i].paramIndex == rows[0].paramIndex){
						index = i;
						break;
					}
				}
				$table.bootstrapTable('updateRow', {
					index: index, 
					row: retParams[0]
				});
			}
			else
				top.app.message.alert("获取参数失败！");
		});
    });
}


/**
 * 提交数据
 */
function submitAction(){
	var rows = $table.bootstrapTable('getData');
	parent.app.layer.retParams = [];
	if(rows.length == 0){
		parent.app.layer.retParams.push("无参数");
	}else{
		var listParam = [];
		$(rows).each(function(i,row){
			listParam.push({
				"paramIndex":row.paramIndex,
				"paramName":row.paramName,
				"paramType":row.paramType,
				"paramValue":row.paramValue,
				"paramMode":row.paramMode
			});
		});
		parent.app.layer.retParams.push("参数列表");
		parent.app.layer.retParams.push(listParam);
	}
	//关闭页面前设置结果
	parent.app.layer.editLayerRet = true;
	parent.layer.close(g_iframeIndex);
}