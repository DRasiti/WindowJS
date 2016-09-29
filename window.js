;(function(){
	this._options = null;
	this._window = null;
	this._modalBg = null;
	this._closeButton = null;
	this._fullScreenButton = null;
	this._minimiseButton = null;
	
	this.WindowJS = function(){
		var defaults = {
			width: 700,
			height: 500,
			title: 'Title Here !',
			modal: false,
			controls: true,
			content: 'Content of window Here !',
			bgColor: '#ffffff', // #3fd or #33ffdd
			bgOpacity: '.75',
			ajax: false,
			url: ''
		};

		// Create options by extending defaults with the passed in arugments
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

	}

	// Utility method to extend defaults with user options
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

	// 53, 121, 127 -> #35797F
	function rgbToHex(r, g, b)
	{
		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	// #35797F -> 53, 121, 127
	function hexToRgb(hex)
	{
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
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

	// 75.58654 -> 0.76
	function cssOpacity(opacity)
	{
		return parseFloat(opacity) >= 0 && parseFloat(opacity) <= 100 ? Math.round((opacity/100) * 100) / 100 : 1;
	}
})();