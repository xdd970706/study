// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Editing.Utils
//
// DESCRIPTION:
//	A collection of general functions to help with widget editing
//
// FUNCTIONS:
//  Spry.DesignTime.Editing.Utils.canInsertWidget - reports conditions that prevent widget insertion

if( typeof Spry == 'undefined' ) Spry = {};
if( typeof Spry.DesignTime == 'undefined' ) Spry.DesignTime = {};
if( typeof Spry.DesignTime.Editing == 'undefined' ) Spry.DesignTime.Editing = {};


Spry.DesignTime.Editing.Utils = function()
{
};

//Determines if a widget can be inserted into the given document
Spry.DesignTime.Editing.Utils.canInsertWidget = function(dom, widgetType)
{
	var sel = dom.getSelection(true);
	var selNode = dom.getSelectedNode();
    var validationWidgetsGroup = MM.SPRY_ValidationWidgetsGroup;

	if( selectionIsContainedInTagOfType(sel, "MMTEMPLATE:EDITABLE", dom, false) )
	{
		alert(dw.loadString('spry/widget/alert/cant insert into editable region'));
		return false;
	}
	
	if( !dom.isHeadEditable() )
	{
		alert( dwscripts.sprintf(dw.loadString('spry/alert/lockedHeadRegion'), dom.getAttachedTemplate()) );
		return false;
	}  
	
    if( dom.URL == '' )
    {
        if(confirm(dw.loadString('spry/widget/please save file')))
        {
            if (dw.canSaveDocument(dw.getDocumentDOM()))
            {
                dw.saveDocument(dw.getDocumentDOM());
                var saved = (dom.URL != '');
                return saved;
            }
        }
        return false;
    }

	// Try to see whether we are trying to apply a widget on an already exisiting widget. Therefore, we'll start
	// searching the parent nodes of the current selected tag until we reach the body tag or a container of a
	// form validation widget.
    if( selNode && dwscripts.findInArray(validationWidgetsGroup, widgetType) != -1 )
    {
      while ( selNode )
      {
        if( selNode.nodeType == Node.ELEMENT_NODE )
        {
          if (selNode.getTranslatedAttribute)
		  {
		    for( var i = 0; i < validationWidgetsGroup.length; i++ )
            {
              var attr = selNode.getTranslatedAttribute(validationWidgetsGroup[i]);
			  
			  // Check to current tag to see whether it is correctly selected and if it doesn't have
			  // a validation widget mark-up.
              if( attr && attr.length > 0 && !Spry.DesignTime.Editing.Utils.isFakeSelection(dom, [sel[0],sel[1]], selNode) )
              {
                // We have a selected a tag within a validation widget => we'll display an error message
				// and stop widget insertion.
				alert(dw.loadString("spry/widget/alert/cant insert into validation widget"));
                return false;
              }
            }
          }
        }
        selNode = selNode.parentNode;
        if( selNode && selNode.nodeType == Node.ELEMENT_NODE && selNode.tagName == "BODY" )
        {
		  // We'll exit the loop if we have reached the BODY tag.
          break;
        }
      }
    }  
	
	return true;
};

// Determine if the selection is inside the specified node. If the IP was just before or after the opening
// tag of the widget container, the getTranslatedAttribute still returns the attributes, even if
// the container was not selected. This method helps us prevent this edge-case.
Spry.DesignTime.Editing.Utils.isFakeSelection = function (curDOM, curSel, selNode) 
{
    var isFake = false;
    var selStart, selEnd;
    selStart = curSel[0];
    selEnd = curSel[1];
    
    var matchOffsets = curDOM.nodeToOffsets(selNode);
    if ((selStart == selEnd) && ((selStart == matchOffsets[0]) || (selStart == matchOffsets[1]))) 
    {
        isFake = true;
    }
        
    return isFake;
};

// Looks for the given widget container by search for the marker
// left by the translator
Spry.DesignTime.Editing.Utils.findWidgetContainer =  function(ele, widgetId)
{
    while( ele )
	{
		//check for the mark left by translator
		var attr = ele.getTranslatedAttribute(widgetId);
		if( attr && attr.length > 0 )
			return ele;
			
		ele = ele.parentNode;
	}
	
	return ele;
};

Spry.DesignTime.Editing.Utils.getNewJSObjectName = function(widgetType, baseName)
{
  var dom = dw.getDocumentDOM();
  var objectNamesRegExp = new RegExp("\\s*.*\\s*=\\s*new\\s+" + dwscripts.escRegExpChars(widgetType) + "\\s*\\(\\s*\".+\"", "g");
  var nameRegExp1 = new RegExp("(" + baseName + "\\d+)\\s*=\\s*new\\s+" + dwscripts.escRegExpChars(widgetType), "i");
  var nameRegExp2 = new RegExp("\\s*\\(\\s*\"(" + baseName + "\\d+)", "i");
  var domSource = dom.body.innerHTML;
  var idElems = dom.body.getElementsByAttributeName("id");
  var result;
  var suffix = 1;
  var newName = baseName + suffix; 
  var arrayJSObjNames = new Array();
  
  result = domSource.match(objectNamesRegExp);
  if( result )
  {
    for( var i = 0; i < result.length; i++)
    {
      var match = result[i].match(nameRegExp1);
      var JSObjName = "";
      if( match )
      {
        JSObjName = match[1];
        arrayJSObjNames.push(JSObjName);
      }
      match = result[i].match(nameRegExp2);
      if (match && match[1] != JSObjName)
        arrayJSObjNames.push(match[1]);
    }
  }

  // Add all elements with id attribute into our search array.
  for (var i=0; i < idElems.length; i++)
  {
    currId = idElems[i].getAttribute("id");
    if (currId)
      arrayJSObjNames.push(currId);
  }
  
  if(arrayJSObjNames.length)
  {
    while(dwscripts.findInArray(arrayJSObjNames, newName) != -1)
    {
      suffix++;
      newName = baseName + suffix;
    }
  }
  return newName;
};

//When undo an insertion of a widget the widget object is not removed from the widget manager
//This function will remove any cached object that does not exists in page
Spry.DesignTime.Editing.Utils.removeCachedObjects = function(dom, widgetType)
{
  var widgetMgr;
	if( typeof (dom.Spry) == 'undefined' || 
      typeof (dom.Spry.Widgets) == 'undefined' || 
      typeof (dom.Spry.Widgets.Manager) == 'undefined' )
	{
		return;
	}

	widgetMgr = dom.Spry.Widgets.Manager;
  if( widgetMgr.widgets && widgetType )
  {
    for (var id in widgetMgr.widgets[widgetType])
    { 
      if( !dw.nodeExists(widgetMgr.widgets[widgetType][id].element) )
      {
        widgetMgr.deleteWidget(widgetType, id);
      }
    }
  }
};


// GPParserStack is a utility class used getParamsAsStrings() for
// storing the current parser context. This is necessary to track
// the nesting of braces, brackets, parens and quotes as it attempts
// to balance them while it parses its string.

var GP_PARSE_ARGLIST  = 1;
var GP_PARSE_STRING   = 2;
var GP_PARSE_BRACES   = 3;
var GP_PARSE_BRACKETS = 4;
var GP_PARSE_PARENS   = 5;

function GPParserStack()
{
	this.stack = [];
}

GPParserStack.prototype.push = function(mode, modeTerminators)
{
	var psItem = new Object;
	psItem.mode = mode;
	psItem.modeTerminators = modeTerminators;
	this.stack.push(psItem);
};

GPParserStack.prototype.pop = function() { this.stack.pop(); };
GPParserStack.prototype.length = function() { return this.stack.length; };

GPParserStack.prototype.mode = function()
{
	if (this.stack.length)
		return this.stack[this.stack.length - 1].mode;
	return -1;
};

GPParserStack.prototype.isTerminator = function(c)
{
	if (this.stack.length)
	{
		var terms = this.stack[this.stack.length - 1].modeTerminators;
		if (typeof terms != "object")
			return (c == terms);
		for (var i = 0; i < terms.length; i++)
		{
			if (c == terms[i])
				return true;
		}
	}
	return false;
};

// getParamsAsStrings:
//
// Provides support for parsing a comma separated list of parameters between
// two delimeted characters. It does this by matching up braces, brackets,
// parens, single/double quotes. It returns an array containing each parameter
// as a string.

Spry.DesignTime.Editing.Utils.getParamsAsStrings = function(str, startOffset, startDelimeter, endDelimeter, trimWhiteSpace)
{
	var args = [];
	args._offsets = [];

	if (!str || !startDelimeter || !endDelimeter)
		return args;

	var curIndex = startOffset;
	while (curIndex < str.length)
	{
		if (str[curIndex] == startDelimeter)
			break;
		++curIndex;
	}
	if (curIndex >= str.length || !str[curIndex + 1] || str[curIndex + 1] == endDelimeter)
		return args;

	var stack = new GPParserStack();
	stack.push(GP_PARSE_ARGLIST, [',', endDelimeter]);

	var argStart = curIndex+1;
	var lastIndex = str.length - 1;

	while (curIndex < lastIndex && stack.length() > 0)
	{
		c = str[++curIndex];

		switch(stack.mode())
		{
			case GP_PARSE_ARGLIST:
			{
				if (stack.length() == 1 && stack.isTerminator(c))
				{
					var pStr = str.substring(argStart, curIndex);
					if (trimWhiteSpace)
						pStr = pStr.replace(/^\s*|\s*$/, "");
					args.push(pStr);
					args._offsets.push(argStart);
					argStart = curIndex+1;
					continue;
				}
				break;
			}
			case GP_PARSE_STRING:
			{
				if (c == '\\')
					++curIndex;
				else if (stack.isTerminator(c))
					stack.pop();
				continue;
			}
			case GP_PARSE_BRACES:
			case GP_PARSE_PARENS:
			case GP_PARSE_BRACKETS:
			{
				if (stack.isTerminator(c))
				{
					stack.pop();
					continue;
				}
				break;
			}
			default:
			{
				alert("PARSE ERROR!");
				return args;
			}

		}

		switch(stack.mode())
		{
			case GP_PARSE_ARGLIST:
			case GP_PARSE_BRACES:
			case GP_PARSE_PARENS:
			case GP_PARSE_BRACKETS:
			{
				if (c == '"' || c == '\'')
					stack.push(GP_PARSE_STRING, c);
				else if (c == '[')
					stack.push(GP_PARSE_BRACKETS, ']');
				else if (c == '(')
					stack.push(GP_PARSE_PARENS, ')');
				else if (c == '{')
					stack.push(GP_PARSE_BRACES, '}');
				break;
			}
			default:
			{
				alert("PARSE ERROR!");
				return args;
			}
		}
	}

	return args;
};
