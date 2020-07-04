// Copyright 2009-2010 Adobe Systems Incorporated.  All rights reserved.
var extList = {
	list: {},
	add_button: {},
	del_button: {},
	
	initializeUI: function(tName, addName, delName, extArr) {
		this.list = new GridControl(tName);
		this.add_button = dwscripts.findDOMObject(addName);
		this.del_button = dwscripts.findDOMObject(delName);
		if (!extArr) extArr = [];
		this.list.setAll(extArr);
	},
	add: function() {
		this.list.append();
		this.list.setIndex(this.list.object.options.length-1);
		this.list.object.focus();
	},
	remove: function() {
		if (this.list.getIndex() >= 0) {
			var tIndex = this.list.getIndex();
			tIndex--;
			if (tIndex < 0) tIndex = 0;
			this.list.del();
			if (this.list.object.options.length) {
				this.list.setIndex(tIndex);
			}
		}
		this.list.object.focus();
	},
	onChange: function() {
		
	},
	enable: function() {
		this.list.object.disabled = "enabled";
		this.add_button.disabled = "enabled";
		this.del_button.disabled = "enabled";
	},
	disable: function() {
		this.list.object.disabled = "disabled";
		this.add_button.disabled = "disabled";
		this.del_button.disabled = "disabled";
	},
	validateUI: function() {
		var tOpts = this.list.getAll();
		for (var n=0; n<tOpts.length; n++) {
			if (tOpts[n][0]) {
				if (tOpts[n][0].search(/^\.[^\.]*\./) == 0) {
					alert(dw.loadString("Dinamico/Alert/Extensions_MultipleDot"));
					this.list.setIndex(n);
					this.list.object.focus();
					return false;
				}
				if (tOpts[n][0].search(/^\.[^\.\/\:\\]*$/) < 0) {
					alert(dw.loadString("Dinamico/Alert/Extensions_Format"));
					this.list.setIndex(n);
					this.list.object.focus();
					return false;
				}
			}
		}
		return true;
	},
}