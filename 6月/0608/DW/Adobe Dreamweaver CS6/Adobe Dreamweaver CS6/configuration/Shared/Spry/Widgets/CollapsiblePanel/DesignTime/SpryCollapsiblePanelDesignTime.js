// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.CollapsiblePanel
//
// DESCRIPTION:
//   This class is used by the CollapsiblePanel property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       CollapsiblePanel(dom, objName, element, args)
//
//   Utils:
//
//       close()
//       getContent()
//       getDefaultOpenState()
//       getEnableAnimation()
//       getTab()
//       isOpen()
//       open()
//       refresh()
//
//   Update widget constructor snippet:
//
//       setDefaultOpenState(isOpen)
//       setEnableAnimation(enable)
//
//   Validate widget markup:
//
//       isValidPanelStructure()
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.CollapsiblePanel.getAssets()
//       Spry.DesignTime.Widget.CollapsiblePanel.getConstructorSnippet(id)
//       Spry.DesignTime.Widget.CollapsiblePanel.getMarkupSnippet(id, label, content)
//
// PRIVATE FUNCTIONS:
//
//   Utils:
//
//       attachBehaviors()
//       attachPanelHandlers()
//       onDWContextButtonActivate()
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   CollapsiblePanel
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the CollapsiblePanel's widget markup in the design view. This constructor
//   is registered in the Spry Widget translator found at:
//
//       Configuration/Translators/SpryWidget.htm
//
//   and will automatically be invoked for any tabbed panels markup on the
//   page.
//
// ARGUMENTS:
//   dom - object - The DOM used by the document in design view.
//   objName - string - The name of the variable used within the constructor
//                      snippet that will be hold the resulting widget object. This
//                      would be the equivalent of "w1" in the following example:
//
//                          var w1 = new Spry.Widget.CollapsiblePanel('acc1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.CollapsiblePanel('cp', { isOpen: false });
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'acc1\'"
//                      args[1] == " { isOpen: false }"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel = function(dom, objName, element, args)
{
    Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Number of *required* args to the constructor.
  this.opts = {};
  this.hoverClass = "CollapsiblePanelTabHover";
  this.openClass = "CollapsiblePanelOpen";
  this.closedClass = "CollapsiblePanelClosed";
  this.focusedClass = "CollapsiblePanelFocused";

  this.setOptsFromArgsArray(args);

  this.contentIsOpen = this.getDefaultOpenState();

  this.attachBehaviors();
}; 

// Spry.DesignTime.Widget.CollapsiblePanel derives from our Spry.DesignTime.Widget.Base
// class, so create a Base object and use it as our prototype so we inherit all of its
// methods.

Spry.DesignTime.Widget.CollapsiblePanel.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to CollapsiblePanel for our newly created prototype
// object so callers know that our object was created with the CollapsiblePanel constructor.

Spry.DesignTime.Widget.CollapsiblePanel.prototype.constructor = Spry.DesignTime.Widget.CollapsiblePanel; 


//--------------------------------------------------------------------
// FUNCTION:
//   getAssets
//
// DESCRIPTION:
//   Static function that returns the assets to be applied to page.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (array of objects)
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.getAssets = function()
{
  var assets = new Array();
  var tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/CollapsiblePanel/SpryCollapsiblePanel.js";
  tempObj.file = "SpryCollapsiblePanel.js";
  tempObj.type = "javascript";
  assets.push(tempObj);
 
  tempObj = new Object();
  tempObj.fullPath = "Shared/Spry/Widgets/CollapsiblePanel/SpryCollapsiblePanel.css";
  tempObj.file = "SpryCollapsiblePanel.css";
  tempObj.type = "link";
  assets.push(tempObj);

  return assets;
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
//   object already exists for a specific widget ID, and from various
//   methods in the CollapsiblePanel property inspector.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.refresh = function()
{
  this.ensureValidElements();
  // Reinitialize widget options.
  this.opts = {};
  
  var args = this.getConstructorArgs(this.widgetType);
  this.setOptsFromArgsArray(args);
  this.attachBehaviors();
};

//--------------------------------------------------------------------
// FUNCTION:
//   onDWContextButtonActivate
//
// DESCRIPTION:
//   Internal event callback function for handling the click on the
//   activate button that appears in the CollapsiblePanel's tab in
//   design view. Clicking on this button in design view causes the
//   widget to open or close.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.onDWContextButtonActivate = function()
{
  if (this.isOpen())
    this.close();
  else
    this.open();
};

//--------------------------------------------------------------------
// FUNCTION:
//   open
//
// DESCRIPTION:
//   Opens the content region of the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.open = function()
{
  var contentPanel = this.getContent();
  if (contentPanel)
  {
      this.contentIsOpen = true;
      contentPanel.translatedStyle.display = "block";
      this.removeClassName(this.element, this.closedClass);
      this.addClassName(this.element, this.openClass);
    
    // Add the dw button to toggle the panel.
    this.addHidePanelContextButton(this.getTab());
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   close
//
// DESCRIPTION:
//   Closes the content region of the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.close = function()
{
  var contentPanel = this.getContent();
  if (contentPanel)
  {
      this.contentIsOpen = false;
      contentPanel.translatedStyle.display = "none";
      this.removeClassName(this.element, this.openClass);
      this.addClassName(this.element, this.closedClass);
    
    if( this.isValidPanelStructure() )
    {
      // Add the dw button to toggle the panel.
      this.addShowPanelContextButton(this.getTab());
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   attachPanelHandlers
//
// DESCRIPTION:
//   Internal function that adds event handlers to the elements that
//   make up the widget. These event handlers are meant to be
//   triggered from events generated by the user when interacting with
//   the widget in design view.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.attachPanelHandlers = function()
{
  var tab = this.getTab();

  if (tab)
  {
    var self = this;
    this.addEventListener(tab, "DWContextButtonActivate", function(e) { return self.onDWContextButtonActivate(tab); }, false);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   attachBehaviors
//
// DESCRIPTION:
//   Internal utility function for attaching event handlers to the
//   elements that make up the widget and setting the initial display
//   state of the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.attachBehaviors = function()
{
  var panel = this.element;
  var tab = this.getTab();
  var content = this.getContent();
  
  if ( !content )
   return;

  if (this.contentIsOpen || this.hasClassName(panel, this.openClass))
  {
    this.removeClassName(panel, this.closedClass);
    content.translatedStyle.display = "block";
    this.contentIsOpen = true;
    
    // Add the dw button to toggle the panel.
    this.addHidePanelContextButton(tab);
  }
  else
  {
    this.removeClassName(panel, this.openClass);
    this.addClassName(panel, this.closedClass);
    content.translatedStyle.display = "none";
    this.contentIsOpen = false;
    
    // Add the dw button to toggle the panel.
    this.addShowPanelContextButton(tab);
  }

  this.attachPanelHandlers();
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTab
//
// DESCRIPTION:
//   Returns the DOM element that is the tab of the collapsible panel.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.getTab = function()
{
  this.ensureValidElements();
  return this.getElementChildren(this.element)[0];
};

//--------------------------------------------------------------------
// FUNCTION:
//   getContent
//
// DESCRIPTION:
//   Returns the DOM element that is the content container of the
//   collapsible panel.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.getContent = function()
{
  this.ensureValidElements();
  return this.getElementChildren(this.element)[1];
};

//--------------------------------------------------------------------
// FUNCTION:
//   isOpen
//
// DESCRIPTION:
//   Returns a boolean that indicates whether the panel is showing
//   its content area or not.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Boolean value. true if panel is open, false if it is closed.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.isOpen = function()
{
  return this.contentIsOpen;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isValidPanelStructure
//
// DESCRIPTION:
//   Traverses the markup structure for the widget and checks to see
//   if it contains the correct nesting and number of elements.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   true if widget structure is valid, or false if it is invalid.
//--------------------------------------------------------------------

//checks the structure of a panel to make sure it's what we think is a panel
Spry.DesignTime.Widget.CollapsiblePanel.prototype.isValidPanelStructure = function()
{
  return this.getTab() && this.getContent();
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultOpenState
//
// DESCRIPTION:
//   Modifies the isOpen option for the constructor snippet in the
//   document.
//
// ARGUMENTS:
//  isOpen - boolean - If true, the widget will be open when initially
//                     loaded into the browser. If false, it will be
//                     closed.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.setDefaultOpenState = function(isOpen)
{
  this.opts.contentIsOpen = isOpen ? undefined : false;
  this.updateOptions();
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDefaultOpenState
//
// DESCRIPTION:
//   Returns the initial state of the widget when loaded into the
//   browser. If true, the widget is open. If false, the widget is
//   closed.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   true if the initial state of the widget is open. false if it
//   is closed.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.getDefaultOpenState = function()
{
  return (typeof this.opts.contentIsOpen != "undefined") ? this.opts.contentIsOpen : true;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setEnableAnimation
//
// DESCRIPTION:
//   Modifies the enableAnimation option for the constructor snippet
//   in the document.
//
// ARGUMENTS:
//  enable - boolean - If true, the widget will animate the opening
//                     or closing of the widget. If false, the widget
//                     will immediately open or close.
//
// RETURNS:
//   true if animation is enabled, false if it isn't.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.setEnableAnimation = function(enable)
{
  this.opts.enableAnimation = enable ? undefined : false;
  this.updateOptions();
};

//--------------------------------------------------------------------
// FUNCTION:
//   getEnableAnimation
//
// DESCRIPTION:
//   Returns the value of the enableAnimation option to the widget
//   constructor. If true, the widget will animate when opening or
//   closing, false if it doesn't.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   true if the widget will animate, false if it won't.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.prototype.getEnableAnimation = function()
{
  return (typeof this.opts.enableAnimation != "undefined") ? this.opts.enableAnimation : true;
};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.CollapsiblePanel.getMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete CollapsiblePanel widget.
//
// ARGUMENTS:
//  id - string - The value for the widget's id attribute.
//  label - string - The content to insert into the panel's tab.
//  content - string - The content to insert into the panel's content area.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.getMarkupSnippet = function(id, label, content)
{
  var str = "<div id=\"" + id + "\" class=\"CollapsiblePanel\">";
  str += "<div class=\"CollapsiblePanelTab\" tabindex=\"0\">" + label + "</div>";
  str += "<div class=\"CollapsiblePanelContent\">" + content + "</div>";
  str += "</div>";
  return str;
};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.CollapsiblePanel.getConstructorSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string that contains the
//   constructor snippet for creating a widget with the specified id.
//
// ARGUMENTS:
//  id - string - The id of the widget markup to insert into the
//                constructor snippet.
//
// RETURNS:
//   String containing JS that is the constructor call to create the
//   widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.CollapsiblePanel.getConstructorSnippet = function(id)
{
  return "var " + id + " = new Spry.Widget.CollapsiblePanel(\"" + id + "\");";
};
