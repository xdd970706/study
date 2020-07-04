// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.TabbedPanels
//
// DESCRIPTION:
//   This class is used by the TabbedPanels property inspector to manage
//   and manipulate the design-time state of the widget's markup in the
//   design view.
//
// PUBLIC FUNCTIONS:
//
//   Constructor:
//
//       TabbedPanels(dom, objName, element, args)
//
//   Utils:
//
//       getTabGroup()
//       getTabs()
//       getContentPanelGroup()
//       getContentPanels()
//       getCurrentPanelIndex()
//       getDefaultTab()
//       getTabbedPanelCount()
//       getTabbedPanelIndex(ele)
//       refresh()
//       showPanel(elementOrIndex)
//
//   Update widget markup:
//
//       movePanelUp(panelIndex)
//       movePanelDown(panelIndex)
//       addPanel(prevIndex, label, content)
//       removePanel(panelIndex)
//
//   Update widget constructor snippet:
//
//       setDefaultTab(defaultTabIndex)
//
//   Validate widget markup:
//
//       isValidTabbedPanelsStructure(ele)
//       isValidPanelStructure(panelIndex)
//
//   Static Utility Functions:
//
//       Spry.DesignTime.Widget.TabbedPanels.getMarkupSnippet(id, label, content)
//       Spry.DesignTime.Widget.TabbedPanels.getConstructorSnippet(id)
//       Spry.DesignTime.Widget.TabbedPanels.getTabGroupMarkupSnippet()
//       Spry.DesignTime.Widget.TabbedPanels.getPanelGroupMarkupSnippet()
//       Spry.DesignTime.Widget.TabbedPanels.getTabMarkupSnippet(label, counter)
//       Spry.DesignTime.Widget.TabbedPanels.getPanelMarkupSnippet(content, counter)
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   TabbedPanels
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of
//   the TabbedPanels widget markup in the design view. This constructor
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
//                          var w1 = new Spry.Widget.TabbedPanels('tp1');
//
//   element - object - The top-level DOM element for our widget markup.
//   args - array - An array of strings that represent the args passed to the
//                  constructor in the constructor snippet. For example, if the constructor
//                  snippet looked like this:
//
//                          var w1 = new Spry.Widget.TabbedPanels('tp1', { defaultTab: 1 });
//
//                  args would be an array of two elements:
//
//                      args[0] == "\'tp1\'"
//                      args[1] == " { defaultTab: 1}"
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels = function(dom, objName, element, args)
{
  Spry.DesignTime.Widget.Base.call(this, dom, objName, element);

  this.numReqCArgs = 1;
  this.opts = {};
  this.tabSelectedClass = "TabbedPanelsTabSelected";
  this.tabHoverClass = "TabbedPanelsTabHover";
  this.panelVisibleClass = "TabbedPanelsContentVisible";

  this.setOptsFromArgsArray(args);

  this.currentTabIndex = this.getDefaultTab();

  this.attachBehaviors();
  this.addDwEditingAttributes();
}; 

// Spry.DesignTime.Widget.TabbedPanels derives from our Spry.DesignTime.Widget.Base
// class, so create a Base object and use it as our prototype so we inherit all of its
// methods.

Spry.DesignTime.Widget.TabbedPanels.prototype = new Spry.DesignTime.Widget.Base();

// Reset the constructor property back to TabbedPanels for our newly created prototype
// object so callers know that our object was created with the TabbedPanels constructor.

Spry.DesignTime.Widget.TabbedPanels.prototype.constructor = Spry.DesignTime.Widget.TabbedPanels;

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

Spry.DesignTime.Widget.TabbedPanels.getAssets = function()
{
	var assets = new Array();
	var tempObj;

	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/TabbedPanels/SpryTabbedPanels.js";
	tempObj.file = "SpryTabbedPanels.js";
	tempObj.type = "javascript";
	assets.push(tempObj);
 
	tempObj = new Object();
	tempObj.fullPath = "Shared/Spry/Widgets/TabbedPanels/SpryTabbedPanels.css";
	tempObj.file = "SpryTabbedPanels.css";
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
//   methods in the TabbedPanels property inspector.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.refresh = function()
{
  this.ensureValidElements();

  // Re-fetch the widget options from the constructor
  // snippet in case it changed.
  this.opts = {};
  var args = this.getConstructorArgs(this.widgetType);
  this.setOptsFromArgsArray(args);

  // Attach any behaviors and translated attributes to the
  // widget elements in case some new elements were added.
  this.attachBehaviors();
  this.addDwEditingAttributes();
};

//--------------------------------------------------------------------
// FUNCTION:
//   addNoSplitAttr
//
// DESCRIPTION:
//   Internal utility function used to set translated attributes
//   on an element, and conditionally on its children, to prevent
//   Dreamweaver from splitting the element when the user hits
//   the return key.
//
//   These attributes are added to the Tab buttons of the TabbedPanels
//   widget. Since the Tab buttons are <li> elements, we want to prevent
//   Dreamweaver from inserting a new <li> if the user ever hits return.
//   Instead, we tell Dreamweaver to insert a <br>.
//
// ARGUMENTS:
//  ele - object - The DOM element to set the translated attributes on.
//  useBR - boolean - If true tell DW to insert a <br> when the return key is hit.
//  addToChildren - boolean - If true, the function recursively traverses down
//                            the element's child sub-trees adding the translated
//                            attributes to each element.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.addNoSplitAttr = function(ele, useBR, addToChildren)
{
  if (!ele || ele.nodeType != 1 /* ELEMENT_NODE */)
    return;

  ele.setTranslatedAttribute("dwedit:nosplit", "nosplit");

  if (useBR)
    ele.setTranslatedAttribute("dwedit:usebr", "usebr");

  if (addToChildren)
  {
    if (ele.hasChildNodes())
    {
      var child = ele.firstChild;
      while (child)
      {
        if (child.nodeType == 1 /* ELEMENT_NODE */)
          this.addNoSplitAttr(child, useBR, addToChildren);
        child = child.nextSibling;
      }
    }
  }
}; 

//--------------------------------------------------------------------
// FUNCTION:
//   addDwEditingAttributes
//
// DESCRIPTION:
//   Iterates over all the tab buttons in the TabbedPanels widget
//   to add translated attributes that prevent them from being split
//   when the user hits the return key when editing the tab button
//   content.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.addDwEditingAttributes = function()
{
  // If the user hits the return key while the caret is in a
  // tab, we want to prevent the list item handling code from automatically
  // splitting our tab since it will cause a broken widget structure.
  // Instead, just insert a br. We prevent the auto-splitting behavior from
  // occurring by adding the nosplit attribute to the tab element and all
  // of its child elements.

  var tabs = this.getTabs();
  for(var i = 0; i < tabs.length ; i++ )
  {
    var ele = tabs[i];
    if(ele)
      this.addNoSplitAttr(ele, true, true);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getCurrentPanelIndex
//
// DESCRIPTION:
//   Returns the index of the tab panel that is currently showing.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getCurrentPanelIndex = function()
{
  return this.currentTabIndex;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabGroup
//
// DESCRIPTION:
//   Returns the DOM element that is the container that holds all
//   of the tab buttons.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   DOM element object or null.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getTabGroup = function()
{
  this.ensureValidElements();
  if (this.element)
  {
    var children = this.getElementChildren(this.element);
    if (children.length && children[0].tagName.toLowerCase() == "ul")
      return children[0];
  }
  return null;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabs
//
// DESCRIPTION:
//   Returns an array containing all of the tab button elements. 
//   This function always returns an array. If the tab group element
//   is missing, or contains no tab button elements, the array returned
//   will contain no elements and have a length of zero.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   Array of tab button elements.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getTabs = function()
{
  var tabs = [];
  var tg = this.getTabGroup();
  if (tg)
    tabs = this.getElementChildren(tg);
  return tabs;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getContentPanelGroup
//
// DESCRIPTION:
//   Returns the DOM element that is the container that holds all
//   of the tab content panels.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   DOM element object or null.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getContentPanelGroup = function()
{
  this.ensureValidElements();
  if (this.element)
  {
    var children = this.getElementChildren(this.element);
    if (children.length > 1)
      return children[1];
    else if (children.length == 1 && children[0].tagName.toLowerCase() != "ul")
      return children[0];
  }
  return null;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getContentPanels
//
// DESCRIPTION:
//   Returns an array containing all of the tab content panel elements. 
//   This function always returns an array. If the tab content panel group
//   element is missing, or contains no tab button elements, the array
//   returned will contain no elements and have a length of zero.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   Array of tab content panel elements.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getContentPanels = function()
{
  var panels = [];
  var pg = this.getContentPanelGroup();
  if (pg)
    panels = this.getElementChildren(pg);
  return panels;
};

//--------------------------------------------------------------------
// FUNCTION:
//   onDWContextButtonActivate
//
// DESCRIPTION:
//   Internal event callback function for handling the click on the
//   activate button that appears in tab buttons in design view.
//   Clicking on this button in design view causes the corresponding
//   tab panel to show.
//
// ARGUMENTS:
//   tab - object - The tab button element.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.onDWContextButtonActivate = function(tab)
{
  // Treat context button activate event the same as a click.
  this.showPanel(tab);
};

//--------------------------------------------------------------------
// FUNCTION:
//   addPanelEventListeners
//
// DESCRIPTION:
//   Internal function that adds event handlers to the elements that
//   make up a single tab panel. These event handlers are meant to be
//   triggered from events generated by the user when interacting with
//   the widget in design view.
//
//   Currently, only tab buttons have event handlers on them.
//
// ARGUMENTS:
//  tab - object - The tab button DOM element.
//  panel - object - The tab content panel DOM element.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.addPanelEventListeners = function(tab, panel)
{
  var self = this;
  this.addEventListener(tab, "DWContextButtonActivate", function(e) { return self.onDWContextButtonActivate(tab); }, false);
};

//--------------------------------------------------------------------
// FUNCTION:
//   getIndex
//
// DESCRIPTION:
//   Internal utility function that returns the index of the specified
//   element in the specified array.
//
// ARGUMENTS:
//  ele - object - DOM element object.
//  arr - array - Array of DOM element objects.
//
// RETURNS:
//   The index of ele in arr, or -1 if not found.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getIndex = function(ele, arr)
{
  ele = this.getElement(ele);
  if (ele && arr && arr.length)
  {
    for (var i = 0; i < arr.length; i++)
    {
      if (ele == arr[i])
        return i;
    }
  }
  return -1;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabbedPanelIndex
//
// DESCRIPTION:
//   Utility function for getting the tab panel index for a given
//   tab button or tab content panel element.
//
// ARGUMENTS:
//  ele - object - DOM element that is either the tab button or tab
//                 content panel.
//
// RETURNS:
//   The index of the tab panel, or -1 if not found.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getTabbedPanelIndex = function(ele)
{
  // Check if ele is in our list of tabs.
  var i = this.getIndex(ele, this.getTabs());
  if (i < 0)
  {
    // ele wasn't in our list of tabs so now check
    // through our list of content panels.
    i = this.getIndex(ele, this.getContentPanels());
  }
  return i;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabbedPanelCount
//
// DESCRIPTION:
//   Returns the number of tab panels in the widget.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   Returns the number of tab panels in the widget, or zero if the
//   widget contains no tab panels.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getTabbedPanelCount = function()
{
  return Math.min(this.getTabs().length, this.getContentPanels().length);
};

//--------------------------------------------------------------------
// FUNCTION:
//   showPanel
//
// DESCRIPTION:
//   Shows the tab panel specified by the given index, tab button
//   DOM element, or tab button panel DOM element.
//
// ARGUMENTS:
//  ele - integer or object - Index of the tab panel to show, or the
//                            tab button or tab content panel element
//                            of the tab panel to show.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.showPanel = function(elementOrIndex)
{
  this.ensureValidElements();

  var tpIndex = -1;
  
  if (typeof elementOrIndex == "number")
    tpIndex = elementOrIndex;
  else // Must be the element for the tab or content panel.
    tpIndex = this.getTabbedPanelIndex(elementOrIndex);
  
  var numTabbedPanels = this.getTabbedPanelCount();

  if (tpIndex < 0 || tpIndex >= numTabbedPanels)
  {
    if (this.currentTabIndex >= 0 && this.currentTabIndex < numTabbedPanels)
      tpIndex = this.currentTabIndex;
    else if (tpIndex <= 0)
      tpIndex = 0;
    else // tpIndex >= nunmTabbedPanels
      tpIndex = numTabbedPanels - 1;
  }

  var tabs = this.getTabs();
  var panels = this.getContentPanels();

  numTabbedPanels = Math.max(tabs.length, panels.length);

  for (var i = 0; i < numTabbedPanels; i++)
  {
    if (i != tpIndex)
    {
      if (tabs[i])
      {
        this.removeClassName(tabs[i], this.tabSelectedClass);
        
        // Add the dw show button to the closed tab.
        if( this.isValidPanelStructure(i) )
        {
          this.addShowPanelContextButton(tabs[i]);
        }
      }
      
      if (panels[i])
      {
        this.removeClassName(panels[i], this.panelVisibleClass);
        panels[i].translatedStyle.display = "none";
      }
    }
  }

  this.currentTabIndex = tpIndex;
  if (tabs[tpIndex])
  {
    this.addClassName(tabs[tpIndex], this.tabSelectedClass);
    
    // Remove the dw show button from the panel that's now open.
    this.removeContextButton(tabs[tpIndex]);
  }
  
  if (panels[tpIndex])
  {
    this.addClassName(panels[tpIndex], this.panelVisibleClass);
    panels[tpIndex].translatedStyle.display = "block";
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   attachBehaviors
//
// DESCRIPTION:
//   Internal utility function for attaching event handlers to all
//   tab panels and setting the initial display state of the widget.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.attachBehaviors = function()
{
  var tabs = this.getTabs();
  var panels = this.getContentPanels();
  var panelCount = this.getTabbedPanelCount();

  for (var i = 0; i < panelCount; i++)
    this.addPanelEventListeners(tabs[i], panels[i]);

  this.showPanel(this.currentTabIndex);
};

//--------------------------------------------------------------------
// FUNCTION:
//   isValidTabbedPanelsStructure
//
// DESCRIPTION:
//   Traverses the widget markup structure and checks to see if
//   it contains the correct nesting and number of elements.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   true if widget structure is valid, or false if it is invalid.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.isValidTabbedPanelsStructure = function()
{
  var ele = this.element;
  if( !ele || !ele.hasChildNodes )
    return false;
  
  // We expect the tabbed panels container to contain 2 elements.
  // The first is the tab group container, the 2nd is the tabbed
  // content panels container.

  var eleChildren = this.getElementChildren(ele);
  if (!eleChildren || eleChildren.length < 2)
    return false;

  // Make sure that we have matching pairs of tabs and content
  // panels.

  var numTabs = this.getTabs().length;
  var numPanels = this.getContentPanels().length;

  return (numTabs == numPanels);
};

//--------------------------------------------------------------------
// FUNCTION:
//   isValidPanelStructure
//
// DESCRIPTION:
//   Makes sure that a tab button and tab content panel exists
//   for the tab panel with the specified index.
//
// ARGUMENTS:
//  panelIndex - integer - The index of the tab panel to validate.
//
// RETURNS:
//   true if panel is valid and false if it is invalid.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.isValidPanelStructure = function(panelIndex)
{
  return this.getTabs()[panelIndex] && this.getContentPanels()[panelIndex];
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultTab
//
// DESCRIPTION:
//   Adds the defaultTab option to the constructor snippet in the
//   document.
//
// ARGUMENTS:
//  defaultTabIndex - integer - The index of the tab panel to show by default.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.setDefaultTab = function(defaultTabIndex)
{
  this.opts.defaultTab = (defaultTabIndex == 0) ? undefined : defaultTabIndex;
  this.updateOptions();
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDefaultTab
//
// DESCRIPTION:
//   Returns the index of the tab panel that will show by default
//   when the document is loaded into the browser.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   The index of the default tab panel or zero if it is not specified
//   in the widget's constructor snippet.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.getDefaultTab = function()
{
  return (typeof this.opts.defaultTab != "undefined") ? this.opts.defaultTab : 0;
};

//--------------------------------------------------------------------
// FUNCTION:
//   movePanelUp
//
// DESCRIPTION:
//   Moves the tab panel at the current index to the index-1 position.
//   Does nothing if the specified index is zero.
//
// ARGUMENTS:
//  panelIndex - integer - Index of the tab panel to move.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.movePanelUp = function(panelIndex)
{
  var tabs = this.getTabs();
  var numTabs = tabs.length;

  if (panelIndex < 1 || numTabs < 2 || panelIndex >= tabs.length)
    return;

  var panels = this.getContentPanels();

  var prevTab = tabs[panelIndex - 1];
  var prevPanel = panels[panelIndex - 1];

  var tab = tabs[panelIndex];
  var panel = panels[panelIndex];

  if (!prevTab || !prevPanel || !tab || !panel)
    return;

  prevTab.outerHTML = tab.outerHTML + prevTab.outerHTML;
  tab.outerHTML = "";

  prevPanel.outerHTML = panel.outerHTML + prevPanel.outerHTML;
  panel.outerHTML = "";
};

//--------------------------------------------------------------------
// FUNCTION:
//   movePanelDown
//
// DESCRIPTION:
//   Moves the tab panel at the current index to the index+1 position
//   within the widget. Does nothing if the specified index is for the
//   last tab panel in the widget.
//
// ARGUMENTS:
//  panelIndex - integer - Index of the tab panel to move.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.movePanelDown = function(panelIndex)
{
  this.movePanelUp(panelIndex + 1);
};

//--------------------------------------------------------------------
// FUNCTION:
//   addPanel
//
// DESCRIPTION:
//   Adds a new tab panel after the tab panel specified by prevIndex.
//
// ARGUMENTS:
//  prevIndex - integer - The index of the tab panel to insert the new
//                        panel after.
//  label - string - The content to insert into the new tab button
//                   after it is created.
//  content - string - The content to insert into the new tab content
//                     panel after it is created.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.addPanel = function(prevIndex, label, content)
{
  var counter = 1;
  var tabs = this.getTabs();
  if( tabs && tabs.length )
    counter = tabs.length + 1;
    
  var tStr = Spry.DesignTime.Widget.TabbedPanels.getTabMarkupSnippet(label, counter);
  var pStr = Spry.DesignTime.Widget.TabbedPanels.getPanelMarkupSnippet(content, counter);

  if (prevIndex == -1)
  {
    var tg = this.getTabGroup();
    var pg = this.getContentPanelGroup();
    
    if (tg && pg)
    {
      tg.innerHTML = tStr;
      pg.innerHTML = pStr;
    }

    return;
  }
  
  var prevTab = this.getTabs()[prevIndex];
  var prevPanel = this.getContentPanels()[prevIndex];

  if (!prevTab || !prevPanel)
    return;

  prevTab.outerHTML = prevTab.outerHTML + tStr;
  prevPanel.outerHTML = prevPanel.outerHTML + pStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   removePanel
//
// DESCRIPTION:
//   Removes the tab panel at the specifed index.
//
// ARGUMENTS:
//  panelIndex - integer - The index of the panel to be removed.
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.removePanel = function(panelIndex)
{
  var tab = this.getTabs()[panelIndex];
  if (tab)
    tab.outerHTML = "";

  var panel = this.getContentPanels()[panelIndex];
  if (panel)
    panel.outerHTML = "";
};

//--------------------------------------------------------------------
// FUNCTION:
//   repairGroupsIfNeeded
//
// DESCRIPTION:
//   Inspects the widget markup structure and adds a tab group
//   container or content panel group container if it is missing.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.prototype.repairGroupsIfNeeded = function()
{
  var tabGroup = this.getTabGroup();
  var panelGroup = this.getContentPanelGroup();

  if (tabGroup && panelGroup)
    return;

  var tgStr = "";
  var pgStr = "";
  var ele = null;

  if (tabGroup)
  {
    tgStr = tabGroup.outerHTML;
    ele = tabGroup;
  }
  else
    tgStr = Spry.DesignTime.Widget.TabbedPanels.getTabGroupMarkupSnippet();

  if (panelGroup)
  {
    pgStr = panelGroup.outerHTML;
    ele = panelGroup;
  }
  else
    pgStr = Spry.DesignTime.Widget.TabbedPanels.getPanelGroupMarkupSnippet();

  if (!tabGroup && !panelGroup)
    this.element.innerHTML = tgStr + pgStr + this.element.innerHTML;
  else
    ele.outerHTML = tgStr + pgStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string containing the
//   markup for a complete TabbbedPanels widget.
//
// ARGUMENTS:
//  id - string - The value for the widget's id attribute.
//  label - string - The content to insert into each tab button.
//  content - string - The content to insert into each content panel.
//
// RETURNS:
//   String that is the HTML markup fragment for the widget.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.getMarkupSnippet = function(id, label, content)
{
  var numTabs = 2;
  var str = "<div id=\"" + id + "\" class=\"TabbedPanels\"><ul class=\"TabbedPanelsTabGroup\">";
  for (var i = 0; i < numTabs; i++)
    str += Spry.DesignTime.Widget.TabbedPanels.getTabMarkupSnippet(label, i+1);

  str += "</ul><div class=\"TabbedPanelsContentGroup\">";

  for (var i = 0; i < numTabs; i++)
    str += Spry.DesignTime.Widget.TabbedPanels.getPanelMarkupSnippet(content, i+1);

  str += "</div></div>";
  return str;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getConstructorSnippet
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

Spry.DesignTime.Widget.TabbedPanels.getConstructorSnippet = function(id)
{
  return "var " + id + " = new Spry.Widget.TabbedPanels(\"" + id + "\");";
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabGroupMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string that contains the
//   markup for a tab group container.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   String containing an HTML fragment.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.getTabGroupMarkupSnippet = function()
{
  return "<ul class=\"TabbedPanelsTabGroup\"></ul>";
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanelGroupMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string that contains the
//   markup for a tab panel content group container.
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   String containing an HTML fragment.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.getPanelGroupMarkupSnippet = function()
{
  return "<div class=\"TabbedPanelsContentGroup\"></div>";
};

//--------------------------------------------------------------------
// FUNCTION:
//   getTabMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string that contains the
//   markup for a tab button.
//
// ARGUMENTS:
//  label - string - The content to be inserted into the tab button.
//  counter - integer - Optional argument. If specified, is an integer
//                      to append to the label to help differenciate
//                      tab buttons when they all have the same label.
//
// RETURNS:
//   String that is the HTML fragment for a tab button.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.getTabMarkupSnippet = function(label, counter)
{
  if( typeof counter == 'number' ) counter = " " + counter;
  if( typeof counter == 'undefined' ) counter = "";
  if( typeof label == 'undefined' ) label = dw.loadString('spry/widgets/tabbedpanels/newSnippet/label'); 
  return "<li class=\"TabbedPanelsTab\" tabindex=\"0\">" + label + counter + "</li>";
};

//--------------------------------------------------------------------
// FUNCTION:
//   getPanelMarkupSnippet
//
// DESCRIPTION:
//   Static utility function that returns a string that contains the
//   markup for a tab content panel.
//
// ARGUMENTS:
//  content - string - The content to be inserted into the tab content panel.
//  counter - integer - Optional argument. If specified, is an integer
//                      to append to the content to help differenciate
//                      tabs when they all have the same content.
//
// RETURNS:
//   String that is the HTML fragment for a tab content.
//--------------------------------------------------------------------

Spry.DesignTime.Widget.TabbedPanels.getPanelMarkupSnippet = function(content, counter)
{
  if( typeof counter == 'number' ) counter = " " + counter;
  if( typeof counter == 'undefined' ) counter = "";
  if( typeof content == 'undefined' ) content = dw.loadString('spry/widgets/tabbedpanels/newSnippet/content'); 
  return "<div class=\"TabbedPanelsContent\">" + content + counter + "</div>";
};

