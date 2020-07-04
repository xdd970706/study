// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.ValidationSelect
//
// DESCRIPTION:
//   This class is used by the ValidationSelect property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       ValidationSelect(dom, objName, element, args)
//
//   Utils:
//
//       addDwEditingAttributes()
//       checkStateAvailability(stateName)
//       getDisplayedState()
//       getErrorMessages()
//       getMessagesContainer()
//       getOption(optionName, defaultValue)
//       getStatesLabels()
//       getStatesValues()
//       inspectSelectControl()
//       isDuplicateControl()
//       isMultiSelect()
//       isValidStructure()
//       refresh()
//       removeOption(optionName)
//       setDisplayedState(stateName)
//       setOption(optionName, optionValue, defaultValue)
//
//
//   Update widget constructor and markup:
//
//       addWidgetMessage(messageID)
//       removeWidgetMessage(messageID)
//
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.ValidationSelect.getErrorMessageSrc(messageClass, message)
//       Spry.DesignTime.Widget.ValidationSelect.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.ValidationSelect.getNewWidgetConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.ValidationSelect.getNewWidgetSnippet(id, tagStr)
//       Spry.DesignTime.Widget.ValidationSelect.getTagSnippet(id, selNode)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ValidationSelect
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the ValidationSelect widget in the design view. This constructor
//   is registered in the Spry Widget translator found at:
//
//       Configuration/Translators/SpryWidget.htm
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
//                          var w1 = new Spry.Widget.ValidationSelect('spryselect1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.ValidationSelect("spryselect1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'spryselect1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.opts = {};
  this.tagName = "SELECT";
  this.currentState = "";
  this.typeAttribute = null;
  this.typeAttributeValue = null;
  this.requiredClass = "selectRequiredState";
  this.invalidClass = "selectInvalidState";
  this.focusClass = "selectFocusState";
  this.validClass = "selectValidState";

  this.widgetStates = {
    isRequired: {
      displayName: dw.loadString("spry/widget/Validation/label/required"),
      stateClass: "requiredClass",
      messageClass: "selectRequiredMsg",
      defaultMsgLocation: dw.loadString("spry/widgets/ValidationSelect/required message"),
      availability: "isRequired"
    },
    invalidValue: {
      displayName: dw.loadString("spry/widget/Validation/label/invalid"),
      stateClass: "invalidClass",
      messageClass: "selectInvalidMsg",
      defaultMsgLocation: dw.loadString("spry/widgets/ValidationSelect/invalid message"),
      availability: "invalidValue"
    },
    valid: {
      displayName: dw.loadString("spry/widget/Validation/label/valid"),
      stateClass: "validClass",
      messageClass: "selectValidMsg",
      defaultMsgLocation: "",
      availability: "valid"
    }
  };

  this.setOptsFromArgsArray(args);

  // Just search for the appropriate SELECT control within the container.
  this.inspectSelectControl();

  this.addDwEditingAttributes();
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.ValidationSelect.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to ValidationSelect for our newly created prototype
// object so callers know that our object was created with the ValidationCheckbox constructor.
Spry.DesignTime.Widget.ValidationSelect.prototype.constructor = Spry.DesignTime.Widget.ValidationSelect;

//--------------------------------------------------------------------
// FUNCTION:
//   inspectSelectControl
//
// DESCRIPTION:
//   This function searches for the appropriate SELECT form control within the
//   widget container, and assign that object to the this.selectElement property.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.inspectSelectControl = function()
{
  if (this.element) {
    if (this.element.nodeName == "SELECT") {
      this.selectElement = this.element;
    } else {
      this.selectElement = Spry.DesignTime.Widget.ValidationSelect.getFirstChildWithNodeNameAtAnyLevel(this.element, "SELECT");
    }
  }
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

Spry.DesignTime.Widget.ValidationSelect.prototype.addDwEditingAttributes = function()
{
  if (this.element )
  {
    this.element.setTranslatedAttribute("dwedit:nosplit", "nosplit");
    if( this.element.nodeName == "SPAN" ) {
      this.element.setTranslatedAttribute("dwedit:usebr", "usebr");
    }
  }

  var containers = this.getErrorMessages();
  if( !containers ) {
    return;
  }

  for(var i = 0; i < containers.length ; i++ )
  {
    var ele = containers[i];
    if( !ele ) {
      continue;
    }

    // Never split the tag.
    ele.setTranslatedAttribute("dwedit:nosplit", "nosplit");
    // For spans, always use br instead of p for new lines.
    if(ele.nodeName == "SPAN") {
      ele.setTranslatedAttribute("dwedit:usebr", "usebr");
    }
  }
};

///////////////////////////////////////////////////////////////////////////////
// Static methods
////////////////////////////////////////////////////////////////////////////////

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

Spry.DesignTime.Widget.ValidationSelect.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationSelect/SpryValidationSelect.js";
  tempObj.file = "SpryValidationSelect.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationSelect/SpryValidationSelect.css";
  tempObj.file = "SpryValidationSelect.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTagSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for the widget's form control.
//
// ARGUMENTS:
//   id - string - The value for the control id attribute.
//   selNode - object - Selected node in page.
//
// RETURNS:
//   String that is the HTML markup for the widget's form control.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.getTagSnippet = function(id, selNode)
{
  var tagStr;
  var controlName = dwscripts.getUniqueNameForTag("select", "select");

  // If there is some selection in page, check to see if it's our control node, if so include the selection in the returned string.
  if( selNode && selNode.nodeType == Node.ELEMENT_NODE && selNode.tagName == "SELECT" )
  {
    if( selNode.parentNode && selNode.parentNode.nodeType == Node.ELEMENT_NODE && selNode.parentNode.tagName == "LABEL" )
    {
      tagStr = selNode.parentNode.outerHTML;
    }
    else
    {
      tagStr = selNode.outerHTML;
    }
  }
  else
  {
    // If no selection or the selection is not our tag control just add a control tag.
    tagStr = '<select name="' + controlName + '" id="' + controlName + '">';
    tagStr += '</select>';
  }

  return tagStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewWidgetSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete ValidationSelect widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's container id attribute.
//   tagStr - string - HTML markup for the widget's form control.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.getNewWidgetSnippet = function(id, tagStr)
{
  var widgetSnippet = '<span id="' + id + '">';
  var errorMsgs = Spry.DesignTime.Widget.ValidationSelect.getErrorMessageSrc("selectRequiredMsg", dw.loadString("spry/widgets/ValidationSelect/required message"));
  var formRegExp = /(<form[^>]*?>[\r\n\s\t]*<p>|<form[^>]*?>)([\w\W]*?)(<\/p>[\r\n\s\t]*<\/form>|<\/form>)/i;
  var selectRegExp = /<select[^>]*?>[\w\W]*?<\/select>/i;

  // Select tag not present; return empty string.
  if ( !tagStr.match(selectRegExp) )
    return "";

  if( tagStr.match(formRegExp) )
  {
    // If form tag is found, put the widget inside the form tag.
    widgetSnippet = tagStr.replace(formRegExp, "$1" + widgetSnippet + "$2" + errorMsgs + "</span>$3");
  }
  else
  {
    // Just insert the tag inside the widget.
    widgetSnippet += tagStr;
    widgetSnippet += errorMsgs;
    widgetSnippet += "</span>";
  }

  return widgetSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getFirstChildWithNodeNameAtAnyLevel
//
// DESCRIPTION:
//   This function returns the first element (given by its tag name) at any depth
//   level within "node" DOM element.
//
// ARGUMENTS:
//   node - object - DOM element inside of which the specified node will be searched.
//   nodeName - string - name of the element that needs to be finded
//
// RETURNS:
//   First finded element or null.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) {
  var elements  = node.getElementsByTagName(nodeName);
  if (elements) {
    return elements[0];
  }
  return null;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewWidgetConstructorSnippet
//
// DESCRIPTION:
//   Static utility function that returns the JS code for the widget constructor.
//
// ARGUMENTS:
//   id - string - The id attribute of the widget main container. This will be
//                 the first parameter of the constructor JS code
//   opts - object - This object will be serialized as a string and inserted as
//                   parameters for the constructor JS code.
//
// RETURNS:
//   The JS code for the widget constructor that needs to be inserted in page.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.getNewWidgetConstructorSnippet = function(id, opts)
{
  var strOptions = Spry.DesignTime.Widget.Base.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (', ' + strOptions) : "";
  return 'var ' + id + ' = new Spry.Widget.ValidationSelect("' + id + '"' + extra + ');';
};

//--------------------------------------------------------------------
// FUNCTION:
//   isMultiSelect
//
// DESCRIPTION:
//   This function looks for the "multiple" property of the inner SELECT tag.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if the "multiple" attribute is present, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.isMultiSelect = function()
{
  var isMulti = false;

  this.inspectSelectControl();
  if (this.selectElement && this.selectElement.getAttribute)
  {
    if (this.selectElement.getAttribute("multiple"))
    {
      isMulti = true;
    }
  }

  return isMulti;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isDuplicateControl
//
// DESCRIPTION:
//   This function check to see if inside the widget main container exists more
//   than one SELECT form element.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if more than one SELECT form control is finded inside the current widget, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.isDuplicateControl = function()
{
  var isDuplicate = false;

  if( this.element && this.element.getElementsByTagName )
  {
    var arrElements = this.element.getElementsByTagName("SELECT");
    if( arrElements )
      isDuplicate = arrElements.length > 1;
  }

  return isDuplicate;
};

//--------------------------------------------------------------------
// FUNCTION:
//   addWidgetMessage
//
// DESCRIPTION:
//   This function inserts markup for the specified message.
//
// ARGUMENTS:
//   messageID - string - Widget state identifier, which is a key in the
//                        this.widgetStates object.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.addWidgetMessage = function(messageID)
{
  var containerSnippet = Spry.DesignTime.Widget.ValidationSelect.getErrorMessageSrc(this.widgetStates[messageID].messageClass, this.widgetStates[messageID].defaultMsgLocation);
  var errNodeExists = false;
  var msgsContainer;

  this.ensureValidElements();
  msgsContainer = this.getMessagesContainer();

  if( msgsContainer )
  {
    // Find specified message container.
    for( var i = 0; i < msgsContainer.childNodes.length; i++ )
    {
      if( msgsContainer.childNodes[i].nodeType == Node.ELEMENT_NODE )
      {
        var classAttribute = msgsContainer.childNodes[i].getAttribute("class");
        if( classAttribute && classAttribute.indexOf(this.widgetStates[messageID].messageClass) != -1 )
        {
          errNodeExists = true;
          break;
        }
      }
    }
  }

  if( !errNodeExists )
  {
    // Insert new span container right after the control.
    if( (!msgsContainer || msgsContainer == this.element) && this.element.tagName != this.tagName )
    {
      var controlTag;
      var elTags = this.element.getElementsByTagName(this.tagName);

      if( elTags )
      {
        if( this.typeAttribute )
        {
          for( var i = 0; i < elTags.length; i++ )
          {
            if( elTags[i].getAttribute(this.typeAttribute) == this.typeAttributeValue )
            {
              controlTag = elTags[i];
              break;
            }
          }
        }
        else
        {
          controlTag = elTags[0];
        }
      }

      if( controlTag )
      {
        // See if control is inside a label tag.
        if( controlTag.parentNode &&
            controlTag.parentNode.nodeType == Node.ELEMENT_NODE &&
            controlTag.parentNode.tagName == "LABEL" )
        {
          controlTag.parentNode.outerHTML += containerSnippet;
        }
        else
        {
          controlTag.outerHTML += containerSnippet;
        }
      }
    }
    else if( msgsContainer )
    {
      // Insert new span at the end of the messages container.
      msgsContainer.innerHTML += containerSnippet;
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   removeWidgetMessage
//
// DESCRIPTION:
//   This function is used to remove the error message for a given state from
//   the widget container. If such a message was found it performs a simple check
//   to see whether the message we are about to delete is the same as default
//   message. If not, we'll gonna ask the user for its confirmation on message
//   removal.
//
// ARGUMENTS:
//   messageID - string - Widget state identifier, which is a key in the
//                        this.widgetStates object.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.removeWidgetMessage = function(messageID)
{
  var msgsContainer;
  var msgNode;
  var removeIt = false;

  this.ensureValidElements();
  msgsContainer = this.getMessagesContainer();
  if( msgsContainer )
  {
    // Find specified message container.
    for( var i = 0; i < msgsContainer.childNodes.length; i++ )
    {
      if( msgsContainer.childNodes[i].nodeType == Node.ELEMENT_NODE )
      {
        var classAttribute = msgsContainer.childNodes[i].getAttribute("class");
        if( classAttribute && classAttribute.indexOf(this.widgetStates[messageID].messageClass) != -1 )
        {
          msgNode = msgsContainer.childNodes[i];
          break;
        }
      }
    }
  }

  if( msgNode )
  {
    var originalMessage = msgNode.innerHTML;
    if( originalMessage )
    {
      // Remove white characters from the begin and at the end of the current message
      // those characters may be inserted when the source code is formated.
      originalMessage = originalMessage.replace(/^[ \t\r\n]*/g, '').replace(/[ \t\r\n]*$/g, '');
    }
    if( originalMessage == this.widgetStates[messageID].defaultMsgLocation && msgNode.attributes.length == 1 )
    {
      removeIt = true;
    }
    else
    {
      // Error message was changed. We'll ask the user before removal.
      var confirmMsg = dwscripts.sprintf(dw.loadString("spry/widget/Validation/alert/confirm/remove message"), this.widgetStates[messageID].displayName);
      if (dwscripts.askYesNo(confirmMsg, MM.BTN_Yes) === 0) {
        removeIt = true;
      }
    }
    if( removeIt )
    {
      // Remove the message container.
      msgNode.outerHTML = '';
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getErrorMessages
//
// DESCRIPTION:
//   This function returns an array of DOM elements. These elements are the containers
//   for error messages from within the current widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of DOM elements.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.getErrorMessages = function()
{
  var messagesArray = new Array();
  var containerOffsets = this.dom.nodeToOffsets(this.element);
  var errNodeList = this.dom.getElementsByAttributeName("class");

  if( errNodeList )
  {
    for( var i = 0; i < errNodeList.length; i++ )
    {
      var classAttribute = errNodeList[i].getAttribute("class");
      if( classAttribute )
      {
        for( stateName in this.widgetStates )
        {
          if( classAttribute.indexOf(this.widgetStates[stateName].messageClass) != -1 )
          {
            var elOffsets = this.dom.nodeToOffsets(errNodeList[i]);

            if( elOffsets[0] > containerOffsets[0] &&
                elOffsets[1] < containerOffsets[1] &&
                errNodeList[i].parentNode &&
                errNodeList[i].parentNode.nodeType == Node.ELEMENT_NODE )  // Make sure the node is inside this widget.
            {
              messagesArray.push(errNodeList[i]);
            }
          }
        }
      }
    }
  }

  return messagesArray;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getMessagesContainer
//
// DESCRIPTION:
//    This function finds and returns messages’ container.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   The DOM element in which are located all widget messages.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.getMessagesContainer = function()
{
  var retNode = null;
  var messagesArray = this.getErrorMessages();

  if (messagesArray && messagesArray[0])
  {
    retNode = messagesArray[0].parentNode;
  }

  return retNode;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getStatesLabels
//
// DESCRIPTION:
//   This function returns the available states' labels for the current widget configuration.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.getStatesLabels = function()
{
  var labels = new Array();

  labels.push(dw.loadString("spry/widget/Validation/label/initial"));
  for (var i in this.widgetStates)
  {
    if (this.checkStateAvailability(i))
    {
      labels.push(this.widgetStates[i].displayName);
    }
  }
  return labels;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getStatesValues
//
// DESCRIPTION:
//   This function returns the available states' values for the current widget configuration.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.getStatesValues = function()
{
  var values = new Array();

  values.push("");
  for (var i in this.widgetStates)
  {
    if (this.checkStateAvailability(i))
    {
      values.push(this.widgetStates[i].availability);
    }
  }

  return values;
};

//--------------------------------------------------------------------
// FUNCTION:
//   checkStateAvailability
//
// DESCRIPTION:
//   This function checks the message availability according to the current type
//   and any other factors (like required checkbox being checked etc.)
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   True if the state make sense in current context false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.checkStateAvailability = function(stateName)
{
  var availability = false;
  var stateObj = this.widgetStates[stateName];

  if( stateObj )
  {
    if( stateObj.availability == "isRequired" )
    {
      if( typeof this.opts[stateObj.availability] == "undefined" )
      {
        availability = true;
      }
    }
    else
    {
      if( stateObj.availability == "valid" || typeof this.opts[stateObj.availability] != "undefined" )
      {
        availability = true;
      }
    }
  }

  return availability;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDisplayedState
//
// DESCRIPTION:
//   This function displays in design view the state specified by stateName parameter.
//   In case of an empty state name we'll hide the current state instead.
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.setDisplayedState = function(stateName)
{
  if( stateName && this.widgetStates[stateName] )
  {
    this.element.translatedClassName = (this.element.className ? " " : "") + this[this.widgetStates[stateName].stateClass];
    this.currentState = stateName;
  }
  else
  {
    this.element.removeTranslatedAttribute("class");
    this.currentState = "";
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDisplayedState
//
// DESCRIPTION:
//   This function returns the current displayed state name (if any).
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   State name string.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.prototype.getDisplayedState = function()
{
  var retValue = "";
  var transAttribute;

  this.ensureValidElements();
  transAttribute = this.element.getTranslatedAttribute("class");
  if( transAttribute )
  {
    transAttribute = dwscripts.trim(transAttribute);
    // Find to who state correspond translated class.
    for( var prop in this.widgetStates)
    {
      if( this[this.widgetStates[prop].stateClass] == transAttribute)
      {
        retValue = prop;
        break;
      }
    }
  }

  return retValue;
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

Spry.DesignTime.Widget.ValidationSelect.prototype.isValidStructure = function()
{
  var retValue = false;

  this.ensureValidElements();
  if( this.element.hasChildNodes() )
  {
    var controlNodes = this.element.getElementsByTagName(this.tagName);
    if ( controlNodes && controlNodes.length )
    {
      if( this.typeAttribute )
      {
        // Find correct node.
        for( var i = 0; i < controlNodes.length; i++ )
        {
          if( controlNodes[i].getAttribute(this.typeAttribute) == this.typeAttributeValue )
          {
            retValue = true;
            break;
          }
        }
      }
      else
      {
        retValue = true;
      }
    }
  }
  else if( this.element.nodeType == Node.ELEMENT_NODE &&
           this.element.tagName == this.tagName &&
           ((this.typeAttribute && this.element.getAttribute(this.typeAttribute) == this.typeAttributeValue) ||
             !this.typeAttribute ))
  {
    retValue = true;
  }

  return retValue;
};

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

Spry.DesignTime.Widget.ValidationSelect.prototype.refresh = function()
{
  var currentState = this.currentState;
  this.ensureValidElements();

  // Reinitialize options object.
  this.opts = {};

  // Start with user options
  // First get options from page to make shure options are not cached.
  var args = this.getConstructorArgs(this.widgetType);
  this.setOptsFromArgsArray(args);

  this.setDisplayedState(currentState);

  // Just search for the appropriate INPUT control within the container.
  this.inspectSelectControl();

  this.addDwEditingAttributes();
};

//--------------------------------------------------------------------
// FUNCTION:
//   getErrorMessageSrc
//
// DESCRIPTION:
//   Static utility function used to construct the error message definition
//   starting from message class and the message itself.
//
// ARGUMENTS:
//   messageClass - string - message's default state class
//   message - string - Message string
//
// RETURNS:
//   String that represents the widget's message markup.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationSelect.getErrorMessageSrc = function(messageClass, message)
{
  if (typeof(message) == "undefined")
  {
    message = dw.loadString("spry/widgets/ValidationSelect/defaultMessage");
  }

  return '<span class="' + messageClass + '">' + message + '</span>';
};

