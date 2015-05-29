function totodoo(data) {


	var selectedList;
	var lists = data;

	init();

	function init() {
        
        addItemAdder();
        addFilters();
        addAllTogglable();
        initItems();

        createTodoListsMenu();
        selectList();
        todoTitleName();
        addChangeListTriggers();
        loadItems();

	};

	// init items, called on init app and addNewTodoItem
	function initItems() {
		addRemovers();
		addEditables();
		addItemInputToggles();
	};

	function addItemAdder() {
		// item add field
		$('input#new-todo').keypress(function(e) {
	        if (e.which == 13) {
	        	var id = guid();
	        	addItemtoModel($(this).val(), id);
	            addNewTodoItem($(this).val(), id);
	            $(this).val('');
	        }
	    });
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

	function addNewTodoItem(item, dataid, completed) {
		var new_item = itemTemplate(item, dataid, completed);
	    $('#todo-list').prepend(new_item);
	    $('#todo-list li').first().effect("highlight", {}, 500);
	    initItems();
	}

	function itemTemplate(value, dataid, completed) {
		completed = completed || false;
		var checked = completed ? ' checked="checked"' : '';
		var className = completed ? ' class="completed"' : '';
	    return '<li'+className+' data-id="'+dataid+'"><div class="view"><input class="toggle" type="checkbox"'+checked+' /><label><div>'+value+'</div></label><button class="destroy"></button></div></li>';
	}

	function addItemtoModel(item, dataid, completed) {
		dataid = dataid || guid();
		completed = completed || false;
    	var obs = BaseModelObserver();
        var moh = ModelObserverHandlers();
        obs.handler.define(moh.valueHandler);
        var m = obs.createModel({id: dataid, name: item, completed: completed});
        selectedList.items.push(m);
    	selectedList.items = selectedList.items;
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
            addNewTodoItem(m.name.value, m.id.value, m.completed.value);
        }
    }

    function addChangeListTriggers() {
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
    }

    function createTodoListItem(ul, key, divider, name, state) {
        var model = lists[key];
        if (model.length) {
            var div = divider ? '<li class="divider"></li>' : '';
            ul.append(div+'<li class="dropdown-header">'+name+'</li>');
            for (var i in model) {
                var m = model[i];
                var className = state.active ? ' class="active"' : '';
                ul.append('<li id="'+m.id.value+'"'+className+' type="'+key+'"><a data-bind="'+m.path.join('.')+'" href="#">'+m.name.value+'</a></li>');
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
    }

	return {data: data}
}



function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
