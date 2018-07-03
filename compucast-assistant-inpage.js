// console.log('inside inpage.js');

function pointerevents_none() {
	this.classList.add('stay-open');
	this.style.pointerEvents = "none";
}

function shownote(el, text, backgroundColor) {
	rect = el.getBoundingClientRect();
	var box = document.createElement('div');
	box.className = "note-box";
	box.style.top = (rect.top + window.scrollY - 4) + "px";
	box.style.left = (rect.left + window.scrollX - 4) + "px";
	box.style.width = (rect.width + 8) + "px";
	box.style.height = (rect.height + 8) + "px";
	box.style.borderColor = backgroundColor;
	var span = document.createElement('span');
	span.style.backgroundColor = backgroundColor;
	span.innerText = text;
	box.appendChild(span);
	box.addEventListener("click", pointerevents_none);
	document.body.appendChild(box);
	return box;
}

allanchors = document.querySelectorAll('a');
anchornotes = [];
allanchors.forEach(function(el) {
	var note = [];
	var notecolor = null;

	if (gaobj = el.closest('[data-ga-id]')) {
		note.push('ID: ' + gaobj.getAttribute('data-ga-id'));
		notecolor = 'green';
		// ecdata = this.buildECData(gaobj, !samedomain);
		// ga.trackers.promo('interaction', [ecdata]);
	}


	if (el.hostname != document.location.hostname && el.target != '_blank') {
		el.style.display = "inline-block";
		el.style.animation = "spin 2s linear 1"; // make em spin
		note.push('Missing target');
		notecolor = 'orange';
	}



	if (note.length) {
		shownote(el, note.join('\n'), notecolor);
	}
});



(function() {
	var throttle = function(type, name, obj) {
		obj = obj || window;
		var running = false;
		var func = function() {
			if (running) { return; }
			running = true;
			 requestAnimationFrame(function() {
				obj.dispatchEvent(new CustomEvent(name));
				running = false;
			});
		};
		obj.addEventListener(type, func);
	};

	/* init - you can init any event */
	throttle("resize", "optimizedResize");
})();

// handle event
window.addEventListener("optimizedResize", function() {
	console.log("Resource conscious resize callback!");
});





x={color:"#B00", text:"3"};
x
