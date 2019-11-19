var ActivitiRest = {
	options: {},
	getProcessDefinitionByKey: function(processDefinitionKey, callback) {
		var url = Lang.sub(this.options.processDefinitionByKeyUrl, {processDefinitionKey: processDefinitionKey});
		$.ajax({
		    url: url,
		    method: 'GET',
		    success : function(data) { 
		    	var processDefinition = data;
				if (!processDefinition) {
					console.error("Process definition '" + processDefinitionKey + "' not found");
				} else {
				  callback.apply({processDefinitionId: processDefinition.id});
				}
	        },  
	        error : function(responseStr) { 
	        	console.error('Get diagram layout['+processDefinitionKey+'] failure: ', responseStr);
	        } 
		});
	},
	
	getProcessDefinition: function(processDefinitionId, callback) {
		var url = Lang.sub(this.options.processDefinitionUrl, {processDefinitionId: processDefinitionId});
		$.ajax({
		    url: url,
		    method: 'GET',
		    success : function(data) { 
		    	var processDefinitionDiagramLayout = data;
				if (!processDefinitionDiagramLayout) {
					console.error("Process definition diagram layout '" + processDefinitionId + "' not found");
					return;
				} else {
					callback.apply({processDefinitionDiagramLayout: processDefinitionDiagramLayout});
				}
	        },  
	        error : function(responseStr) { 
	        	console.log('Get diagram layout['+processDefinitionId+'] failure: ', responseStr);
	        } 
		});
	},
	
	getHighLights: function(processInstanceId, callback) {
		var url = Lang.sub(this.options.processInstanceHighLightsUrl, {processInstanceId: processInstanceId});
		$.ajax({
		    url: url,
		    method: 'GET',
		    success : function(data) { 
		    	console.log("ajax returned data");
				var highLights = data;
				if (!highLights) {
					console.log("highLights not found");
					return;
				} else {
					callback.apply({highLights: highLights});
				}
	        },  
	        error : function(responseStr) { 
	        	console.log('Get HighLights['+processInstanceId+'] failure: ',  responseStr);
	        } 
		});
	}
};