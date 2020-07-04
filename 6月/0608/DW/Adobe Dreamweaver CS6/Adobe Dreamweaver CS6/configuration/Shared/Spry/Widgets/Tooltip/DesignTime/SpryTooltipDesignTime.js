// Copyright 2008 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.Tooltip
//
// DESCRIPTION:
//   This class is used by the Tooltip property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       Tooltip(dom, objName, element, args)
//
//   Utils:
//
//       addDwEditingAttributes()
//       getId()
//       getMessageContainer (messageClass)
//       getOption(optionName, defaultValue)
//       isChildOf (parentNode, childNode)
//       isValidStructure()
//       refresh()
//       removeOption(optionName)
//       setOption(optionName, optionValue, defaultValue)
//       setOptsFromArgsArray(args)
//       setTooltipState(isEnabled)
//
//   Update widget constructor and markup:
//
//       updateId(newId)
//       updateOptions()
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.Tooltip.changeConstructorId(dom, curId, newId)
//       Spry.DesignTime.Widget.Tooltip.checkSelection()
//       Spry.DesignTime.Widget.Tooltip.isTooltipId()
//       Spry.DesignTime.Widget.Tooltip.isTriggerId()
//       Spry.DesignTime.Widget.Tooltip.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.Tooltip.getNewTooltipConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.Tooltip.getNewTooltipSnippet(id, opts, existingTag)
//       Spry.DesignTime.Widget.Tooltip.getObjectAsString(obj)
//       Spry.DesignTime.Widget.Tooltip.getTriggerSnippet(selNode)
//       Spry.DesignTime.Widget.Tooltip.insertWidgetCallback(event, constructorJS)
//       Spry.DesignTime.Widget.Tooltip.getSelectionChildrenNumber()
//       Spry.DesignTime.Widget.Tooltip.toggleTooltips()
//       Spry.DesignTime.Widget.Tooltip.getTooltipsEnabled()
//       Spry.DesignTime.Widget.Tooltip.getAllTooltips()
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   Tooltip
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the Tooltip widget in the design view. This constructor
//   is registered in the Spry Widget translator found in:
//
//       bin/Configuration/Inspectors/SpryWidget.htm
//
//   and it will automatically be invoked for any markup from page that
//   corresponds to the widget structure.
//
// ARGUMENTS:
//   dom - object - The DOM used by the document in design view.
//   objName - string - The name of the variable used within the constructor
//                      snippet that will be hold the resulting widget object.
//                      This would be the equivalent of "w1" in the following
//                      example:
//
//                          var w1 = new Spry.Widget.Tooltip('sprytextfield1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.Tooltip("sprytextfield1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'sprytooltip1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------


Spry.DesignTime.Widget.Tooltip = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 2; // Our constructor only requires an ID arg.
  this.currentState = "";
  //this.input = null;
  this.opts = {};

  this.setOptsFromArgsArray(args);
  this.addDwEditingAttributes();
    
  //show / hide tooltip
  this.setTooltipState(Spry.DesignTime.Widget.Tooltip.getTooltipsEnabled());    
  
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.Tooltip.prototype = new Spry.DesignTime.Widget.Base();

//--------------------------------------------------------------------
// FUNCTION:
//   getAssets
//
// DESCRIPTION:
//   Static function that returns the assets to be applied to page
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (array of objects)
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/Tooltip/SpryTooltip.js";
  tempObj.file = "SpryTooltip.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/Tooltip/SpryTooltip.css";
  tempObj.file = "SpryTooltip.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
};

//--------------------------------------------------------------------
// FUNCTION:
//   addDwEditingAttributes
//
// DESCRIPTION:
//   This marks important containers as "nosplit" and "usebr" so dreamweaver will
//   insert br's for new lines instead of spliting the spans and wraping them with p tags
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.addDwEditingAttributes = function()
{
  if (this.element )
  {
    // Never split the tag.    
    this.element.setTranslatedAttribute("dwedit:nosplit", "nosplit");
    // For spans, always use br instead of p for new lines.    
    if( this.element.nodeName == "SPAN" ) {
      this.element.setTranslatedAttribute("dwedit:usebr", "usebr");
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getMessageContainer
//
// DESCRIPTION:
//   This function returns the container for the error message by its class name.
//   The message container is considered the SPAN element having the specified
//   class attribute on it.
//
// ARGUMENTS:
//   messageClass - string - value of css class attribute
//
// RETURNS:
//   The DOM element whose class attribute equals the messageClass parameter, or null
//   if no element is found.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.getMessageContainer = function (messageClass)
{
  var messageContainer = null;

  var elems = this.element.getElementsByAttributeName("class");
  for (var i=0; i<elems.length; i++)
  {
    if (elems[i].getAttribute && (this.hasClassName(elems[i], messageClass)))
    {
      if (this.isChildOf(this.element, elems[i]))
      {
        messageContainer = elems[i];
        break;
      }
    }
  }

  return messageContainer;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isChildOf
//
// DESCRIPTION:
//   This function checks to see whether the given parentNode have the childNode
//   as a child of it.
//
// ARGUMENTS:
//   parentNode - object - DOM object
//   childNode - object - DOM object
//
// RETURNS:
//   True if the second parameter is a child of first parameter, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.isChildOf = function (parentNode, childNode)
{
  var isChild = false;
  var canContinue = true;

  while (canContinue && !isChild)
  {
    if (parentNode == childNode)
    {
      isChild = true;
    }
    else
    {
      if (!childNode || !childNode.tagName || !childNode.tagName.toLowerCase || childNode.tagName.toLowerCase() == "body")
      {
        canContinue = false;
      }
      else
      {
        childNode = childNode.parentNode;
      }
    }
  }

  return isChild;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTriggerSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for the widget's form control.
//
// ARGUMENTS:
//   selection - object - Current selection object
//   triggerId - string - The generated next trigger ID
//   -  if left blank, it means that we'll have to set the ID attribute 
//      of the existing tag instead of generating a new tag
//
// RETURNS:
//   String that is the HTML markup for the widget's form control.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getTriggerSnippet = function(triggerId)
{
  dwscripts.fixUpSelection(dom, false, false);    
  var dom = dw.getDocumentDOM();	
  var selection = dom.getSelection();  
  var selNode = dom.offsetsToNode(selection[0],selection[1]);
  
  var tagStr = '';

  // If there is some selection in page, try to put the selection on that 
  
  if(selection[0] != selection[1])
  {
    //we have a text node
    if(selNode && selNode.nodeType == Node.TEXT_NODE)
    {
      tagStr = '<span id="' + triggerId + '">' + dom.source.getText(selection[0],selection[1]) + '</span>';   
    }
    //for elements, we'll have to set the ID if not already defined
    //we don't do it here because this would generate an unwanted undo level
  }
  //we have no selection, just add a default tag as trigger
  else
  {
    tagStr = '<span id="' + triggerId + '">' + dw.loadString("spry/widgets/Tooltip/defaultMessageTrigger") + '</span>';
  }
  return tagStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewTooltipSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete Tooltip widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   opts - object - options used to generate widget main container.
//   existingTag - string - HTML markup for the widget's form control.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getNewTooltipSnippet = function(id /*opts, trigger, existingTag*/)
{
  var tooltipSnippet = "";
  tooltipSnippet +=  '<div class="tooltipContent" id="' + id + '">' + dw.loadString("spry/widgets/Tooltip/defaultMessageTooltip") + '</div>';

  return tooltipSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewTooltipConstructorSnippet
//
// DESCRIPTION:
//   Static utility function that returns the JS code for widget constructor.
//
// ARGUMENTS:
//   id - string - The id of the widget markup to insert into the
//                 constructor snippet.
//   opts - object - This object will be serialized to a string that will be used
//                   to pass arguments to the widget constructor.
//
// RETURNS:
//   The JS code for the widget constructor.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getNewTooltipConstructorSnippet = function(id, trigger, opts)
{
  var strOptions = Spry.DesignTime.Widget.Tooltip.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (', ' + strOptions) : "";  
  if (typeof(trigger) == "undefined") 
{
    trigger = "";
  }  
  else
  {
    trigger = '#' + trigger;
  }
  
  return 'var ' + id + ' = new Spry.Widget.Tooltip("' + id + '", "' + trigger + '"' + extra + ');';
};

//--------------------------------------------------------------------
// FUNCTION:
//   getOption
//
// DESCRIPTION:
//   This method returns the value of the given property from the widget's options
//   object. If such a property cannot be found and a default value has been
//   specified instead, we'll return the default value. Otherwise, if neither
//   value was found not default message was specified, we'll simply return undefined.
//
// ARGUMENTS:
//   optionName - string - One of the widget's constructor options.
//   defaultValue - string or numeric - Value that is suplied in case the opts
//                          object does not contains a value for optionName key.
//
// RETURNS:
//   The option value in case that value exist or the defaultValue parameter otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.getOption = function(optionName, defaultValue)
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
//   The function returns the operation status (true for successfull, false otherwise).
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.setOption = function(optionName, optionValue, defaultValue)
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

Spry.DesignTime.Widget.Tooltip.prototype.removeOption = function(optionName)
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
//   updateOptions
//
// DESCRIPTION:
//   This function writes back to the page the current options form this.opts
//   object ignoring the ones not being set.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.updateOptions = function()
{
  this.updateConstructorOptions("Spry.Widget.Tooltip", this.numReqCArgs, this.opts);
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAllIds
//
// DESCRIPTION:
//   This function returns all the IDs in user's page, prepended with a #
//
// ARGUMENTS:
//   excludeId - string - exclude this ID
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.getAllIds = function(excludeId)
{
  var myids = new Array();
  var dom = dw.getDocumentDOM();
  var elems = dom.getElementsByAttributeName("id");
  for (var i=0; i<elems.length; i++)
  {
    var crt = elems[i].getAttribute('id');
    if(crt != excludeId)
    {
      myids.push('#' + crt);
    }
  }
  
  //sort them alphabetically
  myids.sort();
  
  return myids;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isValidStructure
//
// DESCRIPTION:
//   This function validates the current DOM structure of the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if structure is valid false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.isValidStructure = function()
{
  var retValue = false;
  this.ensureValidElements();
 
  //must not be empty and have an id atribute
  if( this.element.hasChildNodes() && this.element.getAttribute("id")){
        retValue = true;
    }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTriggerElement
//
// DESCRIPTION:
//   This function extracts the trigger element ID from the constructor
//   JS code.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   String - The trigger ID.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.getTriggerElement = function()
{
  var triggerElement = "";
  var matches;
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\(\\s*?[\"']" + dwscripts.escRegExpChars(this.getId()) + "[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");
  var scriptTags = this.dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    matches = scriptTags[i].innerHTML.match(updateConstructorRegEx);
    if( matches && matches[1] )
    {
      triggerElement = matches[1];
    }
  }

  if(triggerElement[0]=='#')
  triggerElement = triggerElement.substr(1);  
    
  return triggerElement;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setTriggerElement
//
// DESCRIPTION:
//   This function updates the widget's trigger
//
// ARGUMENTS:
//   newID - string - control ID type.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.setTriggerElement = function(newID)
{
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\(\\s*?[\"']" + dwscripts.escRegExpChars(this.getId()) + "[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");
  var scriptTags = this.dom.getElementsByTagName("script");
  
  for( var i = 0; i < scriptTags.length; i++ )
  {
    if( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
    {
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, "Spry.Widget.Tooltip(\"" + this.getId() + "\", \"" + newID + "\"");
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSelectionChildrenNumber
//
// DESCRIPTION:
//   Static function that counts the children elements contained in 
//   the current selection
//
// ARGUMENTS:
//  NONE
//
// RETURNS:
//   Integer - the number of children
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getSelectionChildrenNumber =  function()
{
  var dom = dw.getDocumentDOM();
  var sel = dom.getSelection();

  //get selection
  var outerSelection = dom.source.getText(sel[0],sel[1]);

  //construct a new temporary DOM
  var newDom = dw.getNewDocumentDOM();
  newDom.documentElement.outerHTML = "<body>" + outerSelection + "</body>";
  
  //count its children
  var tag = newDom.getElementsByTagName("body")[0];
  return tag.childNodes.length;
}

//--------------------------------------------------------------------
// FUNCTION:
//   checkSelection
//
// DESCRIPTION:
//   Static function that checks the given selection to see if it is valid:
//   no multiple sibling tags, selection restricted to BODY tag, allowed parent tag
//
// ARGUMENTS:
//   selection - the selection object
//
// RETURNS:
//   0 if the selection is valid 
//   error code if the selection is not valid: 
//  - NOT_ALLOWED = the selecetd tag does not allow a tooltip
//  - MULTIPLE_TAGS = the selection contains multiple tags
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.checkSelection = function()
{
  var dom = dw.getDocumentDOM();  
  dwscripts.fixUpSelection(dom, false, false);    
  var selection = dom.getSelection();
  var invalidTags = ['html','body','head','title','meta','link','script'];      
  var selNode = dom.offsetsToNode(selection[0],selection[1]);       
  var isCursor = (selection[0]==selection[1]);
  var isChildOfBody = Spry.DesignTime.Widget.Tooltip.isDirectChildOfBody(selNode);
  
  //check multiple sibling tags
  var numTags = Spry.DesignTime.Widget.Tooltip.getSelectionChildrenNumber();
  if(numTags > 1)
  {
    return 'MULTIPLE_TAGS';
  }          
    
  //for text nodes, get its parent       
  if(selNode && selNode.nodeType == Node.TEXT_NODE)
  {
    if(selNode.parentNode)
    {
      selNode = selNode.parentNode;
    }
  }
  
  if (selNode && selNode.nodeType == Node.ELEMENT_NODE)
        {
    var tagLower = selNode.tagName.toLowerCase();
    //check allowed tags 
    if (dwscripts.findInArray(invalidTags, tagLower) >= 0)
    {
      //prevent transforming the body tag itself      
      if(!isChildOfBody || !isCursor)
      {
        return 'NOT_ALLOWED';
      }
    }
        
    //don't allow insertion on another tooltip or trigger tag
    if(Spry.DesignTime.Widget.Tooltip.isTooltipId(selNode))
    {
      return 'IN_TOOLTIP';
    }
    if(Spry.DesignTime.Widget.Tooltip.isTriggerId(selNode))
    {
      return 'IN_TRIGGER';
    }
  }
  else
  {
    return 'NOT_ALLOWED';    
  }

  return 0;
};


//--------------------------------------------------------------------
// FUNCTION:
//   isDirectChildOfBody
//
// DESCRIPTION:
//   Static function that checks the selected node is a direct child of the BODY tag
//
// ARGUMENTS:
//   selNode - the selected node
//
// RETURNS:
//   true if the node is a direct child of body, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.isDirectChildOfBody = function(selNode)
{
  if (selNode.tagName && selNode.tagName.toLowerCase()=='body')
  {
    return true;
  }

  if(selNode.parentNode && selNode.parentNode.tagName && selNode.parentNode.tagName.toLowerCase()=='body')
  {
    return true;
  }
  return false;
}

//--------------------------------------------------------------------
// FUNCTION:
//   isTooltipId
//
// DESCRIPTION:
//   Static function that checks if the given node is a tooltip
//
// ARGUMENTS:
//   node - the node object
//
// RETURNS:
//   true if the node is a tootip, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.isTooltipId = function(node)
{
  var tooltipId = node.id;  
  if(!tooltipId)
  {
    return false;
  }
  var dom = dw.getDocumentDOM();        
    
  //find this id in the constructors in this page  
  var constructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\(\\s*?[\"']" + dwscripts.escRegExpChars(tooltipId) + "[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");  
  var scriptTags = dom.getElementsByTagName("script"); 
  for(var i = 0; i < scriptTags.length; i++ )
  {
    if(scriptTags[i].innerHTML.match(constructorRegEx))
    {
      return true;
    }
  }   
  return false;      
}

//--------------------------------------------------------------------
// FUNCTION:
//   isTriggerId
//
// DESCRIPTION:
//   Static function that checks if the given node is a trigger
//
// ARGUMENTS:
//   node - the node object
//
// RETURNS:
//   true if the node is a tootip, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.isTriggerId = function(node)
{
  var triggerId = node.id;
  if(!triggerId)
  {
    return false;
  }
  var dom = dw.getDocumentDOM();    
    
  //find this id in the constructors in this page  
  var constructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\(\\s*?[\"'](.*?)[\"']\\s*,\\s*[\"']#" + dwscripts.escRegExpChars(triggerId) + "[\"']?");  
  var scriptTags = dom.getElementsByTagName("script"); 
  for(var i = 0; i < scriptTags.length; i++ )
  {
    if(scriptTags[i].innerHTML.match(constructorRegEx))
    {
      return true;
    }
  }   
  return false;      
}

//--------------------------------------------------------------------
// FUNCTION:
//   refresh
//
// DESCRIPTION:
//   Syncs up the internal state of the design-time widget object
//   with the markup and constructor snippet that currently exists
//   in the design view.
//
//   This method gets called from the translator if a design-time
//   object already exists for a specific widget ID.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.refresh = function()
{
  var curState = this.currentState;
  this.ensureValidElements();

  // Reinitialize options object.
  this.opts = {};

  // Start with user options
  // First get options from page to make shure options are not cached.
  var args = this.getConstructorArgs("Spry.Widget.Tooltip");
  this.setOptsFromArgsArray(args);

  this.addDwEditingAttributes();
  this.setTooltipState(Spry.DesignTime.Widget.Tooltip.getTooltipsEnabled());
};

//--------------------------------------------------------------------
// FUNCTION:
//   getId
//
// DESCRIPTION:
//   Getter for the widget ID.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Widget ID.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.getId = function()
{
  return this.element_id;
};

//--------------------------------------------------------------------
// FUNCTION:
//   updateId
//
// DESCRIPTION:
//   Called when the user changes the id attribute of the widget's
//   top-level element. This function searches through all script
//   tags in the document for constructor calls that use the old
//   widget ID and modifies them to use the newId.
//
// ARGUMENTS:
//   newId - string - The new element ID to use for the widget.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.prototype.updateId = function(newId)
{
  // Set our elements id first.
  this.element.id = newId;
  var oldId = this.element_id;
  this.element_id = newId;

  // Update constructor.
  Spry.DesignTime.Widget.Tooltip.changeConstructorId(this.dom, oldId, newId);

  // Make sure why have the correct old element.
  this.ensureValidElements();
};


//--------------------------------------------------------------------
// FUNCTION:
//   setTooltipState
//
// DESCRIPTION:
//   Internal utility function for setting up a a tooltip look and feel.
//
// ARGUMENTS:
//   isEnabled - whether the tooltip should be enabled
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.prototype.setTooltipState = function(isEnabled)
{
  if(this.element){            
    //toggle display
    if(isEnabled)
    {
      this.element.translatedStyle.display = 'block';
    }
    else
    {
      this.element.translatedStyle.display = 'none';                
    }

    //if trigger exists, get its position and position tooltip absolutely next to it
    //DW does not currently support properties like offsetTop, offsetLeft, offsetParent etc
    //top and left are defined only for absolute / relative positioned elements
  }
};


//--------------------------------------------------------------------
// FUNCTION:
//   getInsertWidgetCallback
//
// DESCRIPTION:
//   Called from the generic translator to insert custom constructor on cut / paste
//   The function updates a constructor with the new ID and removes the trigger
//
// ARGUMENTS:
//   constructorJS - string - The JS constructor that would normally be inserted
//   widgetId - string  - the new generated widgetId
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.getInsertWidgetCallback = function(constructorJS, widgetId)
{

  return function(e)
  {      
    var targetDom = e.target.ownerDocument;	
    var newId = e.target.id;
    var newConJs = constructorJS;
  
    var assetList = new Array();
        
    // Construct the assets list using the array of assets returned by the static getAssets() function
    var assets = Spry.DesignTime.Widget.Tooltip.getAssets();
    for (var i=0; i<assets.length; i++)
    {
      assetInfo = new AssetInfo(assets[i].fullPath, assets[i].file, assets[i].type);
      assetList.push(assetInfo);
    }
    if (assetList && assetList.length)
    {
      targetDom.copyAssets(assetList);
    }

    //id got renamed on paste, update our constructor
    var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\(\\s*?[\"'](.*?)[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");
    if(newId && newId != widgetId ){
      newConJs = newConJs.replace(widgetId, newId, "gm" );
    }
    newConJs = newConJs.replace(updateConstructorRegEx, "Spry.Widget.Tooltip(\"" + newId + "\", \"\"");
    targetDom.addJavaScript(newConJs, false); 
  };
}



//--------------------------------------------------------------------
// FUNCTION:
//   getFirstChildWithNodeNameAtAnyLevel
//
// DESCRIPTION:
//   This function search inside the "node" element for "nodeName" elements
//   and returns the first occurence of that element.
//
// ARGUMENTS:
//   node - object - DOM element in wich the "nodeName" element will be searched
//   nodeName - string - DOM element tag name
//
// RETURNS:
//   First finded element or null if no element is finded.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) 
{
  var elements  = node.getElementsByTagName(nodeName);
  if (elements) {
    return elements[0];
  }
  return null;
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
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Tooltip.changeConstructorId = function(dom, curId, newId)
{
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.Tooltip\\s*?\\(\\s*?[\"']" + dwscripts.escRegExpChars(curId) + "[\"']");
  var scriptTags = dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    if( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, "Spry.Widget.Tooltip(\"" + newId + "\"");
  }
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

Spry.DesignTime.Widget.Tooltip.getObjectAsString = function(obj)
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
//   getTooltipsEnabled
//
// DESCRIPTION:
//   Static utility function that gets the Tooltip visibility status from Preferences
//
// ARGUMENTS:
//   force boolean - if any tooltip is shown, force "enabled " state
//
// RETURNS:
//  True if tooltips are enabled, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.getTooltipsEnabled = function(force)
{
  //get data from Preferences, allowing default
  var tooltipsEnabledReg = 1;
  var tooltipsEnabledReg = dreamweaver.getPreferenceInt("Spry.Widget.Tooltip", "tooltipsEnabled", tooltipsEnabledReg);
  var anyWidgetShown = false;
          
  //if any widget is present and shown, return true and update Preferences
  if(force===true)
  {
     var theDOM = dw.getDocumentDOM();
     var tooltips = Spry.DesignTime.Widget.Tooltip.getAllTooltips();
     
     if(tooltips.length > 0)
     {     
       for (var i=0 ; i < tooltips.length ; i++)
       {
         if(tooltips[i].translatedStyle.display=='block')
         {
           anyWidgetShown = true;
           break;
         } 
       }          
          
       if(anyWidgetShown)
         tooltipsEnabledReg = 1;
       else
         tooltipsEnabledReg = 0;   
               
       //save data to Preferences
       dreamweaver.setPreferenceInt("Spry.Widget.Tooltip", "tooltipsEnabled", tooltipsEnabledReg);   
     }
  }
          
  var tooltipsEnabled = (tooltipsEnabledReg == 1 ? true: false)
  return tooltipsEnabled;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAllTooltips
//
// DESCRIPTION:
//   Static utility function that gets all the tooltips in page
//   The function actually looks in the actual DOM and does not use the widget manager
//   in order to reflect the latest undo/redo changes     
// ARGUMENTS:
//   None.
//
// RETURNS:
//   widgets - array - Array of widget elements 
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.getAllTooltips = function ()
{
  var theDOM = dw.getDocumentDOM();    
  var tooltips = [];  
  var allIds = theDOM.getElementsByAttributeName("id");   
  for (var i=0 ; i < allIds.length ; i++)
  {
    var el = allIds[i]; 
    if(el && Spry.DesignTime.Widget.Tooltip.isTooltipId(el))
    {
      tooltips.push(el);
    }
  }  
  return tooltips;
}

//--------------------------------------------------------------------
// FUNCTION:
//   toggleTooltips
//
// DESCRIPTION:
//   Static utility function used to toggle all tooltips visibility status
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.Widget.Tooltip.toggleTooltips = function(){
  var theDOM = dw.getDocumentDOM();
  var tooltips = Spry.DesignTime.Widget.Tooltip.getAllTooltips();
  var tooltipsEnabled = Spry.DesignTime.Widget.Tooltip.getTooltipsEnabled();
  
  for (var i=0 ; i < tooltips.length ; i++)
  {
    var el = tooltips[i];
    if(tooltipsEnabled)
      el.translatedStyle.display = 'none';
    else
      el.translatedStyle.display = 'block'; 
  }
  
  var tooltipsEnabledReg = tooltipsEnabled  ? 0 : 1;    
  //save data to Preferences
  dreamweaver.setPreferenceInt("Spry.Widget.Tooltip", "tooltipsEnabled", tooltipsEnabledReg);            
}