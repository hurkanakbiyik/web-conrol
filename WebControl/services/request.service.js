let request = require('request');

let service = {
	loadService : loadService
};

/**
 *
 */
function loadService(url,successCallback,errorCallback) {
	request.get({
		url: url,
		headers: {

		}
	}, function(error, response, body) {
		if(error){
			errorCallback(error);
		}else{
			successCallback({
				response : response,
				body : body
			});
		}
	});
}

module.exports = service;