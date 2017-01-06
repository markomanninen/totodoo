function notificationcenter(data) {

	var adder = {

        'add': function(value, model, property, property_stack, parent) {
        	/*
            console.log(
            	'add',
				value, // what was added
				property != undefined ? property : "undefined", // index of the additive operation
				model.value, // what is left after additition
				this.path.join('.') // path of the additive operation
			);
			*/
            amplify.request( "post", {value: value, path: this.path}, 
            	function(response) {
            		// should not lift up notification because of infinite loop!
                	console.log(response);
            	}
            );

             $('.notifications-wrapper').append('\
                <a class="content" href="#">\
                    <div class="notification-item">\
                        <h4 class="item-title">'+value[0].timestamp+'</h4>\
                        <p class="item-info">'+value[0].message+'</p>\
                    </div>\
                </a>'
            );
			
            return value;
        }
    };

    var obs = BaseModelObserver();
    var mvt = ModelValueTriggers(obs);
	obs.triggers.defines(mvt.valueTriggers);
    obs.triggers.defines(adder);
    // at the moment array as a root model seems not to work
    // thats why using notifications attribute on model root
    var center = obs.createModel({notifications: data || []});
	
	/*
	{
		message: "",
		time: iso8601,
		tags: ["system", "user", "login", 
			   "logout", "todo-list" "todo-item", 
			   "publicLists", "privateLists", "sharedLists", "..."],
		user: null
	}
	*/
	
	//var latest_notification = notifications.length ? notifications[notifications.length-1] : {};

	this.push = function(message, tags, growl_props) {

		center.notifications.push(
			{
				id: guid(),
				message: message, 
				tags: tags, 
				timestamp: getTimestamp()
			}
		);

		// add notifications to the menulist + increase number / add first number badge...

		if (growl_props) {
			 return $.notify(growl_props.options, growl_props.settings);
		}
	}

	this.get = function(filter_func) {
		return filter_func ? center.notifications.filter(filter_func) : center.notifications;
	}

	return {push: this.push, get: this.get};
}

function totodoo(data, loggedUser) {

	$('body').on('focus', '[contenteditable]', function() {
	    var $this = $(this);
	    $this.data('before', $this.html());
	    return $this;
	}).on('blur', '[contenteditable]', function() {
	    var $this = $(this);
	    if ($this.text().trim() == '') {
	    	$this.html($this.data('before'));
	    }
	    if ($this.data('before') !== $this.html()) {
	        $this.data('before', $this.html());
	        $this.trigger('change');
	    }
	    return $this;
	}).on('keypress', '[contenteditable]', function(e) {
		var $this = $(this);
    	if (e.which == 13) {
    		if ($this.text().trim() == '') {
    			$this.html($this.data('before'));
    		}
        	$this.trigger('blur');
        }
	});
	/*.on('_click _dblclick', '[contenteditable]', function(e) {
        var caretRange = getMouseEventCaretRange(e);
		// Set a timer to allow the selection to happen and the dust settle first
		window.setTimeout(function() {
			selectRange(caretRange);
		}, 10);
		return false;
    });
	*/

	$('#myForm').on('submit', function(e) {
        e.preventDefault();
        var name = $('#name');
        var str = parseString(name.val());
        // Check if there is an entered value
        if (!str) {
          // Add errors highlight
          name.closest('.form-group').removeClass('has-success').addClass('has-error');
        
        } else {
          // Remove the errors highlight
          name.closest('.form-group').removeClass('has-error').addClass('has-success');
          
          var key = "privateLists";
          
          lists[key].push({id: guid(), name: str, items: []});

          var m = lists[key][lists[key].length-1];

          var ul = $('ul#todo-lists ul#privateLists');
          
          $('ul#todo-lists li li.active').removeClass('active');

          ul.append('<li id="'+m.id.value+'" class="active" type="'+key+'"><a data-bind="'+m.path.join('.')+'.name" href="#"><span class="glyphicon glyphicon-list"> '+m.name.value+'</span></a></li>');
          
          addChangeListTriggers();

          $('#addNewList').modal('hide');

          name.val('');

          name.closest('.form-group').removeClass('has-success');

        }
    });

/*
function getMouseEventCaretRange(evt) {
    var range, x = evt.clientX, y = evt.clientY;

    // Try the simple IE way first
    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToPoint(x, y);
    }

    else if (typeof document.createRange != "undefined") {
        // Try Mozilla's rangeOffset and rangeParent properties,
        // which are exactly what we want
        if (typeof evt.rangeParent != "undefined") {
            range = document.createRange();
            range.setStart(evt.rangeParent, evt.rangeOffset);
            range.collapse(true);
        }

        // Try the standards-based way next
        else if (document.caretPositionFromPoint) {
            var pos = document.caretPositionFromPoint(x, y);
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
        }

        // Next, the WebKit way
        else if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(x, y);
        }
    }

    return range;
}

function selectRange(range) {
    if (range) {
        if (typeof range.select != "undefined") {
            range.select();
        } else if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}
*/
	$( "#todo-list" ).sortable(
        {
        	cancel: ':input,button,[contenteditable]',
            start: function(event, ui) {
                    var start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos);
            },
            update: function (event, ui) {
                    
                    var start_pos = ui.item.data('start_pos');
                    var end_pos = ui.item.index();

                    // reversing start and end position
                    start_pos = Math.abs(start_pos - selectedList.items.length+1);
                    end_pos = Math.abs(end_pos - selectedList.items.length+1);
                    selectedList.items.move(start_pos, 1, end_pos);

                    var a = $('[data-bind^="'+selectedList.items[start_pos].path.join('.')+'"]');
                    var b = $('[data-bind^="'+selectedList.items[end_pos].path.join('.')+'"]');

                    a.each(function(i, item) {
                    	var db = $(item).attr('data-bind');
                    	$(item).attr('data-bind', db.replace(
                    		selectedList.items[start_pos].path.join('.'), 
                    		selectedList.items[end_pos].path.join('.')
                    	));
                    });
                    
                    b.each(function(i, item) {
                    	var db = $(item).attr('data-bind');
                    	$(item).attr('data-bind', db.replace(
                    		selectedList.items[end_pos].path.join('.'), 
                    		selectedList.items[start_pos].path.join('.')
                    	));
                    });

                    loadItems();

                    $('a[href="'+location.hash+'"]').trigger('click');
            }
        }
    );

	// TODO: double clicking contenteditable fields gives unexpected behaviour...
	// 
    //$( "#todo-list" ).disableSelection();
    
	var selectedList;
    var obs = BaseModelObserver();
    var mvt = ModelValueTriggers(obs);
	obs.triggers.defines(mvt.valueTriggers);

    function mergeConfig(to, from) {
        for (var n in from)
            if (typeof to[n] != 'object')
                to[n] = from[n];
            else if (typeof from[n] == 'object')
                to[n] = mergeConfig(to[n], from[n]);
        return to;
    }

    function defineProperty(obj, property, config, get, set) {
        var value = obj[property] || obj['updated'] || obj['created'];
        var config = mergeConfig({enumerable: true, configurable: true}, config || {});
        config['get'] = get || function() {return this.updated || value || this.created};
        config['set'] = set || function(new_value) {value = new_value};
        Object.defineProperty(obj, property, config);
    }

    function defineProperty2(obj, property) {
        var value = obj[property];
        Object.defineProperty(obj, property, {
        	enumerable: true, configurable: true,
        	get: function() {return value},
        	set: function(new_value) {value = new_value}
        });
    }

    var logger = {
        'init': function(value, model, property, property_stack, parent) {
            //console.log(["init", value, model, property, property_stack.join('.'), parent]);
            // timestamp
            if (model.hasOwnProperty('completed')) {
	        	defineProperty(model, 'timestamp'); // updateAt?
	        	/*
	        	model['order'] = 1;
	        	defineProperty2(model, 'order');
	        	*/
	        }
            return value;
        },
        'get': function(value, property_stack) {
            //console.log(["get", value, property_stack.join('.')]);
            return value;
        },
        // set aka update aka edit aka put
        'set': function(value, old_value, property_stack) {
            // move, swap, reorder, delete happening?!
            if (this.arrayMutation) {
                return value;
            }

            var path = this.path.slice();
            path.push(property_stack[property_stack.length-1]);
/*
            console.log(
            	'set',
				value.value,
				this.key,
				value.old_value,
				this.path.join('.'), // path of the removal operation
				property_stack.join('.'),
				path.join('.')
			);
*/
            amplify.request( "put", //save
           		{
           			value: value.value, 
           			path: path
           		}, 
            	function(response) {
                	var message = sprintf("Updated %s. %s set to '%s'", "todo list/todo list item", path.join(' > '), value.value);
					notcen.push(message, ['lists', 'modify', path[1]], {options: {title: "Update", message: message}, settings: {}});
            	}
            );

            return value;
        },
        // add aka post
        'add': function(value, model, property, property_stack, parent) {
        	
        	/*
            console.log(
            	'add',
				value, // what was added
				typeof property != "undefined" ? property : "undefined", // index of the additive operation
				model.value, // what is left after additition
				this.path.join('.') // path of the additive operation
			);
			*/

			var path = this.path.slice();

            amplify.request( "post", 
           		{
           			value: value, 
           			path: path
           		}, 
            	function(response) {
                	//console.log(response);
                	var message = sprintf("Added new item '%s' to '%s'.", value[0].name.value, path[1]);
					notcen.push(message, ['lists', 'add', path[1]], {options: {title: "Add", message: message}, settings: {}});
            	}
            );

            return value;
        },
        // remove aka delete
        'remove': function(value, model, property, property_stack, parent) {

        	var val = value.map(function(v){return v.value;});
/*
            console.log(
            	'remove',
				val, // what was removed
				typeof property != "undefined" ? property : "undefined", // index of the removal operation
				model.value, // what is left after removal
				this.path.join('.') // path of the removal operation
			);
*/
			var path = this.path.slice();

            amplify.request( "delete", 
           		{
           			value: val, 
           			path: path
           		}, 
            	function(response) {
                	var message = sprintf("Removed item '%s' from '%s'.", value[0].name.value, path[1]);
					notcen.push(message, ['lists', 'remove', path[1]], {options: {title: "Remove", message: message}, settings: {}});
            	}
            );

            return value;
        },
        // order aka rearrange
        'order': function(value, model, property_stack) {

        	var val;

        	if (value[0] == 'swap') {

        	}
        	// only move supported at the moment
        	if (value[0] == 'move') {
        		val = value[5];
        	}
        	if (value[0] == 'reorder') {
        		
        	}
/*
            console.log(
            	'order',
				value[0], // order type
				value, // order type
				val, // order parameters
				model.value, // what is left after removal
				this.path.join('.') // path of the removal operation
			);
*/
			var path = this.path.slice();

            if (val) {
	            amplify.request( "order", 
	           		{
	           			value: val, 
	           			path: path
	           		}, 
	            	function(response) {
	                	//console.log(response);
                		var message = sprintf("Changed the order of items in '%s'.", path[1]);
						notcen.push(message, ['lists', 'order', path[1]], {options: {title: "Order", message: message}, settings: {}});
	            	}
	            );
        	}
			
            return value;
        }
    };

    // add new log handler upon valueHandler!

    obs.triggers.defines(logger);

    var lists = obs.createModel(data);

    var notcen;

    amplify.request( "get", 
    	{
    		path: ['root', 'notifications']
    	},
    	function( notifications ) {
        	notcen = notificationcenter(notifications['val']);
    	}
    );

	init();

	// initialize on application startup
	function init() {
        
        // triggers and handlers
        addItemAdder();
        addFilters();
        addAllTogglable();
        initItems();

        // populate todo menu list and add triggers
        createTodoListsMenu();
	};

	// init items, called on on application startup and addNewTodoItem
	function initItems() {
		// triggers and handlers
		addRemovers();
		addEditables();
		addItemInputToggles();
	};

	function addItemAdder() {
		// item add field
		$('input#new-todo').keypress(function(e) {
	        if (e.which == 13) {
	        	var str = parseString($(this).val());
	        	if (str) {
		        	var id = guid();
		        	var item = addItemtoModel($(this).val(), id);
		            addNewTodoItem($(this).val(), id, false, item.path.join('.'));
		            $(this).val('');
	            }
	        }
	    });
	}

	function getNode(model, path) {
		var n = path.shift();
		if (path.length > 0) {
			return getNode(model[n], path);
		}
		return model[n];
	}

	function addFilters() {
		// filters: show all
	    $('a[href="#/all"]').click(function() {
	        $('ul#todo-list li').show();
	        $('ul#filters li a').removeClass('selected');
	        $(this).addClass('selected');
	    });
	    // filters: show active
	    $('a[href="#/active"]').click(function() {
	        $('ul#todo-list li').show();
	        $('ul#todo-list li.completed').hide();
	        $('ul#filters li a').removeClass('selected');
	        $(this).addClass('selected');
	    });
	    // filters: show completed
	    $('a[href="#/completed"]').click(function() {
	        $('ul#todo-list li').hide();
	        $('ul#todo-list li.completed').show();
	        $('ul#filters li a').removeClass('selected');
	        $(this).addClass('selected');
	    });      
	}

	function addItemInputToggles() {
	    // item toggler
	    $('li input.toggle').unbind('click');
	    $('li input.toggle').click(function(event) {

	        var grandParent = $(this).parent().parent();
	        grandParent.toggleClass('completed');

	        var div = $('label div', $(this).parent());
	        div.unbind('dblclick');
	        div.unbind('blur');

	        if (grandParent.hasClass('completed')) {
	            div.prop("contentEditable", "false").removeClass('doubleClicked');
	        } else {
	            div.dblclick(function(e) {
	            	// there is editing class available too!
	                $(this).prop("contentEditable", "true").addClass('doubleClicked');
	                this.focus();
	            });
	            div.on('blur', function(e) {
		            $(this).prop("contentEditable", "false").removeClass('doubleClicked');
		        });
	            div.prop("contentEditable", "true");  
	        }
	        grandParent.trigger('focus');
	    });
	}

	function addEditables() {
		// editable handlers
		$('ul#todo-list li:not(.completed) div label div').unbind('dblclick');
	    $('ul#todo-list li:not(.completed) div label div').dblclick(function(e) {
	        $(this).prop("contentEditable", "true").addClass('doubleClicked');
	        this.focus();
	    });
		$('ul#todo-list li div label div').unbind('blur');
	    $('ul#todo-list li div label div').on('blur', function(e) {
	        $(this).prop("contentEditable", "false").removeClass('doubleClicked');
	    });

		$('h1 span#listName').unbind('dblclick');
	    $('h1 span#listName').dblclick(function(e) {
	        $(this).prop("contentEditable", "true").addClass('doubleClicked');
	        this.focus();
	    });
		$('h1 span#listName').unbind('blur');
	    $('h1 span#listName').on('blur', function(e) {
	        $(this).prop("contentEditable", "false").removeClass('doubleClicked');
	    });
	}

	function removeFromModel(item) {
        for (var i in selectedList.items) {
            if (item.attr('data-id') == selectedList.items[i].id.value) {
            	//console.log(selectedList.items[i], item.attr('data-id'));
                selectedList.items.remove(i);
                item.remove();
            }
        }
	}

	function addRemovers() {
		// clear / destroy all completed button
		$('button#clear-completed').unbind('click');
	    $('button#clear-completed').click(function () {
	    	$('ul#todo-list li.completed').effect('highlight', {}, 500, function() {
	        	removeFromModel($(this));
	        });
	    });
	    // clear / destroy one item
	    $('button.destroy').unbind('click');
	    $('button.destroy').click(function(event) {
	        $(this).parent().effect('highlight', {}, 500, function() {
	        	removeFromModel($(this).parent());
	        });
	    });
	}

	function addAllTogglable() {
		// all toggler
		$('input#toggle-all').unbind('click');
		$('input#toggle-all').click(function () {
			// swap / toggle item states
	    	var checkBoxes = $('ul#todo-list li input');
	    	checkBoxes.trigger('click');
	    	// other option is to select / deselect all items...
	    	/*
	    	checkBoxes.prop("checked", !checkBoxes.prop("checked"));
	    	$('ul#todo-list li input:not(:checked)').parent().parent().removeClass('completed');
	    	$('ul#todo-list li input:checked').parent().parent().addClass('completed');
	    	*/

	    });
	}

	function addNewTodoItem(item, dataid, completed, path) {
		var new_item = itemTemplate(item, dataid, completed, path);
	    $('#todo-list').prepend(new_item);
	    $('#todo-list li').first().effect("highlight", {}, 500);

	    $('[data-bind="'+path+'.completed"]').unbind('change');
        $('[data-bind="'+path+'.completed"]').change(function() {
        	var properties = path.split('.');
    		properties.shift();
    		var model = getNode(lists, properties);
            model.completed = !model.completed.value;
        });

        $('[data-bind="'+path+'.name"]').unbind('change');
        $('[data-bind="'+path+'.name"]').change(function() {
        	var properties = path.split('.');
    		properties.shift();
    		var model = getNode(lists, properties);
            model.name = $('[data-bind="'+path+'.name"]').html();
        });

	    initItems();
	}

	function itemTemplate(value, dataid, completed, path) {
		completed = completed || false;
		var checked = completed ? ' checked="checked"' : '';
		var className = completed ? ' class="completed"' : '';
	    return '<li'+className+' data-id="'+dataid+'"><div class="view"><input data-type="boolean" data-bind="'+path+'.completed" class="toggle" type="checkbox"'+checked+' /><label><div class="editable" data-bind="'+path+'.name">'+value+'</div></label><button class="destroy"></button></div></li>';
	}

	function addItemtoModel(item, dataid, completed) {
		dataid = dataid || guid();
		completed = completed || false;
        var model = {id: dataid, name: item, completed: completed, timestamp: getTimestamp()};
        selectedList.items.push(model);
    	return selectedList.items[selectedList.items.length-1];
	}

	function selectList() {
        var list = $('ul#todo-lists li.active');
        var listType = list.attr('type');
        if (lists.hasOwnProperty(listType)) {
        	var listId = list.attr('id');
            for (var i in lists[listType]) {
                if (listId == lists[listType][i].id.value) {
                    selectedList = lists[listType][i];
                    return;
                }
            }
        }
	}

    function loadItems() {
        $('ul#todo-list li').remove();
        //selectedList.items.reverse();
        for (var i in selectedList.items) {
            var m = selectedList.items[i];
            addNewTodoItem(m.name.value, m.id.value, m.completed.value, m.path.join('.'));
        }
    }

    function addChangeListTriggers() {
    	// setup page header -> todo::{name}
        todoTitleName();
        // select list that is classified as active
        selectList();
        // load items
        loadItems();
        //$('ul#todo-lists li a:not([data-toggle="modal"])').unbind('click');
        $('ul#todo-lists li li a:not([data-toggle="modal"])').click(function() {
            $('ul#todo-lists li li.active a').parent().removeClass('active');
            $(this).parent().addClass('active');
            todoTitleName();
            selectList();
            loadItems();
        });
    }

    function todoTitleName() {
        var $li = $('ul#todo-lists li li.active');
        var $span = $('span#listName');
        $span.html($('a span', $li).html().trim());
        $span.attr('data-bind', $li.find('a').attr('data-bind'));
        
        $span.unbind('change');
        $span.change(function() {
        	var $this = $(this);
        	var properties = $this.attr('data-bind').split('.');
    		properties.shift();
    		model = getNode(lists, properties);
            model.parent.name = $this.html();
            $li.find('a span').html(' ' + $this.html()); 
        });
    }
/*
    function _createTodoListItem(ul, key, divider, name, state) {
        var model = lists[key];
        if (model && model.length) {
            var div = divider ? '<li class="divider"></li>' : '';
            ul.append(div+'<li class="dropdown-header '+key+'">'+name+'</li>');
            for (var i in model) {
                var m = model[i];
                var className = state.active ? ' class="active"' : '';
                ul.append('<li id="'+m.id.value+'"'+className+' type="'+key+'"><a data-bind="'+m.path.join('.')+'.name" href="#"><span class="glyphicon glyphicon-list"> '+m.name.value+'</span></a></li>');
                state.active = false;
            }
        }
    }
*/
    function createTodoListItem(ul, key, divider, name, state) {
        var model = lists[key];
        var ul = $('ul#'+key);
                
        if (model && model.length) {
            //var div = divider ? '<li class="divider"></li>' : '';
            //ul.append(div+'<li class="dropdown-header '+key+'">'+name+'</li>');
            for (var i in model) {
                var m = model[i];
                var className = state.active ? ' class="active"' : '';
                ul.append('<li id="'+m.id.value+'"'+className+' type="'+key+'"><a tabindex="'+i+'" data-bind="'+m.path.join('.')+'.name" href="#"><span class="glyphicon glyphicon-list"> '+m.name.value+'</span></a></li>');
                state.active = false;
            }
        }
    }

    function createTodoListsMenu() {
        var ul = $('ul#todo-lists');
        var state = {active: true};
        createTodoListItem(ul, 'publicLists', false, 'Public lists', state);
        createTodoListItem(ul, 'sharedLists', true, 'Shared lists', state);
        createTodoListItem(ul, 'privateLists', true, 'My lists', state);

        $('.dropdown-submenu > a').submenupicker();
        /*
        ul.append('<li class="divider"></li>');
        if (!loggedUser)
        	ul.append('<li class="disabled"><a disabled href="#" id="addNewList">Add a new list</a></li>');
        else
        	ul.append('<li><a href="#" data-toggle="modal" data-target="#addNewList" id="addNewList">Add a new list</a></li>');
        */
        addChangeListTriggers();
    }

	return {data: data}
}

if (!Date.now) {
	Date.now = function() { return new Date().getTime(); }
}

// http://apiux.com/2013/09/11/api-timezones/
function getTimestamp(iso8601) {
	if (typeof iso8601 == "undefined" || iso8601 == true) {
		return new Date().toISOString();
	}
	return Date.now();
	//return Date.now(); // Date.now() / 1000 | 0;
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// http://w3lessons.info/2014/01/26/showing-busy-loading-indicator-during-an-ajax-request-using-jquery/
function ajaxindicatorstart(text) {
	
	if($('body').find('#resultLoading').attr('id') != 'resultLoading'){
		$('body').append('<div id="resultLoading" style="display:none"><div><img src="ajax-loader.gif"><div>'+text+'</div></div><div class="bg"></div></div>');
	}

	$('#resultLoading').css({
		'width':'100%',
		'height':'100%',
		'position':'fixed',
		'z-index':'10000000',
		'top':'0',
		'left':'0',
		'right':'0',
		'bottom':'0',
		'margin':'auto'
	});

	$('#resultLoading .bg').css({
		'background':'#000000',
		'opacity':'0.7',
		'width':'100%',
		'height':'100%',
		'position':'absolute',
		'top':'0'
	});

	$('#resultLoading>div:first').css({
		'width': '250px',
		'height':'75px',
		'text-align': 'center',
		'position': 'fixed',
		'top':'0',
		'left':'0',
		'right':'0',
		'bottom':'0',
		'margin':'auto',
		'font-size':'16px',
		'z-index':'10',
		'color':'#ffffff'

	});

    $('#resultLoading .bg').height('100%');
    $('#resultLoading').fadeIn(300);
    $('body').css('cursor', 'wait');
}

// http://www.w3schools.com/cssref/pr_class_cursor.asp
function ajaxindicatorstop() {
    $('#resultLoading .bg').height('100%');
    $('#resultLoading').fadeOut(300);
    $('body').css('cursor', 'default');
}

function parseString(str) {
	function escapeHtml(str) {
	    var div = document.createElement('div');
	    div.appendChild(document.createTextNode(str));
	    return div.innerHTML;
	}
	function sanitizeHTML(str, white, black) {
	   if (!white) white="b|i|u|br"; //allowed tags
	   if (!black) black="script|object|embed"; //complete remove tags
	   var e = new RegExp("(<("+black+")[^>]*>.*</\\2>|(?!<[/]?("+white+")(\\s[^<]*>|[/]>|>))<[^<>]*>|(?!<[^<>\\s]+)\\s[^</>]+(?=[/>]))", "gi");
	   return str.replace(e, "");
	}
	return sanitizeHTML(str);
}

// load todo lists
amplify.request.define( "lists", "ajax", {
    url: "data.php",
    dataType: "json",
    type: "GET"
});
// save?
amplify.request.define( "save", "ajax", {
    url: "save.php",
    dataType: "json",
    type: "POST"
});
// create a new item (either list or todo item)
amplify.request.define( "post", "ajax", {
    url: "api.php?method=post",
    dataType: "json",
    type: "POST"
});
// update item (either list or todo item)
amplify.request.define( "put", "ajax", {
    url: "api.php?method=put",
    dataType: "json",
    type: "POST" // should be changed to PUT on real REST api
});
// get all lists and todo items
amplify.request.define( "get", "ajax", {
    url: "api.php?method=get",
    dataType: "json",
    type: "POST" // should be changed to GET on real REST api
});
// delete todo item. currently list items can't be deleted
amplify.request.define( "delete", "ajax", {
    url: "api.php?method=delete",
    dataType: "json",
    type: "POST" // should be changed to DELETE on real REST api
});
// order/rearrange todo items. currently list items can't be rearranged
amplify.request.define( "order", "ajax", {
    url: "api.php?method=order",
    dataType: "json",
    type: "POST" // should be changed to PUT on real REST api
});

var applicationStarted = false;

$('#myButton').hide();

$(document).ajaxStart(function () {
    if (!applicationStarted) {
        ajaxindicatorstart('Totodoo! Loading todo lists...');
    } else {
        //$('#myButton').html('Loading...').fadeIn(500);
    }
}).ajaxStop(function () {
    if (applicationStarted) {
        //$('#myButton').html('Last save time: ' + new Date().toISOString()).delay(2000).fadeOut(500);
    }
    applicationStarted = true;
    ajaxindicatorstop();
});

// http://bootstrap-notify.remabledesigns.com/#documentation
$.notifyDefaults({
    placement: {
        from: "top",
        align: 'right'
    },
    offset: {
        y: 70, 
        x: 20
    },
    animate: {
        enter: "animated fadeInDown",
        exit: "animated fadeOutUp"
    },
    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
        '<span data-notify="title">{1}</span>' +
        '<span data-notify="message">{2}</span>' +
    '</div>',
    type: 'pastel-info'
});
        