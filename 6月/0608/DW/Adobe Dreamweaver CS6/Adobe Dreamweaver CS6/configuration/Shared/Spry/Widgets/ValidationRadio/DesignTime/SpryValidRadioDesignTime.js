// Copyright 2008 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.ValidationRadio
//
// DESCRIPTION:
//   This class is used by the ValidationRadio property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       ValidationRadio(dom, objName, element, args)
//
//   Utils:
//
//       addDwEditingAttributes()
//       checkStateAvailability(stateName, ignoreOptions)
//       getDisplayedState()
//       getErrorMessages()
//       getErrorMessagesContainer()
//       getId()
//       getMessageContainer (messageClass)
//       getOption(optionName, defaultValue)
//       getStatesLabels()
//       getStatesValues()
//       inspectInputControl()
//       isChildOf (parentNode, childNode)
//       isDuplicateControl()
//       isValidStructure()
//       refresh()
//       removeOption(optionName)
//       setDisplayedState(stateName)
//       setOption(optionName, optionValue, defaultValue)
//       setOptsFromArgsArray(args)
//       updateErrorMessage(stateName)
//       updateErrorMessages(stateName)
//
//
//   Update widget constructor and markup:
//
//       addErrorMessage(stateName, message)
//       removeErrorMessage(stateName)
//       updateId(newId)
//       updateOptions()
//
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.ValidationRadio.changeConstructorId(dom, curId, newId)
//       Spry.DesignTime.Widget.ValidationRadio.checkNode(theNode)
//       Spry.DesignTime.Widget.ValidationRadio.getErrorMessageSrc(messageClass, message)
//       Spry.DesignTime.Widget.ValidationRadio.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.ValidationRadio.getNewValidationRadioConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.ValidationRadio.getNewValidationRadioSnippet(id, opts, existingTag, isBlock)
//       Spry.DesignTime.Widget.ValidationRadio.getObjectAsString(obj)
//       Spry.DesignTime.Widget.ValidationRadio.getTagSnippet(selNode)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ValidationRadio
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the ValidationRadio widget in the design view. This constructor
//   is registered in the Spry Widget Radio translator found in:
//
//       Configuration/Inspectors/spry_ValidationRadio.htm
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
//                          var w1 = new Spry.Widget.ValidationRadio('spryradio1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.ValidationRadio("spryradio1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'spryradio1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.Widget.ValidationRadio = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.currentState = "";
  this.input = null;
  this.opts = {};

  this.validClass = "radioValidState";
  this.focusClass = "radioFocusState";
  this.requiredClass = "radioRequiredState";
  this.invalidClass = "radioInvalidState";

  // Hash structure that defines all available states and many other properties for each of them separately.
  this.states = {
    required: {
      displayName: dw.loadString("spry/widget/Validation/label/required"),  // Value displayed in the "Displayed State" dropdown
      stateClass: this.requiredClass,   // The state class which have to be applied on the container to display a state. It is used when the current widget doesn't define a property defined by the "stateProperty"
      stateProperty: "requiredClass",        // If the value of this property can be found in the widget's options object, this value will be used instead to be applied on the container when displaying the state
      messageClass: "radioRequiredMsg",   // The class name used to identify the span containing the error message for the current state
      defaultMsg: dw.loadString("spry/widgets/ValidationRadio/defaultRequiredMsg"), // The default error message to be added to page when adding the error message span for the current span
      availability: "isRequired"             // String containing boolean expression that will be evaluated (using eval) to see whether the current state is available in the current widget configuration
    },
    invalid: {
      displayName: dw.loadString("spry/widget/Validation/label/invalid"),
      stateClass: this.invalidClass, 
      stateProperty: "invalidClass",
      messageClass: "radioInvalidMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationRadio/defaultInvalidMsg"),
      availability: "invalidValue"
    }
  };
  
  this.setOptsFromArgsArray(args);
  
  // Just search for the appropriate INPUT control within the container
  this.inspectInputControl();

  this.addDwEditingAttributes();
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.ValidationRadio.prototype = new Spry.DesignTime.Widget.Base();

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

Spry.DesignTime.Widget.ValidationRadio.prototype.addDwEditingAttributes = function()
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

//--------------------------------------------------------------------
// FUNCTION:
//   addErrorMessage
//
// DESCRIPTION:
//   This function inserts markup for the specified message.
//
// ARGUMENTS:
//   stateName - string - widget state name
//   message - string - message
//
// RETURNS:
//    The function returns the operation status (true for successfull, false otherwise).
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.addErrorMessage = function(stateName, message)
{
  var status = false;
  var stateObj = this.states[stateName];

  if (this.getMessageContainer(stateObj.messageClass) === null)
  {
    var messageSrc = Spry.DesignTime.Widget.ValidationRadio.getErrorMessageSrc(stateObj.messageClass, message);
    var container = this.getErrorMessagesContainer();
    if (container !== null)
    {
      // If found an already exisitng error message, we'll add the current message at
      // the end if the exisiting error message's container.
      container.innerHTML += messageSrc;
      status = true;
    }
    else
    {
        // Add the error message at the end of the container (as the last child of it)
        // if no INPUT element was found in the widget.
        this.element.innerHTML += messageSrc;
        status = true;
    }
  }

  return status;
};

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

Spry.DesignTime.Widget.ValidationRadio.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationRadio/SpryValidationRadio.js";
  tempObj.file = "SpryValidationRadio.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationRadio/SpryValidationRadio.css";
  tempObj.file = "SpryValidationRadio.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationRadioConstructorSnippet
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

Spry.DesignTime.Widget.ValidationRadio.getNewValidationRadioConstructorSnippet = function(id, opts)
{
  var strOptions = Spry.DesignTime.Widget.ValidationRadio.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (', ' + strOptions) : "";
  return 'var ' + id + ' = new Spry.Widget.ValidationRadio("' + id + '"' + extra + ');';
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationRadioSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete ValidationRadio widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   opts - object - options used to generate widget main container.
//   existingTag - string - HTML markup for the widget's form control.
//   isBlock - boolean - true if radio group structure is with <table> layout, false if with <br> layout
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.getNewValidationRadioSnippet = function(id, opts, existingTag, isBlock)
{
  var errorMsgs = Spry.DesignTime.Widget.ValidationRadio.getErrorMessageSrc("radioRequiredMsg", dw.loadString("spry/widgets/ValidationRadio/defaultRequiredMsg"));
  var formRegExp = /(<form[^>]*?>[\r\n\s\t]*<p>|<form[^>]*?>)([\w\W]*?)(<\/p>[\r\n\s\t]*<\/form>|<\/form>)/i;
  var textfieldRegExp = /<input[^>]*?(?:type="([^\"]+)")?[^>]*?>/i;

  // Input tag not present; return empty string
  var matches = existingTag.match(textfieldRegExp);
  if (!matches || (matches[1] && matches[1].toLowerCase && matches[1].toLowerCase() != "radio"))
  {
    return "";
  }

  // wrap in div if radio group is within table(block) layout, span if in <br> layout
  var widgetSnippet = "";
  if(existingTag && isBlock)
  {
    widgetSnippet += '<div id="' + id + '">';
  }
  else
  {
    widgetSnippet += '<span id="' + id + '">';
  }

  if (existingTag && existingTag.match && existingTag.match(formRegExp))
  {
    // If form tag is found, put the widget inside the form tag.
    if(isBlock)
    {
        widgetSnippet = existingTag.replace(formRegExp, "$1" + widgetSnippet + "$2" + errorMsgs + "</div>" + "$3");
    }
    else
    {
      widgetSnippet = existingTag.replace(formRegExp, "$1" + widgetSnippet + "$2" + errorMsgs + "</span>" + "$3");
    }
  }
  else
  {
    // Just insert the tag inside the widget.
    widgetSnippet += (typeof existingTag != "undefined") ? existingTag : '<input type="radio" />';
    widgetSnippet += errorMsgs;
    if(isBlock)
    {
      widgetSnippet += "</div>";
    }
    else
    {
      widgetSnippet += "</span>";
    }
  }

  return widgetSnippet;
};


//--------------------------------------------------------------------
// FUNCTION:
//   checkNode
//
// DESCRIPTION:
//   Static function that check the given node to see if it is a valid INPUT of type "radio" node.
//
// ARGUMENTS:
//   theNode - object - DOM element
//
// RETURNS:
//   True if parameter is a INPUT type="radio" form control, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.checkNode = function(theNode)
{
  var isValid = false;

  if (theNode && (theNode.nodeType == Node.ELEMENT_NODE))
  {
    if (theNode.tagName.toLowerCase && (theNode.tagName.toLowerCase() == "input"))
    {
      var selectedNodeType = theNode.getAttribute("type");

      // Set current type value to lowercase
      if (selectedNodeType && selectedNodeType.toLowerCase)
      {
        selectedNodeType = selectedNodeType.toLowerCase();
      }

      // Check for appropriate input type
      if (selectedNodeType && (selectedNodeType === "radio"))
      {
        isValid = true;
      }
    }
  }

  return isValid;
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

Spry.DesignTime.Widget.ValidationRadio.getObjectAsString = function(obj)
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

Spry.DesignTime.Widget.ValidationRadio.getErrorMessageSrc = function(messageClass, message)
{
  if (typeof(message) == "undefined")
  {
    message = dw.loadString("spry/widgets/ValidationRadio/defaultMessage");
  }

  return '<span class="' + messageClass + '">' + message + '</span>';
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

Spry.DesignTime.Widget.ValidationRadio.prototype.getStatesLabels = function()
{
  var labels = new Array();
  labels.push(dw.loadString("spry/widget/Validation/label/initial"));
  for (var i in this.states)
  {
    if (this.checkStateAvailability(i))
    {
      labels.push(this.states[i].displayName);
    }
  }
  return labels;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getStatesValues
//
// DESCRIPTION:
//   This function returns the available states' values for the current widget configuration
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.getStatesValues = function()
{
  var values = new Array();
  values.push("");

  for (var i in this.states)
  {
    if (this.checkStateAvailability(i))
    {
      values.push(i);
    }
  }

  return values;
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

Spry.DesignTime.Widget.ValidationRadio.prototype.removeWidgetMessage = function(messageID)
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
Spry.DesignTime.Widget.ValidationRadio.prototype.isValidStructure = function()
{
  var retValue = false;
  this.ensureValidElements();
  if( this.element.hasChildNodes() )
  {
    var selNodes = this.element.getElementsByTagName("INPUT");
    for (var i=0; i<selNodes.length; i++)
    {
      if (!retValue && Spry.DesignTime.Widget.ValidationRadio.checkNode(selNodes[i]))
      {
        retValue = true;
        break;
      }
    }
  }
  else if( Spry.DesignTime.Widget.ValidationRadio.checkNode(this.element) )
  {
    retValue = true;
  }

  return retValue;
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

Spry.DesignTime.Widget.ValidationRadio.prototype.updateId = function(newId)
{
  // Set our elements id first.
  this.element.id = newId;
  var oldId = this.element_id;
  this.element_id = newId;

  // Update constructor.
  Spry.DesignTime.Widget.ValidationRadio.changeConstructorId(this.dom, oldId, newId);

  // Make sure why have the correct old element.
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
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.changeConstructorId = function(dom, curId, newId)
{
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.ValidationRadio\\s*?\\(\\s*?[\"']" + dwscripts.escRegExpChars(curId) + "[\"']");
  var scriptTags = dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    if( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, "Spry.Widget.ValidationRadio(\"" + newId + "\"");
  }
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

Spry.DesignTime.Widget.ValidationRadio.prototype.refresh = function()
{
  var curState = this.currentState;
  this.ensureValidElements();

  // Reinitialize options object.
  this.opts = {};

  // Start with user options
  // First get options from page to make shure options are not cached.
  var args = this.getConstructorArgs("Spry.Widget.ValidationRadio");
  this.setOptsFromArgsArray(args);

  this.setDisplayedState(curState);

  // Just search for the appropriate INPUT control within the container.
  //this.inspectInputControl();

  this.addDwEditingAttributes();
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDisplayedState
//
// DESCRIPTION:
//   This function displays the specified state by its name. In case of an empty
//   state name we'll hide the current state instead.
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.setDisplayedState = function(stateName)
{
  if ((stateName != "") && this.states[stateName])
  {
    var stateObj = this.states[stateName];
    var messageClass = this.getOption(stateObj.stateProperty, stateObj.stateClass);

    // Set the class for the appropriate state
    this.element.setTranslatedAttribute("class", messageClass);

    this.currentState = stateName;
/*
    // If the message was found missing, we'll ask the user whether he/she would like to add
    // a default error message for this state.
    if (this.getMessageContainer(messageClass) === null)
    {
      if (confirm(dw.loadString("spry/widgets/ValidationPassword/error/errorMessageMissing")))
      {
        // If we have successfully added missing error message, we'll also display it
        if (this.addErrorMessage(messageClass ??? WRONG))
        {
          this.setDisplayedState(messageClass);
        }
      }
    }
*/
  }
  else
  {
    // If the specified state is empty we'll clear any displayed message
    if (this.element && this.element.removeTranslatedAttribute)
    {
      this.element.removeTranslatedAttribute("class");
      this.currentState = "";
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   inspectInputControl
//
// DESCRIPTION:
//   This function searches for the appropriate INPUT control within the container
//   and set it as a property of this object.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.inspectInputControl = function()
{
  if (this.element) {
    if (this.element.nodeName == "INPUT") {
      this.input = this.element;
    } else {
      this.input = Spry.DesignTime.Widget.ValidationRadio.getFirstChildWithNodeNameAtAnyLevel(this.element, "INPUT");
    }
  }
};

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

Spry.DesignTime.Widget.ValidationRadio.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) {
  var elements  = node.getElementsByTagName(nodeName);
  if (elements) {
    return elements[0];
  }
  return null;
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

Spry.DesignTime.Widget.ValidationRadio.prototype.getErrorMessages = function()
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
        for( stateName in this.states )
        {
          if( classAttribute.indexOf(this.states[stateName].messageClass) != -1 )
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
//   updateErrorMessage
//
// DESCRIPTION:
//   This function removes the error message that didn't make sense for the
//   current widget configuration and also adds the default message for the given
//   states if there is no error message defined yet.
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   The function returns the operation status (true for successfull,
//   false otherwise).
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.updateErrorMessage = function(stateName)
{
  var switchToState = null;
  var controlWasUpdated = false;
  var stateObj;
  
  // We should manage error messages as long as the ID is placed on any element but the INPUT itself
  if (!this.element.tagName || !this.element.tagName.toLowerCase || this.element.tagName.toLowerCase() != "input")
  {
    if (stateName != "valid")
    {
      stateObj = this.states[stateName];
      if (stateObj)
      {
        if (this.checkStateAvailability(stateName))
        {
          // Set the name of the newly displayed state
          if (switchToState === null)
          {
            switchToState = stateName;
          }

          // Add message if missing
          if (this.addErrorMessage(stateName, stateObj.defaultMsg))
          {
            controlWasUpdated = true;
          }
        }
        else
        {
          // Display the Initial state in case of message removal
          if ((this.getDisplayedState() == stateName) && (switchToState === null))
          {
            switchToState = "";
          }

          // Remove the message
          if (this.removeErrorMessage(stateName))
          {
            controlWasUpdated = true;
          }
        }
      }
    }
  }

  // If we have added or removed a state, we'll take action ad decide which state to display
  if (switchToState !== null)
  {
    this.setDisplayedState(switchToState);
  }

//  if (!controlWasUpdated)
//  {
//    // Simulate a fake control update to force Design View to not move its focus (especially when only a JS property was changed)
//    this.element.outerHTML = this.element.outerHTML;
//    Moved to PI
//  }

  return controlWasUpdated;
};


//--------------------------------------------------------------------
// FUNCTION:
//   updateErrorMessages
//
// DESCRIPTION:
//   This function removes the error messages that didn't make sense for the
//   current widget configuration and also adds the default messages for those
//   states that have no error message defined yet. If specifyed a state name,
//   the function will chache the error messages for the given state only,
//   otherwise all messages will be checked.
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.updateErrorMessages = function(stateName)
{
  if (typeof(stateName) != "undefined")
  {
    this.updateErrorMessage(stateName);
  }
  else
  {
    for (var i in this.states)
    {
      this.updateErrorMessage(i);
    }
  }
};


//--------------------------------------------------------------------
// FUNCTION:
//   checkStateAvailability
//
// DESCRIPTION:
//   This function checks the message availability according to the current type
//   and any other factors.
//
// ARGUMENTS:
//   stateName - string - widget state name
//   ignoreOptions - boolean - decide if options are taken in consideration
//
// RETURNS:
//   True if the state make sense in current context false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.checkStateAvailability = function(stateName, ignoreOptions)
{
  var availability = false;
  var stateObj = this.states[stateName];

  if (stateObj)
  {
    var isRequired = true;
    var emptyValue = true;
    var invalidValue = true;

    if (!ignoreOptions)
    {
      if (this.getOption("isRequired", true) !== true)
      {
        isRequired = false;
      }
      
      emptyValue = emptyValue && !!this.getOption("emptyValue");
      invalidValue = invalidValue && !!this.getOption("invalidValue");
    }

    availability = eval(stateObj.availability);
  }

  return availability;
};


//--------------------------------------------------------------------
// FUNCTION:
//   getDisplayedState
//
// DESCRIPTION:
//   This function returns the current displayed state (if any). The returned value
//   specifies the state name, and not the CSS class or message itself.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   State name string.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.getDisplayedState = function()
{
  var stateName = "";
  var messageClass = "";

  if (this.element && this.element.getTranslatedAttribute)
  {
    messageClass = this.element.getTranslatedAttribute("class");

    if (typeof(messageClass) != "string")
    {
      messageClass = "";
    }
  }

  // Look for the state that has the same class name as the one we have found in the page
  if (messageClass)
  {
    for (var i in this.states)
    {
      if (messageClass == this.getOption(this.states[i].stateProperty, this.states[i].stateClass))
      {
        stateName = i;
        break;
      }
    }
  }

  return stateName;
};


//--------------------------------------------------------------------
// FUNCTION:
//   removeErrorMessage
//
// DESCRIPTION:
//   This function is used to remove the error message for a given state from
//   the widget container. If such a message was found it performs a simple check
//   to see whether the message we are about to delete is the same as default
//   message. If not, we'll gonna ask the user for its confirmation on message
//   removal.
//
// ARGUMENTS:
//   stateName - string - widget state name
//
// RETURNS:
//   The function returns the operation status (true for successfull,
//   false otherwise).
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.removeErrorMessage = function(stateName)
{
  var status = false;
  var stateObj = this.states[stateName];
  var msgTag = this.getMessageContainer(stateObj.messageClass);

  if (msgTag !== null)
  {
    var canDelete = true;

    // Check if the error message was modified.
    if (msgTag.innerHTML != stateObj.defaultMsg)
    {
      var confirmMsg = dwscripts.sprintf(dw.loadString("spry/widget/Validation/alert/confirm/remove message"), stateObj.displayName);
      canDelete = (dwscripts.askYesNo(confirmMsg, MM.BTN_Yes) === 0);
    }

    // If we ca delete the error message, we'll go ahead and do it
    if (canDelete)
    {
      msgTag.outerHTML = "";
      status = true;
    }
  }

  return status;
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

Spry.DesignTime.Widget.ValidationRadio.prototype.getMessageContainer = function (messageClass)
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

Spry.DesignTime.Widget.ValidationRadio.prototype.isChildOf = function (parentNode, childNode)
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
//   getErrorMessagesContainer
//
// DESCRIPTION:
//   This function returns the DOM element that contains all the error messages.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   The DOM element in which are located all widget messages.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationRadio.prototype.getErrorMessagesContainer = function()
{
  var retNode = null;
  var messagesArray = this.getErrorMessages();

  if (messagesArray && messagesArray[0])
  {
    retNode = messagesArray[0].parentNode;
  }

  return retNode;
};
