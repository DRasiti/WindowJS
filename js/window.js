;(function(){
	
	this.WindowJS = function(){
		
		this._options = null;
		this._window = null;
		this._title = null;
		this._titleBar = null;
		this._content = null;
		this._overlay = null;
		this._controlsContainer = null;
		this._closeButton = null;
		this._maximizeMinimizeButton = null;
		this._showHideContentButton = null;
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
		
		this._contentDefaultPaddingTop = null;
		this._contentDefaultPaddingBottom = null;
		this._contentDefaultPaddingLeft = null;
		this._contentDefaultPaddingRight = null;
		
		this._fullscreen = false;
		this._hidden = false;
		this._reduced = false;
		
		this._windowBorderWidth = null;
		this._windowBorderHeight = null;

		this._titleHeight = null;
		this._titleInnerHeight = null;
		
		this._titleBorderWidth = null;

		this._contentDefaultHeight = null;
		this._contentCurrentHeight = null;
		
		this._dragOffset = {
			startX : 0,
			startY : 0,
			endX : 0,
			endY : 0
		};
		
		this._defaultResizable = null;
		this._resizeN = null;
		this._resizeE = null;
		this._resizeS = null;
		this._resizeW = null;
		this._resizeNE = null;
		this._resizeSE = null;
		this._resizeSW = null;
		this._resizeNW = null;
		this._movements = {
			x : 0,
			y : 0
		};
		this._windowStartWidth = null;
		this._windowStartHeight = null;
		this._windowStartTop = null;
		this._windowStartLeft = null;
		
		this._instanceId;
		
		var defaults = {
			width: 700,
			height: 550,
			minWidth: 225,
			minHeight: 100,
			title: 'Title Here !',
			modal: false,
			draggable: true,
			onDragOpacity: 85,
			resizable: true,
			controls: true,
			reducedWidth: 250,
			maximized: false,
			overlayColor: '#ffffff', /* #3fd or #33ffdd */
			overlayOpacity: 90,
			contentPadding: true,
			content: 'Content of window Here !',
			ajaxContent: null, /* { url: '', method: 'get' } */
			iframe: null,
			loaderImg: '../images/w-loader.gif',
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

		if(WindowJS.prototype.reducedWindowsContainer)
		{
			WindowJS.prototype.reducedWindowsContainer = WindowJS.prototype.reducedWindowsContainer;
		}
		else
		{
			var reducedWindowsContainer = document.createElement('div');
			reducedWindowsContainer.className = 'w-reduced-container';
			WindowJS.prototype.reducedWindowsContainer = reducedWindowsContainer;
			document.body.appendChild(WindowJS.prototype.reducedWindowsContainer);
		}

		this._instanceId = WindowJS.prototype.instances;

		/*
		 * Sotre All instances in an array
		 */
		WindowJS.allInstances.push(this);
		
		this._defaultResizable = this._options.resizable;
		
		if(!this._options.contentPadding)
		{
			this._contentDefaultPaddingTop = 0;
			this._contentDefaultPaddingBottom = 0;
			this._contentDefaultPaddingLeft = 0;
			this._contentDefaultPaddingRight = 0;
		}
		
		buildWindow.call(this);
		initEvents.call(this);

		if(this._options.draggable)
		{
			draggable.call(this);
		}
		
		if(this._options.width < this._options.minWidth)
		{
			this._options.width = this._options.minWidth;
		}
		if(this._options.height < this._options.minHeight)
		{
			this._options.height = this._options.minHeight;
		}
		
		if(this._options.maximized)
		{
			this._fullscreen = false;
			this.maximizeMinimize.call(this);
		}
	}
	
	/* Global attribute to all WIndowJS instances */
	WindowJS.allInstances = [];
	
	/**
	 * Public Methods
	 */
	WindowJS.prototype.close = function(){
		var _this = this;

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

		/* Correct the ids of the rest of instances */
		WindowJS.allInstances.forEach(function(elem){

			if(elem._instanceId > _this._instanceId)
			{
				elem._instanceId = _this._instanceId;
				_this._instanceId = _this._instanceId + 1;
			}
	    	
	    });

		if(this._options.onClose !== null && typeof this._options.onClose === 'function')
		{
			this._options.onClose();
		}

	}
	WindowJS.prototype.maximizeMinimize = function(){
		
		if(this._fullscreen)
		{
			this._fullscreen = false;
			
			this._window.style.width = this._wDefaultWidth + 'px';
			this._window.style.height = this._wDefaultHeight + 'px';
			this._window.style.top = this._wDefaultTop + 'px';
			this._window.style.left = this._wDefaultLeft + 'px';
			this._window.style.right = '';
			this._window.style.bottom = '';
			
			this._content.style.paddingTop = this._contentPaddingTop + 'px';
			this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
			this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
			this._content.style.paddingRight = this._contentPaddingRight + 'px';
			
			if(this._options.draggable)
			{
				draggable.call(this);
			}			
			
			this._maximizeMinimizeButton.className = 'icon-maximize blue';
			
			// Resizable on normal screen
			this._options.resizable = true;
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
			
			this._content.style.paddingTop = this._contentPaddingTop + 'px';
			this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
			this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
			this._content.style.paddingRight = this._contentPaddingRight + 'px';
			
			if(this._options.draggable)
			{
				removeDraggable.call(this);
			}
			
			this._maximizeMinimizeButton.className = 'icon-minimize blue';
			
			// No resize on fullscreen
			this._options.resizable = false;
		}
		
		applyAllWindowElementsStyles.call(this);
		
		/* Reset reduce values */
		this._hidden = false;
		this._showHideContentButton.className = 'icon-hide orange';
		
		// Rezizable window depend of "this._options.resizable" value
		resizableWindow.call(this);
	}
	WindowJS.prototype.showHideContent = function(){
		if(this._hidden)
		{
			this._hidden = false;
			
			if(this._fullscreen)
			{
				this._content.style.maxHeight = this._contentDefaultHeight + 'px';
				this._window.style.bottom = '2px';
				this._content.style.paddingTop = this._contentPaddingTop + 'px';
				this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
				this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
				this._content.style.paddingRight = this._contentPaddingRight + 'px';
				this._window.style.height = this._wCurrentHeight + 'px';
				
				// Resizable when the window is enlarged
				this._options.resizable = false;
			}
			else
			{
				this._content.style.maxHeight = this._contentDefaultHeight + 'px';
				this._content.style.paddingTop = this._contentPaddingTop + 'px';
				this._content.style.paddingBottom = this._contentPaddingBottom + 'px';
				this._content.style.paddingLeft = this._contentPaddingLeft + 'px';
				this._content.style.paddingRight = this._contentPaddingRight + 'px';
				this._window.style.height = this._wDefaultHeight + 'px';
				
				// Resizable when the window is enlarged
				this._options.resizable = true;
			}			
			
			this._showHideContentButton.className = 'icon-hide orange';
		}
		else
		{
			this._hidden = true;
			
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
			
			this._showHideContentButton.className = 'icon-show orange';
			
			// No resize when the window is reduced
			this._options.resizable = false;
		}
		
		applyAllWindowElementsStyles.call(this);
		
		resizableWindow.call(this);
	}
	WindowJS.prototype.reduceEnlarge = function()
	{
		if(this._reduced)
		{
			this._reduced = false;

			this._window.style.width = this._wDefaultWidth + 'px';
			this._window.style.height = this._wDefaultHeight + 'px';
			this._window.style.top = this._wDefaultTop + 'px';
			this._window.style.left = this._wDefaultLeft + 'px';
			this._window.style.position = '';
			this._window.style.overflow = '';
			this._window.style.display = '';
			this._window.style.marginLeft = '';
			this._window.style.right = '';
			this._window.style.bottom = '';
			
			if(this._options.draggable)
			{
				draggable.call(this);
			}
			
			document.body.appendChild(this._window);
			this._options.resizable = true;
			
			this._reduceEnlargeButton.className = 'icon-reduce orange';
		}
		else
		{
			this._reduced = true;
			
			this._window.style.width = parseInt(this._options.reducedWidth) + 'px';
			this._window.style.height = this._titleInnerHeight + 'px';
			this._window.style.top = 'auto';
			this._window.style.left = 'auto';
			this._window.style.position = 'relative';
			this._window.style.overflow = 'hidden';
			this._window.style.display = 'inline-block';
			this._window.style.marginLeft = '5px';
			
			if(this._options.draggable)
			{
				removeDraggable.call(this);
			}
						
			WindowJS.prototype.reducedWindowsContainer.appendChild(this._window);
			this._options.resizable = false;
			
			this._reduceEnlargeButton.className = 'icon-enlarge green';
		}

		applyAllWindowElementsStyles.call(this);
		
		showWindowInInitialStatus.call(this);
		
		resizableWindow.call(this);
		
		showCorrectControls.call(this);
	}

	/**
	 * Private Methods
	 */
	function showCorrectControls()
	{
		if(this._options.modal)
		{
			this._reduceEnlargeButton.style.display = 'none';
		}
		else if(this._reduced)
		{
			this._maximizeMinimizeButton.style.display = 'none';
			this._showHideContentButton.style.display = 'none';
		}
		else
		{
			this._maximizeMinimizeButton.style.display = '';
			this._showHideContentButton.style.display = '';
			this._reduceEnlargeButton.style.display = '';
		}
	}
	
	function showWindowInInitialStatus()
	{
		if(!this._reduced)
		{
			if(this._fullscreen && this._hidden)
			{
				this._hidden = false;
				this._fullscreen = false;
				this.maximizeMinimize.call(this);
				this.showHideContent.call(this);
			}
			else if(this._fullscreen)
			{
				this._fullscreen = false;
				this.maximizeMinimize.call(this);
			}
			else if(this._hidden)
			{
				this._hidden = false;
				this.showHideContent.call(this);
			}
			else
			{
				if(!this._fullscreen)
				{
					this._fullscreen = true;
					this.maximizeMinimize.call(this);
				}
				else if(!this._hidden)
				{
					this._hidden = true;
					this.showHideContent.call(this);
					
				}
			}
		}
	}
	
	function selectWindow(e)
	{
		var _this = this;

		/* Place the current window in the foregroud */
	    WindowJS.allInstances.forEach(function(elem){
	    	elem._window.style.zIndex = 9999 - elem._instanceId;
	    });
	    _this._window.style.zIndex = 9999 + _this._instanceId;
	}

	function unselectWindow()
	{
		this._window.onmousedown = null;
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


		this._title.style.cursor = 'grab';

		this._title.onmousedown = mouseDown.bind(_this);
		this._title.onmouseup = mouseUp.bind(_this);
	}

	function mouseDown(e)
	{
		var _this = this;

	    document.onmousemove = mouseMove.bind(_this);
		this._title.style.cursor = 'grabbing';
	    
	    e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	    e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	    this._dragOffset.x = e.pageX - _this._window.offsetLeft;
	    this._dragOffset.y = e.pageY - _this._window.offsetTop;

	    /* Place the current window in the foregroud */
	    selectWindow.call(this);

	    /*WindowJS.allInstances.forEach(function(elem){
	    	elem._window.style.zIndex = 9999 - elem._instanceId;
	    });
	    _this._window.style.zIndex = 9999 + _this._instanceId;*/
	}

	function mouseUp()
	{
		var _this = this;

	    document.onmousemove = null;
	    this._title.style.cursor = 'grab';

	    /* Reset the window opacity when moving is stopped */
		_this._window.style.opacity = '1';
	}

	function mouseMove(e)
	{
		/* Reduce the window opacity during moving */
		this._window.style.opacity = cssOpacity(this._options.onDragOpacity);

	    e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	    e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	    
	    var offsetX, offsetY;

	    // left/right constraints
	    if (e.pageX - this._dragOffset.x < 0)
	    {
	        offsetX = 0;
	    }
	    else if (e.pageX - this._dragOffset.x + this._window.offsetWidth > window.innerWidth)
	    {
	        offsetX = window.innerWidth - this._window.offsetWidth;
	    }
	    else
	    {
	        offsetX = e.pageX - this._dragOffset.x;
	    }
	     
	    // top/bottom constraints
	    if (e.pageY - this._dragOffset.y < 0)
	    {
	        offsetY = 0;
	    }
	    else if (e.pageY - this._dragOffset.y + this._window.offsetHeight > window.innerHeight)
	    {
	        offsetY = window.innerHeight - this._window.offsetHeight;
	    }
	    else
	    {
	        offsetY = e.pageY - this._dragOffset.y;
	    }  


	    this._window.style.top = offsetY + 'px';
	    this._window.style.left = offsetX + 'px';
		
		/* Save the window new position */
		this._wDefaultLeft = offsetX;
		this._wDefaultTop = offsetY;
	}
	
	
	function initResizeValues(e)
	{
		this._movements.startX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
		this._movements.startY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
		
		var windowStyle = this._window.currentStyle || window.getComputedStyle(this._window);
		this._windowStartWidth = parseInt(windowStyle.width, 10);
		this._windowStartHeight = parseInt(windowStyle.height, 10);
		this._windowStartTop = parseInt(windowStyle.top, 10);
		this._windowStartLeft = parseInt(windowStyle.left, 10);
		
		document.documentElement.onmouseup = resizeMouseUp.bind(this);
	}
	
	function resizeNMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeNMouseMove.bind(this);
	}
	function resizeNMouseMove(e)
	{
		e.pageY = e.pageY || e.clientY;
		var height = (this._windowStartHeight - e.pageY + this._movements.startY);
		
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.height = height + 'px';
		this._window.style.top = (this._windowStartTop + (this._windowStartHeight - height)) + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultHeight = height;
		this._wDefaultTop = (this._windowStartTop + (this._windowStartHeight - height));
	}
	
	function resizeEMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeEMouseMove.bind(this);
	}
	function resizeEMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		var width = (this._windowStartWidth + e.pageX - this._movements.startX);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}
		
		this._window.style.width = width + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
	}
	
	function resizeSMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeSMouseMove.bind(this);
	}
	function resizeSMouseMove(e)
	{
		e.pageY = e.pageY || e.clientY;
		var height = (this._windowStartHeight + e.pageY - this._movements.startY);
		
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.height = height + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultHeight = height;
	}
	
	function resizeWMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeWMouseMove.bind(this);
	}
	function resizeWMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		var width = (this._windowStartWidth - e.pageX + this._movements.startX);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}	
		
		this._window.style.width = width + 'px';
		
		this._window.style.left = (this._windowStartLeft + (this._windowStartWidth - width)) + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
		this._wDefaultLeft = (this._windowStartLeft + (this._windowStartWidth - width));
	}
	
	function resizeNEMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeNEMouseMove.bind(this);
	}
	function resizeNEMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		e.pageY = e.pageY || e.clientY;
		
		var width = (this._windowStartWidth + e.pageX - this._movements.startX);
		var height = (this._windowStartHeight - e.pageY + this._movements.startY);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.width = width + 'px';
		this._window.style.height = height + 'px';
		
		this._window.style.top = (this._windowStartTop + (this._windowStartHeight - height)) + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
		this._wDefaultHeight = height;
		this._wDefaultTop = (this._windowStartTop + (this._windowStartHeight - height));
	}
	
	function resizeNWMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeNWMouseMove.bind(this);
	}
	function resizeNWMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		e.pageY = e.pageY || e.clientY;
		var width = (this._windowStartWidth - e.pageX + this._movements.startX);
		var height = (this._windowStartHeight - e.pageY + this._movements.startY);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.width = width + 'px';
		this._window.style.height = height + 'px';
		
		this._window.style.top = (this._windowStartTop + (this._windowStartHeight - height)) + 'px';
		this._window.style.left = (this._windowStartLeft + (this._windowStartWidth - width)) + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
		this._wDefaultHeight = height;
		this._wDefaultTop = (this._windowStartTop + (this._windowStartHeight - height));
		this._wDefaultLeft = (this._windowStartLeft + (this._windowStartWidth - width));
	}
	
	function resizeSEMouseDown(e)
	{		
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeSEMouseMove.bind(this);
	}
	function resizeSEMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		e.pageY = e.pageY || e.clientY;
		var width = (this._windowStartWidth + e.pageX - this._movements.startX);
		var height = (this._windowStartHeight + e.pageY - this._movements.startY);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.width = width + 'px';
		this._window.style.height = height + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
		this._wDefaultHeight = height;
	}
	
	function resizeSWMouseDown(e)
	{
		initResizeValues.call(this, e);
		
		document.documentElement.onmousemove = resizeSWMouseMove.bind(this);
	}
	function resizeSWMouseMove(e)
	{
		e.pageX = e.pageX || e.clientX;
		e.pageY = e.pageY || e.clientY;
		var width = (this._windowStartWidth - e.pageX + this._movements.startX);
		var height = (this._windowStartHeight + e.pageY - this._movements.startY);
		
		if(width < this._options.minWidth)
		{
			width = this._options.minWidth;
		}
		if(height < this._options.minHeight)
		{
			height = this._options.minHeight;
		}
		
		this._window.style.width = width + 'px';
		this._window.style.height = height + 'px';
		
		this._window.style.left = (this._windowStartLeft + (this._windowStartWidth - width)) + 'px';
		
		applyAllWindowElementsStyles.call(this);
		
		this._wDefaultWidth = width;
		this._wDefaultHeight = height;
		this._wDefaultLeft = (this._windowStartLeft + (this._windowStartWidth - width));
	}
	
	function resizeMouseUp()
	{		
		document.documentElement.onmousemove = null;
		document.documentElement.onmouseup = null;
	}
	
	
	function buildWindow()
	{
		var _this = this;
		
		var docFrag;
		
		docFrag = document.createDocumentFragment();
		
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
		
		/* Assemble the window parts */
		buildWindowControlsPart.call(this);
		buildTitleBarPart.call(this);
		buildWindowContentPart.call(this);
		buildWindowPart.call(this);

		/* Append window to DocumentFragement */
		docFrag.appendChild(this._window);

		/* Append DocumentFragment to DOM (body) */
		document.body.appendChild(docFrag);		
		
		if(this._options.contentPadding)
		{
			var contentContainerStyle =  this._content.currentStyle || window.getComputedStyle(this._content);		
			this._contentDefaultPaddingTop = parseInt(contentContainerStyle.paddingTop, 10);
			this._contentDefaultPaddingBottom = parseInt(contentContainerStyle.paddingBottom, 10);
			this._contentDefaultPaddingLeft = parseInt(contentContainerStyle.paddingLeft, 10);
			this._contentDefaultPaddingRight = parseInt(contentContainerStyle.paddingRight, 10);
		}
		
		/* Apply styles to all window elements and save their default values */
		applyAllWindowStyles.call(this);
		
		
		
		/* Add ajax content */
		if(this._options.ajaxContent !== null && typeof this._options.ajaxContent === 'object')
		{
			if(this._options.ajaxContent.url != '')
			{
				var loader = document.createElement('div');
				var imgLoader = document.createElement('img');
				
				/* Loader image attributes */
				imgLoader.setAttribute('src', (typeof this._options.loaderImg === 'string') ? this._options.loaderImg : '');
				imgLoader.setAttribute('alt', 'loader');
				
				/* Loader attributes */
				loader.setAttribute('class', 'loader');
				
				/* Append img to loader */
				loader.appendChild(imgLoader);
				
				/* Loader style */
				loader.style.top = this._title.offsetHeight + this._titleBorderWidth + 'px';
				
				/* Append loader element to content container element */
				this._content.appendChild(loader);
				
				if(this._options.ajaxContent.method == 'get')
				{
					var request = new XMLHttpRequest();
					request.open('GET', this._options.ajaxContent.url, true);

					request.onload = function (e) {
						if (request.readyState === 4) {
							/* Check if the get was successful. */
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
					/* Catch errors */
					request.onerror = function (e) {
						console.error(request.statusText);
					};
					
					request.send(null);
				}
				else if(this._options.ajaxContent.method == 'post') /* NEXT STEP ;) */
				{
					
				}
				else{}
			}
		}
		else if(this._options.iframe != null)
		{
			var iframe = document.createElement('iframe');
			iframe.src = this._options.iframe;
			iframe.width = '100%';
			iframe.height = '100%';
			
			this._content.appendChild(iframe);
			applyWindowContentStyle.call(this);
		}
		else
		{
			this._content.innerHTML = this._options.content;
		}
	}
	
	function applyAllWindowStyles()
	{
		applyWindowStyle.call(this);
		saveWindowDefaultValues.call(this);
		
		applyWindowControlsStyle.call(this);
		
		applyTitleBarStyle.call(this);
		
		applyWindowContentStyle.call(this);
		saveWindowContentDefaultValues.call(this);
	}
	
	function applyAllWindowElementsStyles()
	{
		//saveWindowDefaultValues.call(this);
		applyWindowControlsStyle.call(this);
		
		applyTitleBarStyle.call(this);
		
		applyWindowContentStyle.call(this);
		//saveWindowContentDefaultValues.call(this);
	}
	
	function buildWindowPart()
	{
		this._window = document.createElement('div');
		this._window.className = 'window';

		this._window.appendChild(this._titleBar);
		this._window.appendChild(this._content);

		resizableWindow.call(this);
	}
	
	function resizableWindow()
	{
		var _this = this;
		
		if(this._defaultResizable)
		{
			if(this._options.resizable)
			{
				this._resizeN = document.createElement('div');
				this._resizeE = document.createElement('div');
				this._resizeS = document.createElement('div');
				this._resizeW = document.createElement('div');
				this._resizeNE = document.createElement('div');
				this._resizeSE = document.createElement('div');
				this._resizeSW = document.createElement('div');
				this._resizeNW = document.createElement('div');
				
				this._window.appendChild(this._resizeN);
				this._window.appendChild(this._resizeE);
				this._window.appendChild(this._resizeS);
				this._window.appendChild(this._resizeW);
				this._window.appendChild(this._resizeNE);
				this._window.appendChild(this._resizeSE);
				this._window.appendChild(this._resizeSW);
				this._window.appendChild(this._resizeNW);

				this._resizeN.className = 'resizable-handle resizable-n';
				this._resizeE.className = 'resizable-handle resizable-e';
				this._resizeS.className = 'resizable-handle resizable-s';
				this._resizeW.className = 'resizable-handle resizable-w';
				this._resizeNE.className = 'resizable-handle resizable-ne';
				this._resizeSE.className = 'resizable-handle resizable-se';
				this._resizeSW.className = 'resizable-handle resizable-sw';
				this._resizeNW.className = 'resizable-handle resizable-nw';
				
				this._resizeSE.onmousedown = resizeSEMouseDown.bind(this);
				this._resizeSW.onmousedown = resizeSWMouseDown.bind(this);
				this._resizeNE.onmousedown = resizeNEMouseDown.bind(this);
				this._resizeNW.onmousedown = resizeNWMouseDown.bind(this);
				
				this._resizeN.onmousedown = resizeNMouseDown.bind(this);
				this._resizeE.onmousedown = resizeEMouseDown.bind(this);
				this._resizeS.onmousedown = resizeSMouseDown.bind(this);
				this._resizeW.onmousedown = resizeWMouseDown.bind(this);
			}
			else
			{
				var resizeBars = this._window.querySelectorAll('div[class^="resizable"]');
				if(resizeBars != null)
				{
					[].forEach.call(resizeBars, function(value, index, arr){
						_this._window.removeChild(value);
					});
				}
			}
		}
	}

	function applyWindowStyle()
	{
		/* Window Style */
		var windowStyle = this._window.currentStyle || window.getComputedStyle(this._window);
		this._windowBorderWidth = parseInt(windowStyle.borderLeftWidth, 10) + parseInt(windowStyle.borderRightWidth, 10);
		this._windowBorderHeight = parseInt(windowStyle.borderTopWidth, 10) + parseInt(windowStyle.borderBottomWidth, 10);
		
		this._window.style.width = this._options.width - this._windowBorderWidth + 'px';
		this._window.style.height = this._options.height - this._windowBorderHeight + 'px';
		this._window.style.left = window.innerWidth / 2 - this._window.offsetWidth / 2 + 'px';
		this._window.style.top = window.innerHeight / 2 - this._window.offsetHeight / 2 + 'px';
		/* Place the window in the foreground */
	    this._window.style.zIndex = this.instances + 9999;		
	}

	function saveWindowDefaultValues()
	{
		/* Save the window default values */
		this._wDefaultWidth = this._options.width - this._windowBorderWidth;
		this._wDefaultHeight = this._options.height - this._windowBorderHeight;
		this._wDefaultLeft = window.innerWidth / 2 - this._window.offsetWidth / 2;
		this._wDefaultTop = window.innerHeight / 2 - this._window.offsetHeight / 2;
	}

	function buildTitleBarPart()
	{
		this._titleBar = document.createElement('div');
		this._title = document.createElement('span');

		this._titleBar.className = 'w-title';
		this._title.innerText = this._options.title;
		
		this._titleBar.appendChild(this._title);
		this._titleBar.appendChild(this._controlsContainer);
	}

	function applyTitleBarStyle()
	{
		/* Title Style */
		var titleStyle = this._title.currentStyle || window.getComputedStyle(this._title);
		this._titlePaddingLeft = parseInt(titleStyle.paddingLeft, 10);
		this._title.style.width = this._window.clientWidth - this._titlePaddingLeft - this._windowBorderWidth - Math.ceil(this._controlsContainer.clientWidth) + 'px';
		
		var titleBarStyle = this._titleBar.currentStyle || window.getComputedStyle(this._titleBar);
		this._titleBorderWidth = parseInt(titleBarStyle.borderBottomWidth, 10);
		this._titleHeight = this._title.offsetHeight + this._titleBorderWidth;
		this._titleInnerHeight = this._title.offsetHeight - this._titleBorderWidth;
	}

	function buildWindowControlsPart()
	{
		this._controlsContainer = document.createElement('div');
		this._closeButton = document.createElement('i');
		this._maximizeMinimizeButton = document.createElement('i');
		this._showHideContentButton = document.createElement('i');
		this._reduceEnlargeButton = document.createElement('i');

		this._controlsContainer.className = 'w-controls';
		this._closeButton.className = 'icon-close red';
		this._maximizeMinimizeButton.className = 'icon-maximize blue';
		this._showHideContentButton.className = 'icon-hide orange';
		this._reduceEnlargeButton.className = 'icon-reduce orange';

		this._controlsContainer.appendChild(this._closeButton);
		this._controlsContainer.appendChild(this._maximizeMinimizeButton);
		this._controlsContainer.appendChild(this._showHideContentButton);
		this._controlsContainer.appendChild(this._reduceEnlargeButton);
	}

	function applyWindowControlsStyle()
	{
		showCorrectControls.call(this);
	}

	function buildWindowContentPart()
	{
		this._content = document.createElement('div');
		this._content.className = 'w-content';
	}

	function applyWindowContentStyle()
	{
		if(this._options.contentPadding)
		{
			var contentContainerStyle =  this._content.currentStyle || window.getComputedStyle(this._content);		
			this._contentPaddingTop = parseInt(contentContainerStyle.paddingTop, 10);
			this._contentPaddingBottom = parseInt(contentContainerStyle.paddingBottom, 10);
			this._contentPaddingLeft = parseInt(contentContainerStyle.paddingLeft, 10);
			this._contentPaddingRight = parseInt(contentContainerStyle.paddingRight, 10);
		}
		else
		{
			this._contentPaddingTop = this._contentDefaultPaddingTop;
			this._contentPaddingBottom = this._contentDefaultPaddingBottom;
			this._contentPaddingLeft = this._contentDefaultPaddingLeft;
			this._contentPaddingRight = this._contentDefaultPaddingRight;
		}
		
		
		//this._content.style.maxHeight = this._wDefaultHeight - this._contentPaddingTop - this._contentPaddingBottom - (this._title.offsetHeight + this._titleBorderWidth) + 'px';
		var maxHeight = (this._window.clientHeight + this._windowBorderHeight) - this._contentDefaultPaddingTop - this._contentDefaultPaddingBottom - (this._title.offsetHeight + this._titleBorderWidth);
		this._content.style.maxHeight = maxHeight + 'px';
		this._content.style.height = maxHeight + 'px';
		
		if((this._contentDefaultPaddingTop + this._contentDefaultPaddingBottom) > (maxHeight + (this._contentDefaultPaddingTop + this._contentDefaultPaddingBottom)))
		{
			if(maxHeight < 0)
			{
				this._content.style.paddingTop = 0 + 'px';
				this._content.style.paddingBottom = 0 + 'px';
				this._content.style.paddingLeft = this._contentDefaultPaddingLeft + 'px';
				this._content.style.paddingRight = this._contentDefaultPaddingRight + 'px';
			}
		}
		else
		{
			this._content.style.paddingTop = this._contentDefaultPaddingTop + 'px';
			this._content.style.paddingBottom = this._contentDefaultPaddingBottom + 'px';
			this._content.style.paddingLeft = this._contentDefaultPaddingLeft + 'px';
			this._content.style.paddingRight = this._contentDefaultPaddingRight + 'px';
		}
		
		this._contentDefaultHeight = maxHeight;
	}

	function saveWindowContentDefaultValues()
	{
		this._contentDefaultHeight = this._wDefaultHeight - this._contentPaddingTop - this._contentPaddingBottom - (this._title.offsetHeight + this._titleBorderWidth);
	}
	
	function initEvents()
	{
		if(this._closeButton)
		{
			this._closeButton.onclick = this.close.bind(this);
		}
		
		if(this._maximizeMinimizeButton)
		{
			this._maximizeMinimizeButton.onclick = this.maximizeMinimize.bind(this);
		}
		
		if(this._showHideContentButton)
		{
			this._showHideContentButton.onclick = this.showHideContent.bind(this);
		}

		if(this._reduceEnlargeButton)
		{
			this._reduceEnlargeButton.onclick = this.reduceEnlarge.bind(this);
		}

		if(this._window)
		{
			this._window.onmousedown = selectWindow.bind(this);
		}
		
		if(this._options.resizable && this._resizeN && this._resizeE && this._resizeS && this._resizeW && this._resizeNE && this._resizeSE && this._resizeSW && this._resizeNW)
		{
			this._resizeSE.onmousedown = resizeSEMouseDown.bind(this);
			this._resizeSW.onmousedown = resizeSWMouseDown.bind(this);
			this._resizeNE.onmousedown = resizeNEMouseDown.bind(this);
			this._resizeNW.onmousedown = resizeNWMouseDown.bind(this);
			this._resizeN.onmousedown = resizeNMouseDown.bind(this);
			this._resizeE.onmousedown = resizeEMouseDown.bind(this);
			this._resizeS.onmousedown = resizeSMouseDown.bind(this);
			this._resizeW.onmousedown = resizeWMouseDown.bind(this);
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
