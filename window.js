;(function(){

	var dragOffset = {
		x : 0,
		y : 0
	};

	this.WindowJS = function(){
		this._options = null;
		this._window = null;
		this._title = null;
		this._titleBar = null;
		this._content = null;
		this._overlay = null;
		this._closeButton = null;
		this._maximizeMinimizeButton = null;
		this._reduceEnlargeButton = null;
		
		this._wDefaultWidth = null;
		this._wDefaultHeight = null;
		this._wDefaultTop = null;
		this._wDefaultLeft = null;
		
		this._wCurrentWidth = null;
		this._wCurrentHeight = null;
		this._wCurrentTop = null;
		this._wCurrentLeft = null;
		this._wCurrentRight = null;
		this._wCurrentBottom = null;
		
		this._contentPaddingTop = null;
		this._contentPaddingBottom = null;
		this._contentPaddingLeft = null;
		this._contentPaddingRight = null;
		
		this._fullscreen = false;
		this._reduced = false;
		
		this._titleHeight = null;
		this._contentDefaultHeight = null;
		this._contentCurrentHeight = null;
		
		this._instanceId;
		
		var defaults = {
			width: 700,
			height: 500,
			title: 'Title Here !',
			modal: false,
			draggable: false,
			controls: true,
			overlayColor: '#ffffff', /* #3fd or #33ffdd */
			overlayOpacity: 90,
			content: 'Content of window Here !',
			ajaxContent: false,
			ajax: {
				url : '',
				method : 'get'
			},
			onClose: null
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

	    /*
	     * Increment "instances" attribute to count number of WindowJS instances 
	     * (instances attribute is decremented on close function of WindowJS)
	     */
		WindowJS.prototype.instances = WindowJS.prototype.instances ? WindowJS.prototype.instances + 1 : 1;

		this._instanceId = WindowJS.prototype.instances;

		/*
		 * Sotre All instances in an array
		 */
		WindowJS.allInstances.push(this);
		
		
		buildWindow.call(this);
		initEvents.call(this);
		if(this._options.draggable)
		{
			draggable.call(this);
		}
	}

	WindowJS.allInstances = [];
	
	/**
	 * Public Methods
	 */
	/*WindowJS.prototype.open = function(){
		buildWindow.call(this);
		initEvents.call(this);
		if(this._options.draggable)
		{
			draggable.call(this);
		}
	}*/
	WindowJS.prototype.close = function(){
		this._window.parentNode.removeChild(this._window);

		if(this._options.modal)
		{
			this._overlay.parentNode.removeChild(this._overlay);
		}
		
		/* Decrement "instances" attribut */
		WindowJS.prototype.instances--;

		/* Remove instance from allInstances array */
		var listToDelete = [this._instanceId];
		var newArray = WindowJS.allInstances.filter(function(obj) {
			return listToDelete.indexOf(obj._instanceId) === -1;
		});

		WindowJS.allInstances = newArray;

		if(this._options.onClose !== null && typeof this._options.onClose === 'function')
		{
			this._options.onClose();
		}
	}
	WindowJS.prototype.maximizeMinimize = function(){
		var contentStyle, ccPaddingTop, ccPaddingBottom, windowStyle, borderWidth, borderHeight, windowHeight;
		
		if(this._fullscreen)
		{
			this._fullscreen = false;
			
			this._window.style.width = this._wDefaultWidth + 'px';
			this._window.style.height = this._wDefaultHeight + 'px';
			this._window.style.top = this._wDefaultTop + 'px';
			this._window.style.left = this._wDefaultLeft + 'px';
			this._window.style.right = '';
			this._window.style.bottom = '';
			
			this._content.style.paddingTop = this._contentPaddingBottom + 'px';
			this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
			this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
			this._content.style.paddingRight = this._contentPaddingRight + 'px';
			
			if(this._options.draggable)
			{
				draggable.call(this);
				removeTitleClick.call(this);
			}			
			
			this._maximizeMinimizeButton.className = 'fa fa-expand blue';
		}
		else
		{
			this._fullscreen = true;
			
			this._window.style.width = 'auto';
			this._window.style.height = 'auto';
			this._window.style.top = '2px';
			this._window.style.left = '2px';
			this._window.style.right = '2px';
			this._window.style.bottom = '2px';
			
			this._content.style.paddingTop = this._contentPaddingBottom + 'px';
			this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
			this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
			this._content.style.paddingRight = this._contentPaddingRight + 'px';
			
			if(this._options.draggable)
			{
				removeDraggable.call(this);
				this._titleBar.onclick = addTitleClick.bind(this);
			}
			
			this._maximizeMinimizeButton.className = 'fa fa-compress blue';
		}
		
		contentStyle =  this._content.currentStyle || window.getComputedStyle(this._content);
		ccPaddingTop = contentStyle.paddingTop.substr(0, contentStyle.paddingTop.length - 2);
		ccPaddingBottom = contentStyle.paddingBottom.substr(0, contentStyle.paddingBottom.length - 2);
		
		windowStyle = this._window.currentStyle || window.getComputedStyle(this._window);
		borderWidth = parseInt(windowStyle.borderLeftWidth.substr(0, windowStyle.borderLeftWidth.length - 2)) + parseInt(windowStyle.borderRightWidth.substr(0, windowStyle.borderRightWidth.length - 2));
		borderHeight = parseInt(windowStyle.borderTopWidth.substr(0, windowStyle.borderTopWidth.length - 2)) + parseInt(windowStyle.borderBottomWidth.substr(0, windowStyle.borderBottomWidth.length - 2));
		windowHeight = parseInt(windowStyle.height.substr(0, windowStyle.height.length - 2));
		
		/* Current window size */
		this._wCurrentWidth = parseInt(windowStyle.width.substr(0, windowStyle.width.length - 2));
		this._wCurrentHeight = parseInt(windowStyle.height.substr(0, windowStyle.height.length - 2));
		this._wCurrentTop = parseInt(windowStyle.top.substr(0, windowStyle.top.length - 2));
		this._wCurrentLeft = parseInt(windowStyle.left.substr(0, windowStyle.left.length - 2));
		this._wCurrentRight = parseInt(windowStyle.right.substr(0, windowStyle.right.length - 2));
		this._wCurrentBottom = parseInt(windowStyle.bottom.substr(0, windowStyle.bottom.length - 2));
		
		this._content.style.maxHeight = windowHeight - this._titleHeight - ccPaddingTop - ccPaddingBottom + 'px';
		
		/* Current content size */
		this._contentCurrentHeight = parseInt(contentStyle.maxHeight.substr(0, contentStyle.maxHeight.length - 2));
		
		/* Reset reduce values */
		this._reduced = false;
		this._reduceEnlargeButton.className = 'fa fa-angle-up orange';
	}
	WindowJS.prototype.reduceEnlarge = function(){
		if(this._reduced)
		{
			this._reduced = false;
			
			if(this._fullscreen)
			{
				this._content.style.maxHeight = this._contentCurrentHeight + 'px';
				this._window.style.bottom = '2px';
				this._content.style.paddingTop = this._contentPaddingBottom + 'px';
				this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
				this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
				this._content.style.paddingRight = this._contentPaddingRight + 'px';
				this._window.style.height = this._wCurrentHeight + 'px';
			}
			else
			{
				this._content.style.maxHeight = this._contentDefaultHeight + 'px';
				this._content.style.paddingTop = this._contentPaddingBottom + 'px';
				this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
				this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
				this._content.style.paddingRight = this._contentPaddingRight + 'px';
				this._window.style.height = this._wDefaultHeight + 'px';
			}			
			
			this._reduceEnlargeButton.className = 'fa fa-angle-up orange';
		}
		else
		{
			this._reduced = true;
			
			if(this._fullscreen)
			{
				this._content.style.maxHeight = '0px';
				this._window.style.bottom = '';
				this._content.style.paddingTop = '0px';
				this._content.style.paddingBottom = '0px';
				this._content.style.paddingLeft = '0px';
				this._content.style.paddingRight = '0px';
				this._window.style.height = '';
			}
			else
			{
				this._content.style.maxHeight = '0px';
				this._content.style.paddingTop = '0px';
				this._content.style.paddingBottom = '0px';
				this._content.style.paddingLeft = '0px';
				this._content.style.paddingRight = '0px';
				this._window.style.height = '';
			}
			
			this._reduceEnlargeButton.className = 'fa fa-angle-down orange';
		}
	}
	
	/**
	 * Private Methods
	 */
	function addTitleClick()
	{
		var _this = this;

		/* Place the current window in the foregroud */
	    WindowJS.allInstances.forEach(function(elem){
	    	elem._window.style.zIndex = 9999 - elem._instanceId;
	    });
	    _this._window.style.zIndex = 9999 + _this._instanceId;
	}

	function removeTitleClick()
	{
		this._titleBar.onclick = null;
	}
	
	function removeDraggable()
	{
		var _this = this;
		
		document.onmousemove = null;
		_this._title.onmousedown = null;
		_this._title.onmouseup = null;
		
		_this._title.style.cursor = 'default';
	}
	
	function draggable()
	{
		var _this = this;


		this._title.style.cursor = 'move';

		this._title.onmousedown = mouseDown.bind(_this);
		this._title.onmouseup = mouseUp.bind(_this);
	}

	function mouseDown(e)
	{
		var _this = this;

	    document.onmousemove = mouseMove.bind(_this);

	    e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	    e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	    dragOffset.x = e.pageX - _this._window.offsetLeft;
	    dragOffset.y = e.pageY - _this._window.offsetTop;

	    /* Place the current window in the foregroud */
	    WindowJS.allInstances.forEach(function(elem){
	    	elem._window.style.zIndex = 9999 - elem._instanceId;
	    });
	    _this._window.style.zIndex = 9999 + _this._instanceId;
	}

	function mouseUp()
	{
		var _this = this;

	    document.onmousemove = null;

	    /* Reset the window opacity when moving is stopped */
		_this._window.style.opacity = '1';
	}

	function mouseMove(e)
	{
		var _this = this;

		/* Reduce the window opacity during moving */
		_this._window.style.opacity = '0.75';

	    e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	    e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	    
	    var offsetX, offsetY;

	    // left/right constraints
	    if (e.pageX - dragOffset.x < window.pageXOffset)
	    {
	        offsetX = window.pageXOffset;
	    }
	    else if (e.pageX - dragOffset.x + _this._window.offsetWidth > window.innerWidth)
	    {
	        offsetX = window.innerWidth - _this._window.offsetWidth;
	    }
	    else
	    {
	        offsetX = e.pageX - dragOffset.x;
	    }
	     
	    // top/bottom constraints
	    if (e.pageY - dragOffset.y < window.pageYOffset)
	    {
	        offsetY = window.pageYOffset;
	    }
	    else if (e.pageY - dragOffset.y + _this._window.offsetHeight > window.innerHeight)
	    {
	        offsetY = window.innerHeight - _this._window.offsetHeight;
	    }
	    else
	    {
	        offsetY = e.pageY - dragOffset.y;
	    }  


	    _this._window.style.top = offsetY + 'px';
	    _this._window.style.left = offsetX + 'px';
		
		/* Save the window new position */
		this._wDefaultLeft = offsetX;
		this._wDefaultTop = offsetY;
	}

	function buildWindow()
	{
		var _this = this;
		
		var controlsContainer, docFrag;
		
		docFrag = document.createDocumentFragment();
		
		this._window = document.createElement('div');
		this._titleBar = document.createElement('div');
		
		this._closeButton = document.createElement('i');
		this._maximizeMinimizeButton = document.createElement('i');
		this._reduceEnlargeButton = document.createElement('i');
		
		this._title = document.createElement('span');
		
		controlsContainer = document.createElement('div');
		this._content = document.createElement('div');
		
		/* Controls Container */
		this._content.className = 'w-content';
		
		/* Controls Buttons */
		this._closeButton.className = 'fa fa-close red';
		this._maximizeMinimizeButton.className = 'fa fa-expand blue';
		this._reduceEnlargeButton.className = 'fa fa-angle-up orange';
		
		if(this._options.modal)
		{
			this._maximizeMinimizeButton.style.display = 'none';
			this._reduceEnlargeButton.style.display = 'none';
		}
		
		controlsContainer.className = 'w-controls';
		
		controlsContainer.appendChild(this._closeButton);
		controlsContainer.appendChild(this._maximizeMinimizeButton);
		controlsContainer.appendChild(this._reduceEnlargeButton);
		
		/* Window Title */
		this._titleBar.className = 'w-title';
		
		this._title.innerText = this._options.title;
	
		this._titleBar.appendChild(this._title);
		this._titleBar.appendChild(controlsContainer);
		
		/* Window */
		this._window.className = 'window';
				
		/* Window Content Container */
		this._content.className = 'w-content';
		
		
		
		this._window.appendChild(this._titleBar);
		this._window.appendChild(this._content);
		
		/* If is a modal window */
		if(this._options.modal)
		{
			/* Window Overlay */
			this._overlay = document.createElement('div');
			this._overlay.className = 'w-overlay';

			/* Window Overlay Style */
			this._overlay.style.backgroundColor = this._options.overlayColor
			this._overlay.style.opacity = cssOpacity(this._options.overlayOpacity);
			/* Place the overlay in the foreground (just behind the window) */
			this._overlay.style.zIndex = this.instances + 9998;

			/* Document fragement */
			docFrag.appendChild(this._overlay);
		}

		/* Document fragement */
		docFrag.appendChild(this._window);
		
		/* Append document fragment to DOM */
		document.body.appendChild(docFrag);
		
		/* Window Style */
		var windowStyle = this._window.currentStyle || window.getComputedStyle(this._window);
		var borderWidth = parseInt(windowStyle.borderLeftWidth.substr(0, windowStyle.borderLeftWidth.length - 2)) + parseInt(windowStyle.borderRightWidth.substr(0, windowStyle.borderRightWidth.length - 2));
		var borderHeight = parseInt(windowStyle.borderTopWidth.substr(0, windowStyle.borderTopWidth.length - 2)) + parseInt(windowStyle.borderBottomWidth.substr(0, windowStyle.borderBottomWidth.length - 2));
		
		this._window.style.width = this._options.width - borderWidth + 'px';
		this._window.style.height = this._options.height - borderWidth + 'px';
		this._window.style.left = window.innerWidth / 2 - this._window.offsetWidth / 2 + 'px';
		this._window.style.top = window.innerHeight / 2 - this._window.offsetHeight / 2 + 'px';
		/* Place the window in the foreground */
	    this._window.style.zIndex = this.instances + 9999;
		
		/* Save the window default values */
		this._wDefaultWidth = this._options.width - borderWidth;
		this._wDefaultHeight = this._options.height - borderWidth;
		this._wDefaultLeft = window.innerWidth / 2 - this._window.offsetWidth / 2;
		this._wDefaultTop = window.innerHeight / 2 - this._window.offsetHeight / 2;
		
		/* Title Style */
		var titleStyle = this._title.currentStyle || window.getComputedStyle(this._title);
		var paddingLeft = titleStyle.paddingLeft.substr(0, titleStyle.paddingLeft.length - 2);
		this._title.style.width = this._options.width - paddingLeft - borderWidth - controlsContainer.clientWidth + 'px';
		
		var titleBarStyle = this._titleBar.currentStyle || window.getComputedStyle(this._titleBar);
		var titleBorderWidth = parseInt(titleBarStyle.borderBottomWidth.substr(0, titleBarStyle.borderBottomWidth.length - 2));
		this._titleHeight = this._title.offsetHeight + titleBorderWidth;

		/* Content style */
		var contentContainerStyle =  this._content.currentStyle || window.getComputedStyle(this._content);		
		this._contentPaddingTop = contentContainerStyle.paddingTop.substr(0, contentContainerStyle.paddingTop.length - 2);
		this._contentPaddingBottom = contentContainerStyle.paddingBottom.substr(0, contentContainerStyle.paddingBottom.length - 2);
		this._contentPaddingLeft = contentContainerStyle.paddingLeft.substr(0, contentContainerStyle.paddingLeft.length - 2);
		this._contentPaddingRight = contentContainerStyle.paddingRight.substr(0, contentContainerStyle.paddingRight.length - 2);
		
		this._content.style.maxHeight = this._wDefaultHeight - this._contentPaddingTop - this._contentPaddingBottom - (this._title.offsetHeight + titleBorderWidth) + 'px';
		this._contentDefaultHeight = this._wDefaultHeight - this._contentPaddingTop - this._contentPaddingBottom - (this._title.offsetHeight + titleBorderWidth);
		
		/* Add ajax content */
		if(this._options.ajaxContent)
		{
			if(this._options.ajax.url != '')
			{
				var loader = document.createElement('div');
				var imgLoader = document.createElement('img');
				
				/* Loader image attributes */
				imgLoader.setAttribute('src', './images/w-loader.gif');
				imgLoader.setAttribute('alt', 'loader');
				
				/* Loader attributes */
				loader.setAttribute('class', 'loader');
				
				/* Append img to loader */
				loader.appendChild(imgLoader);
				
				/* Loader style */
				loader.style.top = this._title.offsetHeight + titleBorderWidth + 'px';
				
				/* Append loader element to content container element */
				this._content.appendChild(loader);
				
				if(this._options.ajax.method == 'get')
				{
					var request = new XMLHttpRequest();
					request.open('GET', this._options.ajax.url, true);

					request.onload = function (e) {
						if (request.readyState === 4) {
							// Check if the get was successful.
							if (request.status === 200) {
								
								var wrapper = document.createElement('div');
								wrapper.style.paddingBottom = _this._contentPaddingBottom + 'px';
								wrapper.innerHTML = request.responseText
								_this._content.appendChild(wrapper);
								
								[].forEach.call(_this._content.querySelectorAll('script'), function(v,i,a) {
									eval(v.innerText);
								});
							} else {
								_this._content.innerHTML = request.statusText;
							}
							
							_this._content.removeChild(loader);
						}
					};
					// Catch errors:
					request.onerror = function (e) {
						console.error(request.statusText);
					};
					
					request.send(null);
					
				}
				else if(this._options.ajax.method == 'post') /* NEXT STEP ;) */
				{
					
				}
				else
				{
					
				}
			}
		}
		else
		{
			this._content.innerHTML = this._options.content;		
		}
		
	}
	
	function initEvents()
	{
		if(this._closeButton)
		{
			this._closeButton.addEventListener('click', this.close.bind(this));
		}
		
		if(this._maximizeMinimizeButton)
		{
			this._maximizeMinimizeButton.addEventListener('click', this.maximizeMinimize.bind(this));
		}
		
		if(this._reduceEnlargeButton)
		{
			this._reduceEnlargeButton.addEventListener('click', this.reduceEnlarge.bind(this));
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