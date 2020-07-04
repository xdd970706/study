// Copyright 2006 Adobe Macromedia, Inc. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.Widget.Manager
//
// DESCRIPTION:
//	This is the DesignTime Manager for all widgets. It keeps track of
//	all the widgets on the page to help coordinate edits

if( typeof Spry == 'undefined' ) Spry = {};
if( typeof Spry.DesignTime == 'undefined' ) Spry.DesignTime = {};
if( typeof Spry.DesignTime.Widget == 'undefined' ) Spry.DesignTime.Widget = {};


Spry.DesignTime.Widget.Manager = function(dom)
{
	this.dom = dom;
	this.widgets = new Object();
};

//gets the widget manager for the give document
Spry.DesignTime.Widget.Manager.getManagerForDocument = function(dom)
{
	if( typeof dom == 'undefined' )
	{
		return;
	}
	
	if( typeof dom.Spry == 'undefined' ) dom.Spry = {};
	if( typeof dom.Spry.Widgets == 'undefined' ) dom.Spry.Widgets = {};
	if( typeof dom.Spry.Widgets.Manager == 'undefined' ) dom.Spry.Widgets.Manager = new Spry.DesignTime.Widget.Manager(dom);

	return dom.Spry.Widgets.Manager;
};

//	getters and setters to track widget instances.
//	type - widget class ("Accordion", "Tab", etc...)
//	id - the id of the widget instance
Spry.DesignTime.Widget.Manager.prototype.getWidget = function(type, id)
{
	if( typeof this.widgets[type] == 'undefined') return;

	return this.widgets[type][id];
};

Spry.DesignTime.Widget.Manager.prototype.setWidget = function(type, id, widget)
{
	if( typeof this.widgets[type] == 'undefined' ) this.widgets[type] = new Object();

	this.widgets[type][id] = widget;
};

Spry.DesignTime.Widget.Manager.prototype.deleteWidget = function(type, id)
{
	if( typeof this.widgets[type] == 'undefined' ) return;
	
	delete this.widgets[type][id];
};

Spry.DesignTime.Widget.Manager.prototype.getAllWidgets = function(type)
{
	return this.widgets[type];
};


//take an array of ids and prunes our internal array to only have those in the passed in list
Spry.DesignTime.Widget.Manager.prototype.removeUnlistedWidgets = function(type, idArray)
{
	if( typeof this.widgets[type] == 'undefined' ) return;
	
	//create a new array and copy over the hits
	var curWidgets = new Object();
	
	for( var i = 0 ; i < idArray.length ; i++ )
	{
		var id = idArray[i];
		if( id in this.widgets[type] ) 
		{
			curWidgets[id] = this.widgets[type][id];
		}
	}
	
	//now go through and find out which objects got removed
	var removedWidgets = new Object();
	for( var prop in this.widgets[type] )
	{
		if( ! (prop in curWidgets) )
		{
			removedWidgets[prop] = this.widgets[type][prop];
		}
	}
	
	//replace the old array with the new current one
	this.widgets[type] = curWidgets;
	
	//return the removed ones
	return removedWidgets;
};
