const cheerio = require('cheerio');
const requestService = require('./request.service');
function AnalysisService(body,url) {
	let self = this;
	self.url = url;
	self.body = body;
	self.$ = cheerio.load(body);
	self.loadTitle = loadTitle;
	self.loadVersion = loadVersion;
	self.loadHeads = loadHeads;
	self.loadLinks = loadLinks;
	self.loadLoginInfo = loadLoginInfo;

	//functions

	/**
	 * 
	 */
	function loadTitle(success,error) {
		let result = self.$('title')[0].children[0].data;
		if(result){
			success(result);
		}else{
			error();
		}
	}

	/**
	 *
	 * @returns {*}
	 */
	function loadVersion(success,error) {
		let result = self.$._root.children[0]['x-name'];
		if(result){
			success(result);
		}else{
			error();
		}
	}

	/**
	 *
	 * @returns {{}}
	 */
	function loadHeads(success,error) {
		let headsDOM = self.$(':header');
		let heads = {

		};
		headsDOM.each(function (i,headDOM) {
			if(heads[headDOM.name]){
				heads[headDOM.name]++;
			}else{
				heads[headDOM.name] = 1;
			}
		});

		if(heads){
			success(heads);
		}else{
			error();
		}
	}

	/**
	 * TODO
	 * @returns {Array}
	 */
	function loadLinks(onStart,success,error) {
		let linksDOM = self.$('[href]');

		onStart(linksDOM.length);

		linksDOM.each(function (i,linkDOM) {
			let link = linkDOM.attribs.href;
			let type = '';

			if(link.indexOf(self.url) > -1){
				type = 'internal';
			}else if(link.indexOf('http') > -1){
				type = 'external';
			}else{
				type = 'internal';
				link = url + link;
			}

			requestService.loadService(link,function (response) {
				success({
					type : type,
					link : link,
					status : response.response.statusCode
				});
			},function (err) {
				error({
					type : type,
					link : link,
					status : 404
				});
			});
		});
	}

	/**
	 * TODO
	 * @returns {{}}
	 */
	function loadLoginInfo(success,error) {
		let formsDOM = self.$('form');
		let isFound = false;
		formsDOM.each(function (i,formDOM) {
			if(formDOM.attribs && formDOM.attribs.action && formDOM.attribs.action.indexOf('login') > -1){
				isFound = true;
			}
		});
		if(isFound === true){
			success(true);
		}else{
			error(false);
		}
	}

}

module.exports = AnalysisService;
