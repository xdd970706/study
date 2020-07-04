// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.ValidationPassword
//
// DESCRIPTION:
//   This class is used by the ValidationPassword property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       ValidationPassword(dom, objName, element, args)
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
//       Spry.DesignTime.Widget.ValidationPassword.changeConstructorId(dom, curId, newId)
//       Spry.DesignTime.Widget.ValidationPassword.checkNode(theNode)
//       Spry.DesignTime.Widget.ValidationPassword.getErrorMessageSrc(messageClass, message)
//       Spry.DesignTime.Widget.ValidationPassword.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.ValidationPassword.getNewValidationPasswordConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.ValidationPassword.getNewValidationPasswordSnippet(id, opts, existingTag)
//       Spry.DesignTime.Widget.ValidationPassword.getObjectAsString(obj)
//       Spry.DesignTime.Widget.ValidationPassword.getTagSnippet(selNode)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ValidationPassword
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the ValidationPassword widget in the design view. This constructor
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
//                          var w1 = new Spry.Widget.ValidationPassword('sprytextfield1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.ValidationPassword("sprytextfield1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'sprypassword1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationPassword = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.currentState = "";
  this.input = null;
  this.opts = {};

  this.validClass = "passwordValidState";
  this.focusClass = "passwordFocusState";
  this.requiredClass = "passwordRequiredState";
  this.invalidStrengthClass = "passwordInvalidStrengthState";
  this.invalidCharsMinClass = "passwordMinCharsState";
  this.invalidCharsMaxClass = "passwordMaxCharsState";

  // Hash structure that defines all available states and many other properties for each of them separately.
  this.states = {
    required: {
      displayName: dw.loadString("spry/widget/Validation/label/required"),  // Value displayed in the "Displayed State" dropdown
      stateClass: "passwordRequiredState",   // The state class which have to be applied on the container to display a state. It is used when the current widget doesn't define a property defined by the "stateProperty"
      stateProperty: "requiredClass",        // If the value of this property can be found in the widget's options object, this value will be used instead to be applied on the container when displaying the state
      messageClass: "passwordRequiredMsg",   // The class name used to identify the span containing the error message for the current state
      defaultMsg: dw.loadString("spry/widgets/ValidationPassword/defaultRequiredMsg"), // The default error message to be added to page when adding the error message span for the current span
      availability: "isRequired"             // String containing boolean expression that will be evaluated (using eval) to see whether the current state is available in the current widget configuration
    },
    invalidStrength: {
      displayName: dw.loadString("spry/widgets/ValidationPassword/label/invalid strength"),
      stateClass: "passwordInvalidStrengthState",
      stateProperty: "invalidStrengthClass",
      messageClass: "passwordInvalidStrengthMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationPassword/defaultInvalidStrengthMsg"),
      availability: "invalidStrength"
    },
    minChars: {
      displayName: dw.loadString("spry/widget/Validation/label/min chars not met"),
      stateClass: "passwordMinCharsState",
      stateProperty: "invalidCharsMinClass",
      messageClass: "passwordMinCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationPassword/defaultMinCharsNotMetMsg"),
      availability: "minChars"
    },
    maxChars: {
      displayName: dw.loadString("spry/widget/Validation/label/max chars exceeded"),
      stateClass: "passwordMaxCharsState",
      stateProperty: "invalidCharsMaxClass",
      messageClass: "passwordMaxCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationPassword/defaultMaxCharsExceededMsg"),
      availability: "maxChars"
    },
    valid: {
      displayName: dw.loadString("spry/widget/Validation/label/valid"),
      stateClass: "passwordValidState",
      stateProperty: "validClass",
      messageClass: "passwordValidMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationPassword/defaultValidMsg"),
      availability: "true"
    }
  };

  this.setOptsFromArgsArray(args);

  // Just search for the appropriate INPUT control within the container
  this.inspectInputControl();

  this.addDwEditingAttributes();
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.ValidationPassword.prototype = new Spry.DesignTime.Widget.Base();

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

Spry.DesignTime.Widget.ValidationPassword.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationPassword/SpryValidationPassword.js";
  tempObj.file = "SpryValidationPassword.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationPassword/SpryValidationPassword.css";
  tempObj.file = "SpryValidationPassword.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
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

Spry.DesignTime.Widget.ValidationPassword.prototype.inspectInputControl = function()
{
  if (this.element) {
    if (this.element.nodeName == "INPUT") {
      this.input = this.element;
    } else {
      this.input = Spry.DesignTime.Widget.ValidationPassword.getFirstChildWithNodeNameAtAnyLevel(this.element, "INPUT");
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

Spry.DesignTime.Widget.ValidationPassword.prototype.addDwEditingAttributes = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getMessageContainer = function (messageClass)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.isChildOf = function (parentNode, childNode)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.addErrorMessage = function(stateName, message)
{
  var status = false;
  var stateObj = this.states[stateName];

  if (this.getMessageContainer(stateObj.messageClass) === null)
  {
    var messageSrc = Spry.DesignTime.Widget.ValidationPassword.getErrorMessageSrc(stateObj.messageClass, message);
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
      var inputElems = this.element.getElementsByTagName("input");
      if (inputElems && inputElems[0])
      {
        // Add the error message right after the INPUT control.
        inputElems[0].outerHTML += messageSrc;
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
  }

  return status;
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

Spry.DesignTime.Widget.ValidationPassword.prototype.removeErrorMessage = function(stateName)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.updateErrorMessage = function(stateName)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.updateErrorMessages = function(stateName)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getErrorMessagesContainer = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getErrorMessages = function()
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
//   getTagSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for the widget's form control.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   selNode - object - Current selected node from page.
//
// RETURNS:
//   String that is the HTML markup for the widget's form control.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationPassword.getTagSnippet = function(selNode)
{
  var tagStr;
  var controlName = dwscripts.getUniqueNameForTag("input", "password");

  // If there is some selection in page, check to see if it's our control node, if so include the selection in the returned string.
  if (Spry.DesignTime.Widget.ValidationPassword.checkNode(selNode))
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
    tagStr = '<input type="password" name="' + controlName + '" id="' + controlName + '">';
  }

  return tagStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationPasswordSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete ValidationPassword widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   opts - object - options used to generate widget main container.
//   existingTag - string - HTML markup for the widget's form control.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationPassword.getNewValidationPasswordSnippet = function(id, opts, existingTag)
{
//  var errorMsgs = Spry.DesignTime.Widget.ValidationPassword.getErrorMessageSrc(this.states.required.messageClass, this.states.required.defaultMsg);
  var errorMsgs = Spry.DesignTime.Widget.ValidationPassword.getErrorMessageSrc("passwordRequiredMsg", dw.loadString("spry/widgets/ValidationPassword/defaultRequiredMsg"));
  var formRegExp = /(<form[^>]*?>[\r\n\s\t]*<p>|<form[^>]*?>)([\w\W]*?)(<\/p>[\r\n\s\t]*<\/form>|<\/form>)/i;
  var textfieldRegExp = /<input[^>]*?(?:type="([^\"]+)")?[^>]*?>/i;

  // Input tag not present; return empty string
  var matches = existingTag.match(textfieldRegExp);
  if (!matches || (matches[1] && matches[1].toLowerCase && matches[1].toLowerCase() != "password"))
  {
    return "";
  }

  var widgetSnippet = "";
  widgetSnippet += '<span id="' + id + '">';

  if (existingTag && existingTag.match && existingTag.match(formRegExp))
  {
    // If form tag is found, put the widget inside the form tag.
    widgetSnippet = existingTag.replace(formRegExp, "$1" + widgetSnippet + "$2" + errorMsgs + "</span>" + "$3");
  }
  else
  {
    // Just insert the tag inside the widget.
    widgetSnippet += (typeof existingTag != "undefined") ? existingTag : '<input type="password" />';
    widgetSnippet += errorMsgs;
    widgetSnippet += "</span>";
  }

  return widgetSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationPasswordConstructorSnippet
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

Spry.DesignTime.Widget.ValidationPassword.getNewValidationPasswordConstructorSnippet = function(id, opts)
{
  var strOptions = Spry.DesignTime.Widget.ValidationPassword.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (', ' + strOptions) : "";
  return 'var ' + id + ' = new Spry.Widget.ValidationPassword("' + id + '"' + extra + ');';
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getOption = function(optionName, defaultValue)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.setOption = function(optionName, optionValue, defaultValue)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.removeOption = function(optionName)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.updateOptions = function()
{
  this.updateConstructorOptions("Spry.Widget.ValidationPassword", this.numReqCArgs, this.opts);
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getStatesLabels = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getStatesValues = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.checkStateAvailability = function(stateName, ignoreOptions)
{
  var availability = false;
  var stateObj = this.states[stateName];

  if (stateObj)
  {
    var minChars = true;
    var maxChars = true;
    var invalidStrength = true;
    var isRequired = true;

    if (!ignoreOptions)
    {
      if (this.getOption("isRequired", true) !== true)
      {
        isRequired = false;
      }

      minChars = minChars && !!this.getOption("minChars");
      maxChars = maxChars && !!this.getOption("maxChars");
      invalidStrength = invalidStrength && (!!this.getOption("minAlphaChars") || !!this.getOption("maxAlphaChars") ||
                                            !!this.getOption("minNumbers") || !!this.getOption("maxNumbers") ||
                                            !!this.getOption("minUpperAlphaChars") || !!this.getOption("maxUpperAlphaChars") ||
                                            !!this.getOption("minSpecialChars") || !!this.getOption("maxSpecialChars"));
    }

    availability = eval(stateObj.availability);
  }

  return availability;
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

Spry.DesignTime.Widget.ValidationPassword.prototype.setDisplayedState = function(stateName)
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getDisplayedState = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.isValidStructure = function()
{
  var retValue = false;
  this.ensureValidElements();
  if( this.element.hasChildNodes() )
  {
    var selNodes = this.element.getElementsByTagName("INPUT");
    for (var i=0; i<selNodes.length; i++)
    {
      if (!retValue && Spry.DesignTime.Widget.ValidationPassword.checkNode(selNodes[i]))
      {
        retValue = true;
        break;
      }
    }
  }
  else if( Spry.DesignTime.Widget.ValidationPassword.checkNode(this.element) )
  {
    retValue = true;
  }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isDuplicateControl
//
// DESCRIPTION:
//   This function check to see if the widget contain more than one INPUT element.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if more than one INPUT form control is finded inside the current widget, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationPassword.prototype.isDuplicateControl = function()
{
  var isDuplicate = false;

  if( this.element && this.element.getElementsByTagName )
  {
    var arrElements = this.element.getElementsByTagName("INPUT");
    if( arrElements )
    {
      var counter = 0;
      for( var i = 0; i < arrElements.length; i++)
      {
        if( !arrElements[i].getAttribute("type") || arrElements[i].getAttribute("type") == "password" )
        {
          if (counter >= 1)
          {
            isDuplicate = true;
            break;
          }
          counter++;
        }
      }
    }
  }

  return isDuplicate;
};


//--------------------------------------------------------------------
// FUNCTION:
//   checkNode
//
// DESCRIPTION:
//   Static function that check the given node to see if it is a valid TEXTAREA node.
//
// ARGUMENTS:
//   theNode - object - DOM element
//
// RETURNS:
//   True if parameter is a TEXTAREA form control, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationPassword.checkNode = function(theNode)
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
      if (selectedNodeType && (selectedNodeType === "password"))
      {
        isValid = true;
      }
    }
  }

  return isValid;
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

Spry.DesignTime.Widget.ValidationPassword.prototype.refresh = function()
{
  var curState = this.currentState;
  this.ensureValidElements();

  // Reinitialize options object.
  this.opts = {};

  // Start with user options
  // First get options from page to make shure options are not cached.
  var args = this.getConstructorArgs("Spry.Widget.ValidationPassword");
  this.setOptsFromArgsArray(args);

  this.setDisplayedState(curState);

  // Just search for the appropriate INPUT control within the container.
  this.inspectInputControl();

  this.addDwEditingAttributes();
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

Spry.DesignTime.Widget.ValidationPassword.prototype.getId = function()
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

Spry.DesignTime.Widget.ValidationPassword.prototype.updateId = function(newId)
{
  // Set our elements id first.
  this.element.id = newId;
  var oldId = this.element_id;
  this.element_id = newId;

  // Update constructor.
  Spry.DesignTime.Widget.ValidationPassword.changeConstructorId(this.dom, oldId, newId);

  // Make sure why have the correct old element.
  this.ensureValidElements();
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

Spry.DesignTime.Widget.ValidationPassword.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) {
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

Spry.DesignTime.Widget.ValidationPassword.changeConstructorId = function(dom, curId, newId)
{
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.ValidationPassword\\s*?\\(\\s*?[\"']" + dwscripts.escRegExpChars(curId) + "[\"']");
  var scriptTags = dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    if( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, "Spry.Widget.ValidationPassword(\"" + newId + "\"");
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

Spry.DesignTime.Widget.ValidationPassword.getObjectAsString = function(obj)
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

Spry.DesignTime.Widget.ValidationPassword.getErrorMessageSrc = function(messageClass, message)
{
  if (typeof(message) == "undefined")
  {
    message = dw.loadString("spry/widgets/ValidationPassword/defaultMessage");
  }

  return '<span class="' + messageClass + '">' + message + '</span>';
};
