// Copyright 2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.
//--------------------------------------------------------------------
// CLASS:
//   SpryDataSetList
//
// DESCRIPTION:
//	 ui class for spry datasets listing
//
// PUBLIC FUNCTIONS:
//
//    SpryDataSetList
//--------------------------------------------------------------------
function SpryDataSetList(controlId)
{
	this._controlId = new ListControl(controlId);
	this.initializeUI();
}

SpryDataSetList.prototype = 
{
	initializeUI : function()
	{
	  //get a list of ajax datasets
	  var dom = dw.getDocumentDOM();
	  var ajaxDSNames = ajaxUtils.getAjaxDataSetNames(dom);		 
	  if (ajaxDSNames.length > 0)
	  {
		this._controlId.setAll(ajaxDSNames,ajaxDSNames);
	  } 
	  else 
	  {
		var EMPTY_LIST = new Array("");
		this._controlId.setAll(new Array(MM.LABEL_NoSpryDataSets), EMPTY_LIST);
	  }
  	  this._controlId.setIndex(0); //set it to first element
	},
	getSelectedValue : function()
	{
		return this._controlId.getValue();
	},
	setSelectedValue : function (dsName)
	{		
		if (dsName && dsName.length)
		{
			for (var i=0; i < _LIST_AJAX_DATASETS._controlId.getLen(); i++)
			{
				if (dsName == _LIST_AJAX_DATASETS._controlId.getValue(i))	
				{
					_LIST_AJAX_DATASETS._controlId.setIndex(i);
					break;
				}
			}		
		}
	}
}

