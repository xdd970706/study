// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.ValidationTextarea
//
// DESCRIPTION:
//   This class is used by the ValidationTextarea property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       ValidationTextarea(dom, objName, element, args)
//
//   Utils:
//
//       addDwEditingAttributes()
//       checkStateAvailability(stateName, ignoreOptions)
//       getCounterContainerID()
//       getDefaultCounterContainerCode()
//       getDisplayedState()
//       getErrorMessages()
//       getErrorMessagesContainer()
//       getFirstChildWithID(control, id)
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
//       updateErrorMessage(stateName)
//       updateErrorMessages(stateName)
//
//
//   Update widget constructor and markup:
//
//       addCounterContainer()
//       addErrorMessage(stateName, message)
//       removeCounterContainer()
//       removeErrorMessage(stateName)
//       updateId(newId)
//       updateOptions()
//
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.ValidationTextarea.changeConstructorId(dom, curId, newId)
//       Spry.DesignTime.Widget.ValidationTextarea.checkNode(theNode)
//       Spry.DesignTime.Widget.ValidationTextarea.getErrorMessageSrc(messageClass, message)
//       Spry.DesignTime.Widget.ValidationTextarea.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaSnippet(id, opts, existingTag)
//       Spry.DesignTime.Widget.ValidationTextarea.getTagSnippet(selNode)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ValidationTextarea
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the ValidationTextarea widget in the design view. This constructor
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
//                          var w1 = new Spry.Widget.ValidationTextarea('sprytextarea1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.ValidationTextarea("sprytextarea1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'sprytextarea1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.currentState = "";
  this.input = null;
  this.opts = {};
  this.requiredClass = "textareaRequiredState";
  this.invalidCharsMaxClass = "textareaMaxCharsState";
  this.invalidCharsMinClass = "textareaMinCharsState";
  this.validClass = "textareaValidState";
  this.focusClass = "textareaFocusState";
  this.textareaFlashClass = "textareaFlashState";
//  this.counterID = null;

  // Hash structure that defines all available states and many other properties for each of them separately.
  this.states = {
    required: {
      displayName: dw.loadString("spry/widget/Validation/label/required"),  // Value displayed in the "Displayed State" dropdown
      stateClass: "textareaRequiredState",  // The state class which have to be applied on the container to display a state. It is used when the current widget doesn't define a property defined by the "stateProperty"
      stateProperty: "requiredClass",       // If the value of this property can be found in the widget's options object, this value will be used instead to be applied on the container when displaying the state
      messageClass: "textareaRequiredMsg",  // The class name used to identify the span containing the error message for the current state
      defaultMsg: dw.loadString("spry/widgets/ValidationTextarea/defaultRequiredMsg"), // The default error message to be added to page when adding the error message span for the current span
      availability: "isRequired"            // String containing boolean expression that will be evaluated (using eval) to see whether the current state is available in the current widget configuration
    },
    minChars: {
      displayName: dw.loadString("spry/widget/Validation/label/min chars not met"),
      stateClass: "textareaMinCharsState",
      stateProperty: "invalidCharsMinClass",
      messageClass: "textareaMinCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextarea/defaultMinCharsNotMetMsg"),
      availability: "minChars"
    },
    maxChars: {
      displayName: dw.loadString("spry/widget/Validation/label/max chars exceeded"),
      stateClass: "textareaMaxCharsState",
      stateProperty: "invalidCharsMaxClass",
      messageClass: "textareaMaxCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextarea/defaultMaxCharsExceededMsg"),
      availability: "maxChars"
    },
    valid: {
      displayName: dw.loadString("spry/widget/Validation/label/valid"),
      stateClass: "textareaValidState",
      stateProperty: "validClass",
      messageClass: "textareaValidMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextarea/defaultValidMsg"),
      availability: "true"
    }
  };

  this.setOptsFromArgsArray(args);

  // Just search for the appropriate INPUT control within the container
  this.inspectInputControl();

  this.addDwEditingAttributes();
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.ValidationTextarea.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to ValidationSelect for our newly created prototype
// object so callers know that our object was created with the ValidationCheckbox constructor.
Spry.DesignTime.Widget.ValidationTextarea.prototype.constructor = Spry.DesignTime.Widget.ValidationTextarea;

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

Spry.DesignTime.Widget.ValidationTextarea.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationTextarea/SpryValidationTextarea.js";
  tempObj.file = "SpryValidationTextarea.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationTextarea/SpryValidationTextarea.css";
  tempObj.file = "SpryValidationTextarea.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
};

//--------------------------------------------------------------------
// FUNCTION:
//   inspectInputControl
//
// DESCRIPTION:
//   This function searches for the appropriate TEXTAREA control within the container
//   and set it as a property of this object.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.inspectInputControl = function()
{
  if (this.element){
    if (this.element.nodeName == "TEXTAREA") {
      this.input = this.element;
    } else {
      this.input = Spry.DesignTime.Widget.ValidationTextarea.getFirstChildWithNodeNameAtAnyLevel(this.element, "TEXTAREA");
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.addDwEditingAttributes = function()
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
//   getCounterContainerID
//
// DESCRIPTION:
//   This function search for and returns the id attribute of the default counter container.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   A string that is the id attribute of the counter container.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.getCounterContainerID = function()
{
  return ("count" + this.element.getAttribute("id"));
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDefaultCounterContainerCode
//
// DESCRIPTION:
//   This function constructs and return the markup required to insert the
//   widget's counter option in page.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   A string that represent the markup for the counter container.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.getDefaultCounterContainerCode = function()
{
  var retStr = "";
  retStr = '<span id="' + this.getCounterContainerID() + '">&nbsp;</span>';
  return retStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   addCounterContainer
//
// DESCRIPTION:
//   This function insert the widget's counter markup in page.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.addCounterContainer = function()
{
  var counterId = this.getOption("counterId", this.getCounterContainerID());
  var counterContainer = this.getFirstChildWithID(this.element, counterId);

  if (counterContainer !== null)
  {
    // This means we already have such a container in place, so we'll simply do nothing...
  }
  else
  {
    if (this.input && this.input.outerHTML)
    {
      // If there was no such a container found in the widget container; we'll add it now
      this.input.outerHTML += this.getDefaultCounterContainerCode();
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   removeCounterContainer
//
// DESCRIPTION:
//   This function removes the counter container from page.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.removeCounterContainer = function()
{
  var counterId = this.getOption("counterId", "");

  // Look for the appropriate element
  if (counterId !== "")
  {
    var counterContainer = this.getFirstChildWithID(this.element, counterId);

    // If found the counter's container, we'll go and remove it from the page
    if (counterContainer !== null && (counterContainer.outerHTML == this.getDefaultCounterContainerCode()))
    {
      counterContainer.outerHTML = "";
    }
  }
//  this.counterID = null;
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getMessageContainer = function (messageClass)
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
//   getFirstChildWithID
//
// DESCRIPTION:
//   This function returns the first child node with the given ID. The child can
//   be located on any level.
//
// ARGUMENTS:
//   control - object - the DOM element in wich we will search for the element
//                      with the specified id
//   id - string - value of the id attribute of the DOM element that we need to return
//
// RETURNS:
//   The DOM element whose id attribute equals the id parameter and is a child
//   of the control object, or null if no element is found.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.getFirstChildWithID = function(control, id)
{
  var element = null;
  var elems = control.getElementsByAttributeName("id");
  for (var i=0; i<elems.length; i++)
  {
    if (elems[i].getAttribute && (elems[i].getAttribute("id") == id))
    {
      if (this.isChildOf(this.element, elems[i]))
      {
        element = elems[i];
        break;
      }
    }
  }
  return element;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isChildOf
//
// DESCRIPTION:
//   This function checks to see whether the given "childNode" element is a child
//   of the "parentNode" element.
//
// ARGUMENTS:
//   parentNode - object - DOM object
//   childNode - object - DOM object
//
// RETURNS:
//   True if the second parameter is a child of first parameter, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.isChildOf = function (parentNode, childNode)
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.addErrorMessage = function(stateName, message)
{
  var status = false;
  var stateObj = this.states[stateName];

  if (this.getMessageContainer(stateObj.messageClass) === null)
  {
    var messageSrc = Spry.DesignTime.Widget.ValidationTextarea.getErrorMessageSrc(stateObj.messageClass, message);
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
      var inputElems = this.element.getElementsByTagName("textarea");
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.removeErrorMessage = function(stateName)
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.updateErrorMessage = function(stateName)
{
  var switchToState = null;
  var controlWasUpdated = false;
  var stateObj;

  // We should manage error messages as long as the ID is placed on any element but the INPUT itself
  if (!this.element.tagName || !this.element.tagName.toLowerCase || this.element.tagName.toLowerCase() != "textarea")
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.updateErrorMessages = function(stateName)
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getErrorMessagesContainer = function()
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getErrorMessages = function()
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

Spry.DesignTime.Widget.ValidationTextarea.getTagSnippet = function(selNode)
{
  var tagStr;
  var controlName = dwscripts.getUniqueNameForTag("textarea", "textarea");

  // If there is some selection in page, check to see if it's our control node, if so include the selection in the returned string.
  if (Spry.DesignTime.Widget.ValidationTextarea.checkNode(selNode))
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
    tagStr = '<textarea name="' + controlName + '" id="' + controlName + '" cols="45" rows="5"></textarea>';
  }

  return tagStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationTextareaSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete ValidationTextarea widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   opts - object - options used to generate widget main container.
//   existingTag - string - HTML markup for the widget's form control.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaSnippet = function(id, opts, existingTag)
{
  var errorMsgs = Spry.DesignTime.Widget.ValidationTextarea.getErrorMessageSrc("textareaRequiredMsg", dw.loadString("spry/widgets/ValidationTextarea/defaultRequiredMsg"));
  var formRegExp = /(<form[^>]*?>[\r\n\s\t]*<p>|<form[^>]*?>)([\w\W]*?)(<\/p>[\r\n\s\t]*<\/form>|<\/form>)/i;
  var textareaRegExp = /<textarea[^>]*?>/i;

  // Input tag not present; return empty string.
  if (!existingTag.match(textareaRegExp))
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
    widgetSnippet += (typeof existingTag != "undefined") ? existingTag : '<textarea cols="45" rows="5"></textarea>';
    widgetSnippet += errorMsgs;
    widgetSnippet += "</span>";
  }

  return widgetSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationTextareaConstructorSnippet
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

Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaConstructorSnippet = function(id, opts)
{
  var strOptions = Spry.DesignTime.Widget.Base.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (strOptions) : "";
  return 'var ' + id + ' = new Spry.Widget.ValidationTextarea("' + id + '"' + extra + ');';
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getStatesLabels = function()
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getStatesValues = function()
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.checkStateAvailability = function(stateName, ignoreOptions)
{
  var availability = false;
  var stateObj = this.states[stateName];

  if (stateObj)
  {
    var minChars = true;
    var maxChars = true;
    var isRequired = true;

    if (!ignoreOptions)
    {
      if (this.getOption("isRequired", true) !== true)
      {
        isRequired = false;
      }

      minChars = minChars && !!this.getOption("minChars");
      maxChars = maxChars && !!this.getOption("maxChars");
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.setDisplayedState = function(stateName)
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
      if (confirm(dw.loadString("spry/widgets/ValidationTextarea/error/errorMessageMissing")))
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getDisplayedState = function()
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.isValidStructure = function()
{
  var retValue = false;
  this.ensureValidElements();
  if( this.element.hasChildNodes() )
  {
    var selNodes = this.element.getElementsByTagName("TEXTAREA");
    for (var i=0; i<selNodes.length; i++)
    {
      if (!retValue && Spry.DesignTime.Widget.ValidationTextarea.checkNode(selNodes[i]))
      {
        retValue = true;
        break;
      }
    }
  }
  else if( Spry.DesignTime.Widget.ValidationTextarea.checkNode(this.element) )
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
//   This function check to see if the widget contains more than one TEXTAREA element.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if more than one TEXTAREA form control is finded inside the current widget, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextarea.prototype.isDuplicateControl = function()
{
  var isDuplicate = false;

  if( this.element && this.element.getElementsByTagName )
  {
    var arrElements = this.element.getElementsByTagName("TEXTAREA");
    if( arrElements )
      isDuplicate = arrElements.length > 1;
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

Spry.DesignTime.Widget.ValidationTextarea.checkNode = function(theNode)
{
  var isValid = false;

  if (theNode && (theNode.nodeType == Node.ELEMENT_NODE))
  {
    if (theNode.tagName.toLowerCase && (theNode.tagName.toLowerCase() == "textarea"))
    {
      isValid = true;
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.refresh = function()
{
  var curState = this.currentState;
  this.ensureValidElements();

  // Reinitialize options object.
  this.opts = {};

  // Start with user options
  // First get options from page to make sure options are not cached.
  var args = this.getConstructorArgs(this.widgetType);
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

Spry.DesignTime.Widget.ValidationTextarea.prototype.getId = function()
{
  return this.element_id;
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

Spry.DesignTime.Widget.ValidationTextarea.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) {
  var elements  = node.getElementsByTagName(nodeName);
  if (elements) {
    return elements[0];
  }
  return null;
};

//--------------------------------------------------------------------
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

Spry.DesignTime.Widget.ValidationTextarea.getErrorMessageSrc = function(messageClass, message)
{
  if (typeof(message) == "undefined")
  {
    message = dw.loadString("spry/widgets/ValidationTextarea/defaultMessage");
  }

  return '<span class="' + messageClass + '">' + message + '</span>';
};
