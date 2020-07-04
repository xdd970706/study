// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.Accordion
//
// DESCRIPTION:
//   This class is used by the Accordion property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       Accordion(dom, objName, element, args)
//
//   Utils:
//
//       getId()
//       getPanelIndex(panel)
//       getPanels()
//       getPanelTab(panel)
//       getPanelContent(panel)
//       openPanel(panel)
//       refresh()
//
//   Update widget markup:
//
//       addNewPanel()
//
//   Validate widget markup:
//
//       ensureValidDefaultPanel();
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.Accordion.getNewAccordionConstructorSnippet(id)
//       Spry.DesignTime.Widget.Accordion.getNewAccordionSnippet(id, opts)
//       Spry.DesignTime.Widget.Accordion.getNewPanelSnippet(tab, content, counter)
//       Spry.DesignTime.Widget.Accordion.isValidPanelStructure(panel)
//
// PRIVATE FUNCTIONS:
//
//   Utils:
//
//       attachBehaviors(openPanelIndex)
//       attachPanelHandlers(panel)
//       init()
//       onDWContextButtonActivate(panel)
//       onRemoved()
//       setDisplay(ele, display)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   Accordion
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the Accordion's widget markup in the design view. This constructor
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
//                          var w1 = new Spry.Widget.Accordion('acc1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the
//                  constructor snippet looked like this:
//
//                          var w1 = new Spry.Widget.Accordion('acc1', { defaultPanel: 1 });
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'acc1\'"
//                      args[1] == " { defaultPanel: 1}"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1; // Our constructor only requires an ID arg.
  this.opts = {};
  this.setOptsFromArgsArray(args);
  this.init(element);
  this.ensureValidDefaultPanel();
  this.attachBehaviors(this.defaultPanel);
};

// Spry.DesignTime.Widget.Accordion derives from our Spry.DesignTime.Widget.Base
// class, so create a Base object and use it as our prototype so we inherit all of its
// methods.

Spry.DesignTime.Widget.Accordion.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to Accordion for our newly created prototype
// object so callers know that our object was created with the Accordion constructor.

Spry.DesignTime.Widget.Accordion.prototype.constructor = Spry.DesignTime.Widget.Accordion;

//--------------------------------------------------------------------
// FUNCTION:
//   init
//
// DESCRIPTION:
//   Initializes the design-time object's properties. This  method is
//   called from the constructor and refresh() methods.
//
// ARGUMENTS:
//   element - object - The widget's top-level DOM element.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.init = function(element)
{
  this.element = this.getElement(element);
  this.defaultPanel = 0;
  this.openClass = "AccordionPanelOpen";
  this.closedClass = "AccordionPanelClosed";
  this.currentPanel = null;
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

Spry.DesignTime.Widget.Accordion.getAssets = function()
{
	var assets = new Array();
	var tempObj;

	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/Accordion/SpryAccordion.js";
	tempObj.file = "SpryAccordion.js";
	tempObj.type = "javascript";
	assets.push(tempObj);
 
	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/Accordion/SpryAccordion.css";
	tempObj.file = "SpryAccordion.css";
	tempObj.type = "link";
	assets.push(tempObj);

	return assets;
};

//--------------------------------------------------------------------
// FUNCTION:
//   refresh
//
// DESCRIPTION:
//   None
//
// ARGUMENTS:
//   Syncs up the internal state of the design-time widget object
//   with the markup and constructor snippet that currently exists
//   in the design view.
//
//   This method gets called from the translator if a design-time
//   object already exists for a specific widget ID, and from various
//   methods in the Accordion property inspector.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.refresh = function()
{
  var curPanelIndex = this.getPanelIndex(this.currentPanel);
  if (curPanelIndex < 0)
  {
    this.ensureValidDefaultPanel();
    curPanelIndex = this.defaultPanel;
  }
  
  this.init(this.element_id);
  this.attachBehaviors(curPanelIndex);
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanelIndex
//
// DESCRIPTION:
//   Returns the index of the panel within the Accordion widget.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents the panel
//                    within the widget's markup structure.
//
// RETURNS:
//   The index of the panel within the widget or -1 if the panel
//   does not exist within the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.getPanelIndex = function(panel)
{
  if (panel && panel.ownerDocument)
  {
    var panels = this.getPanels();
    if (panels)
    {
      for (var i = 0; i < panels.length; i++)
      {
        if (panels[i] == panel)
          return i;
      }
    }
  }

  return -1;
};

//--------------------------------------------------------------------
// FUNCTION:
//   openPanel
//
// DESCRIPTION:
//   Opens the specified panel and closes any other panel that is
//   open.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents the panel
//                    within the widget's markup structure.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.openPanel = function(panel)
{
  var panelA = this.currentPanel;
  var panelB = panel;

  if (!panelA || !panelB || panelA == panelB)  
    return;

  var contentA = this.getPanelContent(panelA);
  var contentB = this.getPanelContent(panelB);

  if (!contentA || ! contentB)
    return;

  this.setDisplay(contentA, "none");
  this.setDisplay(contentB, "block");

  this.removeClassName(panelA, this.openClass);
  this.addClassName(panelA, this.closedClass);

  this.removeClassName(panelB, this.closedClass);
  this.addClassName(panelB, this.openClass);
  
  // Add the dw show button to the panel that's closing.
  if ( Spry.DesignTime.Widget.Accordion.isValidPanelStructure(panelA) ) { 
    this.addShowPanelContextButton(panelA);
  }
  
  // Remove the show button from the panel that's now open.
  this.removeContextButton(panelB);
  
  this.currentPanel = panelB;
};

//--------------------------------------------------------------------
// FUNCTION:
//   onRemoved
//
// DESCRIPTION:
//   Internal event callback function that is triggered when the
//   widget's top-level element and all of its children are removed
//   from the document. When triggered this function removes any
//   translated attributes, event handlers and context buttons.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.onRemoved = function()
{
  this.ensureValidElements();
  
  var panels = this.getPanels();
  if ( !panels )
    return;
    
  for (var i = 0; i < panels.length; i++)
  {
    var panel = panels[i];
    panel.removeTranslatedAttribute("style");
    panel.removeTranslatedAttribute("class");
    this.removeContextButton(panel);
    this.attachPanelHandlers(panel);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getId
//
// DESCRIPTION:
//   Returns the ID of the top-level widget DOM element.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   The ID of the element as a string.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.getId = function()
{
  return this.element_id;
};

//--------------------------------------------------------------------
// FUNCTION:
//   ensureValidDefaultPanel
//
// DESCRIPTION:
//   This function ensures that the default panel index refers to
//   an existing panel within the widget, or returns -1 if the
//   widget has no panels.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Index (integer) of the default panel, or -1 if no panel exists.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.ensureValidDefaultPanel = function()
{
  var panels = this.getPanels();
  if ( Spry.DesignTime.Widget.Accordion.isValidPanelStructure(panels[this.defaultPanel]) )
    return; //default is good already
    
  for ( var i = 0 ; i < panels.length ; i++ )
  {
    if ( Spry.DesignTime.Widget.Accordion.isValidPanelStructure(panels[i]) )
    {
      this.defaultPanel = i;
      return;
    }
  }
  
  //no good panels
  this.defaultPane = -1;
};

//--------------------------------------------------------------------
// FUNCTION:
//   addNewPanel
//
// DESCRIPTION:
//   Adds a new panel after the open (current) panel.
//
// ARGUMENTS:
//  tab - string - The content to insert into the tab of the new panel
//                   after it is created.
//  content - string - The content to insert into the content area of
//                     the new panel after it is created.
//
// RETURNS:
//   Returns the DOM element object that represents the new panel
//   or undefined if a new panel was not added.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.addNewPanel = function(tab, content)
{
  var addedPanel;
  var counter = 1;
  var panels = this.getPanels();
  if ( panels && panels.length )
    counter = panels.length + 1;
  var panelSnippet = Spry.DesignTime.Widget.Accordion.getNewPanelSnippet(tab, content, counter);
  
  if ( this.currentPanel && this.currentPanel.ownerDocument )
  {
    // Add it after the current panel.
    this.currentPanel.outerHTML = this.currentPanel.outerHTML + panelSnippet
    addedPanel = this.currentPanel.nextSibling;
  }
  else if ( this.element && this.element.ownerDocument )
  {
    // Add it at the top.
    this.element.innerHTML = panelSnippet + this.element.innerHTML;
    addedPanel = this.getPanels()[0];
  }
  return addedPanel;
};

//--------------------------------------------------------------------
// FUNCTION:
//   attachPanelHandlers
//
// DESCRIPTION:
//   Internal function that adds event handlers to the elements that
//   make up a single panel. These event handlers are meant to be
//   triggered from events generated by the user when interacting with
//   the widget in design view.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents the panel
//                    within the widget's markup structure.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.attachPanelHandlers = function(panel)
{
  if (!panel)
    return;

  var tab = this.getPanelTab(panel);

  if (tab)
  {
    var self = this;
    
    var canFireEvent = function()
    {
       if ( !self ) {
         return false;
      }
       
      self.ensureValidElements();
      
      if ( !self.curPanel || !self.curPanel.ownerDocument ) {
        self.refresh();
      }
      
      if ( !panel || !panel.ownerDocument ) {
        return false;
      }
      
      return true;
    };
    
    this.addEventListener(panel, "DWContextButtonActivate", function(e) { if ( canFireEvent() ) return self.onDWContextButtonActivate(panel); }, false);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanels
//
// DESCRIPTION:
//   Returns an array of DOM element nodes that represent each
//   panel within the widget.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Array of DOM element nodes.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.getPanels = function()
{
  this.ensureValidElements();
  return this.getElementChildren(this.element);
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanelTab
//
// DESCRIPTION:
//   Returns the DOM element node that represents the tab of the
//   specified panel.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents a panel
//                    within the widget's markup structure.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.getPanelTab = function(panel)
{
    if (!panel)
        return null;
    return this.getElementChildren(panel)[0];
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanelContent
//
// DESCRIPTION:
//   Returns the DOM element node that represents the content
//   container of the specified panel.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents a panel
//                    within the widget's markup structure.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.getPanelContent = function(panel)
{
    if (!panel)
        return null;
    return this.getElementChildren(panel)[1];
};

//--------------------------------------------------------------------
// FUNCTION:
//   attachBehaviors
//
// DESCRIPTION:
//   Internal utility function for attaching event handlers to all
//   panels and setting the initial display state of the widget.
//
// ARGUMENTS:
//   openPanelIndex - integer - The index of the panel that should
//                              be open after this function has
//                              finished executing.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.attachBehaviors = function(openPanelIndex)
{
  var panels = this.getPanels();
  for (var i = 0; i < panels.length; i++)
  {
    var content = this.getPanelContent(panels[i]);
    if (i == openPanelIndex)
    {
      this.currentPanel = panels[i];
      this.removeClassName(this.currentPanel, this.closedClass);
      this.addClassName(this.currentPanel, this.openClass);
      if (content)
        this.setDisplay(content, "block");
    }
    else
    {
      this.removeClassName(panels[i], this.openClass);
      this.addClassName(panels[i], this.closedClass);
      if (content)
        this.setDisplay(content, "none");
      
      // For the closed panels, add the open panel icon.
      if ( Spry.DesignTime.Widget.Accordion.isValidPanelStructure(panels[i]) ) { 
        this.addShowPanelContextButton(panels[i]);
      }
    }
    
    this.attachPanelHandlers(panels[i]);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDisplay
//
// DESCRIPTION:
//   Internal utility function for setting the translated display
//   property of a DOM element.
//
// ARGUMENTS:
//   ele - object - DOM element.
//   display - string - CSS value to set the display property to.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.setDisplay = function(ele, display)
{
  if ( ele )
    ele.translatedStyle.display = display;
};

//--------------------------------------------------------------------
// FUNCTION:
//   onDWContextButtonActivate
//
// DESCRIPTION:
//   Internal event callback function for handling the click on the
//   activate button that appears in the tab of the panel in design view.
//   Clicking on this button in design view causes the corresponding
//   panel to open.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents a panel
//                    within the widget's markup structure.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.prototype.onDWContextButtonActivate = function(panel)
{
  if (panel != this.currentPanel)
    this.openPanel(panel);
};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.Accordion.getNewPanelSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a new Accordion panel.
//
// ARGUMENTS:
//  tab - string - The content to insert into the tab of the panel. If
//                 null, undefined or empty, a default label is used.
//  content - string - The content to insert into the panel's content area.
//                     If null, undefined or empty, a default content string
//                     is used.
//  counter - integer - Unique integer value appended to the tab label and
//                      content so that it is unique.
//
// RETURNS:
//   String that is the HTML markup fragment for the panel.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.getNewPanelSnippet = function(tab, content, counter)
{
  if ( typeof counter == 'number' ) counter = " " + counter;
  if ( typeof counter == 'undefined' ) counter = "";
  if ( typeof tab == 'undefined' ) tab = dw.loadString('spry/widgets/accordion/newSnippet/label'); 
  if ( typeof content == 'undefined' ) content = dw.loadString('spry/widgets/accordion/newSnippet/content');
  
  return  '<div class="AccordionPanel"><div class="AccordionPanelTab">' + tab + counter + '</div><div class="AccordionPanelContent">' + content + counter + '</div></div>';
};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.Accordion.getNewAccordionSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete Accordion.
//
// ARGUMENTS:
//  id - string - The string to use as the widget's id attribute.
//  opts - object - Options for generating the markup. Valid option
//                  properties are:
//
//                      tab - The content to insert into each tab.
//                      content - The content to insert into each
//                                content panel.
//                      panelCount - Number of panels to create.
//
// RETURNS:
//   String that is the HTML markup fragment for the panel.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.getNewAccordionSnippet = function(id, opts)
{
  var tab;
  var content;
  var numPanels = 2;
  if ( typeof opts != 'undefined' ) 
  {
    if ( typeof opts.tab != 'undefined' ) tab = opts.tab;
    if ( typeof opts.content != 'undefined' ) content = opts.content;
    if ( typeof opts.panelCount != 'undefined' ) numPanels = opts.panelCount;
  }
  
  var accSnippet = '<div id="' + id + '" class="Accordion" tabindex="0">'
  for ( var i = 0 ; i < numPanels ; i++ ) {
    accSnippet += Spry.DesignTime.Widget.Accordion.getNewPanelSnippet(tab, content, i+1) ;
  }
  accSnippet += '</div>';
  
  return accSnippet;
};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.Accordion.getNewAccordionConstructorSnippet
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

Spry.DesignTime.Widget.Accordion.getNewAccordionConstructorSnippet = function(id)
{
  return 'var ' + id + ' = new Spry.Widget.Accordion("' + id + '");';
};


//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesignTime.Widget.Accordion.isValidPanelStructure
//
// DESCRIPTION:
//   Static utility function that traverses the markup structure
//   for a single accordion panel and checks to see if it contains
//   the correct nesting and number of elements.
//
// ARGUMENTS:
//   panel - object - The DOM element that represents a panel
//                    within the widget's markup structure.
//
// RETURNS:
//   true if widget structure is valid, or false if it is invalid.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.Accordion.isValidPanelStructure = function(panel)
{
  if ( !panel )
    return false;
  
  //needs to be a node
  if ( !panel.hasChildNodes )
    return false;
  
  //we expect exactly two child elements
  var children = panel.childNodes;
  if ( !children || !children.length || children.length < 2 )
    return false;
  
  var elementCount = 0;
  for (var i = 0 ; i < children.length ; i++ )
  {
    if ( children[i].nodeType == Node.ELEMENT_NODE ){
      elementCount++;
    }
  }

  return (elementCount == 2);
};
