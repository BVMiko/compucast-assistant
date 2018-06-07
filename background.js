var domains = {}, ga_debug = false;
chrome.storage.local.get({domains:{}, ga_debug:false}, function(items) {
	domains = items.domains;
	ga_debug = items.ga_debug;
});

// For ga_debug (per-browser)
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var ga_map = {
		"www.google-analytics.com": {from:"/ga.js", to:"/u/ga_debug.js"},
		"ssl.google-analytics.com": {from:"/ga.js", to:"/u/ga_debug.js"},
		"stats.g.doubleclick.net": {from:"/dc.js", to:"/dc_debug.js"},
		"www.google-analytics.com": {from:"/analytics.js", to:"/analytics_debug.js"}
	}

	var parser = new URL(details.url);
	if (ga_debug && parser.hostname in ga_map && ga_map[parser.hostname].from == parser.pathname) {
		parser.pathname = ga_map[parser.hostname].to;
		return { redirectUrl: parser.href };
	}
}, {urls: ["<all_urls>"]}, ["blocking"]);

// For domain modifiers (per-domain)
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	url = new URL(details.url);
	newRequestHeaders = [];

	if (url.hostname in domains) {
		if ("PageSpeed" in domains[url.hostname]) newRequestHeaders.push({name:"PageSpeed", value:domains[url.hostname]["PageSpeed"]});
		if ("admin" in domains[url.hostname]) newRequestHeaders.push({name:"Admin", value:domains[url.hostname]["admin"]});
		if ("debug" in domains[url.hostname]) newRequestHeaders.push({name:"Debug", value:domains[url.hostname]["debug"]});
	}
	if (newRequestHeaders.length) {
		return {requestHeaders: details.requestHeaders.concat(newRequestHeaders)};
	}
}, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);


// chrome.permissions.getAll(function(perm) {
// 	// console.log(perm);
// });

function updateDomain(hostname, key, value) {
	if (!(hostname in domains)) {
		domains[hostname] = {};
	}
	if (value !== undefined) {
		domains[hostname][key] = value;
	} else if (key in domains[hostname]) { // value === undefined, delete it
		delete(domains[hostname][key]);
	}
	chrome.storage.local.set({domains:domains});
}

chrome.runtime.onInstalled.addListener(function(details) {
	chrome.storage.local.clear();
	// if(details.reason == "install") {
	// 	console.log("This is a first install!");
	// } else if(details.reason == "update") {
	// 	var thisVersion = chrome.runtime.getManifest().version;
	// 	console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
	// }
});

// function explodeQueryString(qs) {
// 	var ret = [];
// 	if (qs != "") {
// 		var vars = qs.substring(1).split("&");
// 		for (var i = 0; i < vars.length; i++) {
// 			var [key, val] = vars[i].split('=', 2);
// 			key = decodeURIComponent(key);
// 			val = val === undefined ? undefined : decodeURIComponent(val);
// 			if (key.substr(-2) == "[]") {
// 				key = key.substr(0, key.length - 2);
// 				if (!Array.isArray(ret[key])) ret[key] = [];
// 				ret[key].push(val);
// 			} else {
// 				ret[key] = val;
// 			}
// 		}
// 	}
// 	// console.log('original qs:',  qs);
// 	// console.log('exploded qs:',  ret);
// 	return ret;
// }

// function implodeQueryString(bits) {
// 	var ret = Object.entries(bits).map(function(pair) {
// 		const [key, val] = pair;
// 		if (Array.isArray(val)) {
// 			var subret = [];
// 			val.forEach(function (subval) { subret.push(encodeURIComponent(key + "[]") + "=" + encodeURIComponent(subval)); });
// 			return subret.join("&");
// 		} else if (val === undefined) {
// 			return encodeURIComponent(key);
// 		} else {
// 			return encodeURIComponent(key) + "=" + encodeURIComponent(val);
// 		}
// 	}).join("&");
// 	// console.log('imploded qs:',  ret.length ? '?'+ret : '');
// 	return ret.length ? '?'+ret : '';
// }
