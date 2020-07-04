// Copyright 2006 Adobe Macromedia, Inc. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.Base
//
// DESCRIPTION:
//   This the base class for all design time widgets (i.e., all design
//   time widgets inherit from this class). Unidentified Spry widgets --
//   any widget that does not have its own design time file -- will use
//   this one. 
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       Base(dom, objName, element)
//
//   Utils:
//
//       addClassName(ele, className)
//       removeClassName(ele, className)
//       hasClassName(ele, className)
//       getElementChildren(element)
//       addEventListener(element, eventType, handler, capture)
//       getOption(optionName, defaultValue)
//       setOption(optionName, optionValue, defaultValue)
//       removeOption(optionName)
//       setOptsFromArgsArray(args)
//       setOptions(obj, optionsObj, ignoreUndefinedProps)
//       getHidePanelIcon()
//       getShowPanelIcon()
//       addHidePanelContextButton(buttonContainer)
//       removeContextButton(buttonContainer)
//       getObjectName()
//       getElement(ele)
//       ensureValidElements()
//       getConstructorArgs(className)
//       setWidgetType(widgetType)
//       getWidgetType()
//
//
//   Update widget constructor and markup:
//
//       updateId(newId)
//       updateConstructorOptions(className, numReqCArgs, opts)
//
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.Base.getElementChildrenRaw(element)
//       Spry.DesignTime.Widget.Base.getObjectAsString(obj)
//       Spry.DesignTime.Widget.Base.changeConstructorId(dom, curId, newId, widgetType)
//--------------------------------------------------------------------

var Spry;
if (!Spry) Spry = {};
if (!Spry.DesignTime) Spry.DesignTime = {};
if (!Spry.DesignTime.Widget) Spry.DesignTime.Widget = {};

Spry.DesignTime.Widget.Base = function(dom, objName, element)
{
    this.dom = dom;
    this.objName = objName;
    this.element = this.getElement(element);
    this.element_id = (typeof element == "string" || !element) ? element : element.id;
};

//--------------------------------------------------------------------
// FUNCTION:
//   addClassName
//
// DESCRIPTION:
//   Adds the specified class as a translated attribute to the specified
//   element, so that the class becomes visible in Design view. Does not
//   change the actual class attribute.
//
// ARGUMENTS:
//   ele - the element on which to change the class
//   className - the name of the class to apply
//
// RETURNS:
//   Nothing.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.addClassName = function(ele, className)
{
	if (!ele || !className)
		return;

	var tclass = ele.getTranslatedAttribute("class");
 	if (!tclass || (tclass.search(new RegExp("\\b" + className + "\\b")) != -1))
		return;

	ele.setTranslatedAttribute("class", tclass + (tclass ? " " : "") + className);
};

Spry.DesignTime.Widget.Base.removeClassName = function(ele, className)
{
	if (!ele || !className)
		return;

	var tclass = ele.getTranslatedAttribute("class");
	if (!tclass || (tclass.search(new RegExp("\\b" + className + "\\b")) == -1))
		return;

	ele.setTranslatedAttribute("class", tclass.replace(new RegExp("\\s*\\b" + className + "\\b", "g"), ""));
};

//--------------------------------------------------------------------
// FUNCTION:
//   hasClassName
//
// DESCRIPTION:
//   Checks whether the specified class has been applied to the specified
//   element via a translated attribute.
//
// ARGUMENTS:
//   ele - the element on which to check for the class
//   className - the name of the class for which to check
//
// RETURNS:
//   Boolean value indicating whether the class has been applied to
//   the specified element.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.hasClassName = function(ele, className)
{
	if (!ele || !className)
		return false;
	var tclass = ele.getTranslatedAttribute("class");
	return (tclass && tclass.search(new RegExp("\\b" + className + "\\b")) != -1);
};

//--------------------------------------------------------------------
// FUNCTION:
//   getElementChildren
//
// DESCRIPTION:
//   Checks whether the specified class has been applied to the specified
//   element via a translated attribute.
//
// ARGUMENTS:
//   ele - the element on which to check for the class
//   className - the name of the class for which to check
//
// RETURNS:
//   Boolean value indicating whether the class has been applied to
//   the specified element.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.getElementChildren = function(element)
{	
	// filter out any non-HTML tags between the container element and
	// its first element child
	var elementToUse = element;
	if( elementToUse && 
	   	elementToUse.hasChildNodes() && 
		elementToUse.childNodes.length == 1 &&
		(elementToUse.firstChild.nodeType != Node.ELEMENT_NODE || !elementToUse.firstChild.isHtmlTag()) )
	{
		var foundNode = dwscripts.getFirstHtmlTag(elementToUse.firstChild);
		if( foundNode ) {
			elementToUse = foundNode.parentNode;
		}
	}
	
	//get all the children
	var rawChildren = Spry.DesignTime.Widget.Base.getElementChildrenRaw(elementToUse);
	
	//go through and filter out any non HTML tags in the arrray
	var filteredChildren = new Array();
	for( var i = 0 ; i < rawChildren.length ; i++ )
	{		
		goodChild = rawChildren[i];
		if(!goodChild.isHtmlTag() ) 
		{
			//wasn't a good child, look down this child node for a better one
			goodChild = dwscripts.getFirstHtmlTag(goodChild.firstChild);
		}
		
		if( goodChild ) {
			filteredChildren.push(goodChild);
		}
	}
	
	return filteredChildren;
};

Spry.DesignTime.Widget.Base.getElementChildrenRaw = function(element)
{
	var children = [];
	
	if( element )
	{
  	var child = element.firstChild;
  	while (child)
  	{
  		if (child.nodeType == 1 /* Node.ELEMENT_NODE */)
  			children.push(child);
  		child = child.nextSibling;
  	}
  }
  
	return children;
};

Spry.DesignTime.Widget.Base.addEventListener = function(element, eventType, handler, capture)
{
	try
	{
		if (element.addEventListener)
			element.addEventListener(eventType, handler, capture);
		else if (element.attachEvent)
			element.attachEvent("on" + eventType, handler);
	}
	catch (e) {}
};

//--------------------------------------------------------------------
// FUNCTION:
//   getObjectAsString
//
// DESCRIPTION:
//   Static utility function used to serialize the given object.
//
// ARGUMENTS:
//   obj - object - Object that needs serializtion.
//
// RETURNS:
//   Object serialization string.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.getObjectAsString = function(obj)
{
  var strOptions = "{}";
  if( obj )
  {
    // Construct the options string.
    var options = new Object();
    Spry.DesignTime.Widget.Base.setOptions(options, obj, true);
    strOptions = options.toSource();
    if( strOptions )
    {
      strOptions = dwscripts.trim(strOptions);
      strOptions = strOptions.replace(/^\(/i, "");
      strOptions = strOptions.replace(/\)$/i, "");
    }
  }
  return strOptions;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getOption
//
// DESCRIPTION:
//   This method returns the value of the given property from the widget's options
//   object. If such a property cannot be found and a default value has been
//   specified instead, we'll return the default value. Otherwise, if a
//   value was not found nor a default value specified, we'll simply return undefined.
//
// ARGUMENTS:
//   optionName - string - One of the widget's constructor options.
//   defaultValue - string or numeric - Value that is suplied in case the opts
//                          object does not contains a value for optionName key.
//
// RETURNS:
//   The option value if it exists, the defaultValue parameter otherwise, or
//   undefined if a defaultValue is not given.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.getOption = function(optionName, defaultValue)
{
  var retValue;
  if (this.opts)
  {
    retValue = this.opts[optionName];
  }

  if (typeof(retValue) == "undefined")
  {
    retValue = defaultValue;
  }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setOption
//
// DESCRIPTION:
//   This function sets a property (specified by its name) to widget's options
//   object. If a default value was specified for this property and if this value
//   is actually the same as the value to be set, we'll go and remove the option
//   instead of adding it with the default value. By doing this, we make sure we
//   keep the code in page as minimum as possible.
//
// ARGUMENTS:
//   optionName - string - One of the widget's constructor options.
//   optionValue - string - Option new value.
//   defaultValue - string - Option's default value.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.setOption = function(optionName, optionValue, defaultValue)
{
  var status = (typeof(defaultValue) == "undefined") || (this.getOption(optionName, defaultValue) !== optionValue);

  if ((typeof(defaultValue) == "undefined") || (optionValue !== defaultValue))
  {
    if( !this.opts )
    {
      this.opts = new Object();
    }
    this.opts[optionName] = optionValue;
  }
  else
  {
    this.removeOption(optionName);
  }

  return status;
};

//--------------------------------------------------------------------
// FUNCTION:
//   removeOption
//
// DESCRIPTION:
//   This function removes the given property from the widget's options object.
//
// ARGUMENTS:
//   optionName - string - One of the widget's constructor options.
//
// RETURNS:
//   The function returns the operation status (true for successfull, false otherwise).
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.removeOption = function(optionName)
{
  var status = false;
  if (this.opts)
  {
    if (typeof(this.opts[optionName]) != "undefined")
    {
      // The option exists and therefore it will be removed, so we'll set the status of the operation to TRUE
      status = true;
    }

    // Removing the option
    this.opts[optionName] = undefined;
  }
  return status;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setOptsFromArgsArray
//
// DESCRIPTION:
//   Internal utility function for setting the options property of the
//   design-time widget object from the args array passed into the constructor.
//
// ARGUMENTS:
//   args - array - An array of strings that represent the arguments
//                  between the parens of the constructor snippet.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.setOptsFromArgsArray = function(args)
{
  if (args && args.length > this.numReqCArgs)
  {
    var optStr = args[this.numReqCArgs];
    if (optStr && optStr.search(/^[\s\n\r]*\{/) != -1)
    {
      // DEVELOPER NOTE: We are assuming that options are actual values,
      // not variable names or expressions. To support variables used in
      // constructor options, step through each option manually instead 
      // of using eval. Note that the widget Property Inspectors would
      // also need to be modified to support variables or expressions
      // as values.
      var opts;
      try { eval("opts = " + optStr); } catch(e) { opts = null; }
      if (opts)
        this.setOptions(this.opts, opts);
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   setOptions
//
// DESCRIPTION:
//   Set all widget options at once, optionally ignoring any properties
//   that are undefined.
//
// ARGUMENTS:
//   obj - array - the object in which to store the new options
//   optionsObj - array - the current options array
//   ignoreUndefinedProps - boolean - whether to skip over undefined options
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.setOptions = function(obj, optionsObj, ignoreUndefinedProps)
{
	if (!optionsObj)
		return;
	for (var optionName in optionsObj)
	{
		if (ignoreUndefinedProps && optionsObj[optionName] == undefined)
			continue;
		obj[optionName] = optionsObj[optionName];
	}
};


//--------------------------------------------------------------------
// FUNCTION:
//   getHidePanelIcon
//
// DESCRIPTION:
//   Gets the icon to display in Design view to indicate that an element
//   (doesn't necessarily have to be a panel) can be hidden.
//
// ARGUMENTS:
//   None.
//
// RETURNS:
//   The full path to the the icon, expressed as a file:// URL.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.getHidePanelIcon = function()
{
	return dw.getConfigurationPath() + "/Shared/MM/Images/disclosure_close.png";
};

//--------------------------------------------------------------------
// FUNCTION:
//   getShowPanelIcon
//
// DESCRIPTION:
//   Gets the icon to display in Design view to indicate that an element
//   (doesn't necessarily have to be a panel) can be shown/made visible.
//
// ARGUMENTS:
//   None.
//
// RETURNS:
//   The full path to the the icon, expressed as a file:// URL.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.getShowPanelIcon = function()
{
	return dw.getConfigurationPath() + "/Shared/MM/Images/disclosure_open.png";
};

Spry.DesignTime.Widget.Base.addShowPanelContextButton = function(buttonContainer)
{
	if( !buttonContainer || !buttonContainer.setTranslatedAttribute )
	{
		if( dw.isDebugBuild() ) alert("DEBUG ALERT: bad buttonContainer passed into 'Spry.DesignTime.Widget.Base.addShowPanelContextButton'");
		return;
	}
	buttonContainer.setTranslatedAttribute("dwedit:hascontextbutton", "hascontextbutton");
	buttonContainer.setTranslatedAttribute("dwedit:contextbuttonurl", Spry.DesignTime.Widget.Base.getShowPanelIcon());
	buttonContainer.setTranslatedAttribute("dwedit:contextbuttontooltip", dw.loadString("spry/widget/tooltip/show panel"));
};

Spry.DesignTime.Widget.Base.addHidePanelContextButton = function(buttonContainer)
{
	if( !buttonContainer || !buttonContainer.setTranslatedAttribute )
	{
		if( dw.isDebugBuild() ) alert("DEBUG ALERT: bad buttonContainer passed into 'Spry.DesignTime.Widget.Base.addHidePanelContextButton'");
		return;
	}
	buttonContainer.setTranslatedAttribute("dwedit:hascontextbutton", "hascontextbutton");
	buttonContainer.setTranslatedAttribute("dwedit:contextbuttonurl", Spry.DesignTime.Widget.Base.getHidePanelIcon());
	buttonContainer.setTranslatedAttribute("dwedit:contextbuttontooltip", dw.loadString("spry/widget/tooltip/hide panel"));
};

Spry.DesignTime.Widget.Base.removeContextButton = function(buttonContainer)
{
	if( !buttonContainer || !buttonContainer.removeTranslatedAttribute )
	{
		if( dw.isDebugBuild() ) alert("DEBUG ALERT: bad buttonContainer passed into 'Spry.DesignTime.Widget.Base.removeContextButton'");
		return;
	}
	buttonContainer.removeTranslatedAttribute("dwedit:hascontextbutton");
	buttonContainer.removeTranslatedAttribute("dwedit:contextbuttonurl");
	buttonContainer.removeTranslatedAttribute("dwedit:contextbuttontooltip");
};



// For convenience, we'll add these static methods as members of the widget class itself.
Spry.DesignTime.Widget.Base.prototype.addClassName = Spry.DesignTime.Widget.Base.addClassName;
Spry.DesignTime.Widget.Base.prototype.removeClassName = Spry.DesignTime.Widget.Base.removeClassName;
Spry.DesignTime.Widget.Base.prototype.hasClassName = Spry.DesignTime.Widget.Base.hasClassName;
Spry.DesignTime.Widget.Base.prototype.getElementChildren = Spry.DesignTime.Widget.Base.getElementChildren;
Spry.DesignTime.Widget.Base.prototype.addEventListener = Spry.DesignTime.Widget.Base.addEventListener;
Spry.DesignTime.Widget.Base.prototype.setOptions = Spry.DesignTime.Widget.Base.setOptions;
Spry.DesignTime.Widget.Base.prototype.getHidePanelIcon = Spry.DesignTime.Widget.Base.getHidePanelIcon;
Spry.DesignTime.Widget.Base.prototype.getShowPanelIcon = Spry.DesignTime.Widget.Base.getShowPanelIcon;
Spry.DesignTime.Widget.Base.prototype.addShowPanelContextButton = Spry.DesignTime.Widget.Base.addShowPanelContextButton;
Spry.DesignTime.Widget.Base.prototype.addHidePanelContextButton = Spry.DesignTime.Widget.Base.addHidePanelContextButton;
Spry.DesignTime.Widget.Base.prototype.removeContextButton = Spry.DesignTime.Widget.Base.removeContextButton;



Spry.DesignTime.Widget.Base.prototype.getObjectName = function()
{
	return this.objName;
};

Spry.DesignTime.Widget.Base.prototype.getElement = function(ele)
{
	if (ele && typeof ele == "string")
		return this.dom.getElementById(ele);
	return ele;
}

Spry.DesignTime.Widget.Base.prototype.ensureValidElements = function()
{
	if( this.element && 
	   this.element.ownerDocument && 
	   this.element.id == this.element_id )
	return; //node is still good
	
	//refind our element in the document
	this.element = this.getElement(this.element_id);
};

Spry.DesignTime.Widget.Base.prototype.updateConstructorOptions = function(className, numReqCArgs, opts)
{
	var consRegExp = new RegExp(className.replace(/\./g, "\\.") + "\\s*?\\(\\s*?[\"']" + this.element_id + "[\"']");
	var scriptTags = this.dom.getElementsByTagName("script");
	for( var i = 0; i < scriptTags.length; i++ )
	{
		var sTag = scriptTags[i];
		var src = sTag.innerHTML;
		if(!src)
			continue;
		var cOffset = src.search(consRegExp);
		if (cOffset != -1)
		{
			var args = Spry.DesignTime.Editing.Utils.getParamsAsStrings(src, cOffset, '(', ')');
			var cleanOpts = {};
			this.setOptions(cleanOpts, opts, true);
			var optStr = Spry.DesignTime.Widget.Base.unencodeCharsFromSource(cleanOpts.toSource().replace(/^\(|\)$/g, ""));
			optStr = (optStr == "{}") ? "" : optStr;
			var optStart;
			if (args.length > numReqCArgs)
			{
				// The constructor has an options object.
				optStart = args._offsets[numReqCArgs];
				optEnd = optStart + args[numReqCArgs].length;

				if (optStr)
					optStr = " " + optStr;
				else
				{
					// We'll be removing the existing options object
					// from the constructor call, so include the ','
					// character.
					--optStart;
				}
			}
			else
			{
				// The constructor has no options object.
				optStart = args._offsets[numReqCArgs - 1] + args[numReqCArgs - 1].length;
				optEnd = optStart;

				if (optStr)
				{
					// We're adding an options object to constructor call
					// that did not already have one. Add a ',' character
					// in front of the optStr we are adding.
					optStr = ", " + optStr;
				}
			}

			sTag.innerHTML = src.substr(0, optStart) + optStr + src.substr(optEnd);
		}
	}
};

Spry.DesignTime.Widget.Base.prototype.getConstructorArgs = function(className)
{
	var consRegExp = new RegExp(className.replace(/\./g, "\\.") + "\\s*?\\(\\s*?[\"']" + this.element_id + "[\"']");
	var scriptTags = this.dom.getElementsByTagName("script");
	for( var i = 0; i < scriptTags.length; i++ )
	{
		var sTag = scriptTags[i];
		var src = sTag.innerHTML;
		if(!src)
			continue;
		var cOffset = src.search(consRegExp);
		if (cOffset != -1)
		{
			var args = Spry.DesignTime.Editing.Utils.getParamsAsStrings(src, cOffset, '(', ')');
			return args;
		}
	}
	return null;
};

Spry.DesignTime.Widget.Base.unencodeCharsFromSource = function(sourceString)
{  
    var unecodedString = sourceString;
    var uCharRegExp = /\\u[ABCDEFadcbdef0123456789]+/;
    var encodedChar = new String(sourceString.match(uCharRegExp));
    while( encodedChar != "" && encodedChar != "null" )
    {
        var charCode = Number( "0x" + encodedChar.slice(2) );
        if( charCode == Number.NaN )
        {
            //error converting, bail on the whole thing to be safe
            return sourceString;
        }
        var charCodeStr = String.fromCharCode( charCode );
        
        if( charCodeStr.length == 0 )
        {
            return sourceString;
        }
        unecodedString = unecodedString.replace(encodedChar, charCodeStr );
        encodedChar = new String(unecodedString.match(uCharRegExp));
    }
    return unecodedString;
};

//--------------------------------------------------------------------
// FUNCTION:
//   updateId
//
// DESCRIPTION:
//   Called when the user changes the id attribute of the widget's
//   top-level element from the PI. Calls changeConstructorId(),
//   which searches through all script tags in the document for 
//   constructor calls that use the old id and modifies them to
//   use the new id.
//
// ARGUMENTS:
//   newId - string - The new element ID to use for the widget.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.updateId = function(newId)
{
  // Set our element's id first.
  this.element.id = newId;
  var oldId = this.element_id;
  this.element_id = newId;
  var widgetType = this.widgetType;

  // Update constructor
  Spry.DesignTime.Widget.Base.changeConstructorId(this.dom, oldId, newId, widgetType);
  
  // Make sure we have a handle to the correct element.
  this.ensureValidElements();
};

//--------------------------------------------------------------------
// FUNCTION:
//   changeConstructorId
//
// DESCRIPTION:
//   Searches through all script tags in the document and updates any
//   widget constructors that use curId so that they use newId instead.
//
// ARGUMENTS:
//   dom - object - The DOM for the current page.
//   curId - string - The element ID to search for.
//   newId - string - New ID for element.
//   widgetType - string - The actual (not designtime) widget type,
//   such as "Spry.Widget.Accordion".
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.changeConstructorId = function(dom, curId, newId, widgetType)
{

  var updateConstructorRegEx = new RegExp(dwscripts.escRegExpChars(widgetType) + "\\s*?\\(\\s*?[\"']" + dwscripts.escRegExpChars(curId) + "[\"']");
  var scriptTags = dom.getElementsByTagName("script");
  for ( var i = 0; i < scriptTags.length; i++ )
  {
    if ( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, widgetType + "(\"" + newId + "\"");
  }
};

Spry.DesignTime.Widget.Base.prototype.updateOptions = function()
{
  this.updateConstructorOptions(this.widgetType, this.numReqCArgs, this.opts);
};

//--------------------------------------------------------------------
// FUNCTION:
//   setWidgetType
//
// DESCRIPTION:
//   Called by the translator to store the type of widget so that those 
//   functions that need the widget type as a string value can get
//   it as an argument rather than having to be repeated in each 
//   widget designtime file.
//
// ARGUMENTS:
//   widgetType - string - The name of the widget as it appears in
//   the constructor in the user's document (e.g., Spry.Widget.Accordion,
//   Spry.Widget.MenuBar)
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.setWidgetType = function(widgetType)
{
  this.widgetType = widgetType;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getWidgetType
//
// DESCRIPTION:
//   Gets the widget type as a string.
//
// ARGUMENTS:
//   None.
//
// RETURNS:
//   A string such as "Spry.Widget.Accordion" or "Spry.Widget.MenuBar".
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Base.prototype.getWidgetType = function()
{
  return this.widgetType;
};

