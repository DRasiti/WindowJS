
;(function(){
	
	this.WindowJS = function(){
		this._options = null;
		this._window = null;
		this._title = null;
		this._overlay = null;
		this._closeButton = null;
		this._maximizeButton = null;
		this._minimizeButton = null;
		
		var defaults = {
			width: 700,
			height: 500,
			title: 'Title Here !',
			modal: false,
			controls: true,
			overlayColor: '#ffffff', /* #3fd or #33ffdd */
			overlayOpacity: 90,
			content: 'Content of window Here !',
			ajaxContent: false,
			ajax: {
				url : '',
				method : 'get'
			}
		};
		
		/* Create options by extending defaults with the passed in arugments */
	    if (arguments[0] && typeof arguments[0] === "object")
	    {
			this._options = extendDefaults(defaults, arguments[0]);
	    }
	    else
	    {
	    	this._options = defaults;
	    }
	}
	
	/**
	 * Public Methods
	 */
	WindowJS.prototype.open = function(){
		buildWindow.call(this);
		initEvents.call(this);
	}
	WindowJS.prototype.close = function(){
		this._window.parentNode.removeChild(this._window);
		this._overlay.parentNode.removeChild(this._overlay);
	}
	
	/**
	 * Private Methods
	 */
	function buildWindow()
	{
		var titleBar, controlsContainer, content, contentContainer, docFrag;
		
		docFrag = document.createDocumentFragment();
		
		this._window = document.createElement('div');
		this._overlay = document.createElement('div');
		titleBar = document.createElement('div');
		
		this._closeButton = document.createElement('i');
		this._maximizeButton = document.createElement('i');
		this._minimizeButton = document.createElement('i');
		
		this._title = document.createElement('span');
		
		controlsContainer = document.createElement('div');
		contentContainer = document.createElement('div');
		
		/* Controls Container */
		contentContainer.className = 'w-content';
		
		/* Controls Buttons */
		this._closeButton.className = 'fa fa-close red';
		this._maximizeButton.className = 'fa fa-external-link blue';
		this._minimizeButton.className = 'fa fa-angle-down orange';
		
		controlsContainer.className = 'w-controls';
		controlsContainer.appendChild(this._closeButton);
		controlsContainer.appendChild(this._maximizeButton);
		controlsContainer.appendChild(this._minimizeButton);
		
		/* Window Title */
		titleBar.className = 'w-title';
		
		this._title.innerText = this._options.title;
	
		titleBar.appendChild(this._title);
		titleBar.appendChild(controlsContainer);
		
		/* Window */
		this._window.className = 'window';
		
		/* Window Overlay */
		this._overlay.className = 'w-overlay';
		this._overlay.style.backgroundColor = this._options.overlayColor
		this._overlay.style.opacity = cssOpacity(this._options.overlayOpacity);
		
		/* Window Content Container */
		contentContainer.className = 'w-content';
		
		if(this._options.ajaxContent)
		{
			if(this._options.ajax.url != '')
			{
				if(this._options.ajax.method == 'get')
				{
					var request = new XMLHttpRequest();
					request.open('GET', this._options.ajax.url, true);

					request.onload = function (e) {
						if (request.readyState === 4) {
							// Check if the get was successful.
							if (request.status === 200) {
								contentContainer.innerHTML = request.responseText;	
							} else {
								console.error(request.statusText);
								contentContainer.innerHTML = request.statusText;	
							}
						}
					};
					// Catch errors:
					request.onerror = function (e) {
						console.error(request.statusText);
					};
					
					request.send(null);
					
					/*
					$.ajax({
						url: this._options.ajax.url,
						cache: false,
						dataType : 'html',
						success : function(code_html, statut){
							console.log(code_html);
							contentContainer.innerHTML = code_html;
						},
						error : function(resultat, statut, erreur){
							console.log(resultat);
						}
					});
					*/
					
				}
				else if(this._options.ajax.method == 'post')
				{
					
				}
				else
				{
					
				}
			}
		}
		else
		{
			contentContainer.innerHTML = this._options.content;		
		}
		
		this._window.appendChild(titleBar);
		this._window.appendChild(contentContainer);
		
		/* Document fragement */
		docFrag.appendChild(this._overlay);
		docFrag.appendChild(this._window);
		
		/* Append document fragment to DOM */
		document.body.appendChild(docFrag);
		
		
		/* Window Style */
		var windowStyle = this._window.currentStyle || window.getComputedStyle(this._window);
		var borderWidth = parseInt(windowStyle.borderTopWidth.substr(0, windowStyle.borderTopWidth.length - 2));
		
		this._window.style.width = this._options.width - (borderWidth * 2) + 'px';
		this._window.style.height = this._options.height - (borderWidth * 2) + 'px';
		
		/* Title Style */
		var titleStyle = this._title.currentStyle || window.getComputedStyle(this._title);
		var paddingLeft = titleStyle.paddingLeft.substr(0, titleStyle.paddingLeft.length - 2)
		
		this._title.style.width = this._options.width - paddingLeft - (borderWidth * 2) - controlsContainer.clientWidth + 'px';
	}
	
	function initEvents()
	{
		if(this._closeButton)
		{
			this._closeButton.addEventListener('click', this.close.bind(this));
		}
		
		if(this._overlay)
		{
			this._overlay.addEventListener('click', this.close.bind(this));
		}
	}
	
	/* Utility method to extend defaults with user options */
	function extendDefaults(source, properties)
	{
		var property;
	    for (property in properties)
	    {
	    	if (source.hasOwnProperty(property))
	    	{
	        	source[property] = properties[property];
	    	}
		}
	    return source;
	}

	/* 53, 121, 127 -> #35797F */
	function rgbToHex(r, g, b)
	{
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	/* #35797F -> 53, 121, 127 */
	function hexToRgb(hex)
	{
		/* Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF") */
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			rgb: parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16)
		} : null;
	}

	/* 75.58654 -> 0.76 */
	function cssOpacity(opacity)
	{
		return parseFloat(opacity) >= 0 && parseFloat(opacity) <= 100 ? Math.round((opacity/100) * 100) / 100 : 1;
	}
})();