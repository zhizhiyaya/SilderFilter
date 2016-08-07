var util = {
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    },
    isString: function(obj){ return typeof obj == 'string' },

    isFunction: function (value) { return type(value) == "function" },

    isWindow: function (obj) { return obj != null && obj == obj.window },

    isDocument: function(obj) { return obj != null && obj.nodeType == obj.DOCUMENT_NODE },

    isObject: function(obj) { return type(obj) == "object" },

    isPlainObject: function (obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    },

    isArray: Array.isArray ||
    function(object){ return object instanceof Array },

    extend: function(target){
        var deep, args = [].slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function(arg){ extend(target, arg, deep) });
        return target;
    },

    formatFormData: function (data) {
        var arr = data.split('&');
        var itemData;
        var formData = {};

        arr.forEach(function(item, index) {

            itemData = item.split('=');
            formData[util.trim(itemData[0])] = util.trim(itemData[1]);
        });

        return formData;
    }

};
var class2type = {},
    toString = class2type.toString;

function type(obj) {
    return obj == null ? String(obj) :
    class2type[toString.call(obj)] || "object"
}

function extend(target, source, deep) {
    for (key in source)
        if (deep && (util.isPlainObject(source[key]) || util.isArray(source[key]))) {
            if (util.isPlainObject(source[key]) && !util.isPlainObject(target[key]))
                target[key] = {}
            if (isArray(source[key]) && !util.isArray(target[key]))
                target[key] = []
            extend(target[key], source[key], deep)
        }
        else if (source[key] !== undefined) target[key] = source[key]
}

module.exports = util;