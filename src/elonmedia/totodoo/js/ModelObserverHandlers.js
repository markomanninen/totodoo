/**
 * Created by marko on 24.5.15.
 */

function ModelObserverHandlers() {

    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
    }

    function getTimestamp() {
        return Date.now(); // Date.now() / 1000 | 0;
    }

    function mergeConfig(to, from) {
        for (n in from)
            if (typeof to[n] != 'object')
                to[n] = from[n];
            else if (typeof from[n] == 'object')
                to[n] = realMerge(to[n], from[n]);
        return to;
    }

    function defineProperty(obj, property, config, get, set) {
        var value = obj[property];
        var config = mergeConfig({enumerable: false, configurable: false}, config || {});
        config['get'] = get || function() {return value};
        config['set'] = set || function(new_value) {value = new_value};
        Object.defineProperty(obj, property, config);
    }

    function defineNodeValueProperty(obj) {
        var value = obj['value'];
        var config = {enumerable: false, configurable: false};
        config['get'] = function() {
            if (this.canget) return value;
            else return undefined;
        };
        config['set'] = function(new_value) {
            if (this.canset) {
                value = new_value;
                this.updated = getTimestamp();
            }
        };
        Object.defineProperty(obj, 'value', config);
    }

    function defineBranchValueProperty(obj) {
        var value = obj['value'];
        var config = {enumerable: false, configurable: false};
        config['get'] = function() {
            var value = {};
            if (this.canget) {
                for (var i in this)
                    if (this.hasOwnProperty(i))
                        value[i] = this[i].value;
            }
            return value;
        };
        config['set'] = function(new_value) {value = new_value};
        /*
        config['set'] = function(new_value) {
            if (this.canset) {
                var props = this.path.slice();
                for (var property in new_value) {
                    props.push(property);
                    if (new_value.hasOwnProperty(property)) {
                        if (this.hasOwnProperty(property)) {
                            this[property].value = new_value[property];
                        } else {
                            if (isObject(new_value[property])) {
                                // create new branch
                                this[property] = _recurs(new_value[property], this, props.slice());
                            } else {
                                // create a new node
                                var mod = {};
                                init(mod, this, props.slice());
                                node(mod, property, new_value[property], props.slice());
                                this[property] = mod;
                            }
                        }
                    }
                    props.pop();
                }
            }
        };
        */
        Object.defineProperty(obj, 'value', config);
    }

    // canget, canget,...
    function setHierarchyDownProperty(obj, property, val) {
        var value = obj[property] = val || true;
        var get = function() {return value};
        var set = function(new_value) {
            value = new_value;
            for (var i in this) {
                if (this[i].hasOwnProperty(property)) {
                    this[i][property] = value;
                }
            }
        };
        defineProperty(obj, property, {}, get, set);
    }

    // created,...
    function setOnceProperty(obj, property, val) {
        Object.defineProperty(obj, property, {value: obj[property] || val, enumerable: false, configurable: false, writable: false});
    }

    // updated,...
    function setHierarchyUpProperty(obj, property, val) {
        var value = obj[property] = val;
        var get = function() {return value};
        var set = function(new_value) {
            value = new_value;
            if (this.parent) this.parent[property] = new_value;
        };
        defineProperty(obj, property, null, get, set);
    }

    var valueHandler = {
        initter: function (value, model, property, property_stack, parent) {
            //console.log(["value init", value, model, property, property_stack.join('.'), parent]);
            if (value !== null && typeof value === "object") {
                // value property appending on old dictionary
                model[property]['value'] = value;
                defineBranchValueProperty(model[property]);
                // branch / node property
                model[property]['branch'] = true;
                defineProperty(model[property], 'branch');
            } else {
                // value property with a new dictionary
                model[property] = {value: value};
                defineNodeValueProperty(model[property]);
                // branch / node property
                model[property]['node'] = true;
                defineProperty(model[property], 'node');
            }
            // parent property
            var parent_property, grand_parent;
            parent_property = property_stack.length > 1 ? property_stack[property_stack.length - 2] : null;
            if (parent_property) {
                grand_parent = parent[parent_property];
            }
            model[property]['parent'] = grand_parent;
            defineProperty(model[property], 'parent');
            // path
            model[property]['path'] = property_stack;
            defineProperty(model[property], 'path');
            // access properties
            setHierarchyDownProperty(model[property], 'canget', model[property]['canget']);
            setHierarchyDownProperty(model[property], 'canset', model[property]['canset']);
            // timestamp properties
            setOnceProperty(model[property], 'created', model[property]['created'] || getTimestamp());
            setHierarchyUpProperty(model[property], 'updated', model[property]['updated']);
            // node value needs to be reassigned
            if (!(value !== null && typeof value === "object")) {
                value = model[property];
            }

            return value;
        },
        getter: function (value, property_stack) {
            //console.log(["value get", value, property_stack.join('.'), this]);
            return value;
        },
        setter: function (value, old_value, property_stack) {
            console.log(["value set", value, old_value, property_stack.join('.'), this]);
            return value;
        }
    };

    return {valueHandler: valueHandler};
}