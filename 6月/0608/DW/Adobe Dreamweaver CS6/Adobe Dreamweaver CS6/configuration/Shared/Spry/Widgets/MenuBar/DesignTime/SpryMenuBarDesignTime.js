// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.MenuBar
//
// DESCRIPTION:
//	This is the DesignTime version of the Spry MenuBar class.
//	It inherits from the Spry Widget Base class.
//
//	dom - the document this widget is in
//	objName - the var this widget is assigned to in the user's document
//	element - the html element for this widget
//  args - the arguments passed to the constructor in the user's document
//--------------------------------------------------------------------
Spry.DesignTime.Widget.MenuBar = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.opts = {};
  this.setOptsFromArgsArray(args);
	this.init(element);
};

// Inherit all methods from Widget.Base class
Spry.DesignTime.Widget.MenuBar.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to MenuBar for our newly created prototype
// object so callers know that our object was created with the MenuBar constructor.
Spry.DesignTime.Widget.MenuBar.prototype.constructor = Spry.DesignTime.Widget.MenuBar;

Spry.DesignTime.Widget.MenuBar.prototype.init = function(element)
{
	this.element = this.getElement(element);

	if(this.element)
	{
		var items = this.element.getElementsByTagName('li');
		for(var i=0; i<items.length; i++)
		{
			this.initializeItem(items[i], element);
		}
	}
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAssets
//
// DESCRIPTION:
//   Static function that returns the assets to be applied to page. If you do not specify isHorizontal, the function
//   will return the assets for both horizontal and vertical menu bars (trying to avoid any error in page that may
//   appear).
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (array of objects)
//--------------------------------------------------------------------

Spry.DesignTime.Widget.MenuBar.getAssets = function(isHorizontal)
{
	var assets = new Array();
	var tempObj;

	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBar.js";
	tempObj.file = "SpryMenuBar.js";
	tempObj.type = "javascript";
	assets.push(tempObj);
     
    /////////////////////////////////////////////////////////////////////// 
    // If the param "isHorizontal" is not passed in, check the clipboard
    // to see if the user is cutting and pasting a Spry MenuBar and try
    // to discover if we are vertical or horizontal.
    //
    if (typeof (isHorizontal) == "undefined")
    {        
        var clipboardText = dw.getClipboardText()
                      
        if (clipboardText.indexOf("MenuBarVertical") != -1)
            isHorizontal = false
        else if (clipboardText.indexOf("MenuBarHorizontal") != -1)
            isHorizontal = true                               
    }
    //
    // End of checking the clipboard.
    /////////////////////////////////////////////////////////////////////// 
 
	if ((isHorizontal === true) || (typeof (isHorizontal) == "undefined"))
	{
		tempObj = new Object();
		tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarHorizontal.css";
		tempObj.file = "SpryMenuBarHorizontal.css";
		tempObj.type = "link";
		assets.push(tempObj);

		tempObj = new Object();
		tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarDown.gif";
		tempObj.file = "SpryMenuBarDown.gif";
		tempObj.type = "";
		assets.push(tempObj);

		tempObj = new Object();
		tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarDownHover.gif";
		tempObj.file = "SpryMenuBarDownHover.gif";
		tempObj.type = "";
		assets.push(tempObj);
	}  
 
	if ((isHorizontal === false) || (typeof (isHorizontal) == "undefined"))
	{
		tempObj = new Object();
		tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarVertical.css";
		tempObj.file = "SpryMenuBarVertical.css";
		tempObj.type = "link";
		assets.push(tempObj);
	}  

	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarRight.gif";
	tempObj.file = "SpryMenuBarRight.gif";
	tempObj.type = "";
	assets.push(tempObj);

	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/MenuBar/SpryMenuBarRightHover.gif";
	tempObj.file = "SpryMenuBarRightHover.gif";
	tempObj.type = "";
	assets.push(tempObj);

	return assets;
};

//This gets called after edits so we can render correctly
Spry.DesignTime.Widget.MenuBar.prototype.refresh = function()
{
	this.init(this.element_id);
	this.validateElements();

	for(node in this.translatedNodes)
	{
		if(dw.nodeExists(this.translatedNodes[node][0]) && this.translatedNodes[node][0].getTranslatedAttribute("class") != this.translatedNodes[node][1])
		{
			this.translatedNodes[node][0].setTranslatedAttribute("class", this.translatedNodes[node][1]);
		}
	}
};

Spry.DesignTime.Widget.MenuBar.prototype.validateElements = function()
{
	if( this.element && 
	   this.element.ownerDocument && 
	   this.element.id == this.element_id )
	{
		return; //node is still good
	}

	//refind our element in the document
	this.element = this.getElement(this.element_id);
};

Spry.DesignTime.Widget.MenuBar.prototype.getObjectName = function()
{
	return this.objName;
};

//static function for creating MenuBar at runtime
Spry.DesignTime.Widget.MenuBar.getNewMenuBarSnippet = function(id, opts)
{
	var listItems = '<li><a class="MenuBarItemSubmenu" href="#">%s 1</a><ul><li><a href="#">%s 1.1</a></li><li><a href="#">%s 1.2</a></li><li><a href="#">%s 1.3</a></li></ul></li><li><a href="#">%s 2</a></li><li><a class="MenuBarItemSubmenu" href="#">%s 3</a><ul><li><a class="MenuBarItemSubmenu" href="#">%s 3.1</a><ul><li><a href="#">%s 3.1.1</a></li><li><a href="#">%s 3.1.2</a></li></ul></li><li><a href="#">%s 3.2</a></li><li><a href="#">%s 3.3</a></li></ul></li><li><a href="#">%s 4</a></li>'; 
	var label = "Item", orientation = "MenuBarHorizontal";
	if( typeof opts != 'undefined')
	{
		if(typeof opts.label != 'undefined')
		{
			label = opts.label;
		}
		if(typeof opts.orientation != 'undefined')
		{
			orientation = opts.orientation;
		}
	}
	
	var menuSnippet = '<ul id="' + id + '" class="' + orientation + '">';
	menuSnippet += listItems.replace(/%s/g, label);
	menuSnippet += '</ul>';
	
	return menuSnippet;
};

Spry.DesignTime.Widget.MenuBar.getNewMenuBarConstructorSnippet = function(id, options)
{
	var strResult = 'var ' + id + ' = new Spry.Widget.MenuBar("' + id + '"';
	if(options)
	{
	    strResult += ', ' + options;
	}
	strResult += ');';
	return strResult;
};

Spry.DesignTime.Widget.MenuBar.prototype.newMenuItemSnippet = '<li><a href="#">' + dw.loadString('spry/widgets/menubar/newSnippet/label') + '</a></li>';
Spry.DesignTime.Widget.MenuBar.prototype.newMenuSnippet = '<ul><li><a href="#">' + dw.loadString('spry/widgets/menubar/newSnippet/label') + '</a></li></ul>';

// this array will store arrays with two items: element and translatedClass
Spry.DesignTime.Widget.MenuBar.prototype.translatedNodes = new Array();

Spry.DesignTime.Widget.MenuBar.prototype.addTranslatedNode = function(element, className)
{
	var bFoundItem = false;
	// first look for this element
	for(node in this.translatedNodes)
	{
		if(this.translatedNodes[node][0] == element)
		{
			this.translatedNodes[node][1] = className;
			bFoundItem = true;
			break;
		}
	}
	if(!bFoundItem)
	{
		var newNode = new Array(element, className);
		this.translatedNodes.push(newNode);
	}

	if(element.getTranslatedAttribute("class") != className)
	{
		element.setTranslatedAttribute("class", className);
	}
}

Spry.DesignTime.Widget.MenuBar.prototype.removeTranslatedNode = function(element)
{
	element.removeTranslatedAttribute("class");

	for(var i=0; i<this.translatedNodes.length; i++)
	{
		if(this.translatedNodes[i][0] == element)
		{
			this.translatedNodes.splice(i, 1);
			break;
		}
	}
}

Spry.DesignTime.Widget.MenuBar.prototype.clearTranslatedNodes = function()
{
	for(node in this.translatedNodes)
	{
		if(dw.nodeExists(this.translatedNodes[node][0]))
		{
			this.translatedNodes[node][0].removeTranslatedAttribute("class");
		}
	}
	this.translatedNodes = new Array();
}

Spry.DesignTime.Widget.MenuBar.prototype.initializeItem = function(listitem, element)
{
	var link = listitem.getElementsByTagName('a')[0];
	var submenus = listitem.getElementsByTagName('ul');
	var menu = (submenus.length > 0 ? submenus[0] : null);

	if(menu)
	{
		this.addClassName(link, "MenuBarItemSubmenu");
	}
};

Spry.DesignTime.Widget.MenuBar.prototype.showSubmenu = function(menu)
{
	if(menu && menu.translatedClassName.search(/\s*\bMenuBarSubmenuVisible\b/g) < 0)
	{
		this.addTranslatedNode(menu, (menu.translatedClassName == '' ? '' : menu.translatedClassName+' ') + 'MenuBarSubmenuVisible')
	}
};

// hideSubmenu for Menu Bar
// remove the proper CSS class on this menu to hide it
Spry.DesignTime.Widget.MenuBar.prototype.hideSubmenu = function(menu)
{
	if(menu)
	{
		var newClassName = menu.translatedClassName.replace(/\s*\bMenuBarSubmenuVisible\b/g, '');
		if(newClassName.length)
		{
			this.addTranslatedNode(menu, newClassName);
		}
		else
		{
			this.removeTranslatedNode(menu);
		}
	}
};

// clearMenus for Menu Bar
// root is the top level unordered list (<ul> tag)
Spry.DesignTime.Widget.MenuBar.prototype.clearMenus = function(root)
{
  if ( !root || !root.getElementsByTagName )
  	return;

  this.validateElements();
	var menus = root.getElementsByTagName('ul');
	for(var i=0; i<menus.length; i++)
	{
		this.hideSubmenu(menus[i]);
	}
	this.removeClassName(this.element, "MenuBarActive");
};

