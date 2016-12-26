function totodoo(data) {

	$('body').on('focus', '[contenteditable]', function() {
	    var $this = $(this);
	    $this.data('before', $this.html());
	    return $this;
	}).on('blur keyup paste input', '[contenteditable]', function() {
	    var $this = $(this);
	    if ($this.data('before') !== $this.html()) {
	        $this.data('before', $this.html());
	        $this.trigger('change');
	    }
	    return $this;
	});

	var selectedList;

    var obs = BaseModelObserver();
    //var moh = ModelObserverHandlers(obs);
    var moh = ModelValueTriggers(obs);
    //obs.handler.define(moh.valueHandler);
    obs.triggers.defines(moh.valueTriggers);

    var logger = {
        init: function(value, model, property, property_stack, parent) {
            //console.log(["init", value, model, property, property_stack.join('.'), parent]);
            return value;
        },
        get: function(value, property_stack) {
            //console.log(["get", value, property_stack.join('.')]);
            return value;
        },
        set: function(value, old_value, property_stack) {
            console.log(["set", value, old_value, property_stack.join('.')]);
            return value;
        }
    };

    // add new log handler upon valueHandler!

    //obs.handler.define(logger);
    obs.triggers.defines(logger);

    var lists = obs.createModel(data);

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
	        	var id = guid();
	        	var item = addItemtoModel($(this).val(), id);
	            addNewTodoItem($(this).val(), id, false, item.path.join('.'));
	            $(this).val('');
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
                selectedList.items[i] = null;
                delete selectedList.items[i];
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
            model.name = $('[data-bind="'+path+'.name"]').text();
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
		completed = completed || false;
        var model = {id: dataid, name: item, completed: completed};
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
        $('ul#todo-lists li a').unbind('click');
        $('ul#todo-lists li a').click(function() {
            $('ul#todo-lists li a').parent().removeClass('active');
            $(this).parent().addClass('active');
            todoTitleName();
            selectList();
            loadItems();
        });
    }

    function todoTitleName() {
        var li = $('ul#todo-lists li.active');
        var span = $('span#listName');
        span.text(li.text());
        span.attr('data-bind', li.find('a').attr('data-bind'));
        
        span.unbind('change');
        span.change(function() {
        	var properties = $(this).attr('data-bind').split('.');
    		properties.shift();
    		var model = getNode(lists, properties);
            model.name = $(this).text();
            li.find('a').text($(this).text());
        });
    }

    function createTodoListItem(ul, key, divider, name, state) {
        var model = lists[key];
        if (model && model.length) {
            var div = divider ? '<li class="divider"></li>' : '';
            ul.append(div+'<li class="dropdown-header">'+name+'</li>');
            for (var i in model) {
                var m = model[i];
                var className = state.active ? ' class="active"' : '';
                ul.append('<li id="'+m.id.value+'"'+className+' type="'+key+'"><a data-bind="'+m.path.join('.')+'.name" href="#">'+m.name.value+'</a></li>');
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
        addChangeListTriggers();
    }

	return {data: data}
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
