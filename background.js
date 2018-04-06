function explodeQueryString(qs) {
	var ret = [];
	if (qs != "") {
		var vars = qs.substring(1).split("&");
		for (var i = 0; i < vars.length; i++) {
			var [key, val] = vars[i].split('=', 2);
			key = decodeURIComponent(key);
			val = val === undefined ? undefined : decodeURIComponent(val);
			if (key.substr(-2) == "[]") {
				key = key.substr(0, key.length - 2);
				if (!Array.isArray(ret[key])) ret[key] = [];
				ret[key].push(val);
			} else {
				ret[key] = val;
			}
		}
	}
	// console.log('original qs:',  qs);
	// console.log('exploded qs:',  ret);
	return ret;
}

function implodeQueryString(bits) {
	var ret = Object.entries(bits).map(function(pair) {
		const [key, val] = pair;
		if (Array.isArray(val)) {
			var subret = [];
			val.forEach(function (subval) { subret.push(encodeURIComponent(key + "[]") + "=" + encodeURIComponent(subval)); });
			return subret.join("&");
		} else if (val === undefined) {
			return encodeURIComponent(key);
		} else {
			return encodeURIComponent(key) + "=" + encodeURIComponent(val);
		}
	}).join("&");
	// console.log('imploded qs:',  ret.length ? '?'+ret : '');
	return ret.length ? '?'+ret : '';
}

var domainMods = [];
chrome.storage.local.get(["domainMods"], function(items){
	if ("domainMods" in items) {
		domainMods = items["domainMods"];
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var parser = document.createElement("a");
	parser.href = details.url;

	// Special stuff for Google Analytics
	if (["www.google-analytics.com", "ssl.google-analytics.com", "stats.g.doubleclick.net", "www.google-analytics.com"].includes(parser.hostname)) {
		var initparser = document.createElement("a");
		initparser.href = details.initiator;
		currMods = domainMods[initparser.hostname];
		if ("ga_debug" in currMods && currMods["ga_debug"] != undefined) {
			var newpathname = parser.pathname;
			if (parser.hostname == "www.google-analytics.com" && parser.pathname == "/ga.js") {
				newpathname = "/u/ga_debug.js";
			} else if (parser.hostname == "ssl.google-analytics.com" && parser.pathname == "/ga.js") {
				newpathname = "/u/ga_debug.js";
			} else if (parser.hostname == "stats.g.doubleclick.net" && parser.pathname == "/dc.js") {
				newpathname = "/dc_debug.js";
			} else if (parser.hostname == "www.google-analytics.com" && parser.pathname == "/analytics.js") {
				newpathname = "/analytics_debug.js";
			}
			if (newpathname != parser.pathname) {
				parser.pathname = newpathname;
				return { redirectUrl: parser.href };
			}
		}
	}

	if (parser.hostname in domainMods) {
		currMods = domainMods[parser.hostname];
		var exploded = explodeQueryString(parser.search);
		if ("ModPagespeed" in currMods && currMods["ModPagespeed"] != undefined) {
			exploded["ModPagespeed"] = currMods["ModPagespeed"];
		}
		if ("admin" in currMods && currMods["admin"] != undefined) {
			exploded["admin"] = undefined;
		}
		if ("debug" in currMods && currMods["debug"] != undefined) {
			exploded["debug"] = undefined;
		}
		var imploded = implodeQueryString(exploded);
		if (parser.search != imploded) {
			parser.search = imploded;
			return { redirectUrl: parser.href };
		}
	}
}, {urls: ["<all_urls>"]}, ["blocking"]);

chrome.permissions.getAll(function(perm) {
	// console.log(perm);
});

function updateDomainMods(hostname, mod, value) {
	if (mod === undefined) {
		delete domainMods[hostname];
	} else if (!(hostname in domainMods)) {
		domainMods[hostname] = {};
		domainMods[hostname][mod] = value;
	} else {
		domainMods[hostname][mod] = value;
	}
	chrome.storage.local.set({ "domainMods": domainMods });
}

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install") {
		console.log("This is a first install!");
	} else if(details.reason == "update") {
		var thisVersion = chrome.runtime.getManifest().version;
		console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
	}
});
