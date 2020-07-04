// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.ValidationTextField
//
// DESCRIPTION:
//   This class is used by the ValidationTextField property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view. It inherits from Spry.DesignTime.Widget.Base
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       ValidationTextField(dom, objName, element, args)
//
//   Utils:
//
//       addDwEditingAttributes()
//       checkStateAvailability(stateName, ignoreOptions)
//       getCharMaskingAvailability(type)
//       getDisplayedState()
//       getErrorMessages()
//       getErrorMessagesContainer()
//       getFormatsLabels(type)
//       getFormatsValues(type)
//       getHintAvailability()
//       getId()
//       getMessageContainer (messageClass)
//       getStatesLabels()
//       getStatesValues()
//       getTypesLabels()
//       getTypesValues()
//       inspectInputControl()
//       isChildOf (parentNode, childNode)
//       isDuplicateControl()
//       isValidStructure()
//       refresh()
//       setDisplayedState(stateName)
//       setType(newValidation)
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
//       Spry.DesignTime.Widget.ValidationTextField.changeConstructorId(dom, curId, newId)
//       Spry.DesignTime.Widget.ValidationTextField.checkNode(theNode)
//       Spry.DesignTime.Widget.ValidationTextField.getErrorMessageSrc(messageClass, message)
//       Spry.DesignTime.Widget.ValidationTextField.getFirstChildWithNodeNameAtAnyLevel(node, nodeName) {
//       Spry.DesignTime.Widget.ValidationTextField.getNewValidationTextFieldConstructorSnippet(id, opts)
//       Spry.DesignTime.Widget.ValidationTextField.getNewValidationTextFieldSnippet(id, opts, existingTag)
//       Spry.DesignTime.Widget.ValidationTextField.getTagSnippet(selNode)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   ValidationTextField
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
//                          var w1 = new Spry.Widget.ValidationTextField('sprytextfield1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.ValidationTextField("sprytextfield1", {isRequired:false});
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'sprytextfield1\'"
//                      args[1] == " { isRequired:false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 2; // Our constructor only requires an ID arg.
  this.currentState = "";
  this.input = null;
  this.opts = {};
  this.validClass = "textfieldValidState";
  this.focusClass = "textfieldFocusState";
  this.requiredClass = "textfieldRequiredState";
  this.invalidFormatClass = "textfieldInvalidFormatState";
  this.invalidRangeMinClass = "textfieldMinValueState";
  this.invalidRangeMaxClass = "textfieldMaxValueState";
  this.invalidCharsMinClass = "textfieldMinCharsState";
  this.invalidCharsMaxClass = "textfieldMaxCharsState";
  this.textfieldFlashTextClass = "textfieldFlashText";

  // Hash structure that defines all available states and many other properties for each of them separately.
  this.states = {
    required: {
      displayName: dw.loadString("spry/widget/Validation/label/required"),  // Value displayed in the "Displayed State" dropdown
      stateClass: "textfieldRequiredState",  // The state class which have to be applied on the container to display a state. It is used when the current widget doesn't define a property defined by the "stateProperty"
      stateProperty: "requiredClass",        // If the value of this property can be found in the widget's options object, this value will be used instead to be applied on the container when displaying the state
      messageClass: "textfieldRequiredMsg",  // The class name used to identify the span containing the error message for the current state
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultRequiredMsg"), // The default error message to be added to page when adding the error message span for the current span
      availability: "isRequired"             // String containing boolean expression that will be evaluated (using eval) to see whether the current state is available in the current widget configuration
    },
    invalidFormat: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/invalid format"),
      stateClass: "textfieldInvalidFormatState",
      stateProperty: "invalidFormatClass",
      messageClass: "textfieldInvalidFormatMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultInvalidFormatMsg"),
      availability: "invalidFormat"
    },
    minValue: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/less than min value"),
      stateClass: "textfieldMinValueState",
      stateProperty: "invalidRangeMinClass",
      messageClass: "textfieldMinValueMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultLessThanMinMsg"),
      availability: "minValue"
    },
    maxValue: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/greater than max value"),
      stateClass: "textfieldMaxValueState",
      stateProperty: "invalidRangeMaxClass",
      messageClass: "textfieldMaxValueMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultGreaterThanMaxMsg"),
      availability: "maxValue"
    },
    minChars: {
      displayName: dw.loadString("spry/widget/Validation/label/min chars not met"),
      stateClass: "textfieldMinCharsState",
      stateProperty: "invalidCharsMinClass",
      messageClass: "textfieldMinCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultMinCharsNotMetMsg"),
      availability: "minChars"
    },
    maxChars: {
      displayName: dw.loadString("spry/widget/Validation/label/max chars exceeded"),
      stateClass: "textfieldMaxCharsState",
      stateProperty: "invalidCharsMaxClass",
      messageClass: "textfieldMaxCharsMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultMaxCharsExceededMsg"),
      availability: "maxChars"
    },
    valid: {
      displayName: dw.loadString("spry/widget/Validation/label/valid"),
      stateClass: "textfieldValidState",
      stateProperty: "validClass",
      messageClass: "textfieldValidMsg",
      defaultMsg: dw.loadString("spry/widgets/ValidationTextField/defaultValidMsg"),
      availability: "true"
    }
  };

  // Hash structure that defines all available types and many other properties for each of them separately.
  this.types = {
    none: {
      displayName: dw.loadString("spry/widget/Validation/label/none"),    // The name displayed in the Types dropdown
      formatsLabels: [],       // The available formats (labels) for the current type. If empty array is provided, this means that the current type has no formats available and therefore, the Formats dropdown will be disabled
      formatsValues: [],       // The available formats (values) for the current type. It should have the same length as the "formatsLabels" property
      allowCharMasking: false  // This flag specifies whether the current type allows character masking or not. If if doesn't allow character masking, the "Char Masking" checkbox from the PI will be unchecked and disabled
    },
    integer: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/integer"),
      formatsLabels: [],
      formatsValues: [],
      allowCharMasking: true
    },
    email: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/email address"),
      formatsLabels: [],
      formatsValues: [],
      allowCharMasking: true
    },
    date: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/date"),
      formatsLabels: [dw.loadString("spry/widget/Validation/label/date-format/mm/dd/yy"),
                      dw.loadString("spry/widget/Validation/label/date-format/mm/dd/yyyy"),
                      dw.loadString("spry/widget/Validation/label/date-format/dd/mm/yyyy"),
                      dw.loadString("spry/widget/Validation/label/date-format/dd/mm/yy"),
                      dw.loadString("spry/widget/Validation/label/date-format/yy/mm/dd"),
                      dw.loadString("spry/widget/Validation/label/date-format/yyyy/mm/dd"),
                      dw.loadString("spry/widget/Validation/label/date-format/mm-dd-yy"),
                      dw.loadString("spry/widget/Validation/label/date-format/dd-mm-yy"),
                      dw.loadString("spry/widget/Validation/label/date-format/yyyy-mm-dd"),
                      dw.loadString("spry/widget/Validation/label/date-format/mm.dd.yyyy"),
                      dw.loadString("spry/widget/Validation/label/date-format/dd.mm.yyyy")],
      formatsValues: ["mm/dd/yy", "mm/dd/yyyy", "dd/mm/yyyy", "dd/mm/yy", "yy/mm/dd", "yyyy/mm/dd", "mm-dd-yy", "dd-mm-yy", "yyyy-mm-dd", "mm.dd.yyyy", "dd.mm.yyyy"],
      allowCharMasking: true
    },
    time: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/time"),
      formatsLabels: [dw.loadString("spry/widget/Validation/label/time-format/HH:mm"),
                      dw.loadString("spry/widget/Validation/label/time-format/HH:mm:ss"),
                      dw.loadString("spry/widget/Validation/label/time-format/hh:mm tt"),
                      dw.loadString("spry/widget/Validation/label/time-format/hh:mm:ss tt"),
                      dw.loadString("spry/widget/Validation/label/time-format/hh:mm t"),
                      dw.loadString("spry/widget/Validation/label/time-format/hh:mm:ss t")],
      formatsValues: ["HH:mm", "HH:mm:ss", "hh:mm tt", "hh:mm:ss tt", "hh:mm t", "hh:mm:ss t"],
      allowCharMasking: true
    },
    credit_card: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/credit card"),
      formatsLabels: [dw.loadString("spry/widget/Validation/label/all"), dw.loadString("spry/widgets/ValidationTextField/label/visa"), dw.loadString("spry/widgets/ValidationTextField/label/mastercard"), dw.loadString("spry/widgets/ValidationTextField/label/american express"), dw.loadString("spry/widgets/ValidationTextField/label/discover"), dw.loadString("spry/widgets/ValidationTextField/label/diners club")],
      formatsValues: ["all", "visa", "mastercard", "amex", "discover", "dinersclub"],
      allowCharMasking: true
    },
    zip_code: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/zip code"),
      formatsLabels: [dw.loadString("spry/widgets/ValidationTextField/label/us-5"), dw.loadString("spry/widgets/ValidationTextField/label/us-9"), dw.loadString("spry/widgets/ValidationTextField/label/uk"), dw.loadString("spry/widgets/ValidationTextField/label/canada"), dw.loadString("spry/widgets/ValidationTextField/label/custom pattern")],
      formatsValues: ["zip_us5", "zip_us9", "zip_uk", "zip_canada", "zip_custom"],
      allowCharMasking: true
    },
    phone_number: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/phone number"),
      formatsLabels: [dw.loadString("spry/widgets/ValidationTextField/label/us canada"), dw.loadString("spry/widgets/ValidationTextField/label/custom pattern")],
      formatsValues: ["phone_us", "phone_custom"],
      allowCharMasking: true
    },
    social_security_number: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/social security number"),
      formatsLabels: [dw.loadString("spry/widgets/ValidationTextField/label/us"), dw.loadString("spry/widgets/ValidationTextField/label/custom pattern")],
      formatsValues: [ "ssn_us", "ssn_custom" ],
      allowCharMasking: true
    },
    currency: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/currency"),
      formatsLabels: ["1,000,000.00", "1.000.000,00"],
      formatsValues: ["comma_dot", "dot_comma"],
      allowCharMasking: true
    },
    real: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/real number"),
      formatsLabels: [],
      formatsValues: [],
      allowCharMasking: true
    },
    ip: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/ip address"),
      formatsLabels: [dw.loadString("spry/widgets/ValidationTextField/label/ipv4 only"), dw.loadString("spry/widgets/ValidationTextField/label/ipv6 only"), dw.loadString("spry/widgets/ValidationTextField/label/ipv6 and ipv4")],
      formatsValues: ["ipv4", "ipv6", "ipv6_ipv4"],
      allowCharMasking: true
    },
    url: {
      displayName: dw.loadString("spry/widgets/ValidationTextField/label/url"),
      formatsLabels: [],
      formatsValues: [],
      allowCharMasking: false
    },
    custom: {
      displayName: dw.loadString("spry/widget/Validation/label/custom"),
      formatsLabels: [],
      formatsValues: [],
      allowCharMasking: true
    }
  }

  this.setOptsFromArgsArray(args);

  // Just search for the appropriate INPUT control within the container
  this.inspectInputControl();

  this.addDwEditingAttributes();
};

// Inherit all methods from WidgetBase class
Spry.DesignTime.Widget.ValidationTextField.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to ValidationSelect for our newly created prototype
// object so callers know that our object was created with the ValidationCheckbox constructor.
Spry.DesignTime.Widget.ValidationTextField.prototype.constructor = Spry.DesignTime.Widget.ValidationTextField;

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

Spry.DesignTime.Widget.ValidationTextField.getAssets = function()
{
  var assets = new Array();
  var tempObj;

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationTextField/SpryValidationTextField.js";
  tempObj.file = "SpryValidationTextField.js";
  tempObj.type = "javascript";
  assets.push(tempObj);

  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/ValidationTextField/SpryValidationTextField.css";
  tempObj.file = "SpryValidationTextField.css";
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

Spry.DesignTime.Widget.ValidationTextField.prototype.inspectInputControl = function()
{
  if (this.element) {
    if (this.element.nodeName == "INPUT") {
      this.input = this.element;
    } else {
      this.input = Spry.DesignTime.Widget.ValidationTextField.getFirstChildWithNodeNameAtAnyLevel(this.element, "INPUT");
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

Spry.DesignTime.Widget.ValidationTextField.prototype.addDwEditingAttributes = function()
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
//   getCharMaskingAvailability
//
// DESCRIPTION:
//   This function returns the character masking feature availability for the given type
//
// ARGUMENTS:
//   type - string - widget validation type
//
// RETURNS:
//   True if character masking is available for the specified validation type, false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getCharMaskingAvailability = function(type)
{
  var availability = false;
  var curType = this.types[type];
  if (curType)
  {
    availability = curType.allowCharMasking;
  }

  return availability;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getHintAvailability
//
// DESCRIPTION:
//   This function returns the hint feature availability for the current INPUT control
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   False if INPUT control is of type password, true otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getHintAvailability = function()
{
  var availability = true;

  if (this.input &&
    this.input.getAttribute &&
    this.input.getAttribute("type") &&
    this.input.getAttribute("type").toLowerCase &&
    this.input.getAttribute("type").toLowerCase() == "password")
  {
    availability = false;
  }

  return availability;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getType
//
// DESCRIPTION:
//   This function extracts the validation type from the constructor JS code.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   The validation type string.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getType = function()
{
  var validation = this.getTypesValues()[0];
  var matches;
  var updateConstructorRegEx = new RegExp("Spry\\.Widget\\.ValidationTextField\\(\\s*?[\"']" + dwscripts.escRegExpChars(this.getId()) + "[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");
  var scriptTags = this.dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    matches = scriptTags[i].innerHTML.match(updateConstructorRegEx);
    if( matches && matches[1] )
    {
      validation = matches[1];
    }
  }

  return validation;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setType
//
// DESCRIPTION:
//   This function updates the validation type parameter of the constructor JS code from page.
//
// ARGUMENTS:
//   newValidation - string - widget validation type.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.setType = function(newValidation)
{
  var updateConstructorRegEx = new RegExp(dwscripts.escRegExpChars(this.widgetType) + "\\(\\s*?[\"']" + dwscripts.escRegExpChars(this.getId()) + "[\"']\\s*(?:,\\s*[\"'](.*?)[\"'])?");
  var scriptTags = this.dom.getElementsByTagName("script");
  for( var i = 0; i < scriptTags.length; i++ )
  {
    if( scriptTags[i].innerHTML.match(updateConstructorRegEx) )
    {
      scriptTags[i].innerHTML = scriptTags[i].innerHTML.replace(updateConstructorRegEx, this.widgetType + "(\"" + this.getId() + "\", \"" + newValidation + "\"");
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTypesLabels
//
// DESCRIPTION:
//   This function returns the types' labels from the "types" property of the object.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getTypesLabels = function()
{
  var labels = new Array();
  for (var i in this.types) {
    labels.push(this.types[i].displayName);
  }
  return labels;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTypesValues
//
// DESCRIPTION:
//   This function returns the types' values from the "types" property of the object.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getTypesValues = function()
{
  var values = new Array();
  for (var i in this.types) {
    values.push(i);
  }
  return values;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getFormatsLabels
//
// DESCRIPTION:
//   This function returns the formats' labels for the specified type, the returned
//   values are used in the property inspector.
//
// ARGUMENTS:
//   type - string - validation type
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getFormatsLabels = function(type)
{
  var labels = new Array();

  if (this.types && this.types[type])
  {
    labels = labels.concat(this.types[type].formatsLabels);
  }

  return labels;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getFormatsLabels
//
// DESCRIPTION:
//   This function returns the formats' values for the specified type, the
//   returned values are used to generate the JS code of the widget constructor.
//
// ARGUMENTS:
//   type - string - validation type
//
// RETURNS:
//   An array of strings.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.getFormatsValues = function(type)
{
  var values = new Array();

  if (this.types && this.types[type])
  {
    values = values.concat(this.types[type].formatsValues);
  }

  return values;
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getMessageContainer = function (messageClass)
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

Spry.DesignTime.Widget.ValidationTextField.prototype.isChildOf = function (parentNode, childNode)
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

Spry.DesignTime.Widget.ValidationTextField.prototype.addErrorMessage = function(stateName, message)
{
  var status = false;
  var stateObj = this.states[stateName];

  if (this.getMessageContainer(stateObj.messageClass) === null)
  {
    var messageSrc = Spry.DesignTime.Widget.ValidationTextField.getErrorMessageSrc(stateObj.messageClass, message);
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

Spry.DesignTime.Widget.ValidationTextField.prototype.removeErrorMessage = function(stateName)
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

Spry.DesignTime.Widget.ValidationTextField.prototype.updateErrorMessage = function(stateName)
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

Spry.DesignTime.Widget.ValidationTextField.prototype.updateErrorMessages = function(stateName)
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getErrorMessagesContainer = function()
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getErrorMessages = function()
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

Spry.DesignTime.Widget.ValidationTextField.getTagSnippet = function(selNode)
{
  var tagStr;
  var controlName = dwscripts.getUniqueNameForTag("input", "text");

  // If there is some selection in page, check to see if it's our control node, if so include the selection in the returned string.
  if (Spry.DesignTime.Widget.ValidationTextField.checkNode(selNode))
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
    tagStr = '<input type="text" name="' + controlName + '" id="' + controlName + '">';
  }

  return tagStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationTextFieldSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete ValidationTextField widget.
//
// ARGUMENTS:
//   id - string - The value for the widget's id attribute.
//   opts - object - options used to generate widget main container.
//   existingTag - string - HTML markup for the widget's form control.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.getNewValidationTextFieldSnippet = function(id, opts, existingTag)
{
  var errorMsgs = Spry.DesignTime.Widget.ValidationTextField.getErrorMessageSrc("textfieldRequiredMsg", dw.loadString("spry/widgets/ValidationTextField/defaultRequiredMsg"));
  var formRegExp = /(<form[^>]*?>[\r\n\s\t]*<p>|<form[^>]*?>)([\w\W]*?)(<\/p>[\r\n\s\t]*<\/form>|<\/form>)/i;
  var textfieldRegExp = /<input[^>]*?(?:type="([^\"]+)")?[^>]*?>/i;

  // Input tag not present; return empty string
  var matches = existingTag.match(textfieldRegExp);
  if (!matches || (matches[1] && !matches[1].toLowerCase && matches[1].toLowerCase() != "text" && matches[1].toLowerCase() != "password"))
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
    widgetSnippet += (typeof existingTag != "undefined") ? existingTag : '<input type="text" />';
    widgetSnippet += errorMsgs;
    widgetSnippet += "</span>";
  }

  return widgetSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewValidationTextFieldConstructorSnippet
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

Spry.DesignTime.Widget.ValidationTextField.getNewValidationTextFieldConstructorSnippet = function(id, opts)
{
  var strOptions = Spry.DesignTime.Widget.Base.getObjectAsString(opts);
  var extra = (strOptions != "{}") ? (', "none", ' + strOptions) : "";
  return 'var ' + id + ' = new Spry.Widget.ValidationTextField("' + id + '"' + extra + ');';
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

Spry.DesignTime.Widget.ValidationTextField.prototype.updateOptions = function()
{
  // The widget's constructor allows developers to leave off the 2nd argument
  // if it is "none". We need to check for this "short-hand" constructor call
  // and turn it into a constructor with the required 2 arguments before setting
  // any options.

  var strOptions = Spry.DesignTime.Widget.Base.getObjectAsString(this.opts);
  if (strOptions != "{}")
  {
    var args = this.getConstructorArgs(this.widgetType);
    if (args && args.length < this.numReqCArgs)
	{
      // HACK: Adding the missing 2nd argument will cause the PI to
      // re-inspect the current selection, which in turn calls refresh()
      // which clears our opts. We need to restore our opts after the
      // the setType() call to make sure the correct options get written out.

      var savedOpts = this.opts;
      this.setType("none");
      this.opts = savedOpts;
	}
  }

  this.updateConstructorOptions(this.widgetType, this.numReqCArgs, this.opts);
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getStatesLabels = function()
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getStatesValues = function()
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

Spry.DesignTime.Widget.ValidationTextField.prototype.checkStateAvailability = function(stateName, ignoreOptions)
{
  var availability = false;
  var stateObj = this.states[stateName];
  var currentType = this.getType();

  if (stateObj)
  {
    var minChars = true;
    var maxChars = true;
    var minValue = true;
    var maxValue = true;
    var invalidFormat = true;
    var isRequired = true;

    switch (currentType)
    {
      // Case "integer":
      case "date":
      case "time":
      case "currency":
      case "real":
      {
        minChars = false;
        maxChars = false;
      }
      break;

      case "email":
      case "url":
      {
        minValue = false;
        maxValue = false;
      }
      break;

      case "credit_card":
      case "zip_code":
      case "phone_number":
      case "social_security_number":
      case "ip":
      case "custom":
      {
        minChars = false;
        maxChars = false;
        minValue = false;
        maxValue = false;
      }
      break;

      case "none":
      {
        invalidFormat = false;
        minValue = false;
        maxValue = false;
      }
      break;
    }

    if (!ignoreOptions)
    {
      if (this.getOption("isRequired", true) !== true)
      {
        isRequired = false;
      }

      minChars = minChars && (typeof this.getOption("minChars") != "undefined");
      maxChars = maxChars && (typeof this.getOption("maxChars") != "undefined");
      minValue = minValue && (typeof this.getOption("minValue") != "undefined");
      maxValue = maxValue && (typeof this.getOption("maxValue") != "undefined");
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

Spry.DesignTime.Widget.ValidationTextField.prototype.setDisplayedState = function(stateName)
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
      if (confirm(dw.loadString("spry/widgets/ValidationTextField/error/errorMessageMissing")))
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getDisplayedState = function()
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
//   This function validate the current DOM structure of the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   True if structure is valid false otherwise.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.prototype.isValidStructure = function()
{
  var retValue = false;
  this.ensureValidElements();
  if( this.element.hasChildNodes() )
  {
    var selNodes = this.element.getElementsByTagName("INPUT");
    for (var i=0; i<selNodes.length; i++)
    {
      if (!retValue && Spry.DesignTime.Widget.ValidationTextField.checkNode(selNodes[i]))
      {
        retValue = true;
        break;
      }
    }
  }
  else if( Spry.DesignTime.Widget.ValidationTextField.checkNode(this.element) )
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

Spry.DesignTime.Widget.ValidationTextField.prototype.isDuplicateControl = function()
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
        if( !arrElements[i].getAttribute("type") || arrElements[i].getAttribute("type") == "text" )
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

Spry.DesignTime.Widget.ValidationTextField.checkNode = function(theNode)
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
      if (!selectedNodeType || selectedNodeType == "text" || selectedNodeType == "password")
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

Spry.DesignTime.Widget.ValidationTextField.prototype.refresh = function()
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

Spry.DesignTime.Widget.ValidationTextField.prototype.getId = function()
{
  return this.element_id;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getFirstChildWithNodeNameAtAnyLevel
//
// DESCRIPTION:
//   This function search inside the "node" DOM element for "nodeName" elements
//   and returns the first occurence of that element.
//
// ARGUMENTS:
//   node - object - DOM element in wich the "nodeName" element will be searched
//   nodeName - string - DOM element tag name
//
// RETURNS:
//   First finded element or null if no element is finded.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.ValidationTextField.getFirstChildWithNodeNameAtAnyLevel = function(node, nodeName) {
  var elements  = node.getElementsByTagName(nodeName);
  if (elements) {
    return elements[0];
  }
  return null;
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

Spry.DesignTime.Widget.ValidationTextField.getErrorMessageSrc = function(messageClass, message)
{
  if (typeof(message) == "undefined")
  {
    message = dw.loadString("spry/widgets/ValidationTextField/defaultMessage");
  }

  return '<span class="' + messageClass + '">' + message + '</span>';
};

