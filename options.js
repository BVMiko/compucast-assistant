var background = chrome.extension.getBackgroundPage();

document.querySelector('fieldset#domains ul').addEventListener('click', function(e) {
	var target = e.target.closest('button');
	if (target) {
		e.preventDefault();
		var li = e.target.closest('li');
		var input = li.querySelector('input');
		if (input.id == "domain_new") {
			checkCMS(input.value);
		} else {

		}
		debugger;
	}

}, true);

function checkCMS(domain) {
	parser = document.createElement('a');
	parser.href = (domain.indexOf('://') == -1) ? "http://" + domain : domain;
	parser.pathname = "/admin/assistant.php";
	if (parser.protocol != "http:" && parser.protocol != "https:") {
		return foundCMS("bad protocol");
	}

	var xhr = new XMLHttpRequest();
	xhr.open('GET', parser.href, true);
	xhr.addEventListener('load', foundCMS);
	xhr.addEventListener('error', foundCMS);
	xhr.send();
}

function foundCMS(e) {
	try {
		if (!e.target) throw new Error(e);
		if (e.target.status != 200) throw new Error("bad response code");
		resp = JSON.parse(e.target.responseText);
	} catch (e) {

	}
	console.log(resp);
}