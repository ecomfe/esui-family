define('underscore/underscore', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    (function () {
        var root = this;
        var previousUnderscore = root._;
        var breaker = {};
        var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
        var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
        var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
        var _ = function (obj) {
            if (obj instanceof _)
                return obj;
            if (!(this instanceof _))
                return new _(obj);
            this._wrapped = obj;
        };
        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = _;
            }
            exports._ = _;
        } else {
            root._ = _;
        }
        _.VERSION = '1.5.2';
        var each = _.each = _.forEach = function (obj, iterator, context) {
            if (obj == null)
                return;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker)
                        return;
                }
            } else {
                var keys = _.keys(obj);
                for (var i = 0, length = keys.length; i < length; i++) {
                    if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker)
                        return;
                }
            }
        };
        _.map = _.collect = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            if (nativeMap && obj.map === nativeMap)
                return obj.map(iterator, context);
            each(obj, function (value, index, list) {
                results.push(iterator.call(context, value, index, list));
            });
            return results;
        };
        var reduceError = 'Reduce of empty array with no initial value';
        _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            if (nativeReduce && obj.reduce === nativeReduce) {
                if (context)
                    iterator = _.bind(iterator, context);
                return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
            }
            each(obj, function (value, index, list) {
                if (!initial) {
                    memo = value;
                    initial = true;
                } else {
                    memo = iterator.call(context, memo, value, index, list);
                }
            });
            if (!initial)
                throw new TypeError(reduceError);
            return memo;
        };
        _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
            var initial = arguments.length > 2;
            if (obj == null)
                obj = [];
            if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
                if (context)
                    iterator = _.bind(iterator, context);
                return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
            }
            var length = obj.length;
            if (length !== +length) {
                var keys = _.keys(obj);
                length = keys.length;
            }
            each(obj, function (value, index, list) {
                index = keys ? keys[--length] : --length;
                if (!initial) {
                    memo = obj[index];
                    initial = true;
                } else {
                    memo = iterator.call(context, memo, obj[index], index, list);
                }
            });
            if (!initial)
                throw new TypeError(reduceError);
            return memo;
        };
        _.find = _.detect = function (obj, iterator, context) {
            var result;
            any(obj, function (value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });
            return result;
        };
        _.filter = _.select = function (obj, iterator, context) {
            var results = [];
            if (obj == null)
                return results;
            if (nativeFilter && obj.filter === nativeFilter)
                return obj.filter(iterator, context);
            each(obj, function (value, index, list) {
                if (iterator.call(context, value, index, list))
                    results.push(value);
            });
            return results;
        };
        _.reject = function (obj, iterator, context) {
            return _.filter(obj, function (value, index, list) {
                return !iterator.call(context, value, index, list);
            }, context);
        };
        _.every = _.all = function (obj, iterator, context) {
            iterator || (iterator = _.identity);
            var result = true;
            if (obj == null)
                return result;
            if (nativeEvery && obj.every === nativeEvery)
                return obj.every(iterator, context);
            each(obj, function (value, index, list) {
                if (!(result = result && iterator.call(context, value, index, list)))
                    return breaker;
            });
            return !!result;
        };
        var any = _.some = _.any = function (obj, iterator, context) {
            iterator || (iterator = _.identity);
            var result = false;
            if (obj == null)
                return result;
            if (nativeSome && obj.some === nativeSome)
                return obj.some(iterator, context);
            each(obj, function (value, index, list) {
                if (result || (result = iterator.call(context, value, index, list)))
                    return breaker;
            });
            return !!result;
        };
        _.contains = _.include = function (obj, target) {
            if (obj == null)
                return false;
            if (nativeIndexOf && obj.indexOf === nativeIndexOf)
                return obj.indexOf(target) != -1;
            return any(obj, function (value) {
                return value === target;
            });
        };
        _.invoke = function (obj, method) {
            var args = slice.call(arguments, 2);
            var isFunc = _.isFunction(method);
            return _.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        };
        _.pluck = function (obj, key) {
            return _.map(obj, function (value) {
                return value[key];
            });
        };
        _.where = function (obj, attrs, first) {
            if (_.isEmpty(attrs))
                return first ? void 0 : [];
            return _[first ? 'find' : 'filter'](obj, function (value) {
                for (var key in attrs) {
                    if (attrs[key] !== value[key])
                        return false;
                }
                return true;
            });
        };
        _.findWhere = function (obj, attrs) {
            return _.where(obj, attrs, true);
        };
        _.max = function (obj, iterator, context) {
            if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                return Math.max.apply(Math, obj);
            }
            if (!iterator && _.isEmpty(obj))
                return -Infinity;
            var result = {
                computed: -Infinity,
                value: -Infinity
            };
            each(obj, function (value, index, list) {
                var computed = iterator ? iterator.call(context, value, index, list) : value;
                computed > result.computed && (result = {
                    value: value,
                    computed: computed
                });
            });
            return result.value;
        };
        _.min = function (obj, iterator, context) {
            if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
                return Math.min.apply(Math, obj);
            }
            if (!iterator && _.isEmpty(obj))
                return Infinity;
            var result = {
                computed: Infinity,
                value: Infinity
            };
            each(obj, function (value, index, list) {
                var computed = iterator ? iterator.call(context, value, index, list) : value;
                computed < result.computed && (result = {
                    value: value,
                    computed: computed
                });
            });
            return result.value;
        };
        _.shuffle = function (obj) {
            var rand;
            var index = 0;
            var shuffled = [];
            each(obj, function (value) {
                rand = _.random(index++);
                shuffled[index - 1] = shuffled[rand];
                shuffled[rand] = value;
            });
            return shuffled;
        };
        _.sample = function (obj, n, guard) {
            if (arguments.length < 2 || guard) {
                return obj[_.random(obj.length - 1)];
            }
            return _.shuffle(obj).slice(0, Math.max(0, n));
        };
        var lookupIterator = function (value) {
            return _.isFunction(value) ? value : function (obj) {
                return obj[value];
            };
        };
        _.sortBy = function (obj, value, context) {
            var iterator = lookupIterator(value);
            return _.pluck(_.map(obj, function (value, index, list) {
                return {
                    value: value,
                    index: index,
                    criteria: iterator.call(context, value, index, list)
                };
            }).sort(function (left, right) {
                var a = left.criteria;
                var b = right.criteria;
                if (a !== b) {
                    if (a > b || a === void 0)
                        return 1;
                    if (a < b || b === void 0)
                        return -1;
                }
                return left.index - right.index;
            }), 'value');
        };
        var group = function (behavior) {
            return function (obj, value, context) {
                var result = {};
                var iterator = value == null ? _.identity : lookupIterator(value);
                each(obj, function (value, index) {
                    var key = iterator.call(context, value, index, obj);
                    behavior(result, key, value);
                });
                return result;
            };
        };
        _.groupBy = group(function (result, key, value) {
            (_.has(result, key) ? result[key] : result[key] = []).push(value);
        });
        _.indexBy = group(function (result, key, value) {
            result[key] = value;
        });
        _.countBy = group(function (result, key) {
            _.has(result, key) ? result[key]++ : result[key] = 1;
        });
        _.sortedIndex = function (array, obj, iterator, context) {
            iterator = iterator == null ? _.identity : lookupIterator(iterator);
            var value = iterator.call(context, obj);
            var low = 0, high = array.length;
            while (low < high) {
                var mid = low + high >>> 1;
                iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        };
        _.toArray = function (obj) {
            if (!obj)
                return [];
            if (_.isArray(obj))
                return slice.call(obj);
            if (obj.length === +obj.length)
                return _.map(obj, _.identity);
            return _.values(obj);
        };
        _.size = function (obj) {
            if (obj == null)
                return 0;
            return obj.length === +obj.length ? obj.length : _.keys(obj).length;
        };
        _.first = _.head = _.take = function (array, n, guard) {
            if (array == null)
                return void 0;
            return n == null || guard ? array[0] : slice.call(array, 0, n);
        };
        _.initial = function (array, n, guard) {
            return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
        };
        _.last = function (array, n, guard) {
            if (array == null)
                return void 0;
            if (n == null || guard) {
                return array[array.length - 1];
            } else {
                return slice.call(array, Math.max(array.length - n, 0));
            }
        };
        _.rest = _.tail = _.drop = function (array, n, guard) {
            return slice.call(array, n == null || guard ? 1 : n);
        };
        _.compact = function (array) {
            return _.filter(array, _.identity);
        };
        var flatten = function (input, shallow, output) {
            if (shallow && _.every(input, _.isArray)) {
                return concat.apply(output, input);
            }
            each(input, function (value) {
                if (_.isArray(value) || _.isArguments(value)) {
                    shallow ? push.apply(output, value) : flatten(value, shallow, output);
                } else {
                    output.push(value);
                }
            });
            return output;
        };
        _.flatten = function (array, shallow) {
            return flatten(array, shallow, []);
        };
        _.without = function (array) {
            return _.difference(array, slice.call(arguments, 1));
        };
        _.uniq = _.unique = function (array, isSorted, iterator, context) {
            if (_.isFunction(isSorted)) {
                context = iterator;
                iterator = isSorted;
                isSorted = false;
            }
            var initial = iterator ? _.map(array, iterator, context) : array;
            var results = [];
            var seen = [];
            each(initial, function (value, index) {
                if (isSorted ? !index || seen[seen.length - 1] !== value : !_.contains(seen, value)) {
                    seen.push(value);
                    results.push(array[index]);
                }
            });
            return results;
        };
        _.union = function () {
            return _.uniq(_.flatten(arguments, true));
        };
        _.intersection = function (array) {
            var rest = slice.call(arguments, 1);
            return _.filter(_.uniq(array), function (item) {
                return _.every(rest, function (other) {
                    return _.indexOf(other, item) >= 0;
                });
            });
        };
        _.difference = function (array) {
            var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
            return _.filter(array, function (value) {
                return !_.contains(rest, value);
            });
        };
        _.zip = function () {
            var length = _.max(_.pluck(arguments, 'length').concat(0));
            var results = new Array(length);
            for (var i = 0; i < length; i++) {
                results[i] = _.pluck(arguments, '' + i);
            }
            return results;
        };
        _.object = function (list, values) {
            if (list == null)
                return {};
            var result = {};
            for (var i = 0, length = list.length; i < length; i++) {
                if (values) {
                    result[list[i]] = values[i];
                } else {
                    result[list[i][0]] = list[i][1];
                }
            }
            return result;
        };
        _.indexOf = function (array, item, isSorted) {
            if (array == null)
                return -1;
            var i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
                } else {
                    i = _.sortedIndex(array, item);
                    return array[i] === item ? i : -1;
                }
            }
            if (nativeIndexOf && array.indexOf === nativeIndexOf)
                return array.indexOf(item, isSorted);
            for (; i < length; i++)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.lastIndexOf = function (array, item, from) {
            if (array == null)
                return -1;
            var hasIndex = from != null;
            if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
                return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
            }
            var i = hasIndex ? from : array.length;
            while (i--)
                if (array[i] === item)
                    return i;
            return -1;
        };
        _.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;
            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var idx = 0;
            var range = new Array(length);
            while (idx < length) {
                range[idx++] = start;
                start += step;
            }
            return range;
        };
        var ctor = function () {
        };
        _.bind = function (func, context) {
            var args, bound;
            if (nativeBind && func.bind === nativeBind)
                return nativeBind.apply(func, slice.call(arguments, 1));
            if (!_.isFunction(func))
                throw new TypeError();
            args = slice.call(arguments, 2);
            return bound = function () {
                if (!(this instanceof bound))
                    return func.apply(context, args.concat(slice.call(arguments)));
                ctor.prototype = func.prototype;
                var self = new ctor();
                ctor.prototype = null;
                var result = func.apply(self, args.concat(slice.call(arguments)));
                if (Object(result) === result)
                    return result;
                return self;
            };
        };
        _.partial = function (func) {
            var args = slice.call(arguments, 1);
            return function () {
                return func.apply(this, args.concat(slice.call(arguments)));
            };
        };
        _.bindAll = function (obj) {
            var funcs = slice.call(arguments, 1);
            if (funcs.length === 0)
                throw new Error('bindAll must be passed function names');
            each(funcs, function (f) {
                obj[f] = _.bind(obj[f], obj);
            });
            return obj;
        };
        _.memoize = function (func, hasher) {
            var memo = {};
            hasher || (hasher = _.identity);
            return function () {
                var key = hasher.apply(this, arguments);
                return _.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
            };
        };
        _.delay = function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        };
        _.defer = function (func) {
            return _.delay.apply(_, [
                func,
                1
            ].concat(slice.call(arguments, 1)));
        };
        _.throttle = function (func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function () {
                previous = options.leading === false ? 0 : new Date();
                timeout = null;
                result = func.apply(context, args);
            };
            return function () {
                var now = new Date();
                if (!previous && options.leading === false)
                    previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        };
        _.debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function () {
                    var last = new Date() - timestamp;
                    if (last < wait) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate)
                            result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow)
                    result = func.apply(context, args);
                return result;
            };
        };
        _.once = function (func) {
            var ran = false, memo;
            return function () {
                if (ran)
                    return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        };
        _.wrap = function (func, wrapper) {
            return function () {
                var args = [func];
                push.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        };
        _.compose = function () {
            var funcs = arguments;
            return function () {
                var args = arguments;
                for (var i = funcs.length - 1; i >= 0; i--) {
                    args = [funcs[i].apply(this, args)];
                }
                return args[0];
            };
        };
        _.after = function (times, func) {
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };
        _.keys = nativeKeys || function (obj) {
            if (obj !== Object(obj))
                throw new TypeError('Invalid object');
            var keys = [];
            for (var key in obj)
                if (_.has(obj, key))
                    keys.push(key);
            return keys;
        };
        _.values = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var values = new Array(length);
            for (var i = 0; i < length; i++) {
                values[i] = obj[keys[i]];
            }
            return values;
        };
        _.pairs = function (obj) {
            var keys = _.keys(obj);
            var length = keys.length;
            var pairs = new Array(length);
            for (var i = 0; i < length; i++) {
                pairs[i] = [
                    keys[i],
                    obj[keys[i]]
                ];
            }
            return pairs;
        };
        _.invert = function (obj) {
            var result = {};
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                result[obj[keys[i]]] = keys[i];
            }
            return result;
        };
        _.functions = _.methods = function (obj) {
            var names = [];
            for (var key in obj) {
                if (_.isFunction(obj[key]))
                    names.push(key);
            }
            return names.sort();
        };
        _.extend = function (obj) {
            each(slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        };
        _.pick = function (obj) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            each(keys, function (key) {
                if (key in obj)
                    copy[key] = obj[key];
            });
            return copy;
        };
        _.omit = function (obj) {
            var copy = {};
            var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
            for (var key in obj) {
                if (!_.contains(keys, key))
                    copy[key] = obj[key];
            }
            return copy;
        };
        _.defaults = function (obj) {
            each(slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        if (obj[prop] === void 0)
                            obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        };
        _.clone = function (obj) {
            if (!_.isObject(obj))
                return obj;
            return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };
        _.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };
        var eq = function (a, b, aStack, bStack) {
            if (a === b)
                return a !== 0 || 1 / a == 1 / b;
            if (a == null || b == null)
                return a === b;
            if (a instanceof _)
                a = a._wrapped;
            if (b instanceof _)
                b = b._wrapped;
            var className = toString.call(a);
            if (className != toString.call(b))
                return false;
            switch (className) {
            case '[object String]':
                return a == String(b);
            case '[object Number]':
                return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a == +b;
            case '[object RegExp]':
                return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
            }
            if (typeof a != 'object' || typeof b != 'object')
                return false;
            var length = aStack.length;
            while (length--) {
                if (aStack[length] == a)
                    return bStack[length] == b;
            }
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor)) {
                return false;
            }
            aStack.push(a);
            bStack.push(b);
            var size = 0, result = true;
            if (className == '[object Array]') {
                size = a.length;
                result = size == b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack)))
                            break;
                    }
                }
            } else {
                for (var key in a) {
                    if (_.has(a, key)) {
                        size++;
                        if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack)))
                            break;
                    }
                }
                if (result) {
                    for (key in b) {
                        if (_.has(b, key) && !size--)
                            break;
                    }
                    result = !size;
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        };
        _.isEqual = function (a, b) {
            return eq(a, b, [], []);
        };
        _.isEmpty = function (obj) {
            if (obj == null)
                return true;
            if (_.isArray(obj) || _.isString(obj))
                return obj.length === 0;
            for (var key in obj)
                if (_.has(obj, key))
                    return false;
            return true;
        };
        _.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };
        _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) == '[object Array]';
        };
        _.isObject = function (obj) {
            return obj === Object(obj);
        };
        each([
            'Arguments',
            'Function',
            'String',
            'Number',
            'Date',
            'RegExp'
        ], function (name) {
            _['is' + name] = function (obj) {
                return toString.call(obj) == '[object ' + name + ']';
            };
        });
        if (!_.isArguments(arguments)) {
            _.isArguments = function (obj) {
                return !!(obj && _.has(obj, 'callee'));
            };
        }
        if (typeof /./ !== 'function') {
            _.isFunction = function (obj) {
                return typeof obj === 'function';
            };
        }
        _.isFinite = function (obj) {
            return isFinite(obj) && !isNaN(parseFloat(obj));
        };
        _.isNaN = function (obj) {
            return _.isNumber(obj) && obj != +obj;
        };
        _.isBoolean = function (obj) {
            return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
        };
        _.isNull = function (obj) {
            return obj === null;
        };
        _.isUndefined = function (obj) {
            return obj === void 0;
        };
        _.has = function (obj, key) {
            return hasOwnProperty.call(obj, key);
        };
        _.noConflict = function () {
            root._ = previousUnderscore;
            return this;
        };
        _.identity = function (value) {
            return value;
        };
        _.times = function (n, iterator, context) {
            var accum = Array(Math.max(0, n));
            for (var i = 0; i < n; i++)
                accum[i] = iterator.call(context, i);
            return accum;
        };
        _.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        };
        var entityMap = {
            escape: {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#x27;'
            }
        };
        entityMap.unescape = _.invert(entityMap.escape);
        var entityRegexes = {
            escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
            unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
        };
        _.each([
            'escape',
            'unescape'
        ], function (method) {
            _[method] = function (string) {
                if (string == null)
                    return '';
                return ('' + string).replace(entityRegexes[method], function (match) {
                    return entityMap[method][match];
                });
            };
        });
        _.result = function (object, property) {
            if (object == null)
                return void 0;
            var value = object[property];
            return _.isFunction(value) ? value.call(object) : value;
        };
        _.mixin = function (obj) {
            each(_.functions(obj), function (name) {
                var func = _[name] = obj[name];
                _.prototype[name] = function () {
                    var args = [this._wrapped];
                    push.apply(args, arguments);
                    return result.call(this, func.apply(_, args));
                };
            });
        };
        var idCounter = 0;
        _.uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
        };
        _.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };
        var noMatch = /(.)^/;
        var escapes = {
            '\'': '\'',
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };
        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        _.template = function (text, data, settings) {
            var render;
            settings = _.defaults({}, settings, _.templateSettings);
            var matcher = new RegExp([
                (settings.escape || noMatch).source,
                (settings.interpolate || noMatch).source,
                (settings.evaluate || noMatch).source
            ].join('|') + '|$', 'g');
            var index = 0;
            var source = '__p+=\'';
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });
                if (escape) {
                    source += '\'+\n((__t=(' + escape + '))==null?\'\':_.escape(__t))+\n\'';
                }
                if (interpolate) {
                    source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
                }
                if (evaluate) {
                    source += '\';\n' + evaluate + '\n__p+=\'';
                }
                index = offset + match.length;
                return match;
            });
            source += '\';\n';
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = 'var __t,__p=\'\',__j=Array.prototype.join,' + 'print=function(){__p+=__j.call(arguments,\'\');};\n' + source + 'return __p;\n';
            try {
                render = new Function(settings.variable || 'obj', '_', source);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data)
                return render(data, _);
            var template = function (data) {
                return render.call(this, data, _);
            };
            template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
            return template;
        };
        _.chain = function (obj) {
            return _(obj).chain();
        };
        var result = function (obj) {
            return this._chain ? _(obj).chain() : obj;
        };
        _.mixin(_);
        each([
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                var obj = this._wrapped;
                method.apply(obj, arguments);
                if ((name == 'shift' || name == 'splice') && obj.length === 0)
                    delete obj[0];
                return result.call(this, obj);
            };
        });
        each([
            'concat',
            'join',
            'slice'
        ], function (name) {
            var method = ArrayProto[name];
            _.prototype[name] = function () {
                return result.call(this, method.apply(this._wrapped, arguments));
            };
        });
        _.extend(_.prototype, {
            chain: function () {
                this._chain = true;
                return this;
            },
            value: function () {
                return this._wrapped;
            }
        });
    }.call(this));
});

define('underscore', ['underscore/underscore'], function (main) { return main; });

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/zh-tw', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('zh-tw', {
        months: '\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D'.split('_'),
        weekdaysShort: '\u9031\u65E5_\u9031\u4E00_\u9031\u4E8C_\u9031\u4E09_\u9031\u56DB_\u9031\u4E94_\u9031\u516D'.split('_'),
        weekdaysMin: '\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D'.split('_'),
        longDateFormat: {
            LT: 'Ah\u9EDEmm',
            L: 'YYYY\u5E74MMMD\u65E5',
            LL: 'YYYY\u5E74MMMD\u65E5',
            LLL: 'YYYY\u5E74MMMD\u65E5LT',
            LLLL: 'YYYY\u5E74MMMD\u65E5ddddLT',
            l: 'YYYY\u5E74MMMD\u65E5',
            ll: 'YYYY\u5E74MMMD\u65E5',
            lll: 'YYYY\u5E74MMMD\u65E5LT',
            llll: 'YYYY\u5E74MMMD\u65E5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 900) {
                return '\u65E9\u4E0A';
            } else if (hm < 1130) {
                return '\u4E0A\u5348';
            } else if (hm < 1230) {
                return '\u4E2D\u5348';
            } else if (hm < 1800) {
                return '\u4E0B\u5348';
            } else {
                return '\u665A\u4E0A';
            }
        },
        calendar: {
            sameDay: '[\u4ECA\u5929]LT',
            nextDay: '[\u660E\u5929]LT',
            nextWeek: '[\u4E0B]ddddLT',
            lastDay: '[\u6628\u5929]LT',
            lastWeek: '[\u4E0A]ddddLT',
            sameElse: 'L'
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '\u65E5';
            case 'M':
                return number + '\u6708';
            case 'w':
            case 'W':
                return number + '\u9031';
            default:
                return number;
            }
        },
        relativeTime: {
            future: '%s\u5167',
            past: '%s\u524D',
            s: '\u5E7E\u79D2',
            m: '\u4E00\u5206\u9418',
            mm: '%d\u5206\u9418',
            h: '\u4E00\u5C0F\u6642',
            hh: '%d\u5C0F\u6642',
            d: '\u4E00\u5929',
            dd: '%d\u5929',
            M: '\u4E00\u500B\u6708',
            MM: '%d\u500B\u6708',
            y: '\u4E00\u5E74',
            yy: '%d\u5E74'
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/zh-cn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('zh-cn', {
        months: '\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D'.split('_'),
        weekdaysShort: '\u5468\u65E5_\u5468\u4E00_\u5468\u4E8C_\u5468\u4E09_\u5468\u56DB_\u5468\u4E94_\u5468\u516D'.split('_'),
        weekdaysMin: '\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D'.split('_'),
        longDateFormat: {
            LT: 'Ah\u70B9mm',
            L: 'YYYY-MM-DD',
            LL: 'YYYY\u5E74MMMD\u65E5',
            LLL: 'YYYY\u5E74MMMD\u65E5LT',
            LLLL: 'YYYY\u5E74MMMD\u65E5ddddLT',
            l: 'YYYY-MM-DD',
            ll: 'YYYY\u5E74MMMD\u65E5',
            lll: 'YYYY\u5E74MMMD\u65E5LT',
            llll: 'YYYY\u5E74MMMD\u65E5ddddLT'
        },
        meridiem: function (hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return '\u51CC\u6668';
            } else if (hm < 900) {
                return '\u65E9\u4E0A';
            } else if (hm < 1130) {
                return '\u4E0A\u5348';
            } else if (hm < 1230) {
                return '\u4E2D\u5348';
            } else if (hm < 1800) {
                return '\u4E0B\u5348';
            } else {
                return '\u665A\u4E0A';
            }
        },
        calendar: {
            sameDay: function () {
                return this.minutes() === 0 ? '[\u4ECA\u5929]Ah[\u70B9\u6574]' : '[\u4ECA\u5929]LT';
            },
            nextDay: function () {
                return this.minutes() === 0 ? '[\u660E\u5929]Ah[\u70B9\u6574]' : '[\u660E\u5929]LT';
            },
            lastDay: function () {
                return this.minutes() === 0 ? '[\u6628\u5929]Ah[\u70B9\u6574]' : '[\u6628\u5929]LT';
            },
            nextWeek: function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[\u4E0B]' : '[\u672C]';
                return this.minutes() === 0 ? prefix + 'dddAh\u70B9\u6574' : prefix + 'dddAh\u70B9mm';
            },
            lastWeek: function () {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf('week');
                prefix = this.unix() < startOfWeek.unix() ? '[\u4E0A]' : '[\u672C]';
                return this.minutes() === 0 ? prefix + 'dddAh\u70B9\u6574' : prefix + 'dddAh\u70B9mm';
            },
            sameElse: 'LL'
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '\u65E5';
            case 'M':
                return number + '\u6708';
            case 'w':
            case 'W':
                return number + '\u5468';
            default:
                return number;
            }
        },
        relativeTime: {
            future: '%s\u5185',
            past: '%s\u524D',
            s: '\u51E0\u79D2',
            m: '1\u5206\u949F',
            mm: '%d\u5206\u949F',
            h: '1\u5C0F\u65F6',
            hh: '%d\u5C0F\u65F6',
            d: '1\u5929',
            dd: '%d\u5929',
            M: '1\u4E2A\u6708',
            MM: '%d\u4E2A\u6708',
            y: '1\u5E74',
            yy: '%d\u5E74'
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/vi', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('vi', {
        months: 'th\xE1ng 1_th\xE1ng 2_th\xE1ng 3_th\xE1ng 4_th\xE1ng 5_th\xE1ng 6_th\xE1ng 7_th\xE1ng 8_th\xE1ng 9_th\xE1ng 10_th\xE1ng 11_th\xE1ng 12'.split('_'),
        monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
        weekdays: 'ch\u1EE7 nh\u1EADt_th\u1EE9 hai_th\u1EE9 ba_th\u1EE9 t\u01B0_th\u1EE9 n\u0103m_th\u1EE9 s\xE1u_th\u1EE9 b\u1EA3y'.split('_'),
        weekdaysShort: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        weekdaysMin: 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM [n\u0103m] YYYY',
            LLL: 'D MMMM [n\u0103m] YYYY LT',
            LLLL: 'dddd, D MMMM [n\u0103m] YYYY LT',
            l: 'DD/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY LT',
            llll: 'ddd, D MMM YYYY LT'
        },
        calendar: {
            sameDay: '[H\xF4m nay l\xFAc] LT',
            nextDay: '[Ng\xE0y mai l\xFAc] LT',
            nextWeek: 'dddd [tu\u1EA7n t\u1EDBi l\xFAc] LT',
            lastDay: '[H\xF4m qua l\xFAc] LT',
            lastWeek: 'dddd [tu\u1EA7n r\u1ED3i l\xFAc] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s t\u1EDBi',
            past: '%s tr\u01B0\u1EDBc',
            s: 'v\xE0i gi\xE2y',
            m: 'm\u1ED9t ph\xFAt',
            mm: '%d ph\xFAt',
            h: 'm\u1ED9t gi\u1EDD',
            hh: '%d gi\u1EDD',
            d: 'm\u1ED9t ng\xE0y',
            dd: '%d ng\xE0y',
            M: 'm\u1ED9t th\xE1ng',
            MM: '%d th\xE1ng',
            y: 'm\u1ED9t n\u0103m',
            yy: '%d n\u0103m'
        },
        ordinal: function (number) {
            return number;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/uz', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('uz', {
        months: '\u044F\u043D\u0432\u0430\u0440\u044C_\u0444\u0435\u0432\u0440\u0430\u043B\u044C_\u043C\u0430\u0440\u0442_\u0430\u043F\u0440\u0435\u043B\u044C_\u043C\u0430\u0439_\u0438\u044E\u043D\u044C_\u0438\u044E\u043B\u044C_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C_\u043E\u043A\u0442\u044F\u0431\u0440\u044C_\u043D\u043E\u044F\u0431\u0440\u044C_\u0434\u0435\u043A\u0430\u0431\u0440\u044C'.split('_'),
        monthsShort: '\u044F\u043D\u0432_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u0439_\u0438\u044E\u043D_\u0438\u044E\u043B_\u0430\u0432\u0433_\u0441\u0435\u043D_\u043E\u043A\u0442_\u043D\u043E\u044F_\u0434\u0435\u043A'.split('_'),
        weekdays: '\u042F\u043A\u0448\u0430\u043D\u0431\u0430_\u0414\u0443\u0448\u0430\u043D\u0431\u0430_\u0421\u0435\u0448\u0430\u043D\u0431\u0430_\u0427\u043E\u0440\u0448\u0430\u043D\u0431\u0430_\u041F\u0430\u0439\u0448\u0430\u043D\u0431\u0430_\u0416\u0443\u043C\u0430_\u0428\u0430\u043D\u0431\u0430'.split('_'),
        weekdaysShort: '\u042F\u043A\u0448_\u0414\u0443\u0448_\u0421\u0435\u0448_\u0427\u043E\u0440_\u041F\u0430\u0439_\u0416\u0443\u043C_\u0428\u0430\u043D'.split('_'),
        weekdaysMin: '\u042F\u043A_\u0414\u0443_\u0421\u0435_\u0427\u043E_\u041F\u0430_\u0416\u0443_\u0428\u0430'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'D MMMM YYYY, dddd LT'
        },
        calendar: {
            sameDay: '[\u0411\u0443\u0433\u0443\u043D \u0441\u043E\u0430\u0442] LT [\u0434\u0430]',
            nextDay: '[\u042D\u0440\u0442\u0430\u0433\u0430] LT [\u0434\u0430]',
            nextWeek: 'dddd [\u043A\u0443\u043D\u0438 \u0441\u043E\u0430\u0442] LT [\u0434\u0430]',
            lastDay: '[\u041A\u0435\u0447\u0430 \u0441\u043E\u0430\u0442] LT [\u0434\u0430]',
            lastWeek: '[\u0423\u0442\u0433\u0430\u043D] dddd [\u043A\u0443\u043D\u0438 \u0441\u043E\u0430\u0442] LT [\u0434\u0430]',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u042F\u043A\u0438\u043D %s \u0438\u0447\u0438\u0434\u0430',
            past: '\u0411\u0438\u0440 \u043D\u0435\u0447\u0430 %s \u043E\u043B\u0434\u0438\u043D',
            s: '\u0444\u0443\u0440\u0441\u0430\u0442',
            m: '\u0431\u0438\u0440 \u0434\u0430\u043A\u0438\u043A\u0430',
            mm: '%d \u0434\u0430\u043A\u0438\u043A\u0430',
            h: '\u0431\u0438\u0440 \u0441\u043E\u0430\u0442',
            hh: '%d \u0441\u043E\u0430\u0442',
            d: '\u0431\u0438\u0440 \u043A\u0443\u043D',
            dd: '%d \u043A\u0443\u043D',
            M: '\u0431\u0438\u0440 \u043E\u0439',
            MM: '%d \u043E\u0439',
            y: '\u0431\u0438\u0440 \u0439\u0438\u043B',
            yy: '%d \u0439\u0438\u043B'
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/uk', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': '\u0445\u0432\u0438\u043B\u0438\u043D\u0430_\u0445\u0432\u0438\u043B\u0438\u043D\u0438_\u0445\u0432\u0438\u043B\u0438\u043D',
            'hh': '\u0433\u043E\u0434\u0438\u043D\u0430_\u0433\u043E\u0434\u0438\u043D\u0438_\u0433\u043E\u0434\u0438\u043D',
            'dd': '\u0434\u0435\u043D\u044C_\u0434\u043D\u0456_\u0434\u043D\u0456\u0432',
            'MM': '\u043C\u0456\u0441\u044F\u0446\u044C_\u043C\u0456\u0441\u044F\u0446\u0456_\u043C\u0456\u0441\u044F\u0446\u0456\u0432',
            'yy': '\u0440\u0456\u043A_\u0440\u043E\u043A\u0438_\u0440\u043E\u043A\u0456\u0432'
        };
        if (key === 'm') {
            return withoutSuffix ? '\u0445\u0432\u0438\u043B\u0438\u043D\u0430' : '\u0445\u0432\u0438\u043B\u0438\u043D\u0443';
        } else if (key === 'h') {
            return withoutSuffix ? '\u0433\u043E\u0434\u0438\u043D\u0430' : '\u0433\u043E\u0434\u0438\u043D\u0443';
        } else {
            return number + ' ' + plural(format[key], +number);
        }
    }
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0441\u0456\u0447\u0435\u043D\u044C_\u043B\u044E\u0442\u0438\u0439_\u0431\u0435\u0440\u0435\u0437\u0435\u043D\u044C_\u043A\u0432\u0456\u0442\u0435\u043D\u044C_\u0442\u0440\u0430\u0432\u0435\u043D\u044C_\u0447\u0435\u0440\u0432\u0435\u043D\u044C_\u043B\u0438\u043F\u0435\u043D\u044C_\u0441\u0435\u0440\u043F\u0435\u043D\u044C_\u0432\u0435\u0440\u0435\u0441\u0435\u043D\u044C_\u0436\u043E\u0432\u0442\u0435\u043D\u044C_\u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434_\u0433\u0440\u0443\u0434\u0435\u043D\u044C'.split('_'),
                'accusative': '\u0441\u0456\u0447\u043D\u044F_\u043B\u044E\u0442\u043E\u0433\u043E_\u0431\u0435\u0440\u0435\u0437\u043D\u044F_\u043A\u0432\u0456\u0442\u043D\u044F_\u0442\u0440\u0430\u0432\u043D\u044F_\u0447\u0435\u0440\u0432\u043D\u044F_\u043B\u0438\u043F\u043D\u044F_\u0441\u0435\u0440\u043F\u043D\u044F_\u0432\u0435\u0440\u0435\u0441\u043D\u044F_\u0436\u043E\u0432\u0442\u043D\u044F_\u043B\u0438\u0441\u0442\u043E\u043F\u0430\u0434\u0430_\u0433\u0440\u0443\u0434\u043D\u044F'.split('_')
            }, nounCase = /D[oD]? *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u043D\u0435\u0434\u0456\u043B\u044F_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A_\u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A_\u0441\u0435\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u044F_\u0441\u0443\u0431\u043E\u0442\u0430'.split('_'),
                'accusative': '\u043D\u0435\u0434\u0456\u043B\u044E_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A_\u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A_\u0441\u0435\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u044E_\u0441\u0443\u0431\u043E\u0442\u0443'.split('_'),
                'genitive': '\u043D\u0435\u0434\u0456\u043B\u0456_\u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043A\u0430_\u0432\u0456\u0432\u0442\u043E\u0440\u043A\u0430_\u0441\u0435\u0440\u0435\u0434\u0438_\u0447\u0435\u0442\u0432\u0435\u0440\u0433\u0430_\u043F\u2019\u044F\u0442\u043D\u0438\u0446\u0456_\u0441\u0443\u0431\u043E\u0442\u0438'.split('_')
            }, nounCase = /(\[[ВвУу]\]) ?dddd/.test(format) ? 'accusative' : /\[?(?:минулої|наступної)? ?\] ?dddd/.test(format) ? 'genitive' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    function processHoursFunction(str) {
        return function () {
            return str + '\u043E' + (this.hours() === 11 ? '\u0431' : '') + '] LT';
        };
    }
    return moment.lang('uk', {
        months: monthsCaseReplace,
        monthsShort: '\u0441\u0456\u0447_\u043B\u044E\u0442_\u0431\u0435\u0440_\u043A\u0432\u0456\u0442_\u0442\u0440\u0430\u0432_\u0447\u0435\u0440\u0432_\u043B\u0438\u043F_\u0441\u0435\u0440\u043F_\u0432\u0435\u0440_\u0436\u043E\u0432\u0442_\u043B\u0438\u0441\u0442_\u0433\u0440\u0443\u0434'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u043D\u0434_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        weekdaysMin: '\u043D\u0434_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0440.',
            LLL: 'D MMMM YYYY \u0440., LT',
            LLLL: 'dddd, D MMMM YYYY \u0440., LT'
        },
        calendar: {
            sameDay: processHoursFunction('[\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456 '),
            nextDay: processHoursFunction('[\u0417\u0430\u0432\u0442\u0440\u0430 '),
            lastDay: processHoursFunction('[\u0412\u0447\u043E\u0440\u0430 '),
            nextWeek: processHoursFunction('[\u0423] dddd ['),
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 5:
                case 6:
                    return processHoursFunction('[\u041C\u0438\u043D\u0443\u043B\u043E\u0457] dddd [').call(this);
                case 1:
                case 2:
                case 4:
                    return processHoursFunction('[\u041C\u0438\u043D\u0443\u043B\u043E\u0433\u043E] dddd [').call(this);
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0437\u0430 %s',
            past: '%s \u0442\u043E\u043C\u0443',
            s: '\u0434\u0435\u043A\u0456\u043B\u044C\u043A\u0430 \u0441\u0435\u043A\u0443\u043D\u0434',
            m: relativeTimeWithPlural,
            mm: relativeTimeWithPlural,
            h: '\u0433\u043E\u0434\u0438\u043D\u0443',
            hh: relativeTimeWithPlural,
            d: '\u0434\u0435\u043D\u044C',
            dd: relativeTimeWithPlural,
            M: '\u043C\u0456\u0441\u044F\u0446\u044C',
            MM: relativeTimeWithPlural,
            y: '\u0440\u0456\u043A',
            yy: relativeTimeWithPlural
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u043D\u043E\u0447\u0456';
            } else if (hour < 12) {
                return '\u0440\u0430\u043D\u043A\u0443';
            } else if (hour < 17) {
                return '\u0434\u043D\u044F';
            } else {
                return '\u0432\u0435\u0447\u043E\u0440\u0430';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
            case 'w':
            case 'W':
                return number + '-\u0439';
            case 'D':
                return number + '-\u0433\u043E';
            default:
                return number;
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tzm', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('tzm', {
        months: '\u2D49\u2D4F\u2D4F\u2D30\u2D62\u2D54_\u2D31\u2D55\u2D30\u2D62\u2D55_\u2D4E\u2D30\u2D55\u2D5A_\u2D49\u2D31\u2D54\u2D49\u2D54_\u2D4E\u2D30\u2D62\u2D62\u2D53_\u2D62\u2D53\u2D4F\u2D62\u2D53_\u2D62\u2D53\u2D4D\u2D62\u2D53\u2D63_\u2D56\u2D53\u2D5B\u2D5C_\u2D5B\u2D53\u2D5C\u2D30\u2D4F\u2D31\u2D49\u2D54_\u2D3D\u2D5F\u2D53\u2D31\u2D55_\u2D4F\u2D53\u2D61\u2D30\u2D4F\u2D31\u2D49\u2D54_\u2D37\u2D53\u2D4A\u2D4F\u2D31\u2D49\u2D54'.split('_'),
        monthsShort: '\u2D49\u2D4F\u2D4F\u2D30\u2D62\u2D54_\u2D31\u2D55\u2D30\u2D62\u2D55_\u2D4E\u2D30\u2D55\u2D5A_\u2D49\u2D31\u2D54\u2D49\u2D54_\u2D4E\u2D30\u2D62\u2D62\u2D53_\u2D62\u2D53\u2D4F\u2D62\u2D53_\u2D62\u2D53\u2D4D\u2D62\u2D53\u2D63_\u2D56\u2D53\u2D5B\u2D5C_\u2D5B\u2D53\u2D5C\u2D30\u2D4F\u2D31\u2D49\u2D54_\u2D3D\u2D5F\u2D53\u2D31\u2D55_\u2D4F\u2D53\u2D61\u2D30\u2D4F\u2D31\u2D49\u2D54_\u2D37\u2D53\u2D4A\u2D4F\u2D31\u2D49\u2D54'.split('_'),
        weekdays: '\u2D30\u2D59\u2D30\u2D4E\u2D30\u2D59_\u2D30\u2D62\u2D4F\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4F\u2D30\u2D59_\u2D30\u2D3D\u2D54\u2D30\u2D59_\u2D30\u2D3D\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4E\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D39\u2D62\u2D30\u2D59'.split('_'),
        weekdaysShort: '\u2D30\u2D59\u2D30\u2D4E\u2D30\u2D59_\u2D30\u2D62\u2D4F\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4F\u2D30\u2D59_\u2D30\u2D3D\u2D54\u2D30\u2D59_\u2D30\u2D3D\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4E\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D39\u2D62\u2D30\u2D59'.split('_'),
        weekdaysMin: '\u2D30\u2D59\u2D30\u2D4E\u2D30\u2D59_\u2D30\u2D62\u2D4F\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4F\u2D30\u2D59_\u2D30\u2D3D\u2D54\u2D30\u2D59_\u2D30\u2D3D\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D4E\u2D61\u2D30\u2D59_\u2D30\u2D59\u2D49\u2D39\u2D62\u2D30\u2D59'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u2D30\u2D59\u2D37\u2D45 \u2D34] LT',
            nextDay: '[\u2D30\u2D59\u2D3D\u2D30 \u2D34] LT',
            nextWeek: 'dddd [\u2D34] LT',
            lastDay: '[\u2D30\u2D5A\u2D30\u2D4F\u2D5C \u2D34] LT',
            lastWeek: 'dddd [\u2D34] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u2D37\u2D30\u2D37\u2D45 \u2D59 \u2D62\u2D30\u2D4F %s',
            past: '\u2D62\u2D30\u2D4F %s',
            s: '\u2D49\u2D4E\u2D49\u2D3D',
            m: '\u2D4E\u2D49\u2D4F\u2D53\u2D3A',
            mm: '%d \u2D4E\u2D49\u2D4F\u2D53\u2D3A',
            h: '\u2D59\u2D30\u2D44\u2D30',
            hh: '%d \u2D5C\u2D30\u2D59\u2D59\u2D30\u2D44\u2D49\u2D4F',
            d: '\u2D30\u2D59\u2D59',
            dd: '%d o\u2D59\u2D59\u2D30\u2D4F',
            M: '\u2D30\u2D62o\u2D53\u2D54',
            MM: '%d \u2D49\u2D62\u2D62\u2D49\u2D54\u2D4F',
            y: '\u2D30\u2D59\u2D33\u2D30\u2D59',
            yy: '%d \u2D49\u2D59\u2D33\u2D30\u2D59\u2D4F'
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tzm-latn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('tzm-latn', {
        months: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        monthsShort: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dadkh s yan %s',
            past: 'yan %s',
            s: 'imik',
            m: 'minu\u1E0D',
            mm: '%d minu\u1E0D',
            h: 'sa\u025Ba',
            hh: '%d tassa\u025Bin',
            d: 'ass',
            dd: '%d ossan',
            M: 'ayowr',
            MM: '%d iyyirn',
            y: 'asgas',
            yy: '%d isgasn'
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

define('moment/lang/tzm-la', [
    'require',
    'exports',
    'module',
    '../moment'
], function (require, exports, module) {
    require('../moment').lang('tzm-la', {
        months: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        monthsShort: 'innayr_br\u02E4ayr\u02E4_mar\u02E4s\u02E4_ibrir_mayyw_ywnyw_ywlywz_\u0263w\u0161t_\u0161wtanbir_kt\u02E4wbr\u02E4_nwwanbir_dwjnbir'.split('_'),
        weekdays: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysShort: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        weekdaysMin: 'asamas_aynas_asinas_akras_akwas_asimwas_asi\u1E0Dyas'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[asdkh g] LT',
            nextDay: '[aska g] LT',
            nextWeek: 'dddd [g] LT',
            lastDay: '[assant g] LT',
            lastWeek: 'dddd [g] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dadkh s yan %s',
            past: 'yan %s',
            s: 'imik',
            m: 'minu\u1E0D',
            mm: '%d minu\u1E0D',
            h: 'sa\u025Ba',
            hh: '%d tassa\u025Bin',
            d: 'ass',
            dd: '%d ossan',
            M: 'ayowr',
            MM: '%d iyyirn',
            y: 'asgas',
            yy: '%d isgasn'
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
});

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var suffixes = {
        1: '\'inci',
        5: '\'inci',
        8: '\'inci',
        70: '\'inci',
        80: '\'inci',
        2: '\'nci',
        7: '\'nci',
        20: '\'nci',
        50: '\'nci',
        3: '\'\xFCnc\xFC',
        4: '\'\xFCnc\xFC',
        100: '\'\xFCnc\xFC',
        6: '\'nc\u0131',
        9: '\'uncu',
        10: '\'uncu',
        30: '\'uncu',
        60: '\'\u0131nc\u0131',
        90: '\'\u0131nc\u0131'
    };
    return moment.lang('tr', {
        months: 'Ocak_\u015Eubat_Mart_Nisan_May\u0131s_Haziran_Temmuz_A\u011Fustos_Eyl\xFCl_Ekim_Kas\u0131m_Aral\u0131k'.split('_'),
        monthsShort: 'Oca_\u015Eub_Mar_Nis_May_Haz_Tem_A\u011Fu_Eyl_Eki_Kas_Ara'.split('_'),
        weekdays: 'Pazar_Pazartesi_Sal\u0131_\xC7ar\u015Famba_Per\u015Fembe_Cuma_Cumartesi'.split('_'),
        weekdaysShort: 'Paz_Pts_Sal_\xC7ar_Per_Cum_Cts'.split('_'),
        weekdaysMin: 'Pz_Pt_Sa_\xC7a_Pe_Cu_Ct'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[bug\xFCn saat] LT',
            nextDay: '[yar\u0131n saat] LT',
            nextWeek: '[haftaya] dddd [saat] LT',
            lastDay: '[d\xFCn] LT',
            lastWeek: '[ge\xE7en hafta] dddd [saat] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \xF6nce',
            s: 'birka\xE7 saniye',
            m: 'bir dakika',
            mm: '%d dakika',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xFCn',
            dd: '%d g\xFCn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir y\u0131l',
            yy: '%d y\u0131l'
        },
        ordinal: function (number) {
            if (number === 0) {
                return number + '\'\u0131nc\u0131';
            }
            var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/tl-ph', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('tl-ph', {
        months: 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
        monthsShort: 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
        weekdays: 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
        weekdaysShort: 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
        weekdaysMin: 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'MM/D/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY LT',
            LLLL: 'dddd, MMMM DD, YYYY LT'
        },
        calendar: {
            sameDay: '[Ngayon sa] LT',
            nextDay: '[Bukas sa] LT',
            nextWeek: 'dddd [sa] LT',
            lastDay: '[Kahapon sa] LT',
            lastWeek: 'dddd [huling linggo] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'sa loob ng %s',
            past: '%s ang nakalipas',
            s: 'ilang segundo',
            m: 'isang minuto',
            mm: '%d minuto',
            h: 'isang oras',
            hh: '%d oras',
            d: 'isang araw',
            dd: '%d araw',
            M: 'isang buwan',
            MM: '%d buwan',
            y: 'isang taon',
            yy: '%d taon'
        },
        ordinal: function (number) {
            return number;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/th', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('th', {
        months: '\u0E21\u0E01\u0E23\u0E32\u0E04\u0E21_\u0E01\u0E38\u0E21\u0E20\u0E32\u0E1E\u0E31\u0E19\u0E18\u0E4C_\u0E21\u0E35\u0E19\u0E32\u0E04\u0E21_\u0E40\u0E21\u0E29\u0E32\u0E22\u0E19_\u0E1E\u0E24\u0E29\u0E20\u0E32\u0E04\u0E21_\u0E21\u0E34\u0E16\u0E38\u0E19\u0E32\u0E22\u0E19_\u0E01\u0E23\u0E01\u0E0E\u0E32\u0E04\u0E21_\u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21_\u0E01\u0E31\u0E19\u0E22\u0E32\u0E22\u0E19_\u0E15\u0E38\u0E25\u0E32\u0E04\u0E21_\u0E1E\u0E24\u0E28\u0E08\u0E34\u0E01\u0E32\u0E22\u0E19_\u0E18\u0E31\u0E19\u0E27\u0E32\u0E04\u0E21'.split('_'),
        monthsShort: '\u0E21\u0E01\u0E23\u0E32_\u0E01\u0E38\u0E21\u0E20\u0E32_\u0E21\u0E35\u0E19\u0E32_\u0E40\u0E21\u0E29\u0E32_\u0E1E\u0E24\u0E29\u0E20\u0E32_\u0E21\u0E34\u0E16\u0E38\u0E19\u0E32_\u0E01\u0E23\u0E01\u0E0E\u0E32_\u0E2A\u0E34\u0E07\u0E2B\u0E32_\u0E01\u0E31\u0E19\u0E22\u0E32_\u0E15\u0E38\u0E25\u0E32_\u0E1E\u0E24\u0E28\u0E08\u0E34\u0E01\u0E32_\u0E18\u0E31\u0E19\u0E27\u0E32'.split('_'),
        weekdays: '\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C_\u0E08\u0E31\u0E19\u0E17\u0E23\u0E4C_\u0E2D\u0E31\u0E07\u0E04\u0E32\u0E23_\u0E1E\u0E38\u0E18_\u0E1E\u0E24\u0E2B\u0E31\u0E2A\u0E1A\u0E14\u0E35_\u0E28\u0E38\u0E01\u0E23\u0E4C_\u0E40\u0E2A\u0E32\u0E23\u0E4C'.split('_'),
        weekdaysShort: '\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C_\u0E08\u0E31\u0E19\u0E17\u0E23\u0E4C_\u0E2D\u0E31\u0E07\u0E04\u0E32\u0E23_\u0E1E\u0E38\u0E18_\u0E1E\u0E24\u0E2B\u0E31\u0E2A_\u0E28\u0E38\u0E01\u0E23\u0E4C_\u0E40\u0E2A\u0E32\u0E23\u0E4C'.split('_'),
        weekdaysMin: '\u0E2D\u0E32._\u0E08._\u0E2D._\u0E1E._\u0E1E\u0E24._\u0E28._\u0E2A.'.split('_'),
        longDateFormat: {
            LT: 'H \u0E19\u0E32\u0E2C\u0E34\u0E01\u0E32 m \u0E19\u0E32\u0E17\u0E35',
            L: 'YYYY/MM/DD',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY \u0E40\u0E27\u0E25\u0E32 LT',
            LLLL: '\u0E27\u0E31\u0E19dddd\u0E17\u0E35\u0E48 D MMMM YYYY \u0E40\u0E27\u0E25\u0E32 LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u0E01\u0E48\u0E2D\u0E19\u0E40\u0E17\u0E35\u0E48\u0E22\u0E07';
            } else {
                return '\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E17\u0E35\u0E48\u0E22\u0E07';
            }
        },
        calendar: {
            sameDay: '[\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49 \u0E40\u0E27\u0E25\u0E32] LT',
            nextDay: '[\u0E1E\u0E23\u0E38\u0E48\u0E07\u0E19\u0E35\u0E49 \u0E40\u0E27\u0E25\u0E32] LT',
            nextWeek: 'dddd[\u0E2B\u0E19\u0E49\u0E32 \u0E40\u0E27\u0E25\u0E32] LT',
            lastDay: '[\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E27\u0E32\u0E19\u0E19\u0E35\u0E49 \u0E40\u0E27\u0E25\u0E32] LT',
            lastWeek: '[\u0E27\u0E31\u0E19]dddd[\u0E17\u0E35\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E40\u0E27\u0E25\u0E32] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0E2D\u0E35\u0E01 %s',
            past: '%s\u0E17\u0E35\u0E48\u0E41\u0E25\u0E49\u0E27',
            s: '\u0E44\u0E21\u0E48\u0E01\u0E35\u0E48\u0E27\u0E34\u0E19\u0E32\u0E17\u0E35',
            m: '1 \u0E19\u0E32\u0E17\u0E35',
            mm: '%d \u0E19\u0E32\u0E17\u0E35',
            h: '1 \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07',
            hh: '%d \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07',
            d: '1 \u0E27\u0E31\u0E19',
            dd: '%d \u0E27\u0E31\u0E19',
            M: '1 \u0E40\u0E14\u0E37\u0E2D\u0E19',
            MM: '%d \u0E40\u0E14\u0E37\u0E2D\u0E19',
            y: '1 \u0E1B\u0E35',
            yy: '%d \u0E1B\u0E35'
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ta', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ta', {
        months: '\u0B9C\u0BA9\u0BB5\u0BB0\u0BBF_\u0BAA\u0BBF\u0BAA\u0BCD\u0BB0\u0BB5\u0BB0\u0BBF_\u0BAE\u0BBE\u0BB0\u0BCD\u0B9A\u0BCD_\u0B8F\u0BAA\u0BCD\u0BB0\u0BB2\u0BCD_\u0BAE\u0BC7_\u0B9C\u0BC2\u0BA9\u0BCD_\u0B9C\u0BC2\u0BB2\u0BC8_\u0B86\u0B95\u0BB8\u0BCD\u0B9F\u0BCD_\u0B9A\u0BC6\u0BAA\u0BCD\u0B9F\u0BC6\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD_\u0B85\u0B95\u0BCD\u0B9F\u0BC7\u0BBE\u0BAA\u0BB0\u0BCD_\u0BA8\u0BB5\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD_\u0B9F\u0BBF\u0B9A\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD'.split('_'),
        monthsShort: '\u0B9C\u0BA9\u0BB5\u0BB0\u0BBF_\u0BAA\u0BBF\u0BAA\u0BCD\u0BB0\u0BB5\u0BB0\u0BBF_\u0BAE\u0BBE\u0BB0\u0BCD\u0B9A\u0BCD_\u0B8F\u0BAA\u0BCD\u0BB0\u0BB2\u0BCD_\u0BAE\u0BC7_\u0B9C\u0BC2\u0BA9\u0BCD_\u0B9C\u0BC2\u0BB2\u0BC8_\u0B86\u0B95\u0BB8\u0BCD\u0B9F\u0BCD_\u0B9A\u0BC6\u0BAA\u0BCD\u0B9F\u0BC6\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD_\u0B85\u0B95\u0BCD\u0B9F\u0BC7\u0BBE\u0BAA\u0BB0\u0BCD_\u0BA8\u0BB5\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD_\u0B9F\u0BBF\u0B9A\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD'.split('_'),
        weekdays: '\u0B9E\u0BBE\u0BAF\u0BBF\u0BB1\u0BCD\u0BB1\u0BC1\u0B95\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0BA4\u0BBF\u0B99\u0BCD\u0B95\u0B9F\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0B9A\u0BC6\u0BB5\u0BCD\u0BB5\u0BBE\u0BAF\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0BAA\u0BC1\u0BA4\u0BA9\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0BB5\u0BBF\u0BAF\u0BBE\u0BB4\u0B95\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0BB5\u0BC6\u0BB3\u0BCD\u0BB3\u0BBF\u0B95\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8_\u0B9A\u0BA9\u0BBF\u0B95\u0BCD\u0B95\u0BBF\u0BB4\u0BAE\u0BC8'.split('_'),
        weekdaysShort: '\u0B9E\u0BBE\u0BAF\u0BBF\u0BB1\u0BC1_\u0BA4\u0BBF\u0B99\u0BCD\u0B95\u0BB3\u0BCD_\u0B9A\u0BC6\u0BB5\u0BCD\u0BB5\u0BBE\u0BAF\u0BCD_\u0BAA\u0BC1\u0BA4\u0BA9\u0BCD_\u0BB5\u0BBF\u0BAF\u0BBE\u0BB4\u0BA9\u0BCD_\u0BB5\u0BC6\u0BB3\u0BCD\u0BB3\u0BBF_\u0B9A\u0BA9\u0BBF'.split('_'),
        weekdaysMin: '\u0B9E\u0BBE_\u0BA4\u0BBF_\u0B9A\u0BC6_\u0BAA\u0BC1_\u0BB5\u0BBF_\u0BB5\u0BC6_\u0B9A'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0B87\u0BA9\u0BCD\u0BB1\u0BC1] LT',
            nextDay: '[\u0BA8\u0BBE\u0BB3\u0BC8] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0BA8\u0BC7\u0BB1\u0BCD\u0BB1\u0BC1] LT',
            lastWeek: '[\u0B95\u0B9F\u0BA8\u0BCD\u0BA4 \u0BB5\u0BBE\u0BB0\u0BAE\u0BCD] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u0B87\u0BB2\u0BCD',
            past: '%s \u0BAE\u0BC1\u0BA9\u0BCD',
            s: '\u0B92\u0BB0\u0BC1 \u0B9A\u0BBF\u0BB2 \u0BB5\u0BBF\u0BA8\u0BBE\u0B9F\u0BBF\u0B95\u0BB3\u0BCD',
            m: '\u0B92\u0BB0\u0BC1 \u0BA8\u0BBF\u0BAE\u0BBF\u0B9F\u0BAE\u0BCD',
            mm: '%d \u0BA8\u0BBF\u0BAE\u0BBF\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD',
            h: '\u0B92\u0BB0\u0BC1 \u0BAE\u0BA3\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD',
            hh: '%d \u0BAE\u0BA3\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD',
            d: '\u0B92\u0BB0\u0BC1 \u0BA8\u0BBE\u0BB3\u0BCD',
            dd: '%d \u0BA8\u0BBE\u0B9F\u0BCD\u0B95\u0BB3\u0BCD',
            M: '\u0B92\u0BB0\u0BC1 \u0BAE\u0BBE\u0BA4\u0BAE\u0BCD',
            MM: '%d \u0BAE\u0BBE\u0BA4\u0B99\u0BCD\u0B95\u0BB3\u0BCD',
            y: '\u0B92\u0BB0\u0BC1 \u0BB5\u0BB0\u0BC1\u0B9F\u0BAE\u0BCD',
            yy: '%d \u0B86\u0BA3\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD'
        },
        ordinal: function (number) {
            return number + '\u0BB5\u0BA4\u0BC1';
        },
        meridiem: function (hour, minute, isLower) {
            if (hour >= 6 && hour <= 10) {
                return ' \u0B95\u0BBE\u0BB2\u0BC8';
            } else if (hour >= 10 && hour <= 14) {
                return ' \u0BA8\u0BA3\u0BCD\u0BAA\u0B95\u0BB2\u0BCD';
            } else if (hour >= 14 && hour <= 18) {
                return ' \u0B8E\u0BB1\u0BCD\u0BAA\u0BBE\u0B9F\u0BC1';
            } else if (hour >= 18 && hour <= 20) {
                return ' \u0BAE\u0BBE\u0BB2\u0BC8';
            } else if (hour >= 20 && hour <= 24) {
                return ' \u0B87\u0BB0\u0BB5\u0BC1';
            } else if (hour >= 0 && hour <= 6) {
                return ' \u0BB5\u0BC8\u0B95\u0BB1\u0BC8';
            }
        },
        week: {
            dow: 0,
            doy: 6
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('sv', {
        months: 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 's\xF6ndag_m\xE5ndag_tisdag_onsdag_torsdag_fredag_l\xF6rdag'.split('_'),
        weekdaysShort: 's\xF6n_m\xE5n_tis_ons_tor_fre_l\xF6r'.split('_'),
        weekdaysMin: 's\xF6_m\xE5_ti_on_to_fr_l\xF6'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Idag] LT',
            nextDay: '[Imorgon] LT',
            lastDay: '[Ig\xE5r] LT',
            nextWeek: 'dddd LT',
            lastWeek: '[F\xF6rra] dddd[en] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'f\xF6r %s sedan',
            s: 'n\xE5gra sekunder',
            m: 'en minut',
            mm: '%d minuter',
            h: 'en timme',
            hh: '%d timmar',
            d: 'en dag',
            dd: '%d dagar',
            M: 'en m\xE5nad',
            MM: '%d m\xE5nader',
            y: 'ett \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: function (number) {
            var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'e' : b === 1 ? 'a' : b === 2 ? 'a' : b === 3 ? 'e' : 'e';
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var translator = {
        words: {
            m: [
                'jedan minut',
                'jedne minute'
            ],
            mm: [
                'minut',
                'minute',
                'minuta'
            ],
            h: [
                'jedan sat',
                'jednog sata'
            ],
            hh: [
                'sat',
                'sata',
                'sati'
            ],
            dd: [
                'dan',
                'dana',
                'dana'
            ],
            MM: [
                'mesec',
                'meseca',
                'meseci'
            ],
            yy: [
                'godina',
                'godine',
                'godina'
            ]
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };
    return moment.lang('sr', {
        months: [
            'januar',
            'februar',
            'mart',
            'april',
            'maj',
            'jun',
            'jul',
            'avgust',
            'septembar',
            'oktobar',
            'novembar',
            'decembar'
        ],
        monthsShort: [
            'jan.',
            'feb.',
            'mar.',
            'apr.',
            'maj',
            'jun',
            'jul',
            'avg.',
            'sep.',
            'okt.',
            'nov.',
            'dec.'
        ],
        weekdays: [
            'nedelja',
            'ponedeljak',
            'utorak',
            'sreda',
            '\u010Detvrtak',
            'petak',
            'subota'
        ],
        weekdaysShort: [
            'ned.',
            'pon.',
            'uto.',
            'sre.',
            '\u010Det.',
            'pet.',
            'sub.'
        ],
        weekdaysMin: [
            'ne',
            'po',
            'ut',
            'sr',
            '\u010De',
            'pe',
            'su'
        ],
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedelju] [u] LT';
                case 3:
                    return '[u] [sredu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay: '[ju\u010De u] LT',
            lastWeek: function () {
                var lastWeekDays = [
                    '[pro\u0161le] [nedelje] [u] LT',
                    '[pro\u0161log] [ponedeljka] [u] LT',
                    '[pro\u0161log] [utorka] [u] LT',
                    '[pro\u0161le] [srede] [u] LT',
                    '[pro\u0161log] [\u010Detvrtka] [u] LT',
                    '[pro\u0161log] [petka] [u] LT',
                    '[pro\u0161le] [subote] [u] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'pre %s',
            s: 'nekoliko sekundi',
            m: translator.translate,
            mm: translator.translate,
            h: translator.translate,
            hh: translator.translate,
            d: 'dan',
            dd: translator.translate,
            M: 'mesec',
            MM: translator.translate,
            y: 'godinu',
            yy: translator.translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sr-cyrl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var translator = {
        words: {
            m: [
                '\u0458\u0435\u0434\u0430\u043D \u043C\u0438\u043D\u0443\u0442',
                '\u0458\u0435\u0434\u043D\u0435 \u043C\u0438\u043D\u0443\u0442\u0435'
            ],
            mm: [
                '\u043C\u0438\u043D\u0443\u0442',
                '\u043C\u0438\u043D\u0443\u0442\u0435',
                '\u043C\u0438\u043D\u0443\u0442\u0430'
            ],
            h: [
                '\u0458\u0435\u0434\u0430\u043D \u0441\u0430\u0442',
                '\u0458\u0435\u0434\u043D\u043E\u0433 \u0441\u0430\u0442\u0430'
            ],
            hh: [
                '\u0441\u0430\u0442',
                '\u0441\u0430\u0442\u0430',
                '\u0441\u0430\u0442\u0438'
            ],
            dd: [
                '\u0434\u0430\u043D',
                '\u0434\u0430\u043D\u0430',
                '\u0434\u0430\u043D\u0430'
            ],
            MM: [
                '\u043C\u0435\u0441\u0435\u0446',
                '\u043C\u0435\u0441\u0435\u0446\u0430',
                '\u043C\u0435\u0441\u0435\u0446\u0438'
            ],
            yy: [
                '\u0433\u043E\u0434\u0438\u043D\u0430',
                '\u0433\u043E\u0434\u0438\u043D\u0435',
                '\u0433\u043E\u0434\u0438\u043D\u0430'
            ]
        },
        correctGrammaticalCase: function (number, wordKey) {
            return number === 1 ? wordKey[0] : number >= 2 && number <= 4 ? wordKey[1] : wordKey[2];
        },
        translate: function (number, withoutSuffix, key) {
            var wordKey = translator.words[key];
            if (key.length === 1) {
                return withoutSuffix ? wordKey[0] : wordKey[1];
            } else {
                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
            }
        }
    };
    return moment.lang('sr-cyrl', {
        months: [
            '\u0458\u0430\u043D\u0443\u0430\u0440',
            '\u0444\u0435\u0431\u0440\u0443\u0430\u0440',
            '\u043C\u0430\u0440\u0442',
            '\u0430\u043F\u0440\u0438\u043B',
            '\u043C\u0430\u0458',
            '\u0458\u0443\u043D',
            '\u0458\u0443\u043B',
            '\u0430\u0432\u0433\u0443\u0441\u0442',
            '\u0441\u0435\u043F\u0442\u0435\u043C\u0431\u0430\u0440',
            '\u043E\u043A\u0442\u043E\u0431\u0430\u0440',
            '\u043D\u043E\u0432\u0435\u043C\u0431\u0430\u0440',
            '\u0434\u0435\u0446\u0435\u043C\u0431\u0430\u0440'
        ],
        monthsShort: [
            '\u0458\u0430\u043D.',
            '\u0444\u0435\u0431.',
            '\u043C\u0430\u0440.',
            '\u0430\u043F\u0440.',
            '\u043C\u0430\u0458',
            '\u0458\u0443\u043D',
            '\u0458\u0443\u043B',
            '\u0430\u0432\u0433.',
            '\u0441\u0435\u043F.',
            '\u043E\u043A\u0442.',
            '\u043D\u043E\u0432.',
            '\u0434\u0435\u0446.'
        ],
        weekdays: [
            '\u043D\u0435\u0434\u0435\u0459\u0430',
            '\u043F\u043E\u043D\u0435\u0434\u0435\u0459\u0430\u043A',
            '\u0443\u0442\u043E\u0440\u0430\u043A',
            '\u0441\u0440\u0435\u0434\u0430',
            '\u0447\u0435\u0442\u0432\u0440\u0442\u0430\u043A',
            '\u043F\u0435\u0442\u0430\u043A',
            '\u0441\u0443\u0431\u043E\u0442\u0430'
        ],
        weekdaysShort: [
            '\u043D\u0435\u0434.',
            '\u043F\u043E\u043D.',
            '\u0443\u0442\u043E.',
            '\u0441\u0440\u0435.',
            '\u0447\u0435\u0442.',
            '\u043F\u0435\u0442.',
            '\u0441\u0443\u0431.'
        ],
        weekdaysMin: [
            '\u043D\u0435',
            '\u043F\u043E',
            '\u0443\u0442',
            '\u0441\u0440',
            '\u0447\u0435',
            '\u043F\u0435',
            '\u0441\u0443'
        ],
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u0434\u0430\u043D\u0430\u0441 \u0443] LT',
            nextDay: '[\u0441\u0443\u0442\u0440\u0430 \u0443] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[\u0443] [\u043D\u0435\u0434\u0435\u0459\u0443] [\u0443] LT';
                case 3:
                    return '[\u0443] [\u0441\u0440\u0435\u0434\u0443] [\u0443] LT';
                case 6:
                    return '[\u0443] [\u0441\u0443\u0431\u043E\u0442\u0443] [\u0443] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[\u0443] dddd [\u0443] LT';
                }
            },
            lastDay: '[\u0458\u0443\u0447\u0435 \u0443] LT',
            lastWeek: function () {
                var lastWeekDays = [
                    '[\u043F\u0440\u043E\u0448\u043B\u0435] [\u043D\u0435\u0434\u0435\u0459\u0435] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u043E\u0433] [\u043F\u043E\u043D\u0435\u0434\u0435\u0459\u043A\u0430] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u043E\u0433] [\u0443\u0442\u043E\u0440\u043A\u0430] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u0435] [\u0441\u0440\u0435\u0434\u0435] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u043E\u0433] [\u0447\u0435\u0442\u0432\u0440\u0442\u043A\u0430] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u043E\u0433] [\u043F\u0435\u0442\u043A\u0430] [\u0443] LT',
                    '[\u043F\u0440\u043E\u0448\u043B\u0435] [\u0441\u0443\u0431\u043E\u0442\u0435] [\u0443] LT'
                ];
                return lastWeekDays[this.day()];
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0437\u0430 %s',
            past: '\u043F\u0440\u0435 %s',
            s: '\u043D\u0435\u043A\u043E\u043B\u0438\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434\u0438',
            m: translator.translate,
            mm: translator.translate,
            h: translator.translate,
            hh: translator.translate,
            d: '\u0434\u0430\u043D',
            dd: translator.translate,
            M: '\u043C\u0435\u0441\u0435\u0446',
            MM: translator.translate,
            y: '\u0433\u043E\u0434\u0438\u043D\u0443',
            yy: translator.translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sq', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('sq', {
        months: 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_N\xEBntor_Dhjetor'.split('_'),
        monthsShort: 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_N\xEBn_Dhj'.split('_'),
        weekdays: 'E Diel_E H\xEBn\xEB_E Mart\xEB_E M\xEBrkur\xEB_E Enjte_E Premte_E Shtun\xEB'.split('_'),
        weekdaysShort: 'Die_H\xEBn_Mar_M\xEBr_Enj_Pre_Sht'.split('_'),
        weekdaysMin: 'D_H_Ma_M\xEB_E_P_Sh'.split('_'),
        meridiem: function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Sot n\xEB] LT',
            nextDay: '[Nes\xEBr n\xEB] LT',
            nextWeek: 'dddd [n\xEB] LT',
            lastDay: '[Dje n\xEB] LT',
            lastWeek: 'dddd [e kaluar n\xEB] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'n\xEB %s',
            past: '%s m\xEB par\xEB',
            s: 'disa sekonda',
            m: 'nj\xEB minut\xEB',
            mm: '%d minuta',
            h: 'nj\xEB or\xEB',
            hh: '%d or\xEB',
            d: 'nj\xEB dit\xEB',
            dd: '%d dit\xEB',
            M: 'nj\xEB muaj',
            MM: '%d muaj',
            y: 'nj\xEB vit',
            yy: '%d vite'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'ena minuta' : 'eno minuto';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2) {
                result += 'minuti';
            } else if (number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minut';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'ena ura' : 'eno uro';
        case 'hh':
            if (number === 1) {
                result += 'ura';
            } else if (number === 2) {
                result += 'uri';
            } else if (number === 3 || number === 4) {
                result += 'ure';
            } else {
                result += 'ur';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dni';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mesec';
            } else if (number === 2) {
                result += 'meseca';
            } else if (number === 3 || number === 4) {
                result += 'mesece';
            } else {
                result += 'mesecev';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'leto';
            } else if (number === 2) {
                result += 'leti';
            } else if (number === 3 || number === 4) {
                result += 'leta';
            } else {
                result += 'let';
            }
            return result;
        }
    }
    return moment.lang('sl', {
        months: 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
        monthsShort: 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays: 'nedelja_ponedeljek_torek_sreda_\u010Detrtek_petek_sobota'.split('_'),
        weekdaysShort: 'ned._pon._tor._sre._\u010Det._pet._sob.'.split('_'),
        weekdaysMin: 'ne_po_to_sr_\u010De_pe_so'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danes ob] LT',
            nextDay: '[jutri ob] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v] [nedeljo] [ob] LT';
                case 3:
                    return '[v] [sredo] [ob] LT';
                case 6:
                    return '[v] [soboto] [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[v] dddd [ob] LT';
                }
            },
            lastDay: '[v\u010Deraj ob] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[prej\u0161nja] dddd [ob] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[prej\u0161nji] dddd [ob] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u010Dez %s',
            past: '%s nazaj',
            s: 'nekaj sekund',
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: 'en dan',
            dd: translate,
            M: 'en mesec',
            MM: translate,
            y: 'eno leto',
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/sk', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var months = 'janu\xE1r_febru\xE1r_marec_apr\xEDl_m\xE1j_j\xFAn_j\xFAl_august_september_okt\xF3ber_november_december'.split('_'), monthsShort = 'jan_feb_mar_apr_m\xE1j_j\xFAn_j\xFAl_aug_sep_okt_nov_dec'.split('_');
    function plural(n) {
        return n > 1 && n < 5;
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'p\xE1r sek\xFAnd' : 'p\xE1r sekundami';
        case 'm':
            return withoutSuffix ? 'min\xFAta' : isFuture ? 'min\xFAtu' : 'min\xFAtou';
        case 'mm':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'min\xFAty' : 'min\xFAt');
            } else {
                return result + 'min\xFAtami';
            }
            break;
        case 'h':
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hod\xEDn');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            return withoutSuffix || isFuture ? 'de\u0148' : 'd\u0148om';
        case 'dd':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dni' : 'dn\xED');
            } else {
                return result + 'd\u0148ami';
            }
            break;
        case 'M':
            return withoutSuffix || isFuture ? 'mesiac' : 'mesiacom';
        case 'MM':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'mesiace' : 'mesiacov');
            } else {
                return result + 'mesiacmi';
            }
            break;
        case 'y':
            return withoutSuffix || isFuture ? 'rok' : 'rokom';
        case 'yy':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'rokov');
            } else {
                return result + 'rokmi';
            }
            break;
        }
    }
    return moment.lang('sk', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort),
        weekdays: 'nede\u013Ea_pondelok_utorok_streda_\u0161tvrtok_piatok_sobota'.split('_'),
        weekdaysShort: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        weekdaysMin: 'ne_po_ut_st_\u0161t_pi_so'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[dnes o] LT',
            nextDay: '[zajtra o] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v nede\u013Eu o] LT';
                case 1:
                case 2:
                    return '[v] dddd [o] LT';
                case 3:
                    return '[v stredu o] LT';
                case 4:
                    return '[vo \u0161tvrtok o] LT';
                case 5:
                    return '[v piatok o] LT';
                case 6:
                    return '[v sobotu o] LT';
                }
            },
            lastDay: '[v\u010Dera o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minul\xFA nede\u013Eu o] LT';
                case 1:
                case 2:
                    return '[minul\xFD] dddd [o] LT';
                case 3:
                    return '[minul\xFA stredu o] LT';
                case 4:
                case 5:
                    return '[minul\xFD] dddd [o] LT';
                case 6:
                    return '[minul\xFA sobotu o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'pred %s',
            s: translate,
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ru', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function plural(word, num) {
        var forms = word.split('_');
        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2];
    }
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
            'mm': withoutSuffix ? '\u043C\u0438\u043D\u0443\u0442\u0430_\u043C\u0438\u043D\u0443\u0442\u044B_\u043C\u0438\u043D\u0443\u0442' : '\u043C\u0438\u043D\u0443\u0442\u0443_\u043C\u0438\u043D\u0443\u0442\u044B_\u043C\u0438\u043D\u0443\u0442',
            'hh': '\u0447\u0430\u0441_\u0447\u0430\u0441\u0430_\u0447\u0430\u0441\u043E\u0432',
            'dd': '\u0434\u0435\u043D\u044C_\u0434\u043D\u044F_\u0434\u043D\u0435\u0439',
            'MM': '\u043C\u0435\u0441\u044F\u0446_\u043C\u0435\u0441\u044F\u0446\u0430_\u043C\u0435\u0441\u044F\u0446\u0435\u0432',
            'yy': '\u0433\u043E\u0434_\u0433\u043E\u0434\u0430_\u043B\u0435\u0442'
        };
        if (key === 'm') {
            return withoutSuffix ? '\u043C\u0438\u043D\u0443\u0442\u0430' : '\u043C\u0438\u043D\u0443\u0442\u0443';
        } else {
            return number + ' ' + plural(format[key], +number);
        }
    }
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u044F\u043D\u0432\u0430\u0440\u044C_\u0444\u0435\u0432\u0440\u0430\u043B\u044C_\u043C\u0430\u0440\u0442_\u0430\u043F\u0440\u0435\u043B\u044C_\u043C\u0430\u0439_\u0438\u044E\u043D\u044C_\u0438\u044E\u043B\u044C_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044C_\u043E\u043A\u0442\u044F\u0431\u0440\u044C_\u043D\u043E\u044F\u0431\u0440\u044C_\u0434\u0435\u043A\u0430\u0431\u0440\u044C'.split('_'),
                'accusative': '\u044F\u043D\u0432\u0430\u0440\u044F_\u0444\u0435\u0432\u0440\u0430\u043B\u044F_\u043C\u0430\u0440\u0442\u0430_\u0430\u043F\u0440\u0435\u043B\u044F_\u043C\u0430\u044F_\u0438\u044E\u043D\u044F_\u0438\u044E\u043B\u044F_\u0430\u0432\u0433\u0443\u0441\u0442\u0430_\u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F_\u043E\u043A\u0442\u044F\u0431\u0440\u044F_\u043D\u043E\u044F\u0431\u0440\u044F_\u0434\u0435\u043A\u0430\u0431\u0440\u044F'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function monthsShortCaseReplace(m, format) {
        var monthsShort = {
                'nominative': '\u044F\u043D\u0432_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u0439_\u0438\u044E\u043D\u044C_\u0438\u044E\u043B\u044C_\u0430\u0432\u0433_\u0441\u0435\u043D_\u043E\u043A\u0442_\u043D\u043E\u044F_\u0434\u0435\u043A'.split('_'),
                'accusative': '\u044F\u043D\u0432_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u044F_\u0438\u044E\u043D\u044F_\u0438\u044E\u043B\u044F_\u0430\u0432\u0433_\u0441\u0435\u043D_\u043E\u043A\u0442_\u043D\u043E\u044F_\u0434\u0435\u043A'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return monthsShort[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043F\u044F\u0442\u043D\u0438\u0446\u0430_\u0441\u0443\u0431\u0431\u043E\u0442\u0430'.split('_'),
                'accusative': '\u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u0435\u0434\u0443_\u0447\u0435\u0442\u0432\u0435\u0440\u0433_\u043F\u044F\u0442\u043D\u0438\u0446\u0443_\u0441\u0443\u0431\u0431\u043E\u0442\u0443'.split('_')
            }, nounCase = /\[ ?[Вв] ?(?:прошлую|следующую)? ?\] ?dddd/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    return moment.lang('ru', {
        months: monthsCaseReplace,
        monthsShort: monthsShortCaseReplace,
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u0432\u0441_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        weekdaysMin: '\u0432\u0441_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        monthsParse: [
            /^янв/i,
            /^фев/i,
            /^мар/i,
            /^апр/i,
            /^ма[й|я]/i,
            /^июн/i,
            /^июл/i,
            /^авг/i,
            /^сен/i,
            /^окт/i,
            /^ноя/i,
            /^дек/i
        ],
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0433.',
            LLL: 'D MMMM YYYY \u0433., LT',
            LLLL: 'dddd, D MMMM YYYY \u0433., LT'
        },
        calendar: {
            sameDay: '[\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0432] LT',
            nextDay: '[\u0417\u0430\u0432\u0442\u0440\u0430 \u0432] LT',
            lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
            nextWeek: function () {
                return this.day() === 2 ? '[\u0412\u043E] dddd [\u0432] LT' : '[\u0412] dddd [\u0432] LT';
            },
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u043E\u0435] dddd [\u0432] LT';
                case 1:
                case 2:
                case 4:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u044B\u0439] dddd [\u0432] LT';
                case 3:
                case 5:
                case 6:
                    return '[\u0412 \u043F\u0440\u043E\u0448\u043B\u0443\u044E] dddd [\u0432] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0447\u0435\u0440\u0435\u0437 %s',
            past: '%s \u043D\u0430\u0437\u0430\u0434',
            s: '\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434',
            m: relativeTimeWithPlural,
            mm: relativeTimeWithPlural,
            h: '\u0447\u0430\u0441',
            hh: relativeTimeWithPlural,
            d: '\u0434\u0435\u043D\u044C',
            dd: relativeTimeWithPlural,
            M: '\u043C\u0435\u0441\u044F\u0446',
            MM: relativeTimeWithPlural,
            y: '\u0433\u043E\u0434',
            yy: relativeTimeWithPlural
        },
        meridiemParse: /ночи|утра|дня|вечера/i,
        isPM: function (input) {
            return /^(дня|вечера)$/.test(input);
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u043D\u043E\u0447\u0438';
            } else if (hour < 12) {
                return '\u0443\u0442\u0440\u0430';
            } else if (hour < 17) {
                return '\u0434\u043D\u044F';
            } else {
                return '\u0432\u0435\u0447\u0435\u0440\u0430';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'M':
            case 'd':
            case 'DDD':
                return number + '-\u0439';
            case 'D':
                return number + '-\u0433\u043E';
            case 'w':
            case 'W':
                return number + '-\u044F';
            default:
                return number;
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ro', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        var format = {
                'mm': 'minute',
                'hh': 'ore',
                'dd': 'zile',
                'MM': 'luni',
                'yy': 'ani'
            }, separator = ' ';
        if (number % 100 >= 20 || number >= 100 && number % 100 === 0) {
            separator = ' de ';
        }
        return number + separator + format[key];
    }
    return moment.lang('ro', {
        months: 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
        monthsShort: 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
        weekdays: 'duminic\u0103_luni_mar\u021Bi_miercuri_joi_vineri_s\xE2mb\u0103t\u0103'.split('_'),
        weekdaysShort: 'Dum_Lun_Mar_Mie_Joi_Vin_S\xE2m'.split('_'),
        weekdaysMin: 'Du_Lu_Ma_Mi_Jo_Vi_S\xE2'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY H:mm',
            LLLL: 'dddd, D MMMM YYYY H:mm'
        },
        calendar: {
            sameDay: '[azi la] LT',
            nextDay: '[m\xE2ine la] LT',
            nextWeek: 'dddd [la] LT',
            lastDay: '[ieri la] LT',
            lastWeek: '[fosta] dddd [la] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'peste %s',
            past: '%s \xEEn urm\u0103',
            s: 'c\xE2teva secunde',
            m: 'un minut',
            mm: relativeTimeWithPlural,
            h: 'o or\u0103',
            hh: relativeTimeWithPlural,
            d: 'o zi',
            dd: relativeTimeWithPlural,
            M: 'o lun\u0103',
            MM: relativeTimeWithPlural,
            y: 'un an',
            yy: relativeTimeWithPlural
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/pt', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('pt', {
        months: 'janeiro_fevereiro_mar\xE7o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays: 'domingo_segunda-feira_ter\xE7a-feira_quarta-feira_quinta-feira_sexta-feira_s\xE1bado'.split('_'),
        weekdaysShort: 'dom_seg_ter_qua_qui_sex_s\xE1b'.split('_'),
        weekdaysMin: 'dom_2\xAA_3\xAA_4\xAA_5\xAA_6\xAA_s\xE1b'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY LT',
            LLLL: 'dddd, D [de] MMMM [de] YYYY LT'
        },
        calendar: {
            sameDay: '[Hoje \xE0s] LT',
            nextDay: '[Amanh\xE3 \xE0s] LT',
            nextWeek: 'dddd [\xE0s] LT',
            lastDay: '[Ontem \xE0s] LT',
            lastWeek: function () {
                return this.day() === 0 || this.day() === 6 ? '[\xDAltimo] dddd [\xE0s] LT' : '[\xDAltima] dddd [\xE0s] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'em %s',
            past: 'h\xE1 %s',
            s: 'segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um m\xEAs',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/pt-br', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('pt-br', {
        months: 'janeiro_fevereiro_mar\xE7o_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
        monthsShort: 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
        weekdays: 'domingo_segunda-feira_ter\xE7a-feira_quarta-feira_quinta-feira_sexta-feira_s\xE1bado'.split('_'),
        weekdaysShort: 'dom_seg_ter_qua_qui_sex_s\xE1b'.split('_'),
        weekdaysMin: 'dom_2\xAA_3\xAA_4\xAA_5\xAA_6\xAA_s\xE1b'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY [\xE0s] LT',
            LLLL: 'dddd, D [de] MMMM [de] YYYY [\xE0s] LT'
        },
        calendar: {
            sameDay: '[Hoje \xE0s] LT',
            nextDay: '[Amanh\xE3 \xE0s] LT',
            nextWeek: 'dddd [\xE0s] LT',
            lastDay: '[Ontem \xE0s] LT',
            lastWeek: function () {
                return this.day() === 0 || this.day() === 6 ? '[\xDAltimo] dddd [\xE0s] LT' : '[\xDAltima] dddd [\xE0s] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'em %s',
            past: '%s atr\xE1s',
            s: 'segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um m\xEAs',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos'
        },
        ordinal: '%d\xBA'
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/pl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsNominative = 'stycze\u0144_luty_marzec_kwiecie\u0144_maj_czerwiec_lipiec_sierpie\u0144_wrzesie\u0144_pa\u017Adziernik_listopad_grudzie\u0144'.split('_'), monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_wrze\u015Bnia_pa\u017Adziernika_listopada_grudnia'.split('_');
    function plural(n) {
        return n % 10 < 5 && n % 10 > 1 && ~~(n / 10) % 10 !== 1;
    }
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'minuta' : 'minut\u0119';
        case 'mm':
            return result + (plural(number) ? 'minuty' : 'minut');
        case 'h':
            return withoutSuffix ? 'godzina' : 'godzin\u0119';
        case 'hh':
            return result + (plural(number) ? 'godziny' : 'godzin');
        case 'MM':
            return result + (plural(number) ? 'miesi\u0105ce' : 'miesi\u0119cy');
        case 'yy':
            return result + (plural(number) ? 'lata' : 'lat');
        }
    }
    return moment.lang('pl', {
        months: function (momentToFormat, format) {
            if (/D MMMM/.test(format)) {
                return monthsSubjective[momentToFormat.month()];
            } else {
                return monthsNominative[momentToFormat.month()];
            }
        },
        monthsShort: 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_pa\u017A_lis_gru'.split('_'),
        weekdays: 'niedziela_poniedzia\u0142ek_wtorek_\u015Broda_czwartek_pi\u0105tek_sobota'.split('_'),
        weekdaysShort: 'nie_pon_wt_\u015Br_czw_pt_sb'.split('_'),
        weekdaysMin: 'N_Pn_Wt_\u015Ar_Cz_Pt_So'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Dzi\u015B o] LT',
            nextDay: '[Jutro o] LT',
            nextWeek: '[W] dddd [o] LT',
            lastDay: '[Wczoraj o] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[W zesz\u0142\u0105 niedziel\u0119 o] LT';
                case 3:
                    return '[W zesz\u0142\u0105 \u015Brod\u0119 o] LT';
                case 6:
                    return '[W zesz\u0142\u0105 sobot\u0119 o] LT';
                default:
                    return '[W zesz\u0142y] dddd [o] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: '%s temu',
            s: 'kilka sekund',
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: '1 dzie\u0144',
            dd: '%d dni',
            M: 'miesi\u0105c',
            MM: translate,
            y: 'rok',
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('nn', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 'sundag_m\xE5ndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
        weekdaysShort: 'sun_m\xE5n_tys_ons_tor_fre_lau'.split('_'),
        weekdaysMin: 'su_m\xE5_ty_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[I dag klokka] LT',
            nextDay: '[I morgon klokka] LT',
            nextWeek: 'dddd [klokka] LT',
            lastDay: '[I g\xE5r klokka] LT',
            lastWeek: '[F\xF8reg\xE5ande] dddd [klokka] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'for %s sidan',
            s: 'nokre sekund',
            m: 'eit minutt',
            mm: '%d minutt',
            h: 'ein time',
            hh: '%d timar',
            d: 'ein dag',
            dd: '%d dagar',
            M: 'ein m\xE5nad',
            MM: '%d m\xE5nader',
            y: 'eit \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'), monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
    return moment.lang('nl', {
        months: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
        monthsShort: function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShortWithoutDots[m.month()];
            } else {
                return monthsShortWithDots[m.month()];
            }
        },
        weekdays: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
        weekdaysShort: 'zo._ma._di._wo._do._vr._za.'.split('_'),
        weekdaysMin: 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD-MM-YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[vandaag om] LT',
            nextDay: '[morgen om] LT',
            nextWeek: 'dddd [om] LT',
            lastDay: '[gisteren om] LT',
            lastWeek: '[afgelopen] dddd [om] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'over %s',
            past: '%s geleden',
            s: 'een paar seconden',
            m: '\xE9\xE9n minuut',
            mm: '%d minuten',
            h: '\xE9\xE9n uur',
            hh: '%d uur',
            d: '\xE9\xE9n dag',
            dd: '%d dagen',
            M: '\xE9\xE9n maand',
            MM: '%d maanden',
            y: '\xE9\xE9n jaar',
            yy: '%d jaar'
        },
        ordinal: function (number) {
            return number + (number === 1 || number === 8 || number >= 20 ? 'ste' : 'de');
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ne', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096A',
            '5': '\u096B',
            '6': '\u096C',
            '7': '\u096D',
            '8': '\u096E',
            '9': '\u096F',
            '0': '\u0966'
        }, numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096A': '4',
            '\u096B': '5',
            '\u096C': '6',
            '\u096D': '7',
            '\u096E': '8',
            '\u096F': '9',
            '\u0966': '0'
        };
    return moment.lang('ne', {
        months: '\u091C\u0928\u0935\u0930\u0940_\u092B\u0947\u092C\u094D\u0930\u0941\u0935\u0930\u0940_\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u093F\u0932_\u092E\u0908_\u091C\u0941\u0928_\u091C\u0941\u0932\u093E\u0908_\u0905\u0917\u0937\u094D\u091F_\u0938\u0947\u092A\u094D\u091F\u0947\u092E\u094D\u092C\u0930_\u0905\u0915\u094D\u091F\u094B\u092C\u0930_\u0928\u094B\u092D\u0947\u092E\u094D\u092C\u0930_\u0921\u093F\u0938\u0947\u092E\u094D\u092C\u0930'.split('_'),
        monthsShort: '\u091C\u0928._\u092B\u0947\u092C\u094D\u0930\u0941._\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u093F._\u092E\u0908_\u091C\u0941\u0928_\u091C\u0941\u0932\u093E\u0908._\u0905\u0917._\u0938\u0947\u092A\u094D\u091F._\u0905\u0915\u094D\u091F\u094B._\u0928\u094B\u092D\u0947._\u0921\u093F\u0938\u0947.'.split('_'),
        weekdays: '\u0906\u0907\u0924\u092C\u093E\u0930_\u0938\u094B\u092E\u092C\u093E\u0930_\u092E\u0919\u094D\u0917\u0932\u092C\u093E\u0930_\u092C\u0941\u0927\u092C\u093E\u0930_\u092C\u093F\u0939\u093F\u092C\u093E\u0930_\u0936\u0941\u0915\u094D\u0930\u092C\u093E\u0930_\u0936\u0928\u093F\u092C\u093E\u0930'.split('_'),
        weekdaysShort: '\u0906\u0907\u0924._\u0938\u094B\u092E._\u092E\u0919\u094D\u0917\u0932._\u092C\u0941\u0927._\u092C\u093F\u0939\u093F._\u0936\u0941\u0915\u094D\u0930._\u0936\u0928\u093F.'.split('_'),
        weekdaysMin: '\u0906\u0907._\u0938\u094B._\u092E\u0919\u094D_\u092C\u0941._\u092C\u093F._\u0936\u0941._\u0936.'.split('_'),
        longDateFormat: {
            LT: 'A\u0915\u094B h:mm \u092C\u091C\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 3) {
                return '\u0930\u093E\u0924\u0940';
            } else if (hour < 10) {
                return '\u092C\u093F\u0939\u093E\u0928';
            } else if (hour < 15) {
                return '\u0926\u093F\u0909\u0901\u0938\u094B';
            } else if (hour < 18) {
                return '\u092C\u0947\u0932\u0941\u0915\u093E';
            } else if (hour < 20) {
                return '\u0938\u093E\u0901\u091D';
            } else {
                return '\u0930\u093E\u0924\u0940';
            }
        },
        calendar: {
            sameDay: '[\u0906\u091C] LT',
            nextDay: '[\u092D\u094B\u0932\u0940] LT',
            nextWeek: '[\u0906\u0909\u0901\u0926\u094B] dddd[,] LT',
            lastDay: '[\u0939\u093F\u091C\u094B] LT',
            lastWeek: '[\u0917\u090F\u0915\u094B] dddd[,] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s\u092E\u093E',
            past: '%s \u0905\u0917\u093E\u0921\u0940',
            s: '\u0915\u0947\u0939\u0940 \u0938\u092E\u092F',
            m: '\u090F\u0915 \u092E\u093F\u0928\u0947\u091F',
            mm: '%d \u092E\u093F\u0928\u0947\u091F',
            h: '\u090F\u0915 \u0918\u0923\u094D\u091F\u093E',
            hh: '%d \u0918\u0923\u094D\u091F\u093E',
            d: '\u090F\u0915 \u0926\u093F\u0928',
            dd: '%d \u0926\u093F\u0928',
            M: '\u090F\u0915 \u092E\u0939\u093F\u0928\u093E',
            MM: '%d \u092E\u0939\u093F\u0928\u093E',
            y: '\u090F\u0915 \u092C\u0930\u094D\u0937',
            yy: '%d \u092C\u0930\u094D\u0937'
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/nb', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('nb', {
        months: 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.'.split('_'),
        weekdays: 's\xF8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xF8rdag'.split('_'),
        weekdaysShort: 's\xF8._ma._ti._on._to._fr._l\xF8.'.split('_'),
        weekdaysMin: 's\xF8_ma_ti_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'H.mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY [kl.] LT',
            LLLL: 'dddd D. MMMM YYYY [kl.] LT'
        },
        calendar: {
            sameDay: '[i dag kl.] LT',
            nextDay: '[i morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[i g\xE5r kl.] LT',
            lastWeek: '[forrige] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: 'for %s siden',
            s: 'noen sekunder',
            m: 'ett minutt',
            mm: '%d minutter',
            h: 'en time',
            hh: '%d timer',
            d: 'en dag',
            dd: '%d dager',
            M: 'en m\xE5ned',
            MM: '%d m\xE5neder',
            y: 'ett \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ms-my', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ms-my', {
        months: 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
        monthsShort: 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
        weekdays: 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
        weekdaysShort: 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
        weekdaysMin: 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat: {
            LT: 'HH.mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY [pukul] LT',
            LLLL: 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'tengahari';
            } else if (hours < 19) {
                return 'petang';
            } else {
                return 'malam';
            }
        },
        calendar: {
            sameDay: '[Hari ini pukul] LT',
            nextDay: '[Esok pukul] LT',
            nextWeek: 'dddd [pukul] LT',
            lastDay: '[Kelmarin pukul] LT',
            lastWeek: 'dddd [lepas pukul] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dalam %s',
            past: '%s yang lepas',
            s: 'beberapa saat',
            m: 'seminit',
            mm: '%d minit',
            h: 'sejam',
            hh: '%d jam',
            d: 'sehari',
            dd: '%d hari',
            M: 'sebulan',
            MM: '%d bulan',
            y: 'setahun',
            yy: '%d tahun'
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/mr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096A',
            '5': '\u096B',
            '6': '\u096C',
            '7': '\u096D',
            '8': '\u096E',
            '9': '\u096F',
            '0': '\u0966'
        }, numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096A': '4',
            '\u096B': '5',
            '\u096C': '6',
            '\u096D': '7',
            '\u096E': '8',
            '\u096F': '9',
            '\u0966': '0'
        };
    return moment.lang('mr', {
        months: '\u091C\u093E\u0928\u0947\u0935\u093E\u0930\u0940_\u092B\u0947\u092C\u094D\u0930\u0941\u0935\u093E\u0930\u0940_\u092E\u093E\u0930\u094D\u091A_\u090F\u092A\u094D\u0930\u093F\u0932_\u092E\u0947_\u091C\u0942\u0928_\u091C\u0941\u0932\u0948_\u0911\u0917\u0938\u094D\u091F_\u0938\u092A\u094D\u091F\u0947\u0902\u092C\u0930_\u0911\u0915\u094D\u091F\u094B\u092C\u0930_\u0928\u094B\u0935\u094D\u0939\u0947\u0902\u092C\u0930_\u0921\u093F\u0938\u0947\u0902\u092C\u0930'.split('_'),
        monthsShort: '\u091C\u093E\u0928\u0947._\u092B\u0947\u092C\u094D\u0930\u0941._\u092E\u093E\u0930\u094D\u091A._\u090F\u092A\u094D\u0930\u093F._\u092E\u0947._\u091C\u0942\u0928._\u091C\u0941\u0932\u0948._\u0911\u0917._\u0938\u092A\u094D\u091F\u0947\u0902._\u0911\u0915\u094D\u091F\u094B._\u0928\u094B\u0935\u094D\u0939\u0947\u0902._\u0921\u093F\u0938\u0947\u0902.'.split('_'),
        weekdays: '\u0930\u0935\u093F\u0935\u093E\u0930_\u0938\u094B\u092E\u0935\u093E\u0930_\u092E\u0902\u0917\u0933\u0935\u093E\u0930_\u092C\u0941\u0927\u0935\u093E\u0930_\u0917\u0941\u0930\u0942\u0935\u093E\u0930_\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930_\u0936\u0928\u093F\u0935\u093E\u0930'.split('_'),
        weekdaysShort: '\u0930\u0935\u093F_\u0938\u094B\u092E_\u092E\u0902\u0917\u0933_\u092C\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094D\u0930_\u0936\u0928\u093F'.split('_'),
        weekdaysMin: '\u0930_\u0938\u094B_\u092E\u0902_\u092C\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
        longDateFormat: {
            LT: 'A h:mm \u0935\u093E\u091C\u0924\u093E',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0906\u091C] LT',
            nextDay: '[\u0909\u0926\u094D\u092F\u093E] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0915\u093E\u0932] LT',
            lastWeek: '[\u092E\u093E\u0917\u0940\u0932] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u0928\u0902\u0924\u0930',
            past: '%s \u092A\u0942\u0930\u094D\u0935\u0940',
            s: '\u0938\u0947\u0915\u0902\u0926',
            m: '\u090F\u0915 \u092E\u093F\u0928\u093F\u091F',
            mm: '%d \u092E\u093F\u0928\u093F\u091F\u0947',
            h: '\u090F\u0915 \u0924\u093E\u0938',
            hh: '%d \u0924\u093E\u0938',
            d: '\u090F\u0915 \u0926\u093F\u0935\u0938',
            dd: '%d \u0926\u093F\u0935\u0938',
            M: '\u090F\u0915 \u092E\u0939\u093F\u0928\u093E',
            MM: '%d \u092E\u0939\u093F\u0928\u0947',
            y: '\u090F\u0915 \u0935\u0930\u094D\u0937',
            yy: '%d \u0935\u0930\u094D\u0937\u0947'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u0930\u093E\u0924\u094D\u0930\u0940';
            } else if (hour < 10) {
                return '\u0938\u0915\u093E\u0933\u0940';
            } else if (hour < 17) {
                return '\u0926\u0941\u092A\u093E\u0930\u0940';
            } else if (hour < 20) {
                return '\u0938\u093E\u092F\u0902\u0915\u093E\u0933\u0940';
            } else {
                return '\u0930\u093E\u0924\u094D\u0930\u0940';
            }
        },
        week: {
            dow: 0,
            doy: 6
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ml', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ml', {
        months: '\u0D1C\u0D28\u0D41\u0D35\u0D30\u0D3F_\u0D2B\u0D46\u0D2C\u0D4D\u0D30\u0D41\u0D35\u0D30\u0D3F_\u0D2E\u0D3E\u0D7C\u0D1A\u0D4D\u0D1A\u0D4D_\u0D0F\u0D2A\u0D4D\u0D30\u0D3F\u0D7D_\u0D2E\u0D47\u0D2F\u0D4D_\u0D1C\u0D42\u0D7A_\u0D1C\u0D42\u0D32\u0D48_\u0D13\u0D17\u0D38\u0D4D\u0D31\u0D4D\u0D31\u0D4D_\u0D38\u0D46\u0D2A\u0D4D\u0D31\u0D4D\u0D31\u0D02\u0D2C\u0D7C_\u0D12\u0D15\u0D4D\u0D1F\u0D4B\u0D2C\u0D7C_\u0D28\u0D35\u0D02\u0D2C\u0D7C_\u0D21\u0D3F\u0D38\u0D02\u0D2C\u0D7C'.split('_'),
        monthsShort: '\u0D1C\u0D28\u0D41._\u0D2B\u0D46\u0D2C\u0D4D\u0D30\u0D41._\u0D2E\u0D3E\u0D7C._\u0D0F\u0D2A\u0D4D\u0D30\u0D3F._\u0D2E\u0D47\u0D2F\u0D4D_\u0D1C\u0D42\u0D7A_\u0D1C\u0D42\u0D32\u0D48._\u0D13\u0D17._\u0D38\u0D46\u0D2A\u0D4D\u0D31\u0D4D\u0D31._\u0D12\u0D15\u0D4D\u0D1F\u0D4B._\u0D28\u0D35\u0D02._\u0D21\u0D3F\u0D38\u0D02.'.split('_'),
        weekdays: '\u0D1E\u0D3E\u0D2F\u0D31\u0D3E\u0D34\u0D4D\u0D1A_\u0D24\u0D3F\u0D19\u0D4D\u0D15\u0D33\u0D3E\u0D34\u0D4D\u0D1A_\u0D1A\u0D4A\u0D35\u0D4D\u0D35\u0D3E\u0D34\u0D4D\u0D1A_\u0D2C\u0D41\u0D27\u0D28\u0D3E\u0D34\u0D4D\u0D1A_\u0D35\u0D4D\u0D2F\u0D3E\u0D34\u0D3E\u0D34\u0D4D\u0D1A_\u0D35\u0D46\u0D33\u0D4D\u0D33\u0D3F\u0D2F\u0D3E\u0D34\u0D4D\u0D1A_\u0D36\u0D28\u0D3F\u0D2F\u0D3E\u0D34\u0D4D\u0D1A'.split('_'),
        weekdaysShort: '\u0D1E\u0D3E\u0D2F\u0D7C_\u0D24\u0D3F\u0D19\u0D4D\u0D15\u0D7E_\u0D1A\u0D4A\u0D35\u0D4D\u0D35_\u0D2C\u0D41\u0D27\u0D7B_\u0D35\u0D4D\u0D2F\u0D3E\u0D34\u0D02_\u0D35\u0D46\u0D33\u0D4D\u0D33\u0D3F_\u0D36\u0D28\u0D3F'.split('_'),
        weekdaysMin: '\u0D1E\u0D3E_\u0D24\u0D3F_\u0D1A\u0D4A_\u0D2C\u0D41_\u0D35\u0D4D\u0D2F\u0D3E_\u0D35\u0D46_\u0D36'.split('_'),
        longDateFormat: {
            LT: 'A h:mm -\u0D28\u0D41',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0D07\u0D28\u0D4D\u0D28\u0D4D] LT',
            nextDay: '[\u0D28\u0D3E\u0D33\u0D46] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0D07\u0D28\u0D4D\u0D28\u0D32\u0D46] LT',
            lastWeek: '[\u0D15\u0D34\u0D3F\u0D1E\u0D4D\u0D1E] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u0D15\u0D34\u0D3F\u0D1E\u0D4D\u0D1E\u0D4D',
            past: '%s \u0D2E\u0D41\u0D7B\u0D2A\u0D4D',
            s: '\u0D05\u0D7D\u0D2A \u0D28\u0D3F\u0D2E\u0D3F\u0D37\u0D19\u0D4D\u0D19\u0D7E',
            m: '\u0D12\u0D30\u0D41 \u0D2E\u0D3F\u0D28\u0D3F\u0D31\u0D4D\u0D31\u0D4D',
            mm: '%d \u0D2E\u0D3F\u0D28\u0D3F\u0D31\u0D4D\u0D31\u0D4D',
            h: '\u0D12\u0D30\u0D41 \u0D2E\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D42\u0D7C',
            hh: '%d \u0D2E\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D42\u0D7C',
            d: '\u0D12\u0D30\u0D41 \u0D26\u0D3F\u0D35\u0D38\u0D02',
            dd: '%d \u0D26\u0D3F\u0D35\u0D38\u0D02',
            M: '\u0D12\u0D30\u0D41 \u0D2E\u0D3E\u0D38\u0D02',
            MM: '%d \u0D2E\u0D3E\u0D38\u0D02',
            y: '\u0D12\u0D30\u0D41 \u0D35\u0D7C\u0D37\u0D02',
            yy: '%d \u0D35\u0D7C\u0D37\u0D02'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u0D30\u0D3E\u0D24\u0D4D\u0D30\u0D3F';
            } else if (hour < 12) {
                return '\u0D30\u0D3E\u0D35\u0D3F\u0D32\u0D46';
            } else if (hour < 17) {
                return '\u0D09\u0D1A\u0D4D\u0D1A \u0D15\u0D34\u0D3F\u0D1E\u0D4D\u0D1E\u0D4D';
            } else if (hour < 20) {
                return '\u0D35\u0D48\u0D15\u0D41\u0D28\u0D4D\u0D28\u0D47\u0D30\u0D02';
            } else {
                return '\u0D30\u0D3E\u0D24\u0D4D\u0D30\u0D3F';
            }
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/mk', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('mk', {
        months: '\u0458\u0430\u043D\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043C\u0430\u0440\u0442_\u0430\u043F\u0440\u0438\u043B_\u043C\u0430\u0458_\u0458\u0443\u043D\u0438_\u0458\u0443\u043B\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043F\u0442\u0435\u043C\u0432\u0440\u0438_\u043E\u043A\u0442\u043E\u043C\u0432\u0440\u0438_\u043D\u043E\u0435\u043C\u0432\u0440\u0438_\u0434\u0435\u043A\u0435\u043C\u0432\u0440\u0438'.split('_'),
        monthsShort: '\u0458\u0430\u043D_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u0458_\u0458\u0443\u043D_\u0458\u0443\u043B_\u0430\u0432\u0433_\u0441\u0435\u043F_\u043E\u043A\u0442_\u043D\u043E\u0435_\u0434\u0435\u043A'.split('_'),
        weekdays: '\u043D\u0435\u0434\u0435\u043B\u0430_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u0435\u0434\u0430_\u0447\u0435\u0442\u0432\u0440\u0442\u043E\u043A_\u043F\u0435\u0442\u043E\u043A_\u0441\u0430\u0431\u043E\u0442\u0430'.split('_'),
        weekdaysShort: '\u043D\u0435\u0434_\u043F\u043E\u043D_\u0432\u0442\u043E_\u0441\u0440\u0435_\u0447\u0435\u0442_\u043F\u0435\u0442_\u0441\u0430\u0431'.split('_'),
        weekdaysMin: '\u043De_\u043Fo_\u0432\u0442_\u0441\u0440_\u0447\u0435_\u043F\u0435_\u0441a'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'D.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u0414\u0435\u043D\u0435\u0441 \u0432\u043E] LT',
            nextDay: '[\u0423\u0442\u0440\u0435 \u0432\u043E] LT',
            nextWeek: 'dddd [\u0432\u043E] LT',
            lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432\u043E] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[\u0412\u043E \u0438\u0437\u043C\u0438\u043D\u0430\u0442\u0430\u0442\u0430] dddd [\u0432\u043E] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[\u0412\u043E \u0438\u0437\u043C\u0438\u043D\u0430\u0442\u0438\u043E\u0442] dddd [\u0432\u043E] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u043F\u043E\u0441\u043B\u0435 %s',
            past: '\u043F\u0440\u0435\u0434 %s',
            s: '\u043D\u0435\u043A\u043E\u043B\u043A\u0443 \u0441\u0435\u043A\u0443\u043D\u0434\u0438',
            m: '\u043C\u0438\u043D\u0443\u0442\u0430',
            mm: '%d \u043C\u0438\u043D\u0443\u0442\u0438',
            h: '\u0447\u0430\u0441',
            hh: '%d \u0447\u0430\u0441\u0430',
            d: '\u0434\u0435\u043D',
            dd: '%d \u0434\u0435\u043D\u0430',
            M: '\u043C\u0435\u0441\u0435\u0446',
            MM: '%d \u043C\u0435\u0441\u0435\u0446\u0438',
            y: '\u0433\u043E\u0434\u0438\u043D\u0430',
            yy: '%d \u0433\u043E\u0434\u0438\u043D\u0438'
        },
        ordinal: function (number) {
            var lastDigit = number % 10, last2Digits = number % 100;
            if (number === 0) {
                return number + '-\u0435\u0432';
            } else if (last2Digits === 0) {
                return number + '-\u0435\u043D';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-\u0442\u0438';
            } else if (lastDigit === 1) {
                return number + '-\u0432\u0438';
            } else if (lastDigit === 2) {
                return number + '-\u0440\u0438';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-\u043C\u0438';
            } else {
                return number + '-\u0442\u0438';
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/lv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var units = {
        'mm': 'min\u016Bti_min\u016Btes_min\u016Bte_min\u016Btes',
        'hh': 'stundu_stundas_stunda_stundas',
        'dd': 'dienu_dienas_diena_dienas',
        'MM': 'm\u0113nesi_m\u0113ne\u0161us_m\u0113nesis_m\u0113ne\u0161i',
        'yy': 'gadu_gadus_gads_gadi'
    };
    function format(word, number, withoutSuffix) {
        var forms = word.split('_');
        if (withoutSuffix) {
            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
        } else {
            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
        }
    }
    function relativeTimeWithPlural(number, withoutSuffix, key) {
        return number + ' ' + format(units[key], number, withoutSuffix);
    }
    return moment.lang('lv', {
        months: 'janv\u0101ris_febru\u0101ris_marts_apr\u012Blis_maijs_j\u016Bnijs_j\u016Blijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_j\u016Bn_j\u016Bl_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 'sv\u0113tdiena_pirmdiena_otrdiena_tre\u0161diena_ceturtdiena_piektdiena_sestdiena'.split('_'),
        weekdaysShort: 'Sv_P_O_T_C_Pk_S'.split('_'),
        weekdaysMin: 'Sv_P_O_T_C_Pk_S'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'YYYY. [gada] D. MMMM',
            LLL: 'YYYY. [gada] D. MMMM, LT',
            LLLL: 'YYYY. [gada] D. MMMM, dddd, LT'
        },
        calendar: {
            sameDay: '[\u0160odien pulksten] LT',
            nextDay: '[R\u012Bt pulksten] LT',
            nextWeek: 'dddd [pulksten] LT',
            lastDay: '[Vakar pulksten] LT',
            lastWeek: '[Pag\u0101ju\u0161\u0101] dddd [pulksten] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s v\u0113l\u0101k',
            past: '%s agr\u0101k',
            s: 'da\u017Eas sekundes',
            m: 'min\u016Bti',
            mm: relativeTimeWithPlural,
            h: 'stundu',
            hh: relativeTimeWithPlural,
            d: 'dienu',
            dd: relativeTimeWithPlural,
            M: 'm\u0113nesi',
            MM: relativeTimeWithPlural,
            y: 'gadu',
            yy: relativeTimeWithPlural
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/lt', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var units = {
            'm': 'minut\u0117_minut\u0117s_minut\u0119',
            'mm': 'minut\u0117s_minu\u010Di\u0173_minutes',
            'h': 'valanda_valandos_valand\u0105',
            'hh': 'valandos_valand\u0173_valandas',
            'd': 'diena_dienos_dien\u0105',
            'dd': 'dienos_dien\u0173_dienas',
            'M': 'm\u0117nuo_m\u0117nesio_m\u0117nes\u012F',
            'MM': 'm\u0117nesiai_m\u0117nesi\u0173_m\u0117nesius',
            'y': 'metai_met\u0173_metus',
            'yy': 'metai_met\u0173_metus'
        }, weekDays = 'sekmadienis_pirmadienis_antradienis_tre\u010Diadienis_ketvirtadienis_penktadienis_\u0161e\u0161tadienis'.split('_');
    function translateSeconds(number, withoutSuffix, key, isFuture) {
        if (withoutSuffix) {
            return 'kelios sekund\u0117s';
        } else {
            return isFuture ? 'keli\u0173 sekund\u017Ei\u0173' : 'kelias sekundes';
        }
    }
    function translateSingular(number, withoutSuffix, key, isFuture) {
        return withoutSuffix ? forms(key)[0] : isFuture ? forms(key)[1] : forms(key)[2];
    }
    function special(number) {
        return number % 10 === 0 || number > 10 && number < 20;
    }
    function forms(key) {
        return units[key].split('_');
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        if (number === 1) {
            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
        } else if (withoutSuffix) {
            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
        } else {
            if (isFuture) {
                return result + forms(key)[1];
            } else {
                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
            }
        }
    }
    function relativeWeekDay(moment, format) {
        var nominative = format.indexOf('dddd HH:mm') === -1, weekDay = weekDays[moment.day()];
        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + '\u012F';
    }
    return moment.lang('lt', {
        months: 'sausio_vasario_kovo_baland\u017Eio_gegu\u017E\u0117s_bir\u017E\u0117lio_liepos_rugpj\u016B\u010Dio_rugs\u0117jo_spalio_lapkri\u010Dio_gruod\u017Eio'.split('_'),
        monthsShort: 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
        weekdays: relativeWeekDay,
        weekdaysShort: 'Sek_Pir_Ant_Tre_Ket_Pen_\u0160e\u0161'.split('_'),
        weekdaysMin: 'S_P_A_T_K_Pn_\u0160'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'YYYY [m.] MMMM D [d.]',
            LLL: 'YYYY [m.] MMMM D [d.], LT [val.]',
            LLLL: 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
            l: 'YYYY-MM-DD',
            ll: 'YYYY [m.] MMMM D [d.]',
            lll: 'YYYY [m.] MMMM D [d.], LT [val.]',
            llll: 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
        },
        calendar: {
            sameDay: '[\u0160iandien] LT',
            nextDay: '[Rytoj] LT',
            nextWeek: 'dddd LT',
            lastDay: '[Vakar] LT',
            lastWeek: '[Pra\u0117jus\u012F] dddd LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'po %s',
            past: 'prie\u0161 %s',
            s: translateSeconds,
            m: translateSingular,
            mm: translate,
            h: translateSingular,
            hh: translate,
            d: translateSingular,
            dd: translate,
            M: translateSingular,
            MM: translate,
            y: translateSingular,
            yy: translate
        },
        ordinal: function (number) {
            return number + '-oji';
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/lb', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': [
                'eng Minutt',
                'enger Minutt'
            ],
            'h': [
                'eng Stonn',
                'enger Stonn'
            ],
            'd': [
                'een Dag',
                'engem Dag'
            ],
            'dd': [
                number + ' Deeg',
                number + ' Deeg'
            ],
            'M': [
                'ee Mount',
                'engem Mount'
            ],
            'MM': [
                number + ' M\xE9int',
                number + ' M\xE9int'
            ],
            'y': [
                'ee Joer',
                'engem Joer'
            ],
            'yy': [
                number + ' Joer',
                number + ' Joer'
            ]
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    function processFutureTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'a ' + string;
        }
        return 'an ' + string;
    }
    function processPastTime(string) {
        var number = string.substr(0, string.indexOf(' '));
        if (eifelerRegelAppliesToNumber(number)) {
            return 'viru ' + string;
        }
        return 'virun ' + string;
    }
    function processLastWeek(string1) {
        var weekday = this.format('d');
        if (eifelerRegelAppliesToWeekday(weekday)) {
            return '[Leschte] dddd [um] LT';
        }
        return '[Leschten] dddd [um] LT';
    }
    function eifelerRegelAppliesToWeekday(weekday) {
        weekday = parseInt(weekday, 10);
        switch (weekday) {
        case 0:
        case 1:
        case 3:
        case 5:
        case 6:
            return true;
        default:
            return false;
        }
    }
    function eifelerRegelAppliesToNumber(number) {
        number = parseInt(number, 10);
        if (isNaN(number)) {
            return false;
        }
        if (number < 0) {
            return true;
        } else if (number < 10) {
            if (4 <= number && number <= 7) {
                return true;
            }
            return false;
        } else if (number < 100) {
            var lastDigit = number % 10, firstDigit = number / 10;
            if (lastDigit === 0) {
                return eifelerRegelAppliesToNumber(firstDigit);
            }
            return eifelerRegelAppliesToNumber(lastDigit);
        } else if (number < 10000) {
            while (number >= 10) {
                number = number / 10;
            }
            return eifelerRegelAppliesToNumber(number);
        } else {
            number = number / 1000;
            return eifelerRegelAppliesToNumber(number);
        }
    }
    return moment.lang('lb', {
        months: 'Januar_Februar_M\xE4erz_Abr\xEBll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonndeg_M\xE9indeg_D\xEBnschdeg_M\xEBttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
        weekdaysShort: 'So._M\xE9._D\xEB._M\xEB._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_M\xE9_D\xEB_M\xEB_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'H:mm [Auer]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Haut um] LT',
            sameElse: 'L',
            nextDay: '[Muer um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[G\xEBschter um] LT',
            lastWeek: processLastWeek
        },
        relativeTime: {
            future: processFutureTime,
            past: processPastTime,
            s: 'e puer Sekonnen',
            m: processRelativeTime,
            mm: '%d Minutten',
            h: processRelativeTime,
            hh: '%d Stonnen',
            d: processRelativeTime,
            dd: processRelativeTime,
            M: processRelativeTime,
            MM: processRelativeTime,
            y: processRelativeTime,
            yy: processRelativeTime
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ko', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ko', {
        months: '1\uC6D4_2\uC6D4_3\uC6D4_4\uC6D4_5\uC6D4_6\uC6D4_7\uC6D4_8\uC6D4_9\uC6D4_10\uC6D4_11\uC6D4_12\uC6D4'.split('_'),
        monthsShort: '1\uC6D4_2\uC6D4_3\uC6D4_4\uC6D4_5\uC6D4_6\uC6D4_7\uC6D4_8\uC6D4_9\uC6D4_10\uC6D4_11\uC6D4_12\uC6D4'.split('_'),
        weekdays: '\uC77C\uC694\uC77C_\uC6D4\uC694\uC77C_\uD654\uC694\uC77C_\uC218\uC694\uC77C_\uBAA9\uC694\uC77C_\uAE08\uC694\uC77C_\uD1A0\uC694\uC77C'.split('_'),
        weekdaysShort: '\uC77C_\uC6D4_\uD654_\uC218_\uBAA9_\uAE08_\uD1A0'.split('_'),
        weekdaysMin: '\uC77C_\uC6D4_\uD654_\uC218_\uBAA9_\uAE08_\uD1A0'.split('_'),
        longDateFormat: {
            LT: 'A h\uC2DC mm\uBD84',
            L: 'YYYY.MM.DD',
            LL: 'YYYY\uB144 MMMM D\uC77C',
            LLL: 'YYYY\uB144 MMMM D\uC77C LT',
            LLLL: 'YYYY\uB144 MMMM D\uC77C dddd LT'
        },
        meridiem: function (hour, minute, isUpper) {
            return hour < 12 ? '\uC624\uC804' : '\uC624\uD6C4';
        },
        calendar: {
            sameDay: '\uC624\uB298 LT',
            nextDay: '\uB0B4\uC77C LT',
            nextWeek: 'dddd LT',
            lastDay: '\uC5B4\uC81C LT',
            lastWeek: '\uC9C0\uB09C\uC8FC dddd LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \uD6C4',
            past: '%s \uC804',
            s: '\uBA87\uCD08',
            ss: '%d\uCD08',
            m: '\uC77C\uBD84',
            mm: '%d\uBD84',
            h: '\uD55C\uC2DC\uAC04',
            hh: '%d\uC2DC\uAC04',
            d: '\uD558\uB8E8',
            dd: '%d\uC77C',
            M: '\uD55C\uB2EC',
            MM: '%d\uB2EC',
            y: '\uC77C\uB144',
            yy: '%d\uB144'
        },
        ordinal: '%d\uC77C',
        meridiemParse: /(오전|오후)/,
        isPM: function (token) {
            return token === '\uC624\uD6C4';
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/km', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('km', {
        months: '\u1798\u1780\u179A\u17B6_\u1780\u17BB\u1798\u17D2\u1797\u17C8_\u1798\u17B7\u1793\u17B6_\u1798\u17C1\u179F\u17B6_\u17A7\u179F\u1797\u17B6_\u1798\u17B7\u1790\u17BB\u1793\u17B6_\u1780\u1780\u17D2\u1780\u178A\u17B6_\u179F\u17B8\u17A0\u17B6_\u1780\u1789\u17D2\u1789\u17B6_\u178F\u17BB\u179B\u17B6_\u179C\u17B7\u1785\u17D2\u1786\u17B7\u1780\u17B6_\u1792\u17D2\u1793\u17BC'.split('_'),
        monthsShort: '\u1798\u1780\u179A\u17B6_\u1780\u17BB\u1798\u17D2\u1797\u17C8_\u1798\u17B7\u1793\u17B6_\u1798\u17C1\u179F\u17B6_\u17A7\u179F\u1797\u17B6_\u1798\u17B7\u1790\u17BB\u1793\u17B6_\u1780\u1780\u17D2\u1780\u178A\u17B6_\u179F\u17B8\u17A0\u17B6_\u1780\u1789\u17D2\u1789\u17B6_\u178F\u17BB\u179B\u17B6_\u179C\u17B7\u1785\u17D2\u1786\u17B7\u1780\u17B6_\u1792\u17D2\u1793\u17BC'.split('_'),
        weekdays: '\u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799_\u1785\u17D0\u1793\u17D2\u1791_\u17A2\u1784\u17D2\u1782\u17B6\u179A_\u1796\u17BB\u1792_\u1796\u17D2\u179A\u17A0\u179F\u17D2\u1794\u178F\u17B7\u17CD_\u179F\u17BB\u1780\u17D2\u179A_\u179F\u17C5\u179A\u17CD'.split('_'),
        weekdaysShort: '\u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799_\u1785\u17D0\u1793\u17D2\u1791_\u17A2\u1784\u17D2\u1782\u17B6\u179A_\u1796\u17BB\u1792_\u1796\u17D2\u179A\u17A0\u179F\u17D2\u1794\u178F\u17B7\u17CD_\u179F\u17BB\u1780\u17D2\u179A_\u179F\u17C5\u179A\u17CD'.split('_'),
        weekdaysMin: '\u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799_\u1785\u17D0\u1793\u17D2\u1791_\u17A2\u1784\u17D2\u1782\u17B6\u179A_\u1796\u17BB\u1792_\u1796\u17D2\u179A\u17A0\u179F\u17D2\u1794\u178F\u17B7\u17CD_\u179F\u17BB\u1780\u17D2\u179A_\u179F\u17C5\u179A\u17CD'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u1790\u17D2\u1784\u17C3\u1793\u17C8 \u1798\u17C9\u17C4\u1784] LT',
            nextDay: '[\u179F\u17D2\u17A2\u17C2\u1780 \u1798\u17C9\u17C4\u1784] LT',
            nextWeek: 'dddd [\u1798\u17C9\u17C4\u1784] LT',
            lastDay: '[\u1798\u17D2\u179F\u17B7\u179B\u1798\u17B7\u1789 \u1798\u17C9\u17C4\u1784] LT',
            lastWeek: 'dddd [\u179F\u1794\u17D2\u178F\u17B6\u17A0\u17CD\u1798\u17BB\u1793] [\u1798\u17C9\u17C4\u1784] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s\u1791\u17C0\u178F',
            past: '%s\u1798\u17BB\u1793',
            s: '\u1794\u17C9\u17BB\u1793\u17D2\u1798\u17B6\u1793\u179C\u17B7\u1793\u17B6\u1791\u17B8',
            m: '\u1798\u17BD\u1799\u1793\u17B6\u1791\u17B8',
            mm: '%d \u1793\u17B6\u1791\u17B8',
            h: '\u1798\u17BD\u1799\u1798\u17C9\u17C4\u1784',
            hh: '%d \u1798\u17C9\u17C4\u1784',
            d: '\u1798\u17BD\u1799\u1790\u17D2\u1784\u17C3',
            dd: '%d \u1790\u17D2\u1784\u17C3',
            M: '\u1798\u17BD\u1799\u1781\u17C2',
            MM: '%d \u1781\u17C2',
            y: '\u1798\u17BD\u1799\u1786\u17D2\u1793\u17B6\u17C6',
            yy: '%d \u1786\u17D2\u1793\u17B6\u17C6'
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ka', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10D8_\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10D8_\u10DB\u10D0\u10E0\u10E2\u10D8_\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8_\u10DB\u10D0\u10D8\u10E1\u10D8_\u10D8\u10D5\u10DC\u10D8\u10E1\u10D8_\u10D8\u10D5\u10DA\u10D8\u10E1\u10D8_\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10DD_\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8_\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10D8_\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8_\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10D8'.split('_'),
                'accusative': '\u10D8\u10D0\u10DC\u10D5\u10D0\u10E0\u10E1_\u10D7\u10D4\u10D1\u10D4\u10E0\u10D5\u10D0\u10DA\u10E1_\u10DB\u10D0\u10E0\u10E2\u10E1_\u10D0\u10DE\u10E0\u10D8\u10DA\u10D8\u10E1_\u10DB\u10D0\u10D8\u10E1\u10E1_\u10D8\u10D5\u10DC\u10D8\u10E1\u10E1_\u10D8\u10D5\u10DA\u10D8\u10E1\u10E1_\u10D0\u10D2\u10D5\u10D8\u10E1\u10E2\u10E1_\u10E1\u10D4\u10E5\u10E2\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1_\u10DD\u10E5\u10E2\u10DD\u10DB\u10D1\u10D4\u10E0\u10E1_\u10DC\u10DD\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1_\u10D3\u10D4\u10D9\u10D4\u10DB\u10D1\u10D4\u10E0\u10E1'.split('_')
            }, nounCase = /D[oD] *MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = {
                'nominative': '\u10D9\u10D5\u10D8\u10E0\u10D0_\u10DD\u10E0\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10E1\u10D0\u10DB\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10DD\u10D7\u10EE\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10EE\u10E3\u10D7\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8_\u10DE\u10D0\u10E0\u10D0\u10E1\u10D9\u10D4\u10D5\u10D8_\u10E8\u10D0\u10D1\u10D0\u10D7\u10D8'.split('_'),
                'accusative': '\u10D9\u10D5\u10D8\u10E0\u10D0\u10E1_\u10DD\u10E0\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10E1\u10D0\u10DB\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10DD\u10D7\u10EE\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10EE\u10E3\u10D7\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1_\u10DE\u10D0\u10E0\u10D0\u10E1\u10D9\u10D4\u10D5\u10E1_\u10E8\u10D0\u10D1\u10D0\u10D7\u10E1'.split('_')
            }, nounCase = /(წინა|შემდეგ)/.test(format) ? 'accusative' : 'nominative';
        return weekdays[nounCase][m.day()];
    }
    return moment.lang('ka', {
        months: monthsCaseReplace,
        monthsShort: '\u10D8\u10D0\u10DC_\u10D7\u10D4\u10D1_\u10DB\u10D0\u10E0_\u10D0\u10DE\u10E0_\u10DB\u10D0\u10D8_\u10D8\u10D5\u10DC_\u10D8\u10D5\u10DA_\u10D0\u10D2\u10D5_\u10E1\u10D4\u10E5_\u10DD\u10E5\u10E2_\u10DC\u10DD\u10D4_\u10D3\u10D4\u10D9'.split('_'),
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u10D9\u10D5\u10D8_\u10DD\u10E0\u10E8_\u10E1\u10D0\u10DB_\u10DD\u10D7\u10EE_\u10EE\u10E3\u10D7_\u10DE\u10D0\u10E0_\u10E8\u10D0\u10D1'.split('_'),
        weekdaysMin: '\u10D9\u10D5_\u10DD\u10E0_\u10E1\u10D0_\u10DD\u10D7_\u10EE\u10E3_\u10DE\u10D0_\u10E8\u10D0'.split('_'),
        longDateFormat: {
            LT: 'h:mm A',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u10D3\u10E6\u10D4\u10E1] LT[-\u10D6\u10D4]',
            nextDay: '[\u10EE\u10D5\u10D0\u10DA] LT[-\u10D6\u10D4]',
            lastDay: '[\u10D2\u10E3\u10E8\u10D8\u10DC] LT[-\u10D6\u10D4]',
            nextWeek: '[\u10E8\u10D4\u10DB\u10D3\u10D4\u10D2] dddd LT[-\u10D6\u10D4]',
            lastWeek: '[\u10EC\u10D8\u10DC\u10D0] dddd LT-\u10D6\u10D4',
            sameElse: 'L'
        },
        relativeTime: {
            future: function (s) {
                return /(წამი|წუთი|საათი|წელი)/.test(s) ? s.replace(/ი$/, '\u10E8\u10D8') : s + '\u10E8\u10D8';
            },
            past: function (s) {
                if (/(წამი|წუთი|საათი|დღე|თვე)/.test(s)) {
                    return s.replace(/(ი|ე)$/, '\u10D8\u10E1 \u10EC\u10D8\u10DC');
                }
                if (/წელი/.test(s)) {
                    return s.replace(/წელი$/, '\u10EC\u10DA\u10D8\u10E1 \u10EC\u10D8\u10DC');
                }
            },
            s: '\u10E0\u10D0\u10DB\u10D3\u10D4\u10DC\u10D8\u10DB\u10D4 \u10EC\u10D0\u10DB\u10D8',
            m: '\u10EC\u10E3\u10D7\u10D8',
            mm: '%d \u10EC\u10E3\u10D7\u10D8',
            h: '\u10E1\u10D0\u10D0\u10D7\u10D8',
            hh: '%d \u10E1\u10D0\u10D0\u10D7\u10D8',
            d: '\u10D3\u10E6\u10D4',
            dd: '%d \u10D3\u10E6\u10D4',
            M: '\u10D7\u10D5\u10D4',
            MM: '%d \u10D7\u10D5\u10D4',
            y: '\u10EC\u10D4\u10DA\u10D8',
            yy: '%d \u10EC\u10D4\u10DA\u10D8'
        },
        ordinal: function (number) {
            if (number === 0) {
                return number;
            }
            if (number === 1) {
                return number + '-\u10DA\u10D8';
            }
            if (number < 20 || number <= 100 && number % 20 === 0 || number % 100 === 0) {
                return '\u10DB\u10D4-' + number;
            }
            return number + '-\u10D4';
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ja', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ja', {
        months: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        monthsShort: '1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708'.split('_'),
        weekdays: '\u65E5\u66DC\u65E5_\u6708\u66DC\u65E5_\u706B\u66DC\u65E5_\u6C34\u66DC\u65E5_\u6728\u66DC\u65E5_\u91D1\u66DC\u65E5_\u571F\u66DC\u65E5'.split('_'),
        weekdaysShort: '\u65E5_\u6708_\u706B_\u6C34_\u6728_\u91D1_\u571F'.split('_'),
        weekdaysMin: '\u65E5_\u6708_\u706B_\u6C34_\u6728_\u91D1_\u571F'.split('_'),
        longDateFormat: {
            LT: 'Ah\u6642m\u5206',
            L: 'YYYY/MM/DD',
            LL: 'YYYY\u5E74M\u6708D\u65E5',
            LLL: 'YYYY\u5E74M\u6708D\u65E5LT',
            LLLL: 'YYYY\u5E74M\u6708D\u65E5LT dddd'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u5348\u524D';
            } else {
                return '\u5348\u5F8C';
            }
        },
        calendar: {
            sameDay: '[\u4ECA\u65E5] LT',
            nextDay: '[\u660E\u65E5] LT',
            nextWeek: '[\u6765\u9031]dddd LT',
            lastDay: '[\u6628\u65E5] LT',
            lastWeek: '[\u524D\u9031]dddd LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s\u5F8C',
            past: '%s\u524D',
            s: '\u6570\u79D2',
            m: '1\u5206',
            mm: '%d\u5206',
            h: '1\u6642\u9593',
            hh: '%d\u6642\u9593',
            d: '1\u65E5',
            dd: '%d\u65E5',
            M: '1\u30F6\u6708',
            MM: '%d\u30F6\u6708',
            y: '1\u5E74',
            yy: '%d\u5E74'
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/it', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('it', {
        months: 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
        monthsShort: 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
        weekdays: 'Domenica_Luned\xEC_Marted\xEC_Mercoled\xEC_Gioved\xEC_Venerd\xEC_Sabato'.split('_'),
        weekdaysShort: 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
        weekdaysMin: 'D_L_Ma_Me_G_V_S'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Oggi alle] LT',
            nextDay: '[Domani alle] LT',
            nextWeek: 'dddd [alle] LT',
            lastDay: '[Ieri alle] LT',
            lastWeek: '[lo scorso] dddd [alle] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: function (s) {
                return (/^[0-9].+$/.test(s) ? 'tra' : 'in') + ' ' + s;
            },
            past: '%s fa',
            s: 'alcuni secondi',
            m: 'un minuto',
            mm: '%d minuti',
            h: 'un\'ora',
            hh: '%d ore',
            d: 'un giorno',
            dd: '%d giorni',
            M: 'un mese',
            MM: '%d mesi',
            y: 'un anno',
            yy: '%d anni'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/is', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function plural(n) {
        if (n % 100 === 11) {
            return true;
        } else if (n % 10 === 1) {
            return false;
        }
        return true;
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'nokkrar sek\xFAndur' : 'nokkrum sek\xFAndum';
        case 'm':
            return withoutSuffix ? 'm\xEDn\xFAta' : 'm\xEDn\xFAtu';
        case 'mm':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'm\xEDn\xFAtur' : 'm\xEDn\xFAtum');
            } else if (withoutSuffix) {
                return result + 'm\xEDn\xFAta';
            }
            return result + 'm\xEDn\xFAtu';
        case 'hh':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
            }
            return result + 'klukkustund';
        case 'd':
            if (withoutSuffix) {
                return 'dagur';
            }
            return isFuture ? 'dag' : 'degi';
        case 'dd':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'dagar';
                }
                return result + (isFuture ? 'daga' : 'd\xF6gum');
            } else if (withoutSuffix) {
                return result + 'dagur';
            }
            return result + (isFuture ? 'dag' : 'degi');
        case 'M':
            if (withoutSuffix) {
                return 'm\xE1nu\xF0ur';
            }
            return isFuture ? 'm\xE1nu\xF0' : 'm\xE1nu\xF0i';
        case 'MM':
            if (plural(number)) {
                if (withoutSuffix) {
                    return result + 'm\xE1nu\xF0ir';
                }
                return result + (isFuture ? 'm\xE1nu\xF0i' : 'm\xE1nu\xF0um');
            } else if (withoutSuffix) {
                return result + 'm\xE1nu\xF0ur';
            }
            return result + (isFuture ? 'm\xE1nu\xF0' : 'm\xE1nu\xF0i');
        case 'y':
            return withoutSuffix || isFuture ? '\xE1r' : '\xE1ri';
        case 'yy':
            if (plural(number)) {
                return result + (withoutSuffix || isFuture ? '\xE1r' : '\xE1rum');
            }
            return result + (withoutSuffix || isFuture ? '\xE1r' : '\xE1ri');
        }
    }
    return moment.lang('is', {
        months: 'jan\xFAar_febr\xFAar_mars_apr\xEDl_ma\xED_j\xFAn\xED_j\xFAl\xED_\xE1g\xFAst_september_okt\xF3ber_n\xF3vember_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_ma\xED_j\xFAn_j\xFAl_\xE1g\xFA_sep_okt_n\xF3v_des'.split('_'),
        weekdays: 'sunnudagur_m\xE1nudagur_\xFEri\xF0judagur_mi\xF0vikudagur_fimmtudagur_f\xF6studagur_laugardagur'.split('_'),
        weekdaysShort: 'sun_m\xE1n_\xFEri_mi\xF0_fim_f\xF6s_lau'.split('_'),
        weekdaysMin: 'Su_M\xE1_\xDEr_Mi_Fi_F\xF6_La'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY [kl.] LT',
            LLLL: 'dddd, D. MMMM YYYY [kl.] LT'
        },
        calendar: {
            sameDay: '[\xED dag kl.] LT',
            nextDay: '[\xE1 morgun kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[\xED g\xE6r kl.] LT',
            lastWeek: '[s\xED\xF0asta] dddd [kl.] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'eftir %s',
            past: 'fyrir %s s\xED\xF0an',
            s: translate,
            m: translate,
            mm: translate,
            h: 'klukkustund',
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/id', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('id', {
        months: 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
        weekdays: 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
        weekdaysShort: 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
        weekdaysMin: 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
        longDateFormat: {
            LT: 'HH.mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY [pukul] LT',
            LLLL: 'dddd, D MMMM YYYY [pukul] LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours < 11) {
                return 'pagi';
            } else if (hours < 15) {
                return 'siang';
            } else if (hours < 19) {
                return 'sore';
            } else {
                return 'malam';
            }
        },
        calendar: {
            sameDay: '[Hari ini pukul] LT',
            nextDay: '[Besok pukul] LT',
            nextWeek: 'dddd [pukul] LT',
            lastDay: '[Kemarin pukul] LT',
            lastWeek: 'dddd [lalu pukul] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dalam %s',
            past: '%s yang lalu',
            s: 'beberapa detik',
            m: 'semenit',
            mm: '%d menit',
            h: 'sejam',
            hh: '%d jam',
            d: 'sehari',
            dd: '%d hari',
            M: 'sebulan',
            MM: '%d bulan',
            y: 'setahun',
            yy: '%d tahun'
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hy-am', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function monthsCaseReplace(m, format) {
        var months = {
                'nominative': '\u0570\u0578\u0582\u0576\u057E\u0561\u0580_\u0583\u0565\u057F\u0580\u057E\u0561\u0580_\u0574\u0561\u0580\u057F_\u0561\u057A\u0580\u056B\u056C_\u0574\u0561\u0575\u056B\u057D_\u0570\u0578\u0582\u0576\u056B\u057D_\u0570\u0578\u0582\u056C\u056B\u057D_\u0585\u0563\u0578\u057D\u057F\u0578\u057D_\u057D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580_\u0570\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580_\u0564\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580'.split('_'),
                'accusative': '\u0570\u0578\u0582\u0576\u057E\u0561\u0580\u056B_\u0583\u0565\u057F\u0580\u057E\u0561\u0580\u056B_\u0574\u0561\u0580\u057F\u056B_\u0561\u057A\u0580\u056B\u056C\u056B_\u0574\u0561\u0575\u056B\u057D\u056B_\u0570\u0578\u0582\u0576\u056B\u057D\u056B_\u0570\u0578\u0582\u056C\u056B\u057D\u056B_\u0585\u0563\u0578\u057D\u057F\u0578\u057D\u056B_\u057D\u0565\u057A\u057F\u0565\u0574\u0562\u0565\u0580\u056B_\u0570\u0578\u056F\u057F\u0565\u0574\u0562\u0565\u0580\u056B_\u0576\u0578\u0575\u0565\u0574\u0562\u0565\u0580\u056B_\u0564\u0565\u056F\u057F\u0565\u0574\u0562\u0565\u0580\u056B'.split('_')
            }, nounCase = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(format) ? 'accusative' : 'nominative';
        return months[nounCase][m.month()];
    }
    function monthsShortCaseReplace(m, format) {
        var monthsShort = '\u0570\u0576\u057E_\u0583\u057F\u0580_\u0574\u0580\u057F_\u0561\u057A\u0580_\u0574\u0575\u057D_\u0570\u0576\u057D_\u0570\u056C\u057D_\u0585\u0563\u057D_\u057D\u057A\u057F_\u0570\u056F\u057F_\u0576\u0574\u0562_\u0564\u056F\u057F'.split('_');
        return monthsShort[m.month()];
    }
    function weekdaysCaseReplace(m, format) {
        var weekdays = '\u056F\u056B\u0580\u0561\u056F\u056B_\u0565\u0580\u056F\u0578\u0582\u0577\u0561\u0562\u0569\u056B_\u0565\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056B_\u0579\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056B_\u0570\u056B\u0576\u0563\u0577\u0561\u0562\u0569\u056B_\u0578\u0582\u0580\u0562\u0561\u0569_\u0577\u0561\u0562\u0561\u0569'.split('_');
        return weekdays[m.day()];
    }
    return moment.lang('hy-am', {
        months: monthsCaseReplace,
        monthsShort: monthsShortCaseReplace,
        weekdays: weekdaysCaseReplace,
        weekdaysShort: '\u056F\u0580\u056F_\u0565\u0580\u056F_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
        weekdaysMin: '\u056F\u0580\u056F_\u0565\u0580\u056F_\u0565\u0580\u0584_\u0579\u0580\u0584_\u0570\u0576\u0563_\u0578\u0582\u0580\u0562_\u0577\u0562\u0569'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY \u0569.',
            LLL: 'D MMMM YYYY \u0569., LT',
            LLLL: 'dddd, D MMMM YYYY \u0569., LT'
        },
        calendar: {
            sameDay: '[\u0561\u0575\u057D\u0585\u0580] LT',
            nextDay: '[\u057E\u0561\u0572\u0568] LT',
            lastDay: '[\u0565\u0580\u0565\u056F] LT',
            nextWeek: function () {
                return 'dddd [\u0585\u0580\u0568 \u056A\u0561\u0574\u0568] LT';
            },
            lastWeek: function () {
                return '[\u0561\u0576\u0581\u0561\u056E] dddd [\u0585\u0580\u0568 \u056A\u0561\u0574\u0568] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u0570\u0565\u057F\u0578',
            past: '%s \u0561\u057C\u0561\u057B',
            s: '\u0574\u056B \u0584\u0561\u0576\u056B \u057E\u0561\u0575\u0580\u056F\u0575\u0561\u0576',
            m: '\u0580\u0578\u057A\u0565',
            mm: '%d \u0580\u0578\u057A\u0565',
            h: '\u056A\u0561\u0574',
            hh: '%d \u056A\u0561\u0574',
            d: '\u0585\u0580',
            dd: '%d \u0585\u0580',
            M: '\u0561\u0574\u056B\u057D',
            MM: '%d \u0561\u0574\u056B\u057D',
            y: '\u057F\u0561\u0580\u056B',
            yy: '%d \u057F\u0561\u0580\u056B'
        },
        meridiem: function (hour) {
            if (hour < 4) {
                return '\u0563\u056B\u0577\u0565\u0580\u057E\u0561';
            } else if (hour < 12) {
                return '\u0561\u057C\u0561\u057E\u0578\u057F\u057E\u0561';
            } else if (hour < 17) {
                return '\u0581\u0565\u0580\u0565\u056F\u057E\u0561';
            } else {
                return '\u0565\u0580\u0565\u056F\u0578\u0575\u0561\u0576';
            }
        },
        ordinal: function (number, period) {
            switch (period) {
            case 'DDD':
            case 'w':
            case 'W':
            case 'DDDo':
                if (number === 1) {
                    return number + '-\u056B\u0576';
                }
                return number + '-\u0580\u0564';
            default:
                return number;
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hu', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var weekEndings = 'vas\xE1rnap h\xE9tf\u0151n kedden szerd\xE1n cs\xFCt\xF6rt\xF6k\xF6n p\xE9nteken szombaton'.split(' ');
    function translate(number, withoutSuffix, key, isFuture) {
        var num = number, suffix;
        switch (key) {
        case 's':
            return isFuture || withoutSuffix ? 'n\xE9h\xE1ny m\xE1sodperc' : 'n\xE9h\xE1ny m\xE1sodperce';
        case 'm':
            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'mm':
            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
        case 'h':
            return 'egy' + (isFuture || withoutSuffix ? ' \xF3ra' : ' \xF3r\xE1ja');
        case 'hh':
            return num + (isFuture || withoutSuffix ? ' \xF3ra' : ' \xF3r\xE1ja');
        case 'd':
            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'dd':
            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
        case 'M':
            return 'egy' + (isFuture || withoutSuffix ? ' h\xF3nap' : ' h\xF3napja');
        case 'MM':
            return num + (isFuture || withoutSuffix ? ' h\xF3nap' : ' h\xF3napja');
        case 'y':
            return 'egy' + (isFuture || withoutSuffix ? ' \xE9v' : ' \xE9ve');
        case 'yy':
            return num + (isFuture || withoutSuffix ? ' \xE9v' : ' \xE9ve');
        }
        return '';
    }
    function week(isFuture) {
        return (isFuture ? '' : '[m\xFAlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
    }
    return moment.lang('hu', {
        months: 'janu\xE1r_febru\xE1r_m\xE1rcius_\xE1prilis_m\xE1jus_j\xFAnius_j\xFAlius_augusztus_szeptember_okt\xF3ber_november_december'.split('_'),
        monthsShort: 'jan_feb_m\xE1rc_\xE1pr_m\xE1j_j\xFAn_j\xFAl_aug_szept_okt_nov_dec'.split('_'),
        weekdays: 'vas\xE1rnap_h\xE9tf\u0151_kedd_szerda_cs\xFCt\xF6rt\xF6k_p\xE9ntek_szombat'.split('_'),
        weekdaysShort: 'vas_h\xE9t_kedd_sze_cs\xFCt_p\xE9n_szo'.split('_'),
        weekdaysMin: 'v_h_k_sze_cs_p_szo'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'YYYY.MM.DD.',
            LL: 'YYYY. MMMM D.',
            LLL: 'YYYY. MMMM D., LT',
            LLLL: 'YYYY. MMMM D., dddd LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours < 12) {
                return isLower === true ? 'de' : 'DE';
            } else {
                return isLower === true ? 'du' : 'DU';
            }
        },
        calendar: {
            sameDay: '[ma] LT[-kor]',
            nextDay: '[holnap] LT[-kor]',
            nextWeek: function () {
                return week.call(this, true);
            },
            lastDay: '[tegnap] LT[-kor]',
            lastWeek: function () {
                return week.call(this, false);
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s m\xFAlva',
            past: '%s',
            s: translate,
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }
    return moment.lang('hr', {
        months: 'sje\u010Danj_velja\u010Da_o\u017Eujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
        monthsShort: 'sje._vel._o\u017Eu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
        weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_\u010Detvrtak_petak_subota'.split('_'),
        weekdaysShort: 'ned._pon._uto._sri._\u010Det._pet._sub.'.split('_'),
        weekdaysMin: 'ne_po_ut_sr_\u010De_pe_su'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay: '[ju\u010Der u] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[pro\u0161lu] dddd [u] LT';
                case 6:
                    return '[pro\u0161le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[pro\u0161li] dddd [u] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'prije %s',
            s: 'par sekundi',
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: 'dan',
            dd: translate,
            M: 'mjesec',
            MM: translate,
            y: 'godinu',
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/hi', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0967',
            '2': '\u0968',
            '3': '\u0969',
            '4': '\u096A',
            '5': '\u096B',
            '6': '\u096C',
            '7': '\u096D',
            '8': '\u096E',
            '9': '\u096F',
            '0': '\u0966'
        }, numberMap = {
            '\u0967': '1',
            '\u0968': '2',
            '\u0969': '3',
            '\u096A': '4',
            '\u096B': '5',
            '\u096C': '6',
            '\u096D': '7',
            '\u096E': '8',
            '\u096F': '9',
            '\u0966': '0'
        };
    return moment.lang('hi', {
        months: '\u091C\u0928\u0935\u0930\u0940_\u092B\u093C\u0930\u0935\u0930\u0940_\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u0948\u0932_\u092E\u0908_\u091C\u0942\u0928_\u091C\u0941\u0932\u093E\u0908_\u0905\u0917\u0938\u094D\u0924_\u0938\u093F\u0924\u092E\u094D\u092C\u0930_\u0905\u0915\u094D\u091F\u0942\u092C\u0930_\u0928\u0935\u092E\u094D\u092C\u0930_\u0926\u093F\u0938\u092E\u094D\u092C\u0930'.split('_'),
        monthsShort: '\u091C\u0928._\u092B\u093C\u0930._\u092E\u093E\u0930\u094D\u091A_\u0905\u092A\u094D\u0930\u0948._\u092E\u0908_\u091C\u0942\u0928_\u091C\u0941\u0932._\u0905\u0917._\u0938\u093F\u0924._\u0905\u0915\u094D\u091F\u0942._\u0928\u0935._\u0926\u093F\u0938.'.split('_'),
        weekdays: '\u0930\u0935\u093F\u0935\u093E\u0930_\u0938\u094B\u092E\u0935\u093E\u0930_\u092E\u0902\u0917\u0932\u0935\u093E\u0930_\u092C\u0941\u0927\u0935\u093E\u0930_\u0917\u0941\u0930\u0942\u0935\u093E\u0930_\u0936\u0941\u0915\u094D\u0930\u0935\u093E\u0930_\u0936\u0928\u093F\u0935\u093E\u0930'.split('_'),
        weekdaysShort: '\u0930\u0935\u093F_\u0938\u094B\u092E_\u092E\u0902\u0917\u0932_\u092C\u0941\u0927_\u0917\u0941\u0930\u0942_\u0936\u0941\u0915\u094D\u0930_\u0936\u0928\u093F'.split('_'),
        weekdaysMin: '\u0930_\u0938\u094B_\u092E\u0902_\u092C\u0941_\u0917\u0941_\u0936\u0941_\u0936'.split('_'),
        longDateFormat: {
            LT: 'A h:mm \u092C\u091C\u0947',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0906\u091C] LT',
            nextDay: '[\u0915\u0932] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0915\u0932] LT',
            lastWeek: '[\u092A\u093F\u091B\u0932\u0947] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u092E\u0947\u0902',
            past: '%s \u092A\u0939\u0932\u0947',
            s: '\u0915\u0941\u091B \u0939\u0940 \u0915\u094D\u0937\u0923',
            m: '\u090F\u0915 \u092E\u093F\u0928\u091F',
            mm: '%d \u092E\u093F\u0928\u091F',
            h: '\u090F\u0915 \u0918\u0902\u091F\u093E',
            hh: '%d \u0918\u0902\u091F\u0947',
            d: '\u090F\u0915 \u0926\u093F\u0928',
            dd: '%d \u0926\u093F\u0928',
            M: '\u090F\u0915 \u092E\u0939\u0940\u0928\u0947',
            MM: '%d \u092E\u0939\u0940\u0928\u0947',
            y: '\u090F\u0915 \u0935\u0930\u094D\u0937',
            yy: '%d \u0935\u0930\u094D\u0937'
        },
        preparse: function (string) {
            return string.replace(/[१२३४५६७८९०]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u0930\u093E\u0924';
            } else if (hour < 10) {
                return '\u0938\u0941\u092C\u0939';
            } else if (hour < 17) {
                return '\u0926\u094B\u092A\u0939\u0930';
            } else if (hour < 20) {
                return '\u0936\u093E\u092E';
            } else {
                return '\u0930\u093E\u0924';
            }
        },
        week: {
            dow: 0,
            doy: 6
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/he', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('he', {
        months: '\u05D9\u05E0\u05D5\u05D0\u05E8_\u05E4\u05D1\u05E8\u05D5\u05D0\u05E8_\u05DE\u05E8\u05E5_\u05D0\u05E4\u05E8\u05D9\u05DC_\u05DE\u05D0\u05D9_\u05D9\u05D5\u05E0\u05D9_\u05D9\u05D5\u05DC\u05D9_\u05D0\u05D5\u05D2\u05D5\u05E1\u05D8_\u05E1\u05E4\u05D8\u05DE\u05D1\u05E8_\u05D0\u05D5\u05E7\u05D8\u05D5\u05D1\u05E8_\u05E0\u05D5\u05D1\u05DE\u05D1\u05E8_\u05D3\u05E6\u05DE\u05D1\u05E8'.split('_'),
        monthsShort: '\u05D9\u05E0\u05D5\u05F3_\u05E4\u05D1\u05E8\u05F3_\u05DE\u05E8\u05E5_\u05D0\u05E4\u05E8\u05F3_\u05DE\u05D0\u05D9_\u05D9\u05D5\u05E0\u05D9_\u05D9\u05D5\u05DC\u05D9_\u05D0\u05D5\u05D2\u05F3_\u05E1\u05E4\u05D8\u05F3_\u05D0\u05D5\u05E7\u05F3_\u05E0\u05D5\u05D1\u05F3_\u05D3\u05E6\u05DE\u05F3'.split('_'),
        weekdays: '\u05E8\u05D0\u05E9\u05D5\u05DF_\u05E9\u05E0\u05D9_\u05E9\u05DC\u05D9\u05E9\u05D9_\u05E8\u05D1\u05D9\u05E2\u05D9_\u05D7\u05DE\u05D9\u05E9\u05D9_\u05E9\u05D9\u05E9\u05D9_\u05E9\u05D1\u05EA'.split('_'),
        weekdaysShort: '\u05D0\u05F3_\u05D1\u05F3_\u05D2\u05F3_\u05D3\u05F3_\u05D4\u05F3_\u05D5\u05F3_\u05E9\u05F3'.split('_'),
        weekdaysMin: '\u05D0_\u05D1_\u05D2_\u05D3_\u05D4_\u05D5_\u05E9'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [\u05D1]MMMM YYYY',
            LLL: 'D [\u05D1]MMMM YYYY LT',
            LLLL: 'dddd, D [\u05D1]MMMM YYYY LT',
            l: 'D/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY LT',
            llll: 'ddd, D MMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u05D4\u05D9\u05D5\u05DD \u05D1\u05BE]LT',
            nextDay: '[\u05DE\u05D7\u05E8 \u05D1\u05BE]LT',
            nextWeek: 'dddd [\u05D1\u05E9\u05E2\u05D4] LT',
            lastDay: '[\u05D0\u05EA\u05DE\u05D5\u05DC \u05D1\u05BE]LT',
            lastWeek: '[\u05D1\u05D9\u05D5\u05DD] dddd [\u05D4\u05D0\u05D7\u05E8\u05D5\u05DF \u05D1\u05E9\u05E2\u05D4] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u05D1\u05E2\u05D5\u05D3 %s',
            past: '\u05DC\u05E4\u05E0\u05D9 %s',
            s: '\u05DE\u05E1\u05E4\u05E8 \u05E9\u05E0\u05D9\u05D5\u05EA',
            m: '\u05D3\u05E7\u05D4',
            mm: '%d \u05D3\u05E7\u05D5\u05EA',
            h: '\u05E9\u05E2\u05D4',
            hh: function (number) {
                if (number === 2) {
                    return '\u05E9\u05E2\u05EA\u05D9\u05D9\u05DD';
                }
                return number + ' \u05E9\u05E2\u05D5\u05EA';
            },
            d: '\u05D9\u05D5\u05DD',
            dd: function (number) {
                if (number === 2) {
                    return '\u05D9\u05D5\u05DE\u05D9\u05D9\u05DD';
                }
                return number + ' \u05D9\u05DE\u05D9\u05DD';
            },
            M: '\u05D7\u05D5\u05D3\u05E9',
            MM: function (number) {
                if (number === 2) {
                    return '\u05D7\u05D5\u05D3\u05E9\u05D9\u05D9\u05DD';
                }
                return number + ' \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD';
            },
            y: '\u05E9\u05E0\u05D4',
            yy: function (number) {
                if (number === 2) {
                    return '\u05E9\u05E0\u05EA\u05D9\u05D9\u05DD';
                }
                return number + ' \u05E9\u05E0\u05D9\u05DD';
            }
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/gl', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('gl', {
        months: 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xu\xF1o_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
        monthsShort: 'Xan._Feb._Mar._Abr._Mai._Xu\xF1._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
        weekdays: 'Domingo_Luns_Martes_M\xE9rcores_Xoves_Venres_S\xE1bado'.split('_'),
        weekdaysShort: 'Dom._Lun._Mar._M\xE9r._Xov._Ven._S\xE1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_M\xE9_Xo_Ve_S\xE1'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: function () {
                return '[hoxe ' + (this.hours() !== 1 ? '\xE1s' : '\xE1') + '] LT';
            },
            nextDay: function () {
                return '[ma\xF1\xE1 ' + (this.hours() !== 1 ? '\xE1s' : '\xE1') + '] LT';
            },
            nextWeek: function () {
                return 'dddd [' + (this.hours() !== 1 ? '\xE1s' : 'a') + '] LT';
            },
            lastDay: function () {
                return '[onte ' + (this.hours() !== 1 ? '\xE1' : 'a') + '] LT';
            },
            lastWeek: function () {
                return '[o] dddd [pasado ' + (this.hours() !== 1 ? '\xE1s' : 'a') + '] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: function (str) {
                if (str === 'uns segundos') {
                    return 'nuns segundos';
                }
                return 'en ' + str;
            },
            past: 'hai %s',
            s: 'uns segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'unha hora',
            hh: '%d horas',
            d: 'un d\xEDa',
            dd: '%d d\xEDas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un ano',
            yy: '%d anos'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fr', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('fr', {
        months: 'janvier_f\xE9vrier_mars_avril_mai_juin_juillet_ao\xFBt_septembre_octobre_novembre_d\xE9cembre'.split('_'),
        monthsShort: 'janv._f\xE9vr._mars_avr._mai_juin_juil._ao\xFBt_sept._oct._nov._d\xE9c.'.split('_'),
        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Aujourd\'hui \xE0] LT',
            nextDay: '[Demain \xE0] LT',
            nextWeek: 'dddd [\xE0] LT',
            lastDay: '[Hier \xE0] LT',
            lastWeek: 'dddd [dernier \xE0] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dans %s',
            past: 'il y a %s',
            s: 'quelques secondes',
            m: 'une minute',
            mm: '%d minutes',
            h: 'une heure',
            hh: '%d heures',
            d: 'un jour',
            dd: '%d jours',
            M: 'un mois',
            MM: '%d mois',
            y: 'un an',
            yy: '%d ans'
        },
        ordinal: function (number) {
            return number + (number === 1 ? 'er' : '');
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fr-ca', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('fr-ca', {
        months: 'janvier_f\xE9vrier_mars_avril_mai_juin_juillet_ao\xFBt_septembre_octobre_novembre_d\xE9cembre'.split('_'),
        monthsShort: 'janv._f\xE9vr._mars_avr._mai_juin_juil._ao\xFBt_sept._oct._nov._d\xE9c.'.split('_'),
        weekdays: 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
        weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Aujourd\'hui \xE0] LT',
            nextDay: '[Demain \xE0] LT',
            nextWeek: 'dddd [\xE0] LT',
            lastDay: '[Hier \xE0] LT',
            lastWeek: 'dddd [dernier \xE0] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'dans %s',
            past: 'il y a %s',
            s: 'quelques secondes',
            m: 'une minute',
            mm: '%d minutes',
            h: 'une heure',
            hh: '%d heures',
            d: 'un jour',
            dd: '%d jours',
            M: 'un mois',
            MM: '%d mois',
            y: 'un an',
            yy: '%d ans'
        },
        ordinal: function (number) {
            return number + (number === 1 ? 'er' : '');
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fo', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('fo', {
        months: 'januar_februar_mars_apr\xEDl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
        monthsShort: 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
        weekdays: 'sunnudagur_m\xE1nadagur_t\xFDsdagur_mikudagur_h\xF3sdagur_fr\xEDggjadagur_leygardagur'.split('_'),
        weekdaysShort: 'sun_m\xE1n_t\xFDs_mik_h\xF3s_fr\xED_ley'.split('_'),
        weekdaysMin: 'su_m\xE1_t\xFD_mi_h\xF3_fr_le'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D. MMMM, YYYY LT'
        },
        calendar: {
            sameDay: '[\xCD dag kl.] LT',
            nextDay: '[\xCD morgin kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[\xCD gj\xE1r kl.] LT',
            lastWeek: '[s\xED\xF0stu] dddd [kl] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'um %s',
            past: '%s s\xED\xF0ani',
            s: 'f\xE1 sekund',
            m: 'ein minutt',
            mm: '%d minuttir',
            h: 'ein t\xEDmi',
            hh: '%d t\xEDmar',
            d: 'ein dagur',
            dd: '%d dagar',
            M: 'ein m\xE1na\xF0i',
            MM: '%d m\xE1na\xF0ir',
            y: 'eitt \xE1r',
            yy: '%d \xE1r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fi', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var numbersPast = 'nolla yksi kaksi kolme nelj\xE4 viisi kuusi seitsem\xE4n kahdeksan yhdeks\xE4n'.split(' '), numbersFuture = [
            'nolla',
            'yhden',
            'kahden',
            'kolmen',
            'nelj\xE4n',
            'viiden',
            'kuuden',
            numbersPast[7],
            numbersPast[8],
            numbersPast[9]
        ];
    function translate(number, withoutSuffix, key, isFuture) {
        var result = '';
        switch (key) {
        case 's':
            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
        case 'm':
            return isFuture ? 'minuutin' : 'minuutti';
        case 'mm':
            result = isFuture ? 'minuutin' : 'minuuttia';
            break;
        case 'h':
            return isFuture ? 'tunnin' : 'tunti';
        case 'hh':
            result = isFuture ? 'tunnin' : 'tuntia';
            break;
        case 'd':
            return isFuture ? 'p\xE4iv\xE4n' : 'p\xE4iv\xE4';
        case 'dd':
            result = isFuture ? 'p\xE4iv\xE4n' : 'p\xE4iv\xE4\xE4';
            break;
        case 'M':
            return isFuture ? 'kuukauden' : 'kuukausi';
        case 'MM':
            result = isFuture ? 'kuukauden' : 'kuukautta';
            break;
        case 'y':
            return isFuture ? 'vuoden' : 'vuosi';
        case 'yy':
            result = isFuture ? 'vuoden' : 'vuotta';
            break;
        }
        result = verbalNumber(number, isFuture) + ' ' + result;
        return result;
    }
    function verbalNumber(number, isFuture) {
        return number < 10 ? isFuture ? numbersFuture[number] : numbersPast[number] : number;
    }
    return moment.lang('fi', {
        months: 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kes\xE4kuu_hein\xE4kuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
        monthsShort: 'tammi_helmi_maalis_huhti_touko_kes\xE4_hein\xE4_elo_syys_loka_marras_joulu'.split('_'),
        weekdays: 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
        weekdaysShort: 'su_ma_ti_ke_to_pe_la'.split('_'),
        weekdaysMin: 'su_ma_ti_ke_to_pe_la'.split('_'),
        longDateFormat: {
            LT: 'HH.mm',
            L: 'DD.MM.YYYY',
            LL: 'Do MMMM[ta] YYYY',
            LLL: 'Do MMMM[ta] YYYY, [klo] LT',
            LLLL: 'dddd, Do MMMM[ta] YYYY, [klo] LT',
            l: 'D.M.YYYY',
            ll: 'Do MMM YYYY',
            lll: 'Do MMM YYYY, [klo] LT',
            llll: 'ddd, Do MMM YYYY, [klo] LT'
        },
        calendar: {
            sameDay: '[t\xE4n\xE4\xE4n] [klo] LT',
            nextDay: '[huomenna] [klo] LT',
            nextWeek: 'dddd [klo] LT',
            lastDay: '[eilen] [klo] LT',
            lastWeek: '[viime] dddd[na] [klo] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s p\xE4\xE4st\xE4',
            past: '%s sitten',
            s: translate,
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/fa', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u06F1',
            '2': '\u06F2',
            '3': '\u06F3',
            '4': '\u06F4',
            '5': '\u06F5',
            '6': '\u06F6',
            '7': '\u06F7',
            '8': '\u06F8',
            '9': '\u06F9',
            '0': '\u06F0'
        }, numberMap = {
            '\u06F1': '1',
            '\u06F2': '2',
            '\u06F3': '3',
            '\u06F4': '4',
            '\u06F5': '5',
            '\u06F6': '6',
            '\u06F7': '7',
            '\u06F8': '8',
            '\u06F9': '9',
            '\u06F0': '0'
        };
    return moment.lang('fa', {
        months: '\u0698\u0627\u0646\u0648\u06CC\u0647_\u0641\u0648\u0631\u06CC\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06CC\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06CC\u0647_\u0627\u0648\u062A_\u0633\u067E\u062A\u0627\u0645\u0628\u0631_\u0627\u06A9\u062A\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062F\u0633\u0627\u0645\u0628\u0631'.split('_'),
        monthsShort: '\u0698\u0627\u0646\u0648\u06CC\u0647_\u0641\u0648\u0631\u06CC\u0647_\u0645\u0627\u0631\u0633_\u0622\u0648\u0631\u06CC\u0644_\u0645\u0647_\u0698\u0648\u0626\u0646_\u0698\u0648\u0626\u06CC\u0647_\u0627\u0648\u062A_\u0633\u067E\u062A\u0627\u0645\u0628\u0631_\u0627\u06A9\u062A\u0628\u0631_\u0646\u0648\u0627\u0645\u0628\u0631_\u062F\u0633\u0627\u0645\u0628\u0631'.split('_'),
        weekdays: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
        weekdaysShort: '\u06CC\u06A9\u200C\u0634\u0646\u0628\u0647_\u062F\u0648\u0634\u0646\u0628\u0647_\u0633\u0647\u200C\u0634\u0646\u0628\u0647_\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647_\u067E\u0646\u062C\u200C\u0634\u0646\u0628\u0647_\u062C\u0645\u0639\u0647_\u0634\u0646\u0628\u0647'.split('_'),
        weekdaysMin: '\u06CC_\u062F_\u0633_\u0686_\u067E_\u062C_\u0634'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u0642\u0628\u0644 \u0627\u0632 \u0638\u0647\u0631';
            } else {
                return '\u0628\u0639\u062F \u0627\u0632 \u0638\u0647\u0631';
            }
        },
        calendar: {
            sameDay: '[\u0627\u0645\u0631\u0648\u0632 \u0633\u0627\u0639\u062A] LT',
            nextDay: '[\u0641\u0631\u062F\u0627 \u0633\u0627\u0639\u062A] LT',
            nextWeek: 'dddd [\u0633\u0627\u0639\u062A] LT',
            lastDay: '[\u062F\u06CC\u0631\u0648\u0632 \u0633\u0627\u0639\u062A] LT',
            lastWeek: 'dddd [\u067E\u06CC\u0634] [\u0633\u0627\u0639\u062A] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u062F\u0631 %s',
            past: '%s \u067E\u06CC\u0634',
            s: '\u0686\u0646\u062F\u06CC\u0646 \u062B\u0627\u0646\u06CC\u0647',
            m: '\u06CC\u06A9 \u062F\u0642\u06CC\u0642\u0647',
            mm: '%d \u062F\u0642\u06CC\u0642\u0647',
            h: '\u06CC\u06A9 \u0633\u0627\u0639\u062A',
            hh: '%d \u0633\u0627\u0639\u062A',
            d: '\u06CC\u06A9 \u0631\u0648\u0632',
            dd: '%d \u0631\u0648\u0632',
            M: '\u06CC\u06A9 \u0645\u0627\u0647',
            MM: '%d \u0645\u0627\u0647',
            y: '\u06CC\u06A9 \u0633\u0627\u0644',
            yy: '%d \u0633\u0627\u0644'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '\u060C');
        },
        ordinal: '%d\u0645',
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/eu', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('eu', {
        months: 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
        monthsShort: 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
        weekdays: 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
        weekdaysShort: 'ig._al._ar._az._og._ol._lr.'.split('_'),
        weekdaysMin: 'ig_al_ar_az_og_ol_lr'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'YYYY[ko] MMMM[ren] D[a]',
            LLL: 'YYYY[ko] MMMM[ren] D[a] LT',
            LLLL: 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
            l: 'YYYY-M-D',
            ll: 'YYYY[ko] MMM D[a]',
            lll: 'YYYY[ko] MMM D[a] LT',
            llll: 'ddd, YYYY[ko] MMM D[a] LT'
        },
        calendar: {
            sameDay: '[gaur] LT[etan]',
            nextDay: '[bihar] LT[etan]',
            nextWeek: 'dddd LT[etan]',
            lastDay: '[atzo] LT[etan]',
            lastWeek: '[aurreko] dddd LT[etan]',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s barru',
            past: 'duela %s',
            s: 'segundo batzuk',
            m: 'minutu bat',
            mm: '%d minutu',
            h: 'ordu bat',
            hh: '%d ordu',
            d: 'egun bat',
            dd: '%d egun',
            M: 'hilabete bat',
            MM: '%d hilabete',
            y: 'urte bat',
            yy: '%d urte'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/et', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            's': [
                'm\xF5ne sekundi',
                'm\xF5ni sekund',
                'paar sekundit'
            ],
            'm': [
                '\xFChe minuti',
                '\xFCks minut'
            ],
            'mm': [
                number + ' minuti',
                number + ' minutit'
            ],
            'h': [
                '\xFChe tunni',
                'tund aega',
                '\xFCks tund'
            ],
            'hh': [
                number + ' tunni',
                number + ' tundi'
            ],
            'd': [
                '\xFChe p\xE4eva',
                '\xFCks p\xE4ev'
            ],
            'M': [
                'kuu aja',
                'kuu aega',
                '\xFCks kuu'
            ],
            'MM': [
                number + ' kuu',
                number + ' kuud'
            ],
            'y': [
                '\xFChe aasta',
                'aasta',
                '\xFCks aasta'
            ],
            'yy': [
                number + ' aasta',
                number + ' aastat'
            ]
        };
        if (withoutSuffix) {
            return format[key][2] ? format[key][2] : format[key][1];
        }
        return isFuture ? format[key][0] : format[key][1];
    }
    return moment.lang('et', {
        months: 'jaanuar_veebruar_m\xE4rts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
        monthsShort: 'jaan_veebr_m\xE4rts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
        weekdays: 'p\xFChap\xE4ev_esmasp\xE4ev_teisip\xE4ev_kolmap\xE4ev_neljap\xE4ev_reede_laup\xE4ev'.split('_'),
        weekdaysShort: 'P_E_T_K_N_R_L'.split('_'),
        weekdaysMin: 'P_E_T_K_N_R_L'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[T\xE4na,] LT',
            nextDay: '[Homme,] LT',
            nextWeek: '[J\xE4rgmine] dddd LT',
            lastDay: '[Eile,] LT',
            lastWeek: '[Eelmine] dddd LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s p\xE4rast',
            past: '%s tagasi',
            s: processRelativeTime,
            m: processRelativeTime,
            mm: processRelativeTime,
            h: processRelativeTime,
            hh: processRelativeTime,
            d: processRelativeTime,
            dd: '%d p\xE4eva',
            M: processRelativeTime,
            MM: processRelativeTime,
            y: processRelativeTime,
            yy: processRelativeTime
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/es', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var monthsShortDot = 'ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.'.split('_'), monthsShort = 'ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic'.split('_');
    return moment.lang('es', {
        months: 'enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre'.split('_'),
        monthsShort: function (m, format) {
            if (/-MMM-/.test(format)) {
                return monthsShort[m.month()];
            } else {
                return monthsShortDot[m.month()];
            }
        },
        weekdays: 'domingo_lunes_martes_mi\xE9rcoles_jueves_viernes_s\xE1bado'.split('_'),
        weekdaysShort: 'dom._lun._mar._mi\xE9._jue._vie._s\xE1b.'.split('_'),
        weekdaysMin: 'Do_Lu_Ma_Mi_Ju_Vi_S\xE1'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [del] YYYY',
            LLL: 'D [de] MMMM [del] YYYY LT',
            LLLL: 'dddd, D [de] MMMM [del] YYYY LT'
        },
        calendar: {
            sameDay: function () {
                return '[hoy a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            nextDay: function () {
                return '[ma\xF1ana a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            nextWeek: function () {
                return 'dddd [a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            lastDay: function () {
                return '[ayer a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            lastWeek: function () {
                return '[el] dddd [pasado a la' + (this.hours() !== 1 ? 's' : '') + '] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un d\xEDa',
            dd: '%d d\xEDas',
            M: 'un mes',
            MM: '%d meses',
            y: 'un a\xF1o',
            yy: '%d a\xF1os'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/eo', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('eo', {
        months: 'januaro_februaro_marto_aprilo_majo_junio_julio_a\u016Dgusto_septembro_oktobro_novembro_decembro'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_a\u016Dg_sep_okt_nov_dec'.split('_'),
        weekdays: 'Diman\u0109o_Lundo_Mardo_Merkredo_\u0134a\u016Ddo_Vendredo_Sabato'.split('_'),
        weekdaysShort: 'Dim_Lun_Mard_Merk_\u0134a\u016D_Ven_Sab'.split('_'),
        weekdaysMin: 'Di_Lu_Ma_Me_\u0134a_Ve_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'YYYY-MM-DD',
            LL: 'D[-an de] MMMM, YYYY',
            LLL: 'D[-an de] MMMM, YYYY LT',
            LLLL: 'dddd, [la] D[-an de] MMMM, YYYY LT'
        },
        meridiem: function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'p.t.m.' : 'P.T.M.';
            } else {
                return isLower ? 'a.t.m.' : 'A.T.M.';
            }
        },
        calendar: {
            sameDay: '[Hodia\u016D je] LT',
            nextDay: '[Morga\u016D je] LT',
            nextWeek: 'dddd [je] LT',
            lastDay: '[Hiera\u016D je] LT',
            lastWeek: '[pasinta] dddd [je] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'je %s',
            past: 'anta\u016D %s',
            s: 'sekundoj',
            m: 'minuto',
            mm: '%d minutoj',
            h: 'horo',
            hh: '%d horoj',
            d: 'tago',
            dd: '%d tagoj',
            M: 'monato',
            MM: '%d monatoj',
            y: 'jaro',
            yy: '%d jaroj'
        },
        ordinal: '%da',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/en-gb', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('en-gb', {
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        },
        ordinal: function (number) {
            var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/en-ca', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('en-ca', {
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'h:mm A',
            L: 'YYYY-MM-DD',
            LL: 'D MMMM, YYYY',
            LLL: 'D MMMM, YYYY LT',
            LLLL: 'dddd, D MMMM, YYYY LT'
        },
        calendar: {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        },
        ordinal: function (number) {
            var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
            return number + output;
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/en-au', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('en-au', {
        months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'h:mm A',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        },
        ordinal: function (number) {
            var b = number % 10, output = ~~(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/el', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('el', {
        monthsNominativeEl: '\u0399\u03B1\u03BD\u03BF\u03C5\u03AC\u03C1\u03B9\u03BF\u03C2_\u03A6\u03B5\u03B2\u03C1\u03BF\u03C5\u03AC\u03C1\u03B9\u03BF\u03C2_\u039C\u03AC\u03C1\u03C4\u03B9\u03BF\u03C2_\u0391\u03C0\u03C1\u03AF\u03BB\u03B9\u03BF\u03C2_\u039C\u03AC\u03B9\u03BF\u03C2_\u0399\u03BF\u03CD\u03BD\u03B9\u03BF\u03C2_\u0399\u03BF\u03CD\u03BB\u03B9\u03BF\u03C2_\u0391\u03CD\u03B3\u03BF\u03C5\u03C3\u03C4\u03BF\u03C2_\u03A3\u03B5\u03C0\u03C4\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2_\u039F\u03BA\u03C4\u03CE\u03B2\u03C1\u03B9\u03BF\u03C2_\u039D\u03BF\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2_\u0394\u03B5\u03BA\u03AD\u03BC\u03B2\u03C1\u03B9\u03BF\u03C2'.split('_'),
        monthsGenitiveEl: '\u0399\u03B1\u03BD\u03BF\u03C5\u03B1\u03C1\u03AF\u03BF\u03C5_\u03A6\u03B5\u03B2\u03C1\u03BF\u03C5\u03B1\u03C1\u03AF\u03BF\u03C5_\u039C\u03B1\u03C1\u03C4\u03AF\u03BF\u03C5_\u0391\u03C0\u03C1\u03B9\u03BB\u03AF\u03BF\u03C5_\u039C\u03B1\u0390\u03BF\u03C5_\u0399\u03BF\u03C5\u03BD\u03AF\u03BF\u03C5_\u0399\u03BF\u03C5\u03BB\u03AF\u03BF\u03C5_\u0391\u03C5\u03B3\u03BF\u03CD\u03C3\u03C4\u03BF\u03C5_\u03A3\u03B5\u03C0\u03C4\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5_\u039F\u03BA\u03C4\u03C9\u03B2\u03C1\u03AF\u03BF\u03C5_\u039D\u03BF\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5_\u0394\u03B5\u03BA\u03B5\u03BC\u03B2\u03C1\u03AF\u03BF\u03C5'.split('_'),
        months: function (momentToFormat, format) {
            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) {
                return this._monthsGenitiveEl[momentToFormat.month()];
            } else {
                return this._monthsNominativeEl[momentToFormat.month()];
            }
        },
        monthsShort: '\u0399\u03B1\u03BD_\u03A6\u03B5\u03B2_\u039C\u03B1\u03C1_\u0391\u03C0\u03C1_\u039C\u03B1\u03CA_\u0399\u03BF\u03C5\u03BD_\u0399\u03BF\u03C5\u03BB_\u0391\u03C5\u03B3_\u03A3\u03B5\u03C0_\u039F\u03BA\u03C4_\u039D\u03BF\u03B5_\u0394\u03B5\u03BA'.split('_'),
        weekdays: '\u039A\u03C5\u03C1\u03B9\u03B1\u03BA\u03AE_\u0394\u03B5\u03C5\u03C4\u03AD\u03C1\u03B1_\u03A4\u03C1\u03AF\u03C4\u03B7_\u03A4\u03B5\u03C4\u03AC\u03C1\u03C4\u03B7_\u03A0\u03AD\u03BC\u03C0\u03C4\u03B7_\u03A0\u03B1\u03C1\u03B1\u03C3\u03BA\u03B5\u03C5\u03AE_\u03A3\u03AC\u03B2\u03B2\u03B1\u03C4\u03BF'.split('_'),
        weekdaysShort: '\u039A\u03C5\u03C1_\u0394\u03B5\u03C5_\u03A4\u03C1\u03B9_\u03A4\u03B5\u03C4_\u03A0\u03B5\u03BC_\u03A0\u03B1\u03C1_\u03A3\u03B1\u03B2'.split('_'),
        weekdaysMin: '\u039A\u03C5_\u0394\u03B5_\u03A4\u03C1_\u03A4\u03B5_\u03A0\u03B5_\u03A0\u03B1_\u03A3\u03B1'.split('_'),
        meridiem: function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? '\u03BC\u03BC' : '\u039C\u039C';
            } else {
                return isLower ? '\u03C0\u03BC' : '\u03A0\u039C';
            }
        },
        longDateFormat: {
            LT: 'h:mm A',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendarEl: {
            sameDay: '[\u03A3\u03AE\u03BC\u03B5\u03C1\u03B1 {}] LT',
            nextDay: '[\u0391\u03CD\u03C1\u03B9\u03BF {}] LT',
            nextWeek: 'dddd [{}] LT',
            lastDay: '[\u03A7\u03B8\u03B5\u03C2 {}] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 6:
                    return '[\u03C4\u03BF \u03C0\u03C1\u03BF\u03B7\u03B3\u03BF\u03CD\u03BC\u03B5\u03BD\u03BF] dddd [{}] LT';
                default:
                    return '[\u03C4\u03B7\u03BD \u03C0\u03C1\u03BF\u03B7\u03B3\u03BF\u03CD\u03BC\u03B5\u03BD\u03B7] dddd [{}] LT';
                }
            },
            sameElse: 'L'
        },
        calendar: function (key, mom) {
            var output = this._calendarEl[key], hours = mom && mom.hours();
            if (typeof output === 'function') {
                output = output.apply(mom);
            }
            return output.replace('{}', hours % 12 === 1 ? '\u03C3\u03C4\u03B7' : '\u03C3\u03C4\u03B9\u03C2');
        },
        relativeTime: {
            future: '\u03C3\u03B5 %s',
            past: '%s \u03C0\u03C1\u03B9\u03BD',
            s: '\u03B4\u03B5\u03C5\u03C4\u03B5\u03C1\u03CC\u03BB\u03B5\u03C0\u03C4\u03B1',
            m: '\u03AD\u03BD\u03B1 \u03BB\u03B5\u03C0\u03C4\u03CC',
            mm: '%d \u03BB\u03B5\u03C0\u03C4\u03AC',
            h: '\u03BC\u03AF\u03B1 \u03CE\u03C1\u03B1',
            hh: '%d \u03CE\u03C1\u03B5\u03C2',
            d: '\u03BC\u03AF\u03B1 \u03BC\u03AD\u03C1\u03B1',
            dd: '%d \u03BC\u03AD\u03C1\u03B5\u03C2',
            M: '\u03AD\u03BD\u03B1\u03C2 \u03BC\u03AE\u03BD\u03B1\u03C2',
            MM: '%d \u03BC\u03AE\u03BD\u03B5\u03C2',
            y: '\u03AD\u03BD\u03B1\u03C2 \u03C7\u03C1\u03CC\u03BD\u03BF\u03C2',
            yy: '%d \u03C7\u03C1\u03CC\u03BD\u03B9\u03B1'
        },
        ordinal: function (number) {
            return number + '\u03B7';
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/de', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': [
                'eine Minute',
                'einer Minute'
            ],
            'h': [
                'eine Stunde',
                'einer Stunde'
            ],
            'd': [
                'ein Tag',
                'einem Tag'
            ],
            'dd': [
                number + ' Tage',
                number + ' Tagen'
            ],
            'M': [
                'ein Monat',
                'einem Monat'
            ],
            'MM': [
                number + ' Monate',
                number + ' Monaten'
            ],
            'y': [
                'ein Jahr',
                'einem Jahr'
            ],
            'yy': [
                number + ' Jahre',
                number + ' Jahren'
            ]
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    return moment.lang('de', {
        months: 'Januar_Februar_M\xE4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm [Uhr]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Heute um] LT',
            sameElse: 'L',
            nextDay: '[Morgen um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gestern um] LT',
            lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime: {
            future: 'in %s',
            past: 'vor %s',
            s: 'ein paar Sekunden',
            m: processRelativeTime,
            mm: '%d Minuten',
            h: processRelativeTime,
            hh: '%d Stunden',
            d: processRelativeTime,
            dd: processRelativeTime,
            M: processRelativeTime,
            MM: processRelativeTime,
            y: processRelativeTime,
            yy: processRelativeTime
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/de-at', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function processRelativeTime(number, withoutSuffix, key, isFuture) {
        var format = {
            'm': [
                'eine Minute',
                'einer Minute'
            ],
            'h': [
                'eine Stunde',
                'einer Stunde'
            ],
            'd': [
                'ein Tag',
                'einem Tag'
            ],
            'dd': [
                number + ' Tage',
                number + ' Tagen'
            ],
            'M': [
                'ein Monat',
                'einem Monat'
            ],
            'MM': [
                number + ' Monate',
                number + ' Monaten'
            ],
            'y': [
                'ein Jahr',
                'einem Jahr'
            ],
            'yy': [
                number + ' Jahre',
                number + ' Jahren'
            ]
        };
        return withoutSuffix ? format[key][0] : format[key][1];
    }
    return moment.lang('de-at', {
        months: 'J\xE4nner_Februar_M\xE4rz_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
        monthsShort: 'J\xE4n._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
        weekdays: 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
        weekdaysShort: 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
        weekdaysMin: 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm [Uhr]',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Heute um] LT',
            sameElse: 'L',
            nextDay: '[Morgen um] LT',
            nextWeek: 'dddd [um] LT',
            lastDay: '[Gestern um] LT',
            lastWeek: '[letzten] dddd [um] LT'
        },
        relativeTime: {
            future: 'in %s',
            past: 'vor %s',
            s: 'ein paar Sekunden',
            m: processRelativeTime,
            mm: '%d Minuten',
            h: processRelativeTime,
            hh: '%d Stunden',
            d: processRelativeTime,
            dd: processRelativeTime,
            M: processRelativeTime,
            MM: processRelativeTime,
            y: processRelativeTime,
            yy: processRelativeTime
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/da', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('da', {
        months: 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
        monthsShort: 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
        weekdays: 's\xF8ndag_mandag_tirsdag_onsdag_torsdag_fredag_l\xF8rdag'.split('_'),
        weekdaysShort: 's\xF8n_man_tir_ons_tor_fre_l\xF8r'.split('_'),
        weekdaysMin: 's\xF8_ma_ti_on_to_fr_l\xF8'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd [d.] D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[I dag kl.] LT',
            nextDay: '[I morgen kl.] LT',
            nextWeek: 'dddd [kl.] LT',
            lastDay: '[I g\xE5r kl.] LT',
            lastWeek: '[sidste] dddd [kl] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'om %s',
            past: '%s siden',
            s: 'f\xE5 sekunder',
            m: 'et minut',
            mm: '%d minutter',
            h: 'en time',
            hh: '%d timer',
            d: 'en dag',
            dd: '%d dage',
            M: 'en m\xE5ned',
            MM: '%d m\xE5neder',
            y: 'et \xE5r',
            yy: '%d \xE5r'
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/cy', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('cy', {
        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Heddiw am] LT',
            nextDay: '[Yfory am] LT',
            nextWeek: 'dddd [am] LT',
            lastDay: '[Ddoe am] LT',
            lastWeek: 'dddd [diwethaf am] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'mewn %s',
            past: '%s yn \xF4l',
            s: 'ychydig eiliadau',
            m: 'munud',
            mm: '%d munud',
            h: 'awr',
            hh: '%d awr',
            d: 'diwrnod',
            dd: '%d diwrnod',
            M: 'mis',
            MM: '%d mis',
            y: 'blwyddyn',
            yy: '%d flynedd'
        },
        ordinal: function (number) {
            var b = number, output = '', lookup = [
                    '',
                    'af',
                    'il',
                    'ydd',
                    'ydd',
                    'ed',
                    'ed',
                    'ed',
                    'fed',
                    'fed',
                    'fed',
                    'eg',
                    'fed',
                    'eg',
                    'eg',
                    'fed',
                    'eg',
                    'eg',
                    'fed',
                    'eg',
                    'fed'
                ];
            if (b > 20) {
                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
                    output = 'fed';
                } else {
                    output = 'ain';
                }
            } else if (b > 0) {
                output = lookup[b];
            }
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/cv', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('cv', {
        months: '\u043A\u0103\u0440\u043B\u0430\u0447_\u043D\u0430\u0440\u0103\u0441_\u043F\u0443\u0448_\u0430\u043A\u0430_\u043C\u0430\u0439_\xE7\u0115\u0440\u0442\u043C\u0435_\u0443\u0442\u0103_\xE7\u0443\u0440\u043B\u0430_\u0430\u0432\u0103\u043D_\u044E\u043F\u0430_\u0447\u04F3\u043A_\u0440\u0430\u0448\u0442\u0430\u0432'.split('_'),
        monthsShort: '\u043A\u0103\u0440_\u043D\u0430\u0440_\u043F\u0443\u0448_\u0430\u043A\u0430_\u043C\u0430\u0439_\xE7\u0115\u0440_\u0443\u0442\u0103_\xE7\u0443\u0440_\u0430\u0432_\u044E\u043F\u0430_\u0447\u04F3\u043A_\u0440\u0430\u0448'.split('_'),
        weekdays: '\u0432\u044B\u0440\u0441\u0430\u0440\u043D\u0438\u043A\u0443\u043D_\u0442\u0443\u043D\u0442\u0438\u043A\u0443\u043D_\u044B\u0442\u043B\u0430\u0440\u0438\u043A\u0443\u043D_\u044E\u043D\u043A\u0443\u043D_\u043A\u0115\xE7\u043D\u0435\u0440\u043D\u0438\u043A\u0443\u043D_\u044D\u0440\u043D\u0435\u043A\u0443\u043D_\u0448\u0103\u043C\u0430\u0442\u043A\u0443\u043D'.split('_'),
        weekdaysShort: '\u0432\u044B\u0440_\u0442\u0443\u043D_\u044B\u0442\u043B_\u044E\u043D_\u043A\u0115\xE7_\u044D\u0440\u043D_\u0448\u0103\u043C'.split('_'),
        weekdaysMin: '\u0432\u0440_\u0442\u043D_\u044B\u0442_\u044E\u043D_\u043A\xE7_\u044D\u0440_\u0448\u043C'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD-MM-YYYY',
            LL: 'YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115]',
            LLL: 'YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115], LT',
            LLLL: 'dddd, YYYY [\xE7\u0443\u043B\u0445\u0438] MMMM [\u0443\u0439\u0103\u0445\u0115\u043D] D[-\u043C\u0115\u0448\u0115], LT'
        },
        calendar: {
            sameDay: '[\u041F\u0430\u044F\u043D] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            nextDay: '[\u042B\u0440\u0430\u043D] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            lastDay: '[\u0114\u043D\u0435\u0440] LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            nextWeek: '[\xC7\u0438\u0442\u0435\u0441] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            lastWeek: '[\u0418\u0440\u0442\u043D\u0115] dddd LT [\u0441\u0435\u0445\u0435\u0442\u0440\u0435]',
            sameElse: 'L'
        },
        relativeTime: {
            future: function (output) {
                var affix = /сехет$/i.exec(output) ? '\u0440\u0435\u043D' : /çул$/i.exec(output) ? '\u0442\u0430\u043D' : '\u0440\u0430\u043D';
                return output + affix;
            },
            past: '%s \u043A\u0430\u044F\u043B\u043B\u0430',
            s: '\u043F\u0115\u0440-\u0438\u043A \xE7\u0435\u043A\u043A\u0443\u043D\u0442',
            m: '\u043F\u0115\u0440 \u043C\u0438\u043D\u0443\u0442',
            mm: '%d \u043C\u0438\u043D\u0443\u0442',
            h: '\u043F\u0115\u0440 \u0441\u0435\u0445\u0435\u0442',
            hh: '%d \u0441\u0435\u0445\u0435\u0442',
            d: '\u043F\u0115\u0440 \u043A\u0443\u043D',
            dd: '%d \u043A\u0443\u043D',
            M: '\u043F\u0115\u0440 \u0443\u0439\u0103\u0445',
            MM: '%d \u0443\u0439\u0103\u0445',
            y: '\u043F\u0115\u0440 \xE7\u0443\u043B',
            yy: '%d \xE7\u0443\u043B'
        },
        ordinal: '%d-\u043C\u0115\u0448',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/cs', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var months = 'leden_\xFAnor_b\u0159ezen_duben_kv\u011Bten_\u010Derven_\u010Dervenec_srpen_z\xE1\u0159\xED_\u0159\xEDjen_listopad_prosinec'.split('_'), monthsShort = 'led_\xFAno_b\u0159e_dub_kv\u011B_\u010Dvn_\u010Dvc_srp_z\xE1\u0159_\u0159\xEDj_lis_pro'.split('_');
    function plural(n) {
        return n > 1 && n < 5 && ~~(n / 10) !== 1;
    }
    function translate(number, withoutSuffix, key, isFuture) {
        var result = number + ' ';
        switch (key) {
        case 's':
            return withoutSuffix || isFuture ? 'p\xE1r sekund' : 'p\xE1r sekundami';
        case 'm':
            return withoutSuffix ? 'minuta' : isFuture ? 'minutu' : 'minutou';
        case 'mm':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'minuty' : 'minut');
            } else {
                return result + 'minutami';
            }
            break;
        case 'h':
            return withoutSuffix ? 'hodina' : isFuture ? 'hodinu' : 'hodinou';
        case 'hh':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'hodiny' : 'hodin');
            } else {
                return result + 'hodinami';
            }
            break;
        case 'd':
            return withoutSuffix || isFuture ? 'den' : 'dnem';
        case 'dd':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'dny' : 'dn\xED');
            } else {
                return result + 'dny';
            }
            break;
        case 'M':
            return withoutSuffix || isFuture ? 'm\u011Bs\xEDc' : 'm\u011Bs\xEDcem';
        case 'MM':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'm\u011Bs\xEDce' : 'm\u011Bs\xEDc\u016F');
            } else {
                return result + 'm\u011Bs\xEDci';
            }
            break;
        case 'y':
            return withoutSuffix || isFuture ? 'rok' : 'rokem';
        case 'yy':
            if (withoutSuffix || isFuture) {
                return result + (plural(number) ? 'roky' : 'let');
            } else {
                return result + 'lety';
            }
            break;
        }
    }
    return moment.lang('cs', {
        months: months,
        monthsShort: monthsShort,
        monthsParse: function (months, monthsShort) {
            var i, _monthsParse = [];
            for (i = 0; i < 12; i++) {
                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
            }
            return _monthsParse;
        }(months, monthsShort),
        weekdays: 'ned\u011Ble_pond\u011Bl\xED_\xFAter\xFD_st\u0159eda_\u010Dtvrtek_p\xE1tek_sobota'.split('_'),
        weekdaysShort: 'ne_po_\xFAt_st_\u010Dt_p\xE1_so'.split('_'),
        weekdaysMin: 'ne_po_\xFAt_st_\u010Dt_p\xE1_so'.split('_'),
        longDateFormat: {
            LT: 'H.mm',
            L: 'DD.\xA0MM.\xA0YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[dnes v] LT',
            nextDay: '[z\xEDtra v] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[v ned\u011Bli v] LT';
                case 1:
                case 2:
                    return '[v] dddd [v] LT';
                case 3:
                    return '[ve st\u0159edu v] LT';
                case 4:
                    return '[ve \u010Dtvrtek v] LT';
                case 5:
                    return '[v p\xE1tek v] LT';
                case 6:
                    return '[v sobotu v] LT';
                }
            },
            lastDay: '[v\u010Dera v] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[minulou ned\u011Bli v] LT';
                case 1:
                case 2:
                    return '[minul\xE9] dddd [v] LT';
                case 3:
                    return '[minulou st\u0159edu v] LT';
                case 4:
                case 5:
                    return '[minul\xFD] dddd [v] LT';
                case 6:
                    return '[minulou sobotu v] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'p\u0159ed %s',
            s: translate,
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: translate,
            dd: translate,
            M: translate,
            MM: translate,
            y: translate,
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ca', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ca', {
        months: 'gener_febrer_mar\xE7_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
        monthsShort: 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
        weekdays: 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
        weekdaysShort: 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
        weekdaysMin: 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: function () {
                return '[avui a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
            },
            nextDay: function () {
                return '[dem\xE0 a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
            },
            nextWeek: function () {
                return 'dddd [a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
            },
            lastDay: function () {
                return '[ahir a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
            },
            lastWeek: function () {
                return '[el] dddd [passat a ' + (this.hours() !== 1 ? 'les' : 'la') + '] LT';
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'en %s',
            past: 'fa %s',
            s: 'uns segons',
            m: 'un minut',
            mm: '%d minuts',
            h: 'una hora',
            hh: '%d hores',
            d: 'un dia',
            dd: '%d dies',
            M: 'un mes',
            MM: '%d mesos',
            y: 'un any',
            yy: '%d anys'
        },
        ordinal: '%d\xBA',
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/bs', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function translate(number, withoutSuffix, key) {
        var result = number + ' ';
        switch (key) {
        case 'm':
            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
        case 'mm':
            if (number === 1) {
                result += 'minuta';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'minute';
            } else {
                result += 'minuta';
            }
            return result;
        case 'h':
            return withoutSuffix ? 'jedan sat' : 'jednog sata';
        case 'hh':
            if (number === 1) {
                result += 'sat';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'sata';
            } else {
                result += 'sati';
            }
            return result;
        case 'dd':
            if (number === 1) {
                result += 'dan';
            } else {
                result += 'dana';
            }
            return result;
        case 'MM':
            if (number === 1) {
                result += 'mjesec';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'mjeseca';
            } else {
                result += 'mjeseci';
            }
            return result;
        case 'yy':
            if (number === 1) {
                result += 'godina';
            } else if (number === 2 || number === 3 || number === 4) {
                result += 'godine';
            } else {
                result += 'godina';
            }
            return result;
        }
    }
    return moment.lang('bs', {
        months: 'januar_februar_mart_april_maj_juni_juli_avgust_septembar_oktobar_novembar_decembar'.split('_'),
        monthsShort: 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
        weekdays: 'nedjelja_ponedjeljak_utorak_srijeda_\u010Detvrtak_petak_subota'.split('_'),
        weekdaysShort: 'ned._pon._uto._sri._\u010Det._pet._sub.'.split('_'),
        weekdaysMin: 'ne_po_ut_sr_\u010De_pe_su'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'DD. MM. YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY LT',
            LLLL: 'dddd, D. MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[danas u] LT',
            nextDay: '[sutra u] LT',
            nextWeek: function () {
                switch (this.day()) {
                case 0:
                    return '[u] [nedjelju] [u] LT';
                case 3:
                    return '[u] [srijedu] [u] LT';
                case 6:
                    return '[u] [subotu] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[u] dddd [u] LT';
                }
            },
            lastDay: '[ju\u010Der u] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                    return '[pro\u0161lu] dddd [u] LT';
                case 6:
                    return '[pro\u0161le] [subote] [u] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[pro\u0161li] dddd [u] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: 'za %s',
            past: 'prije %s',
            s: 'par sekundi',
            m: translate,
            mm: translate,
            h: translate,
            hh: translate,
            d: 'dan',
            dd: translate,
            M: 'mjesec',
            MM: translate,
            y: 'godinu',
            yy: translate
        },
        ordinal: '%d.',
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/br', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    function relativeTimeWithMutation(number, withoutSuffix, key) {
        var format = {
            'mm': 'munutenn',
            'MM': 'miz',
            'dd': 'devezh'
        };
        return number + ' ' + mutation(format[key], number);
    }
    function specialMutationForYears(number) {
        switch (lastNumber(number)) {
        case 1:
        case 3:
        case 4:
        case 5:
        case 9:
            return number + ' bloaz';
        default:
            return number + ' vloaz';
        }
    }
    function lastNumber(number) {
        if (number > 9) {
            return lastNumber(number % 10);
        }
        return number;
    }
    function mutation(text, number) {
        if (number === 2) {
            return softMutation(text);
        }
        return text;
    }
    function softMutation(text) {
        var mutationTable = {
            'm': 'v',
            'b': 'v',
            'd': 'z'
        };
        if (mutationTable[text.charAt(0)] === undefined) {
            return text;
        }
        return mutationTable[text.charAt(0)] + text.substring(1);
    }
    return moment.lang('br', {
        months: 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
        monthsShort: 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
        weekdays: 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
        weekdaysShort: 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
        weekdaysMin: 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
        longDateFormat: {
            LT: 'h[e]mm A',
            L: 'DD/MM/YYYY',
            LL: 'D [a viz] MMMM YYYY',
            LLL: 'D [a viz] MMMM YYYY LT',
            LLLL: 'dddd, D [a viz] MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[Hiziv da] LT',
            nextDay: '[Warc\'hoazh da] LT',
            nextWeek: 'dddd [da] LT',
            lastDay: '[Dec\'h da] LT',
            lastWeek: 'dddd [paset da] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: 'a-benn %s',
            past: '%s \'zo',
            s: 'un nebeud segondenno\xF9',
            m: 'ur vunutenn',
            mm: relativeTimeWithMutation,
            h: 'un eur',
            hh: '%d eur',
            d: 'un devezh',
            dd: relativeTimeWithMutation,
            M: 'ur miz',
            MM: relativeTimeWithMutation,
            y: 'ur bloaz',
            yy: specialMutationForYears
        },
        ordinal: function (number) {
            var output = number === 1 ? 'a\xF1' : 'vet';
            return number + output;
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/bn', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u09E7',
            '2': '\u09E8',
            '3': '\u09E9',
            '4': '\u09EA',
            '5': '\u09EB',
            '6': '\u09EC',
            '7': '\u09ED',
            '8': '\u09EE',
            '9': '\u09EF',
            '0': '\u09E6'
        }, numberMap = {
            '\u09E7': '1',
            '\u09E8': '2',
            '\u09E9': '3',
            '\u09EA': '4',
            '\u09EB': '5',
            '\u09EC': '6',
            '\u09ED': '7',
            '\u09EE': '8',
            '\u09EF': '9',
            '\u09E6': '0'
        };
    return moment.lang('bn', {
        months: '\u099C\u09BE\u09A8\u09C1\u09DF\u09BE\u09B0\u09C0_\u09AB\u09C7\u09AC\u09C1\u09DF\u09BE\u09B0\u09C0_\u09AE\u09BE\u09B0\u09CD\u099A_\u098F\u09AA\u09CD\u09B0\u09BF\u09B2_\u09AE\u09C7_\u099C\u09C1\u09A8_\u099C\u09C1\u09B2\u09BE\u0987_\u0985\u0997\u09BE\u09B8\u09CD\u099F_\u09B8\u09C7\u09AA\u09CD\u099F\u09C7\u09AE\u09CD\u09AC\u09B0_\u0985\u0995\u09CD\u099F\u09CB\u09AC\u09B0_\u09A8\u09AD\u09C7\u09AE\u09CD\u09AC\u09B0_\u09A1\u09BF\u09B8\u09C7\u09AE\u09CD\u09AC\u09B0'.split('_'),
        monthsShort: '\u099C\u09BE\u09A8\u09C1_\u09AB\u09C7\u09AC_\u09AE\u09BE\u09B0\u09CD\u099A_\u098F\u09AA\u09B0_\u09AE\u09C7_\u099C\u09C1\u09A8_\u099C\u09C1\u09B2_\u0985\u0997_\u09B8\u09C7\u09AA\u09CD\u099F_\u0985\u0995\u09CD\u099F\u09CB_\u09A8\u09AD_\u09A1\u09BF\u09B8\u09C7\u09AE\u09CD'.split('_'),
        weekdays: '\u09B0\u09AC\u09BF\u09AC\u09BE\u09B0_\u09B8\u09CB\u09AE\u09AC\u09BE\u09B0_\u09AE\u0999\u09CD\u0997\u09B2\u09AC\u09BE\u09B0_\u09AC\u09C1\u09A7\u09AC\u09BE\u09B0_\u09AC\u09C3\u09B9\u09B8\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF\u09AC\u09BE\u09B0_\u09B6\u09C1\u0995\u09CD\u09B0\u09C1\u09AC\u09BE\u09B0_\u09B6\u09A8\u09BF\u09AC\u09BE\u09B0'.split('_'),
        weekdaysShort: '\u09B0\u09AC\u09BF_\u09B8\u09CB\u09AE_\u09AE\u0999\u09CD\u0997\u09B2_\u09AC\u09C1\u09A7_\u09AC\u09C3\u09B9\u09B8\u09CD\u09AA\u09A4\u09CD\u09A4\u09BF_\u09B6\u09C1\u0995\u09CD\u09B0\u09C1_\u09B6\u09A8\u09BF'.split('_'),
        weekdaysMin: '\u09B0\u09AC_\u09B8\u09AE_\u09AE\u0999\u09CD\u0997_\u09AC\u09C1_\u09AC\u09CD\u09B0\u09BF\u09B9_\u09B6\u09C1_\u09B6\u09A8\u09BF'.split('_'),
        longDateFormat: {
            LT: 'A h:mm \u09B8\u09AE\u09DF',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY, LT',
            LLLL: 'dddd, D MMMM YYYY, LT'
        },
        calendar: {
            sameDay: '[\u0986\u099C] LT',
            nextDay: '[\u0986\u0997\u09BE\u09AE\u09C0\u0995\u09BE\u09B2] LT',
            nextWeek: 'dddd, LT',
            lastDay: '[\u0997\u09A4\u0995\u09BE\u09B2] LT',
            lastWeek: '[\u0997\u09A4] dddd, LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s \u09AA\u09B0\u09C7',
            past: '%s \u0986\u0997\u09C7',
            s: '\u0995\u098F\u0995 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1',
            m: '\u098F\u0995 \u09AE\u09BF\u09A8\u09BF\u099F',
            mm: '%d \u09AE\u09BF\u09A8\u09BF\u099F',
            h: '\u098F\u0995 \u0998\u09A8\u09CD\u099F\u09BE',
            hh: '%d \u0998\u09A8\u09CD\u099F\u09BE',
            d: '\u098F\u0995 \u09A6\u09BF\u09A8',
            dd: '%d \u09A6\u09BF\u09A8',
            M: '\u098F\u0995 \u09AE\u09BE\u09B8',
            MM: '%d \u09AE\u09BE\u09B8',
            y: '\u098F\u0995 \u09AC\u099B\u09B0',
            yy: '%d \u09AC\u099B\u09B0'
        },
        preparse: function (string) {
            return string.replace(/[১২৩৪৫৬৭৮৯০]/g, function (match) {
                return numberMap[match];
            });
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            });
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return '\u09B0\u09BE\u09A4';
            } else if (hour < 10) {
                return '\u09B6\u0995\u09BE\u09B2';
            } else if (hour < 17) {
                return '\u09A6\u09C1\u09AA\u09C1\u09B0';
            } else if (hour < 20) {
                return '\u09AC\u09BF\u0995\u09C7\u09B2';
            } else {
                return '\u09B0\u09BE\u09A4';
            }
        },
        week: {
            dow: 0,
            doy: 6
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/bg', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('bg', {
        months: '\u044F\u043D\u0443\u0430\u0440\u0438_\u0444\u0435\u0432\u0440\u0443\u0430\u0440\u0438_\u043C\u0430\u0440\u0442_\u0430\u043F\u0440\u0438\u043B_\u043C\u0430\u0439_\u044E\u043D\u0438_\u044E\u043B\u0438_\u0430\u0432\u0433\u0443\u0441\u0442_\u0441\u0435\u043F\u0442\u0435\u043C\u0432\u0440\u0438_\u043E\u043A\u0442\u043E\u043C\u0432\u0440\u0438_\u043D\u043E\u0435\u043C\u0432\u0440\u0438_\u0434\u0435\u043A\u0435\u043C\u0432\u0440\u0438'.split('_'),
        monthsShort: '\u044F\u043D\u0440_\u0444\u0435\u0432_\u043C\u0430\u0440_\u0430\u043F\u0440_\u043C\u0430\u0439_\u044E\u043D\u0438_\u044E\u043B\u0438_\u0430\u0432\u0433_\u0441\u0435\u043F_\u043E\u043A\u0442_\u043D\u043E\u0435_\u0434\u0435\u043A'.split('_'),
        weekdays: '\u043D\u0435\u0434\u0435\u043B\u044F_\u043F\u043E\u043D\u0435\u0434\u0435\u043B\u043D\u0438\u043A_\u0432\u0442\u043E\u0440\u043D\u0438\u043A_\u0441\u0440\u044F\u0434\u0430_\u0447\u0435\u0442\u0432\u044A\u0440\u0442\u044A\u043A_\u043F\u0435\u0442\u044A\u043A_\u0441\u044A\u0431\u043E\u0442\u0430'.split('_'),
        weekdaysShort: '\u043D\u0435\u0434_\u043F\u043E\u043D_\u0432\u0442\u043E_\u0441\u0440\u044F_\u0447\u0435\u0442_\u043F\u0435\u0442_\u0441\u044A\u0431'.split('_'),
        weekdaysMin: '\u043D\u0434_\u043F\u043D_\u0432\u0442_\u0441\u0440_\u0447\u0442_\u043F\u0442_\u0441\u0431'.split('_'),
        longDateFormat: {
            LT: 'H:mm',
            L: 'D.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u0414\u043D\u0435\u0441 \u0432] LT',
            nextDay: '[\u0423\u0442\u0440\u0435 \u0432] LT',
            nextWeek: 'dddd [\u0432] LT',
            lastDay: '[\u0412\u0447\u0435\u0440\u0430 \u0432] LT',
            lastWeek: function () {
                switch (this.day()) {
                case 0:
                case 3:
                case 6:
                    return '[\u0412 \u0438\u0437\u043C\u0438\u043D\u0430\u043B\u0430\u0442\u0430] dddd [\u0432] LT';
                case 1:
                case 2:
                case 4:
                case 5:
                    return '[\u0412 \u0438\u0437\u043C\u0438\u043D\u0430\u043B\u0438\u044F] dddd [\u0432] LT';
                }
            },
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0441\u043B\u0435\u0434 %s',
            past: '\u043F\u0440\u0435\u0434\u0438 %s',
            s: '\u043D\u044F\u043A\u043E\u043B\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434\u0438',
            m: '\u043C\u0438\u043D\u0443\u0442\u0430',
            mm: '%d \u043C\u0438\u043D\u0443\u0442\u0438',
            h: '\u0447\u0430\u0441',
            hh: '%d \u0447\u0430\u0441\u0430',
            d: '\u0434\u0435\u043D',
            dd: '%d \u0434\u043D\u0438',
            M: '\u043C\u0435\u0441\u0435\u0446',
            MM: '%d \u043C\u0435\u0441\u0435\u0446\u0430',
            y: '\u0433\u043E\u0434\u0438\u043D\u0430',
            yy: '%d \u0433\u043E\u0434\u0438\u043D\u0438'
        },
        ordinal: function (number) {
            var lastDigit = number % 10, last2Digits = number % 100;
            if (number === 0) {
                return number + '-\u0435\u0432';
            } else if (last2Digits === 0) {
                return number + '-\u0435\u043D';
            } else if (last2Digits > 10 && last2Digits < 20) {
                return number + '-\u0442\u0438';
            } else if (lastDigit === 1) {
                return number + '-\u0432\u0438';
            } else if (lastDigit === 2) {
                return number + '-\u0440\u0438';
            } else if (lastDigit === 7 || lastDigit === 8) {
                return number + '-\u043C\u0438';
            } else {
                return number + '-\u0442\u0438';
            }
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/az', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var suffixes = {
        1: '-inci',
        5: '-inci',
        8: '-inci',
        70: '-inci',
        80: '-inci',
        2: '-nci',
        7: '-nci',
        20: '-nci',
        50: '-nci',
        3: '-\xFCnc\xFC',
        4: '-\xFCnc\xFC',
        100: '-\xFCnc\xFC',
        6: '-nc\u0131',
        9: '-uncu',
        10: '-uncu',
        30: '-uncu',
        60: '-\u0131nc\u0131',
        90: '-\u0131nc\u0131'
    };
    return moment.lang('az', {
        months: 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
        monthsShort: 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
        weekdays: 'Bazar_Bazar ert\u0259si_\xC7\u0259r\u015F\u0259nb\u0259 ax\u015Fam\u0131_\xC7\u0259r\u015F\u0259nb\u0259_C\xFCm\u0259 ax\u015Fam\u0131_C\xFCm\u0259_\u015E\u0259nb\u0259'.split('_'),
        weekdaysShort: 'Baz_BzE_\xC7Ax_\xC7\u0259r_CAx_C\xFCm_\u015E\u0259n'.split('_'),
        weekdaysMin: 'Bz_BE_\xC7A_\xC7\u0259_CA_C\xFC_\u015E\u0259'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd, D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[bug\xFCn saat] LT',
            nextDay: '[sabah saat] LT',
            nextWeek: '[g\u0259l\u0259n h\u0259ft\u0259] dddd [saat] LT',
            lastDay: '[d\xFCn\u0259n] LT',
            lastWeek: '[ke\xE7\u0259n h\u0259ft\u0259] dddd [saat] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '%s sonra',
            past: '%s \u0259vv\u0259l',
            s: 'birne\xE7\u0259 saniyy\u0259',
            m: 'bir d\u0259qiq\u0259',
            mm: '%d d\u0259qiq\u0259',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir g\xFCn',
            dd: '%d g\xFCn',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir il',
            yy: '%d il'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 4) {
                return 'gec\u0259';
            } else if (hour < 12) {
                return 's\u0259h\u0259r';
            } else if (hour < 17) {
                return 'g\xFCnd\xFCz';
            } else {
                return 'ax\u015Fam';
            }
        },
        ordinal: function (number) {
            if (number === 0) {
                return number + '-\u0131nc\u0131';
            }
            var a = number % 10, b = number % 100 - a, c = number >= 100 ? 100 : null;
            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
        },
        week: {
            dow: 1,
            doy: 7
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ar', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0661',
            '2': '\u0662',
            '3': '\u0663',
            '4': '\u0664',
            '5': '\u0665',
            '6': '\u0666',
            '7': '\u0667',
            '8': '\u0668',
            '9': '\u0669',
            '0': '\u0660'
        }, numberMap = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0'
        };
    return moment.lang('ar', {
        months: '\u064A\u0646\u0627\u064A\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u0641\u0628\u0631\u0627\u064A\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064A\u0644/ \u0646\u064A\u0633\u0627\u0646_\u0645\u0627\u064A\u0648/ \u0623\u064A\u0627\u0631_\u064A\u0648\u0646\u064A\u0648/ \u062D\u0632\u064A\u0631\u0627\u0646_\u064A\u0648\u0644\u064A\u0648/ \u062A\u0645\u0648\u0632_\u0623\u063A\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062A\u0645\u0628\u0631/ \u0623\u064A\u0644\u0648\u0644_\u0623\u0643\u062A\u0648\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u062F\u064A\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        monthsShort: '\u064A\u0646\u0627\u064A\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u0641\u0628\u0631\u0627\u064A\u0631/ \u0634\u0628\u0627\u0637_\u0645\u0627\u0631\u0633/ \u0622\u0630\u0627\u0631_\u0623\u0628\u0631\u064A\u0644/ \u0646\u064A\u0633\u0627\u0646_\u0645\u0627\u064A\u0648/ \u0623\u064A\u0627\u0631_\u064A\u0648\u0646\u064A\u0648/ \u062D\u0632\u064A\u0631\u0627\u0646_\u064A\u0648\u0644\u064A\u0648/ \u062A\u0645\u0648\u0632_\u0623\u063A\u0633\u0637\u0633/ \u0622\u0628_\u0633\u0628\u062A\u0645\u0628\u0631/ \u0623\u064A\u0644\u0648\u0644_\u0623\u0643\u062A\u0648\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u0623\u0648\u0644_\u0646\u0648\u0641\u0645\u0628\u0631/ \u062A\u0634\u0631\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u064A_\u062F\u064A\u0633\u0645\u0628\u0631/ \u0643\u0627\u0646\u0648\u0646 \u0627\u0644\u0623\u0648\u0644'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062D\u062F_\u0627\u0644\u0625\u062B\u0646\u064A\u0646_\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062E\u0645\u064A\u0633_\u0627\u0644\u062C\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062A'.split('_'),
        weekdaysShort: '\u0623\u062D\u062F_\u0625\u062B\u0646\u064A\u0646_\u062B\u0644\u0627\u062B\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062E\u0645\u064A\u0633_\u062C\u0645\u0639\u0629_\u0633\u0628\u062A'.split('_'),
        weekdaysMin: '\u062D_\u0646_\u062B_\u0631_\u062E_\u062C_\u0633'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u0635';
            } else {
                return '\u0645';
            }
        },
        calendar: {
            sameDay: '[\u0627\u0644\u064A\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay: '[\u063A\u062F\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0641\u064A %s',
            past: '\u0645\u0646\u0630 %s',
            s: '\u062B\u0648\u0627\u0646',
            m: '\u062F\u0642\u064A\u0642\u0629',
            mm: '%d \u062F\u0642\u0627\u0626\u0642',
            h: '\u0633\u0627\u0639\u0629',
            hh: '%d \u0633\u0627\u0639\u0627\u062A',
            d: '\u064A\u0648\u0645',
            dd: '%d \u0623\u064A\u0627\u0645',
            M: '\u0634\u0647\u0631',
            MM: '%d \u0623\u0634\u0647\u0631',
            y: '\u0633\u0646\u0629',
            yy: '%d \u0633\u0646\u0648\u0627\u062A'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '\u060C');
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ar-sa', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    var symbolMap = {
            '1': '\u0661',
            '2': '\u0662',
            '3': '\u0663',
            '4': '\u0664',
            '5': '\u0665',
            '6': '\u0666',
            '7': '\u0667',
            '8': '\u0668',
            '9': '\u0669',
            '0': '\u0660'
        }, numberMap = {
            '\u0661': '1',
            '\u0662': '2',
            '\u0663': '3',
            '\u0664': '4',
            '\u0665': '5',
            '\u0666': '6',
            '\u0667': '7',
            '\u0668': '8',
            '\u0669': '9',
            '\u0660': '0'
        };
    return moment.lang('ar-sa', {
        months: '\u064A\u0646\u0627\u064A\u0631_\u0641\u0628\u0631\u0627\u064A\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064A\u0644_\u0645\u0627\u064A\u0648_\u064A\u0648\u0646\u064A\u0648_\u064A\u0648\u0644\u064A\u0648_\u0623\u063A\u0633\u0637\u0633_\u0633\u0628\u062A\u0645\u0628\u0631_\u0623\u0643\u062A\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062F\u064A\u0633\u0645\u0628\u0631'.split('_'),
        monthsShort: '\u064A\u0646\u0627\u064A\u0631_\u0641\u0628\u0631\u0627\u064A\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064A\u0644_\u0645\u0627\u064A\u0648_\u064A\u0648\u0646\u064A\u0648_\u064A\u0648\u0644\u064A\u0648_\u0623\u063A\u0633\u0637\u0633_\u0633\u0628\u062A\u0645\u0628\u0631_\u0623\u0643\u062A\u0648\u0628\u0631_\u0646\u0648\u0641\u0645\u0628\u0631_\u062F\u064A\u0633\u0645\u0628\u0631'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062D\u062F_\u0627\u0644\u0625\u062B\u0646\u064A\u0646_\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062E\u0645\u064A\u0633_\u0627\u0644\u062C\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062A'.split('_'),
        weekdaysShort: '\u0623\u062D\u062F_\u0625\u062B\u0646\u064A\u0646_\u062B\u0644\u0627\u062B\u0627\u0621_\u0623\u0631\u0628\u0639\u0627\u0621_\u062E\u0645\u064A\u0633_\u062C\u0645\u0639\u0629_\u0633\u0628\u062A'.split('_'),
        weekdaysMin: '\u062D_\u0646_\u062B_\u0631_\u062E_\u062C_\u0633'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        meridiem: function (hour, minute, isLower) {
            if (hour < 12) {
                return '\u0635';
            } else {
                return '\u0645';
            }
        },
        calendar: {
            sameDay: '[\u0627\u0644\u064A\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay: '[\u063A\u062F\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0641\u064A %s',
            past: '\u0645\u0646\u0630 %s',
            s: '\u062B\u0648\u0627\u0646',
            m: '\u062F\u0642\u064A\u0642\u0629',
            mm: '%d \u062F\u0642\u0627\u0626\u0642',
            h: '\u0633\u0627\u0639\u0629',
            hh: '%d \u0633\u0627\u0639\u0627\u062A',
            d: '\u064A\u0648\u0645',
            dd: '%d \u0623\u064A\u0627\u0645',
            M: '\u0634\u0647\u0631',
            MM: '%d \u0623\u0634\u0647\u0631',
            y: '\u0633\u0646\u0629',
            yy: '%d \u0633\u0646\u0648\u0627\u062A'
        },
        preparse: function (string) {
            return string.replace(/[۰-۹]/g, function (match) {
                return numberMap[match];
            }).replace(/،/g, ',');
        },
        postformat: function (string) {
            return string.replace(/\d/g, function (match) {
                return symbolMap[match];
            }).replace(/,/g, '\u060C');
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

define('moment/moment', [
    'require',
    'exports',
    'module'
], function (require, exports, module) {
    (function (undefined) {
        var moment, VERSION = '2.7.0', globalScope = typeof global !== 'undefined' ? global : this, oldGlobalMoment, round = Math.round, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
                _isAMomentObject: null,
                _i: null,
                _f: null,
                _l: null,
                _strict: null,
                _tzm: null,
                _isUTC: null,
                _offset: null,
                _pf: null,
                _lang: null
            }, hasModule = typeof module !== 'undefined' && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOrdinal = /\d{1,2}/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = 'YYYY-MM-DDTHH:mm:ssZ', isoDates = [
                [
                    'YYYYYY-MM-DD',
                    /[+-]\d{6}-\d{2}-\d{2}/
                ],
                [
                    'YYYY-MM-DD',
                    /\d{4}-\d{2}-\d{2}/
                ],
                [
                    'GGGG-[W]WW-E',
                    /\d{4}-W\d{2}-\d/
                ],
                [
                    'GGGG-[W]WW',
                    /\d{4}-W\d{2}/
                ],
                [
                    'YYYY-DDD',
                    /\d{4}-\d{3}/
                ]
            ], isoTimes = [
                [
                    'HH:mm:ss.SSSS',
                    /(T| )\d\d:\d\d:\d\d\.\d+/
                ],
                [
                    'HH:mm:ss',
                    /(T| )\d\d:\d\d:\d\d/
                ],
                [
                    'HH:mm',
                    /(T| )\d\d:\d\d/
                ],
                [
                    'HH',
                    /(T| )\d\d/
                ]
            ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'), unitMillisecondFactors = {
                'Milliseconds': 1,
                'Seconds': 1000,
                'Minutes': 60000,
                'Hours': 3600000,
                'Days': 86400000,
                'Months': 2592000000,
                'Years': 31536000000
            }, unitAliases = {
                ms: 'millisecond',
                s: 'second',
                m: 'minute',
                h: 'hour',
                d: 'day',
                D: 'date',
                w: 'week',
                W: 'isoWeek',
                M: 'month',
                Q: 'quarter',
                y: 'year',
                DDD: 'dayOfYear',
                e: 'weekday',
                E: 'isoWeekday',
                gg: 'weekYear',
                GG: 'isoWeekYear'
            }, camelFunctions = {
                dayofyear: 'dayOfYear',
                isoweekday: 'isoWeekday',
                isoweek: 'isoWeek',
                weekyear: 'weekYear',
                isoweekyear: 'isoWeekYear'
            }, formatFunctions = {}, relativeTimeThresholds = {
                s: 45,
                m: 45,
                h: 22,
                dd: 25,
                dm: 45,
                dy: 345
            }, ordinalizeTokens = 'DDD w W M D d'.split(' '), paddedTokens = 'M D H h m s w W'.split(' '), formatTokenFunctions = {
                M: function () {
                    return this.month() + 1;
                },
                MMM: function (format) {
                    return this.lang().monthsShort(this, format);
                },
                MMMM: function (format) {
                    return this.lang().months(this, format);
                },
                D: function () {
                    return this.date();
                },
                DDD: function () {
                    return this.dayOfYear();
                },
                d: function () {
                    return this.day();
                },
                dd: function (format) {
                    return this.lang().weekdaysMin(this, format);
                },
                ddd: function (format) {
                    return this.lang().weekdaysShort(this, format);
                },
                dddd: function (format) {
                    return this.lang().weekdays(this, format);
                },
                w: function () {
                    return this.week();
                },
                W: function () {
                    return this.isoWeek();
                },
                YY: function () {
                    return leftZeroFill(this.year() % 100, 2);
                },
                YYYY: function () {
                    return leftZeroFill(this.year(), 4);
                },
                YYYYY: function () {
                    return leftZeroFill(this.year(), 5);
                },
                YYYYYY: function () {
                    var y = this.year(), sign = y >= 0 ? '+' : '-';
                    return sign + leftZeroFill(Math.abs(y), 6);
                },
                gg: function () {
                    return leftZeroFill(this.weekYear() % 100, 2);
                },
                gggg: function () {
                    return leftZeroFill(this.weekYear(), 4);
                },
                ggggg: function () {
                    return leftZeroFill(this.weekYear(), 5);
                },
                GG: function () {
                    return leftZeroFill(this.isoWeekYear() % 100, 2);
                },
                GGGG: function () {
                    return leftZeroFill(this.isoWeekYear(), 4);
                },
                GGGGG: function () {
                    return leftZeroFill(this.isoWeekYear(), 5);
                },
                e: function () {
                    return this.weekday();
                },
                E: function () {
                    return this.isoWeekday();
                },
                a: function () {
                    return this.lang().meridiem(this.hours(), this.minutes(), true);
                },
                A: function () {
                    return this.lang().meridiem(this.hours(), this.minutes(), false);
                },
                H: function () {
                    return this.hours();
                },
                h: function () {
                    return this.hours() % 12 || 12;
                },
                m: function () {
                    return this.minutes();
                },
                s: function () {
                    return this.seconds();
                },
                S: function () {
                    return toInt(this.milliseconds() / 100);
                },
                SS: function () {
                    return leftZeroFill(toInt(this.milliseconds() / 10), 2);
                },
                SSS: function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                SSSS: function () {
                    return leftZeroFill(this.milliseconds(), 3);
                },
                Z: function () {
                    var a = -this.zone(), b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
                },
                ZZ: function () {
                    var a = -this.zone(), b = '+';
                    if (a < 0) {
                        a = -a;
                        b = '-';
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
                },
                z: function () {
                    return this.zoneAbbr();
                },
                zz: function () {
                    return this.zoneName();
                },
                X: function () {
                    return this.unix();
                },
                Q: function () {
                    return this.quarter();
                }
            }, lists = [
                'months',
                'monthsShort',
                'weekdays',
                'weekdaysShort',
                'weekdaysMin'
            ];
        function dfl(a, b, c) {
            switch (arguments.length) {
            case 2:
                return a != null ? a : b;
            case 3:
                return a != null ? a : b != null ? b : c;
            default:
                throw new Error('Implement me');
            }
        }
        function defaultParsingFlags() {
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false
            };
        }
        function deprecate(msg, fn) {
            var firstTime = true;
            function printMsg() {
                if (moment.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
                    console.warn('Deprecation warning: ' + msg);
                }
            }
            return extend(function () {
                if (firstTime) {
                    printMsg();
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }
        function padToken(func, count) {
            return function (a) {
                return leftZeroFill(func.call(this, a), count);
            };
        }
        function ordinalizeToken(func, period) {
            return function (a) {
                return this.lang().ordinal(func.call(this, a), period);
            };
        }
        while (ordinalizeTokens.length) {
            i = ordinalizeTokens.pop();
            formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
        }
        while (paddedTokens.length) {
            i = paddedTokens.pop();
            formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
        }
        formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
        function Language() {
        }
        function Moment(config) {
            checkOverflow(config);
            extend(this, config);
        }
        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
            this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;
            this._days = +days + weeks * 7;
            this._months = +months + quarters * 3 + years * 12;
            this._data = {};
            this._bubble();
        }
        function extend(a, b) {
            for (var i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
            if (b.hasOwnProperty('toString')) {
                a.toString = b.toString;
            }
            if (b.hasOwnProperty('valueOf')) {
                a.valueOf = b.valueOf;
            }
            return a;
        }
        function cloneMoment(m) {
            var result = {}, i;
            for (i in m) {
                if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                    result[i] = m[i];
                }
            }
            return result;
        }
        function absRound(number) {
            if (number < 0) {
                return Math.ceil(number);
            } else {
                return Math.floor(number);
            }
        }
        function leftZeroFill(number, targetLength, forceSign) {
            var output = '' + Math.abs(number), sign = number >= 0;
            while (output.length < targetLength) {
                output = '0' + output;
            }
            return (sign ? forceSign ? '+' : '' : '-') + output;
        }
        function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
            updateOffset = updateOffset == null ? true : updateOffset;
            if (milliseconds) {
                mom._d.setTime(+mom._d + milliseconds * isAdding);
            }
            if (days) {
                rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
            }
            if (months) {
                rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
            }
            if (updateOffset) {
                moment.updateOffset(mom, days || months);
            }
        }
        function isArray(input) {
            return Object.prototype.toString.call(input) === '[object Array]';
        }
        function isDate(input) {
            return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
        }
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
            for (i = 0; i < len; i++) {
                if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }
        function normalizeUnits(units) {
            if (units) {
                var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
                units = unitAliases[units] || camelFunctions[lowered] || lowered;
            }
            return units;
        }
        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {}, normalizedProp, prop;
            for (prop in inputObject) {
                if (inputObject.hasOwnProperty(prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }
            return normalizedInput;
        }
        function makeList(field) {
            var count, setter;
            if (field.indexOf('week') === 0) {
                count = 7;
                setter = 'day';
            } else if (field.indexOf('month') === 0) {
                count = 12;
                setter = 'month';
            } else {
                return;
            }
            moment[field] = function (format, index) {
                var i, getter, method = moment.fn._lang[field], results = [];
                if (typeof format === 'number') {
                    index = format;
                    format = undefined;
                }
                getter = function (i) {
                    var m = moment().utc().set(setter, i);
                    return method.call(moment.fn._lang, m, format || '');
                };
                if (index != null) {
                    return getter(index);
                } else {
                    for (i = 0; i < count; i++) {
                        results.push(getter(i));
                    }
                    return results;
                }
            };
        }
        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion, value = 0;
            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                if (coercedNumber >= 0) {
                    value = Math.floor(coercedNumber);
                } else {
                    value = Math.ceil(coercedNumber);
                }
            }
            return value;
        }
        function daysInMonth(year, month) {
            return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        }
        function weeksInYear(year, dow, doy) {
            return weekOfYear(moment([
                year,
                11,
                31 + dow - doy
            ]), dow, doy).week;
        }
        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }
        function isLeapYear(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }
        function checkOverflow(m) {
            var overflow;
            if (m._a && m._pf.overflow === -2) {
                overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
                if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }
                m._pf.overflow = overflow;
            }
        }
        function isValid(m) {
            if (m._isValid == null) {
                m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
                if (m._strict) {
                    m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
                }
            }
            return m._isValid;
        }
        function normalizeLanguage(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }
        function makeAs(input, model) {
            return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
        }
        extend(Language.prototype, {
            set: function (config) {
                var prop, i;
                for (i in config) {
                    prop = config[i];
                    if (typeof prop === 'function') {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            },
            _months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            months: function (m) {
                return this._months[m.month()];
            },
            _monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            monthsShort: function (m) {
                return this._monthsShort[m.month()];
            },
            monthsParse: function (monthName) {
                var i, mom, regex;
                if (!this._monthsParse) {
                    this._monthsParse = [];
                }
                for (i = 0; i < 12; i++) {
                    if (!this._monthsParse[i]) {
                        mom = moment.utc([
                            2000,
                            i
                        ]);
                        regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                        this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    if (this._monthsParse[i].test(monthName)) {
                        return i;
                    }
                }
            },
            _weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
            weekdays: function (m) {
                return this._weekdays[m.day()];
            },
            _weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysShort: function (m) {
                return this._weekdaysShort[m.day()];
            },
            _weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            weekdaysMin: function (m) {
                return this._weekdaysMin[m.day()];
            },
            weekdaysParse: function (weekdayName) {
                var i, mom, regex;
                if (!this._weekdaysParse) {
                    this._weekdaysParse = [];
                }
                for (i = 0; i < 7; i++) {
                    if (!this._weekdaysParse[i]) {
                        mom = moment([
                            2000,
                            1
                        ]).day(i);
                        regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                        this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                    }
                    if (this._weekdaysParse[i].test(weekdayName)) {
                        return i;
                    }
                }
            },
            _longDateFormat: {
                LT: 'h:mm A',
                L: 'MM/DD/YYYY',
                LL: 'MMMM D YYYY',
                LLL: 'MMMM D YYYY LT',
                LLLL: 'dddd, MMMM D YYYY LT'
            },
            longDateFormat: function (key) {
                var output = this._longDateFormat[key];
                if (!output && this._longDateFormat[key.toUpperCase()]) {
                    output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                        return val.slice(1);
                    });
                    this._longDateFormat[key] = output;
                }
                return output;
            },
            isPM: function (input) {
                return (input + '').toLowerCase().charAt(0) === 'p';
            },
            _meridiemParse: /[ap]\.?m?\.?/i,
            meridiem: function (hours, minutes, isLower) {
                if (hours > 11) {
                    return isLower ? 'pm' : 'PM';
                } else {
                    return isLower ? 'am' : 'AM';
                }
            },
            _calendar: {
                sameDay: '[Today at] LT',
                nextDay: '[Tomorrow at] LT',
                nextWeek: 'dddd [at] LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[Last] dddd [at] LT',
                sameElse: 'L'
            },
            calendar: function (key, mom) {
                var output = this._calendar[key];
                return typeof output === 'function' ? output.apply(mom) : output;
            },
            _relativeTime: {
                future: 'in %s',
                past: '%s ago',
                s: 'a few seconds',
                m: 'a minute',
                mm: '%d minutes',
                h: 'an hour',
                hh: '%d hours',
                d: 'a day',
                dd: '%d days',
                M: 'a month',
                MM: '%d months',
                y: 'a year',
                yy: '%d years'
            },
            relativeTime: function (number, withoutSuffix, string, isFuture) {
                var output = this._relativeTime[string];
                return typeof output === 'function' ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
            },
            pastFuture: function (diff, output) {
                var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
                return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
            },
            ordinal: function (number) {
                return this._ordinal.replace('%d', number);
            },
            _ordinal: '%d',
            preparse: function (string) {
                return string;
            },
            postformat: function (string) {
                return string;
            },
            week: function (mom) {
                return weekOfYear(mom, this._week.dow, this._week.doy).week;
            },
            _week: {
                dow: 0,
                doy: 6
            },
            _invalidDate: 'Invalid date',
            invalidDate: function () {
                return this._invalidDate;
            }
        });
        function loadLang(key, values) {
            values.abbr = key;
            if (!languages[key]) {
                languages[key] = new Language();
            }
            languages[key].set(values);
            return languages[key];
        }
        function unloadLang(key) {
            delete languages[key];
        }
        function getLangDefinition(key) {
            var i = 0, j, lang, next, split, get = function (k) {
                    if (!languages[k] && hasModule) {
                        try {
                            require('./lang/' + k);
                        } catch (e) {
                        }
                    }
                    return languages[k];
                };
            if (!key) {
                return moment.fn._lang;
            }
            if (!isArray(key)) {
                lang = get(key);
                if (lang) {
                    return lang;
                }
                key = [key];
            }
            while (i < key.length) {
                split = normalizeLanguage(key[i]).split('-');
                j = split.length;
                next = normalizeLanguage(key[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    lang = get(split.slice(0, j).join('-'));
                    if (lang) {
                        return lang;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        break;
                    }
                    j--;
                }
                i++;
            }
            return moment.fn._lang;
        }
        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }
        function makeFormatFunction(format) {
            var array = format.match(formattingTokens), i, length;
            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }
            return function (mom) {
                var output = '';
                for (i = 0; i < length; i++) {
                    output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.lang().invalidDate();
            }
            format = expandFormat(format, m.lang());
            if (!formatFunctions[format]) {
                formatFunctions[format] = makeFormatFunction(format);
            }
            return formatFunctions[format](m);
        }
        function expandFormat(format, lang) {
            var i = 5;
            function replaceLongDateFormatTokens(input) {
                return lang.longDateFormat(input) || input;
            }
            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }
            return format;
        }
        function getParseRegexForToken(token, config) {
            var a, strict = config._strict;
            switch (token) {
            case 'Q':
                return parseTokenOneDigit;
            case 'DDDD':
                return parseTokenThreeDigits;
            case 'YYYY':
            case 'GGGG':
            case 'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case 'Y':
            case 'G':
            case 'g':
                return parseTokenSignedNumber;
            case 'YYYYYY':
            case 'YYYYY':
            case 'GGGGG':
            case 'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case 'S':
                if (strict) {
                    return parseTokenOneDigit;
                }
            case 'SS':
                if (strict) {
                    return parseTokenTwoDigits;
                }
            case 'SSS':
                if (strict) {
                    return parseTokenThreeDigits;
                }
            case 'DDD':
                return parseTokenOneToThreeDigits;
            case 'MMM':
            case 'MMMM':
            case 'dd':
            case 'ddd':
            case 'dddd':
                return parseTokenWord;
            case 'a':
            case 'A':
                return getLangDefinition(config._l)._meridiemParse;
            case 'X':
                return parseTokenTimestampMs;
            case 'Z':
            case 'ZZ':
                return parseTokenTimezone;
            case 'T':
                return parseTokenT;
            case 'SSSS':
                return parseTokenDigits;
            case 'MM':
            case 'DD':
            case 'YY':
            case 'GG':
            case 'gg':
            case 'HH':
            case 'hh':
            case 'mm':
            case 'ss':
            case 'ww':
            case 'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case 'M':
            case 'D':
            case 'd':
            case 'H':
            case 'h':
            case 'm':
            case 's':
            case 'w':
            case 'W':
            case 'e':
            case 'E':
                return parseTokenOneOrTwoDigits;
            case 'Do':
                return parseTokenOrdinal;
            default:
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
                return a;
            }
        }
        function timezoneMinutesFromString(string) {
            string = string || '';
            var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + '').match(parseTimezoneChunker) || [
                    '-',
                    0,
                    0
                ], minutes = +(parts[1] * 60) + toInt(parts[2]);
            return parts[0] === '+' ? -minutes : minutes;
        }
        function addTimeToArrayFromToken(token, input, config) {
            var a, datePartArray = config._a;
            switch (token) {
            case 'Q':
                if (input != null) {
                    datePartArray[MONTH] = (toInt(input) - 1) * 3;
                }
                break;
            case 'M':
            case 'MM':
                if (input != null) {
                    datePartArray[MONTH] = toInt(input) - 1;
                }
                break;
            case 'MMM':
            case 'MMMM':
                a = getLangDefinition(config._l).monthsParse(input);
                if (a != null) {
                    datePartArray[MONTH] = a;
                } else {
                    config._pf.invalidMonth = input;
                }
                break;
            case 'D':
            case 'DD':
                if (input != null) {
                    datePartArray[DATE] = toInt(input);
                }
                break;
            case 'Do':
                if (input != null) {
                    datePartArray[DATE] = toInt(parseInt(input, 10));
                }
                break;
            case 'DDD':
            case 'DDDD':
                if (input != null) {
                    config._dayOfYear = toInt(input);
                }
                break;
            case 'YY':
                datePartArray[YEAR] = moment.parseTwoDigitYear(input);
                break;
            case 'YYYY':
            case 'YYYYY':
            case 'YYYYYY':
                datePartArray[YEAR] = toInt(input);
                break;
            case 'a':
            case 'A':
                config._isPm = getLangDefinition(config._l).isPM(input);
                break;
            case 'H':
            case 'HH':
            case 'h':
            case 'hh':
                datePartArray[HOUR] = toInt(input);
                break;
            case 'm':
            case 'mm':
                datePartArray[MINUTE] = toInt(input);
                break;
            case 's':
            case 'ss':
                datePartArray[SECOND] = toInt(input);
                break;
            case 'S':
            case 'SS':
            case 'SSS':
            case 'SSSS':
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            case 'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            case 'Z':
            case 'ZZ':
                config._useUTC = true;
                config._tzm = timezoneMinutesFromString(input);
                break;
            case 'dd':
            case 'ddd':
            case 'dddd':
                a = getLangDefinition(config._l).weekdaysParse(input);
                if (a != null) {
                    config._w = config._w || {};
                    config._w['d'] = a;
                } else {
                    config._pf.invalidWeekday = input;
                }
                break;
            case 'w':
            case 'ww':
            case 'W':
            case 'WW':
            case 'd':
            case 'e':
            case 'E':
                token = token.substr(0, 1);
            case 'gggg':
            case 'GGGG':
            case 'GGGGG':
                token = token.substr(0, 2);
                if (input) {
                    config._w = config._w || {};
                    config._w[token] = toInt(input);
                }
                break;
            case 'gg':
            case 'GG':
                config._w = config._w || {};
                config._w[token] = moment.parseTwoDigitYear(input);
            }
        }
        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, lang;
            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;
                weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
                week = dfl(w.W, 1);
                weekday = dfl(w.E, 1);
            } else {
                lang = getLangDefinition(config._l);
                dow = lang._week.dow;
                doy = lang._week.doy;
                weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
                week = dfl(w.w, 1);
                if (w.d != null) {
                    weekday = w.d;
                    if (weekday < dow) {
                        ++week;
                    }
                } else if (w.e != null) {
                    weekday = w.e + dow;
                } else {
                    weekday = dow;
                }
            }
            temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
        function dateFromConfig(config) {
            var i, date, input = [], currentDate, yearToUse;
            if (config._d) {
                return;
            }
            currentDate = currentDateArray(config);
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }
            if (config._dayOfYear) {
                yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);
                if (config._dayOfYear > daysInYear(yearToUse)) {
                    config._pf._overflowDayOfYear = true;
                }
                date = makeUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }
            for (; i < 7; i++) {
                config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
            }
            config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
            }
        }
        function dateFromObject(config) {
            var normalizedInput;
            if (config._d) {
                return;
            }
            normalizedInput = normalizeObjectUnits(config._i);
            config._a = [
                normalizedInput.year,
                normalizedInput.month,
                normalizedInput.day,
                normalizedInput.hour,
                normalizedInput.minute,
                normalizedInput.second,
                normalizedInput.millisecond
            ];
            dateFromConfig(config);
        }
        function currentDateArray(config) {
            var now = new Date();
            if (config._useUTC) {
                return [
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                ];
            } else {
                return [
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                ];
            }
        }
        function makeDateFromStringAndFormat(config) {
            if (config._f === moment.ISO_8601) {
                parseISO(config);
                return;
            }
            config._a = [];
            config._pf.empty = true;
            var lang = getLangDefinition(config._l), string = '' + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
            tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        config._pf.unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        config._pf.empty = false;
                    } else {
                        config._pf.unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    config._pf.unusedTokens.push(token);
                }
            }
            config._pf.charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                config._pf.unusedInput.push(string);
            }
            if (config._isPm && config._a[HOUR] < 12) {
                config._a[HOUR] += 12;
            }
            if (config._isPm === false && config._a[HOUR] === 12) {
                config._a[HOUR] = 0;
            }
            dateFromConfig(config);
            checkOverflow(config);
        }
        function unescapeFormat(s) {
            return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            });
        }
        function regexpEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        function makeDateFromStringAndArray(config) {
            var tempConfig, bestMoment, scoreToBeat, i, currentScore;
            if (config._f.length === 0) {
                config._pf.invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }
            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = extend({}, config);
                tempConfig._pf = defaultParsingFlags();
                tempConfig._f = config._f[i];
                makeDateFromStringAndFormat(tempConfig);
                if (!isValid(tempConfig)) {
                    continue;
                }
                currentScore += tempConfig._pf.charsLeftOver;
                currentScore += tempConfig._pf.unusedTokens.length * 10;
                tempConfig._pf.score = currentScore;
                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
            extend(config, bestMoment || tempConfig);
        }
        function parseISO(config) {
            var i, l, string = config._i, match = isoRegex.exec(string);
            if (match) {
                config._pf.iso = true;
                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(string)) {
                        config._f = isoDates[i][0] + (match[6] || ' ');
                        break;
                    }
                }
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(string)) {
                        config._f += isoTimes[i][0];
                        break;
                    }
                }
                if (string.match(parseTokenTimezone)) {
                    config._f += 'Z';
                }
                makeDateFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }
        function makeDateFromString(config) {
            parseISO(config);
            if (config._isValid === false) {
                delete config._isValid;
                moment.createFromInputFallback(config);
            }
        }
        function makeDateFromInput(config) {
            var input = config._i, matched = aspNetJsonRegex.exec(input);
            if (input === undefined) {
                config._d = new Date();
            } else if (matched) {
                config._d = new Date(+matched[1]);
            } else if (typeof input === 'string') {
                makeDateFromString(config);
            } else if (isArray(input)) {
                config._a = input.slice(0);
                dateFromConfig(config);
            } else if (isDate(input)) {
                config._d = new Date(+input);
            } else if (typeof input === 'object') {
                dateFromObject(config);
            } else if (typeof input === 'number') {
                config._d = new Date(input);
            } else {
                moment.createFromInputFallback(config);
            }
        }
        function makeDate(y, m, d, h, M, s, ms) {
            var date = new Date(y, m, d, h, M, s, ms);
            if (y < 1970) {
                date.setFullYear(y);
            }
            return date;
        }
        function makeUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));
            if (y < 1970) {
                date.setUTCFullYear(y);
            }
            return date;
        }
        function parseWeekday(input, language) {
            if (typeof input === 'string') {
                if (!isNaN(input)) {
                    input = parseInt(input, 10);
                } else {
                    input = language.weekdaysParse(input);
                    if (typeof input !== 'number') {
                        return null;
                    }
                }
            }
            return input;
        }
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
            return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }
        function relativeTime(milliseconds, withoutSuffix, lang) {
            var seconds = round(Math.abs(milliseconds) / 1000), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < relativeTimeThresholds.s && [
                    's',
                    seconds
                ] || minutes === 1 && ['m'] || minutes < relativeTimeThresholds.m && [
                    'mm',
                    minutes
                ] || hours === 1 && ['h'] || hours < relativeTimeThresholds.h && [
                    'hh',
                    hours
                ] || days === 1 && ['d'] || days <= relativeTimeThresholds.dd && [
                    'dd',
                    days
                ] || days <= relativeTimeThresholds.dm && ['M'] || days < relativeTimeThresholds.dy && [
                    'MM',
                    round(days / 30)
                ] || years === 1 && ['y'] || [
                    'yy',
                    years
                ];
            args[2] = withoutSuffix;
            args[3] = milliseconds > 0;
            args[4] = lang;
            return substituteTimeAgo.apply({}, args);
        }
        function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
            var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
            if (daysToDayOfWeek > end) {
                daysToDayOfWeek -= 7;
            }
            if (daysToDayOfWeek < end - 7) {
                daysToDayOfWeek += 7;
            }
            adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
            return {
                week: Math.ceil(adjustedMoment.dayOfYear() / 7),
                year: adjustedMoment.year()
            };
        }
        function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
            var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;
            d = d === 0 ? 7 : d;
            weekday = weekday != null ? weekday : firstDayOfWeek;
            daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
            dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
            return {
                year: dayOfYear > 0 ? year : year - 1,
                dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
            };
        }
        function makeMoment(config) {
            var input = config._i, format = config._f;
            if (input === null || format === undefined && input === '') {
                return moment.invalid({ nullInput: true });
            }
            if (typeof input === 'string') {
                config._i = input = getLangDefinition().preparse(input);
            }
            if (moment.isMoment(input)) {
                config = cloneMoment(input);
                config._d = new Date(+input._d);
            } else if (format) {
                if (isArray(format)) {
                    makeDateFromStringAndArray(config);
                } else {
                    makeDateFromStringAndFormat(config);
                }
            } else {
                makeDateFromInput(config);
            }
            return new Moment(config);
        }
        moment = function (input, format, lang, strict) {
            var c;
            if (typeof lang === 'boolean') {
                strict = lang;
                lang = undefined;
            }
            c = {};
            c._isAMomentObject = true;
            c._i = input;
            c._f = format;
            c._l = lang;
            c._strict = strict;
            c._isUTC = false;
            c._pf = defaultParsingFlags();
            return makeMoment(c);
        };
        moment.suppressDeprecationWarnings = false;
        moment.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function (config) {
            config._d = new Date(config._i);
        });
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return moment();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }
        moment.min = function () {
            var args = [].slice.call(arguments, 0);
            return pickBy('isBefore', args);
        };
        moment.max = function () {
            var args = [].slice.call(arguments, 0);
            return pickBy('isAfter', args);
        };
        moment.utc = function (input, format, lang, strict) {
            var c;
            if (typeof lang === 'boolean') {
                strict = lang;
                lang = undefined;
            }
            c = {};
            c._isAMomentObject = true;
            c._useUTC = true;
            c._isUTC = true;
            c._l = lang;
            c._i = input;
            c._f = format;
            c._strict = strict;
            c._pf = defaultParsingFlags();
            return makeMoment(c).utc();
        };
        moment.unix = function (input) {
            return moment(input * 1000);
        };
        moment.duration = function (input, key) {
            var duration = input, match = null, sign, ret, parseIso;
            if (moment.isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months
                };
            } else if (typeof input === 'number') {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(match[MILLISECOND]) * sign
                };
            } else if (!!(match = isoDurationRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                parseIso = function (inp) {
                    var res = inp && parseFloat(inp.replace(',', '.'));
                    return (isNaN(res) ? 0 : res) * sign;
                };
                duration = {
                    y: parseIso(match[2]),
                    M: parseIso(match[3]),
                    d: parseIso(match[4]),
                    h: parseIso(match[5]),
                    m: parseIso(match[6]),
                    s: parseIso(match[7]),
                    w: parseIso(match[8])
                };
            }
            ret = new Duration(duration);
            if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
                ret._lang = input._lang;
            }
            return ret;
        };
        moment.version = VERSION;
        moment.defaultFormat = isoFormat;
        moment.ISO_8601 = function () {
        };
        moment.momentProperties = momentProperties;
        moment.updateOffset = function () {
        };
        moment.relativeTimeThreshold = function (threshold, limit) {
            if (relativeTimeThresholds[threshold] === undefined) {
                return false;
            }
            relativeTimeThresholds[threshold] = limit;
            return true;
        };
        moment.lang = function (key, values) {
            var r;
            if (!key) {
                return moment.fn._lang._abbr;
            }
            if (values) {
                loadLang(normalizeLanguage(key), values);
            } else if (values === null) {
                unloadLang(key);
                key = 'en';
            } else if (!languages[key]) {
                getLangDefinition(key);
            }
            r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
            return r._abbr;
        };
        moment.langData = function (key) {
            if (key && key._lang && key._lang._abbr) {
                key = key._lang._abbr;
            }
            return getLangDefinition(key);
        };
        moment.isMoment = function (obj) {
            return obj instanceof Moment || obj != null && obj.hasOwnProperty('_isAMomentObject');
        };
        moment.isDuration = function (obj) {
            return obj instanceof Duration;
        };
        for (i = lists.length - 1; i >= 0; --i) {
            makeList(lists[i]);
        }
        moment.normalizeUnits = function (units) {
            return normalizeUnits(units);
        };
        moment.invalid = function (flags) {
            var m = moment.utc(NaN);
            if (flags != null) {
                extend(m._pf, flags);
            } else {
                m._pf.userInvalidated = true;
            }
            return m;
        };
        moment.parseZone = function () {
            return moment.apply(null, arguments).parseZone();
        };
        moment.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };
        extend(moment.fn = Moment.prototype, {
            clone: function () {
                return moment(this);
            },
            valueOf: function () {
                return +this._d + (this._offset || 0) * 60000;
            },
            unix: function () {
                return Math.floor(+this / 1000);
            },
            toString: function () {
                return this.clone().lang('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
            },
            toDate: function () {
                return this._offset ? new Date(+this) : this._d;
            },
            toISOString: function () {
                var m = moment(this).utc();
                if (0 < m.year() && m.year() <= 9999) {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                } else {
                    return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
                }
            },
            toArray: function () {
                var m = this;
                return [
                    m.year(),
                    m.month(),
                    m.date(),
                    m.hours(),
                    m.minutes(),
                    m.seconds(),
                    m.milliseconds()
                ];
            },
            isValid: function () {
                return isValid(this);
            },
            isDSTShifted: function () {
                if (this._a) {
                    return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
                }
                return false;
            },
            parsingFlags: function () {
                return extend({}, this._pf);
            },
            invalidAt: function () {
                return this._pf.overflow;
            },
            utc: function () {
                return this.zone(0);
            },
            local: function () {
                this.zone(0);
                this._isUTC = false;
                return this;
            },
            format: function (inputString) {
                var output = formatMoment(this, inputString || moment.defaultFormat);
                return this.lang().postformat(output);
            },
            add: function (input, val) {
                var dur;
                if (typeof input === 'string' && typeof val === 'string') {
                    dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
                } else if (typeof input === 'string') {
                    dur = moment.duration(+val, input);
                } else {
                    dur = moment.duration(input, val);
                }
                addOrSubtractDurationFromMoment(this, dur, 1);
                return this;
            },
            subtract: function (input, val) {
                var dur;
                if (typeof input === 'string' && typeof val === 'string') {
                    dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
                } else if (typeof input === 'string') {
                    dur = moment.duration(+val, input);
                } else {
                    dur = moment.duration(input, val);
                }
                addOrSubtractDurationFromMoment(this, dur, -1);
                return this;
            },
            diff: function (input, units, asFloat) {
                var that = makeAs(input, this), zoneDiff = (this.zone() - that.zone()) * 60000, diff, output;
                units = normalizeUnits(units);
                if (units === 'year' || units === 'month') {
                    diff = (this.daysInMonth() + that.daysInMonth()) * 43200000;
                    output = (this.year() - that.year()) * 12 + (this.month() - that.month());
                    output += (this - moment(this).startOf('month') - (that - moment(that).startOf('month'))) / diff;
                    output -= (this.zone() - moment(this).startOf('month').zone() - (that.zone() - moment(that).startOf('month').zone())) * 60000 / diff;
                    if (units === 'year') {
                        output = output / 12;
                    }
                } else {
                    diff = this - that;
                    output = units === 'second' ? diff / 1000 : units === 'minute' ? diff / 60000 : units === 'hour' ? diff / 3600000 : units === 'day' ? (diff - zoneDiff) / 86400000 : units === 'week' ? (diff - zoneDiff) / 604800000 : diff;
                }
                return asFloat ? output : absRound(output);
            },
            from: function (time, withoutSuffix) {
                return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
            },
            fromNow: function (withoutSuffix) {
                return this.from(moment(), withoutSuffix);
            },
            calendar: function (time) {
                var now = time || moment(), sod = makeAs(now, this).startOf('day'), diff = this.diff(sod, 'days', true), format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
                return this.format(this.lang().calendar(format, this));
            },
            isLeapYear: function () {
                return isLeapYear(this.year());
            },
            isDST: function () {
                return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
            },
            day: function (input) {
                var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                if (input != null) {
                    input = parseWeekday(input, this.lang());
                    return this.add({ d: input - day });
                } else {
                    return day;
                }
            },
            month: makeAccessor('Month', true),
            startOf: function (units) {
                units = normalizeUnits(units);
                switch (units) {
                case 'year':
                    this.month(0);
                case 'quarter':
                case 'month':
                    this.date(1);
                case 'week':
                case 'isoWeek':
                case 'day':
                    this.hours(0);
                case 'hour':
                    this.minutes(0);
                case 'minute':
                    this.seconds(0);
                case 'second':
                    this.milliseconds(0);
                }
                if (units === 'week') {
                    this.weekday(0);
                } else if (units === 'isoWeek') {
                    this.isoWeekday(1);
                }
                if (units === 'quarter') {
                    this.month(Math.floor(this.month() / 3) * 3);
                }
                return this;
            },
            endOf: function (units) {
                units = normalizeUnits(units);
                return this.startOf(units).add(units === 'isoWeek' ? 'week' : units, 1).subtract('ms', 1);
            },
            isAfter: function (input, units) {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) > +moment(input).startOf(units);
            },
            isBefore: function (input, units) {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) < +moment(input).startOf(units);
            },
            isSame: function (input, units) {
                units = units || 'ms';
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
            },
            min: deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function (other) {
                other = moment.apply(null, arguments);
                return other < this ? this : other;
            }),
            max: deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function (other) {
                other = moment.apply(null, arguments);
                return other > this ? this : other;
            }),
            zone: function (input, keepTime) {
                var offset = this._offset || 0;
                if (input != null) {
                    if (typeof input === 'string') {
                        input = timezoneMinutesFromString(input);
                    }
                    if (Math.abs(input) < 16) {
                        input = input * 60;
                    }
                    this._offset = input;
                    this._isUTC = true;
                    if (offset !== input) {
                        if (!keepTime || this._changeInProgress) {
                            addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, false);
                        } else if (!this._changeInProgress) {
                            this._changeInProgress = true;
                            moment.updateOffset(this, true);
                            this._changeInProgress = null;
                        }
                    }
                } else {
                    return this._isUTC ? offset : this._d.getTimezoneOffset();
                }
                return this;
            },
            zoneAbbr: function () {
                return this._isUTC ? 'UTC' : '';
            },
            zoneName: function () {
                return this._isUTC ? 'Coordinated Universal Time' : '';
            },
            parseZone: function () {
                if (this._tzm) {
                    this.zone(this._tzm);
                } else if (typeof this._i === 'string') {
                    this.zone(this._i);
                }
                return this;
            },
            hasAlignedHourOffset: function (input) {
                if (!input) {
                    input = 0;
                } else {
                    input = moment(input).zone();
                }
                return (this.zone() - input) % 60 === 0;
            },
            daysInMonth: function () {
                return daysInMonth(this.year(), this.month());
            },
            dayOfYear: function (input) {
                var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 86400000) + 1;
                return input == null ? dayOfYear : this.add('d', input - dayOfYear);
            },
            quarter: function (input) {
                return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
            },
            weekYear: function (input) {
                var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
                return input == null ? year : this.add('y', input - year);
            },
            isoWeekYear: function (input) {
                var year = weekOfYear(this, 1, 4).year;
                return input == null ? year : this.add('y', input - year);
            },
            week: function (input) {
                var week = this.lang().week(this);
                return input == null ? week : this.add('d', (input - week) * 7);
            },
            isoWeek: function (input) {
                var week = weekOfYear(this, 1, 4).week;
                return input == null ? week : this.add('d', (input - week) * 7);
            },
            weekday: function (input) {
                var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
                return input == null ? weekday : this.add('d', input - weekday);
            },
            isoWeekday: function (input) {
                return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
            },
            isoWeeksInYear: function () {
                return weeksInYear(this.year(), 1, 4);
            },
            weeksInYear: function () {
                var weekInfo = this._lang._week;
                return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
            },
            get: function (units) {
                units = normalizeUnits(units);
                return this[units]();
            },
            set: function (units, value) {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function') {
                    this[units](value);
                }
                return this;
            },
            lang: function (key) {
                if (key === undefined) {
                    return this._lang;
                } else {
                    this._lang = getLangDefinition(key);
                    return this;
                }
            }
        });
        function rawMonthSetter(mom, value) {
            var dayOfMonth;
            if (typeof value === 'string') {
                value = mom.lang().monthsParse(value);
                if (typeof value !== 'number') {
                    return mom;
                }
            }
            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }
        function rawGetter(mom, unit) {
            return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
        }
        function rawSetter(mom, unit, value) {
            if (unit === 'Month') {
                return rawMonthSetter(mom, value);
            } else {
                return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
        function makeAccessor(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    rawSetter(this, unit, value);
                    moment.updateOffset(this, keepTime);
                    return this;
                } else {
                    return rawGetter(this, unit);
                }
            };
        }
        moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
        moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
        moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
        moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
        moment.fn.date = makeAccessor('Date', true);
        moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
        moment.fn.year = makeAccessor('FullYear', true);
        moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));
        moment.fn.days = moment.fn.day;
        moment.fn.months = moment.fn.month;
        moment.fn.weeks = moment.fn.week;
        moment.fn.isoWeeks = moment.fn.isoWeek;
        moment.fn.quarters = moment.fn.quarter;
        moment.fn.toJSON = moment.fn.toISOString;
        extend(moment.duration.fn = Duration.prototype, {
            _bubble: function () {
                var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years;
                data.milliseconds = milliseconds % 1000;
                seconds = absRound(milliseconds / 1000);
                data.seconds = seconds % 60;
                minutes = absRound(seconds / 60);
                data.minutes = minutes % 60;
                hours = absRound(minutes / 60);
                data.hours = hours % 24;
                days += absRound(hours / 24);
                data.days = days % 30;
                months += absRound(days / 30);
                data.months = months % 12;
                years = absRound(months / 12);
                data.years = years;
            },
            weeks: function () {
                return absRound(this.days() / 7);
            },
            valueOf: function () {
                return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;
            },
            humanize: function (withSuffix) {
                var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
                if (withSuffix) {
                    output = this.lang().pastFuture(difference, output);
                }
                return this.lang().postformat(output);
            },
            add: function (input, val) {
                var dur = moment.duration(input, val);
                this._milliseconds += dur._milliseconds;
                this._days += dur._days;
                this._months += dur._months;
                this._bubble();
                return this;
            },
            subtract: function (input, val) {
                var dur = moment.duration(input, val);
                this._milliseconds -= dur._milliseconds;
                this._days -= dur._days;
                this._months -= dur._months;
                this._bubble();
                return this;
            },
            get: function (units) {
                units = normalizeUnits(units);
                return this[units.toLowerCase() + 's']();
            },
            as: function (units) {
                units = normalizeUnits(units);
                return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
            },
            lang: moment.fn.lang,
            toIsoString: function () {
                var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
                if (!this.asSeconds()) {
                    return 'P0D';
                }
                return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + (hours || minutes || seconds ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '');
            }
        });
        function makeDurationGetter(name) {
            moment.duration.fn[name] = function () {
                return this._data[name];
            };
        }
        function makeDurationAsGetter(name, factor) {
            moment.duration.fn['as' + name] = function () {
                return +this / factor;
            };
        }
        for (i in unitMillisecondFactors) {
            if (unitMillisecondFactors.hasOwnProperty(i)) {
                makeDurationAsGetter(i, unitMillisecondFactors[i]);
                makeDurationGetter(i.toLowerCase());
            }
        }
        makeDurationAsGetter('Weeks', 604800000);
        moment.duration.fn.asMonths = function () {
            return (+this - this.years() * 31536000000) / 2592000000 + this.years() * 12;
        };
        moment.lang('en', {
            ordinal: function (number) {
                var b = number % 10, output = toInt(number % 100 / 10) === 1 ? 'th' : b === 1 ? 'st' : b === 2 ? 'nd' : b === 3 ? 'rd' : 'th';
                return number + output;
            }
        });
        function makeGlobal(shouldDeprecate) {
            if (typeof ender !== 'undefined') {
                return;
            }
            oldGlobalMoment = globalScope.moment;
            if (shouldDeprecate) {
                globalScope.moment = deprecate('Accessing Moment through the global scope is ' + 'deprecated, and will be removed in an upcoming ' + 'release.', moment);
            } else {
                globalScope.moment = moment;
            }
        }
        if (hasModule) {
            module.exports = moment;
        }
    }.call(this));
});

define('moment', ['moment/moment'], function (main) { return main; });

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('moment/lang/ar-ma', ['moment'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../moment'));
    } else {
        factory(window.moment);
    }
}(function (moment) {
    return moment.lang('ar-ma', {
        months: '\u064A\u0646\u0627\u064A\u0631_\u0641\u0628\u0631\u0627\u064A\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064A\u0644_\u0645\u0627\u064A_\u064A\u0648\u0646\u064A\u0648_\u064A\u0648\u0644\u064A\u0648\u0632_\u063A\u0634\u062A_\u0634\u062A\u0646\u0628\u0631_\u0623\u0643\u062A\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062F\u062C\u0646\u0628\u0631'.split('_'),
        monthsShort: '\u064A\u0646\u0627\u064A\u0631_\u0641\u0628\u0631\u0627\u064A\u0631_\u0645\u0627\u0631\u0633_\u0623\u0628\u0631\u064A\u0644_\u0645\u0627\u064A_\u064A\u0648\u0646\u064A\u0648_\u064A\u0648\u0644\u064A\u0648\u0632_\u063A\u0634\u062A_\u0634\u062A\u0646\u0628\u0631_\u0623\u0643\u062A\u0648\u0628\u0631_\u0646\u0648\u0646\u0628\u0631_\u062F\u062C\u0646\u0628\u0631'.split('_'),
        weekdays: '\u0627\u0644\u0623\u062D\u062F_\u0627\u0644\u0625\u062A\u0646\u064A\u0646_\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621_\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621_\u0627\u0644\u062E\u0645\u064A\u0633_\u0627\u0644\u062C\u0645\u0639\u0629_\u0627\u0644\u0633\u0628\u062A'.split('_'),
        weekdaysShort: '\u0627\u062D\u062F_\u0627\u062A\u0646\u064A\u0646_\u062B\u0644\u0627\u062B\u0627\u0621_\u0627\u0631\u0628\u0639\u0627\u0621_\u062E\u0645\u064A\u0633_\u062C\u0645\u0639\u0629_\u0633\u0628\u062A'.split('_'),
        weekdaysMin: '\u062D_\u0646_\u062B_\u0631_\u062E_\u062C_\u0633'.split('_'),
        longDateFormat: {
            LT: 'HH:mm',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY LT',
            LLLL: 'dddd D MMMM YYYY LT'
        },
        calendar: {
            sameDay: '[\u0627\u0644\u064A\u0648\u0645 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextDay: '[\u063A\u062F\u0627 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            nextWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastDay: '[\u0623\u0645\u0633 \u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            lastWeek: 'dddd [\u0639\u0644\u0649 \u0627\u0644\u0633\u0627\u0639\u0629] LT',
            sameElse: 'L'
        },
        relativeTime: {
            future: '\u0641\u064A %s',
            past: '\u0645\u0646\u0630 %s',
            s: '\u062B\u0648\u0627\u0646',
            m: '\u062F\u0642\u064A\u0642\u0629',
            mm: '%d \u062F\u0642\u0627\u0626\u0642',
            h: '\u0633\u0627\u0639\u0629',
            hh: '%d \u0633\u0627\u0639\u0627\u062A',
            d: '\u064A\u0648\u0645',
            dd: '%d \u0623\u064A\u0627\u0645',
            M: '\u0634\u0647\u0631',
            MM: '%d \u0623\u0634\u0647\u0631',
            y: '\u0633\u0646\u0629',
            yy: '%d \u0633\u0646\u0648\u0627\u062A'
        },
        week: {
            dow: 6,
            doy: 12
        }
    });
}));

define('etpl/tpl', [
    'require',
    'exports',
    'module',
    '.'
], function (require, exports, module) {
    var etpl = require('.');
    return {
        load: function (resourceId, req, load) {
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open('GET', req.toUrl(resourceId), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var source = xhr.responseText;
                        var moduleConfig = module.config();
                        if (moduleConfig.autoCompile || moduleConfig.autoCompile == null) {
                            etpl.compile(source);
                        }
                        load(source);
                    }
                    xhr.onreadystatechange = new Function();
                    xhr = null;
                }
            };
            xhr.send(null);
        }
    };
});

(function (root) {
    function extend(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
        return target;
    }
    function Stack() {
        this.raw = [];
        this.length = 0;
    }
    Stack.prototype = {
        push: function (elem) {
            this.raw[this.length++] = elem;
        },
        pop: function () {
            if (this.length > 0) {
                var elem = this.raw[--this.length];
                this.raw.length = this.length;
                return elem;
            }
        },
        top: function () {
            return this.raw[this.length - 1];
        },
        bottom: function () {
            return this.raw[0];
        },
        find: function (condition) {
            var index = this.length;
            while (index--) {
                var item = this.raw[index];
                if (condition(item)) {
                    return item;
                }
            }
        }
    };
    var guidIndex = 178245;
    function generateGUID() {
        return '___' + guidIndex++;
    }
    function inherits(subClass, superClass) {
        var F = new Function();
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        subClass.prototype.constructor = subClass;
    }
    var HTML_ENTITY = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
    };
    function htmlFilterReplacer(c) {
        return HTML_ENTITY[c];
    }
    var DEFAULT_FILTERS = {
        html: function (source) {
            return source.replace(/[&<>"']/g, htmlFilterReplacer);
        },
        url: encodeURIComponent,
        raw: function (source) {
            return source;
        }
    };
    function stringLiteralize(source) {
        return '"' + source.replace(/\x5C/g, '\\\\').replace(/"/g, '\\"').replace(/\x0A/g, '\\n').replace(/\x09/g, '\\t').replace(/\x0D/g, '\\r') + '"';
    }
    function regexpLiteral(source) {
        return source.replace(/[\^\[\]\$\(\)\{\}\?\*\.\+]/g, function (c) {
            return '\\' + c;
        });
    }
    function stringFormat(source) {
        var args = arguments;
        return source.replace(/\{([0-9]+)\}/g, function (match, index) {
            return args[index - 0 + 1];
        });
    }
    var RENDER_STRING_DECLATION = 'var r="";';
    var RENDER_STRING_ADD_START = 'r+=';
    var RENDER_STRING_ADD_END = ';';
    var RENDER_STRING_RETURN = 'return r;';
    var ieVersionMatch = typeof navigator !== 'undefined' && navigator.userAgent.match(/msie\s*([0-9]+)/i);
    if (ieVersionMatch && ieVersionMatch[1] - 0 < 8) {
        RENDER_STRING_DECLATION = 'var r=[],ri=0;';
        RENDER_STRING_ADD_START = 'r[ri++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }
    function toGetVariableLiteral(name) {
        name = name.replace(/^\s*\*/, '');
        return stringFormat('gv({0},["{1}"])', stringLiteralize(name), name.replace(/\[['"]?([^'"]+)['"]?\]/g, function (match, name) {
            return '.' + name;
        }).split('.').join('","'));
    }
    function parseTextBlock(source, open, close, greedy, onInBlock, onOutBlock) {
        var closeLen = close.length;
        var texts = source.split(open);
        var level = 0;
        var buf = [];
        for (var i = 0, len = texts.length; i < len; i++) {
            var text = texts[i];
            if (i) {
                var openBegin = 1;
                level++;
                while (1) {
                    var closeIndex = text.indexOf(close);
                    if (closeIndex < 0) {
                        buf.push(level > 1 && openBegin ? open : '', text);
                        break;
                    }
                    level = greedy ? level - 1 : 0;
                    buf.push(level > 0 && openBegin ? open : '', text.slice(0, closeIndex), level > 0 ? close : '');
                    text = text.slice(closeIndex + closeLen);
                    openBegin = 0;
                    if (level === 0) {
                        break;
                    }
                }
                if (level === 0) {
                    onInBlock(buf.join(''));
                    onOutBlock(text);
                    buf = [];
                }
            } else {
                text && onOutBlock(text);
            }
        }
        if (level > 0 && buf.length > 0) {
            onOutBlock(open);
            onOutBlock(buf.join(''));
        }
    }
    function compileVariable(source, engine, forText) {
        var code = [];
        var options = engine.options;
        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';
        var defaultFilter;
        if (forText) {
            toStringHead = 'ts(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = options.defaultFilter;
        }
        parseTextBlock(source, options.variableOpen, options.variableClose, 1, function (text) {
            if (forText && text.indexOf('|') < 0 && defaultFilter) {
                text += '|' + defaultFilter;
            }
            var filterCharIndex = text.indexOf('|');
            var variableName = (filterCharIndex > 0 ? text.slice(0, filterCharIndex) : text).replace(/^\s+/, '').replace(/\s+$/, '');
            var filterSource = filterCharIndex > 0 ? text.slice(filterCharIndex + 1) : '';
            var variableRawValue = variableName.indexOf('*') === 0;
            var variableCode = [
                variableRawValue ? '' : toStringHead,
                toGetVariableLiteral(variableName),
                variableRawValue ? '' : toStringFoot
            ];
            if (filterSource) {
                filterSource = compileVariable(filterSource, engine);
                var filterSegs = filterSource.split('|');
                for (var i = 0, len = filterSegs.length; i < len; i++) {
                    var seg = filterSegs[i];
                    var segMatch = seg.match(/^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i);
                    if (segMatch) {
                        variableCode.unshift('fs["' + segMatch[1] + '"](');
                        if (segMatch[3]) {
                            variableCode.push(',', segMatch[3]);
                        }
                        variableCode.push(')');
                    }
                }
            }
            code.push(wrapHead, variableCode.join(''), wrapFoot);
        }, function (text) {
            code.push(wrapHead, forText ? stringLiteralize(text) : text, wrapFoot);
        });
        return code.join('');
    }
    function TextNode(value, engine) {
        this.value = value;
        this.engine = engine;
    }
    TextNode.prototype = {
        getRendererBody: function () {
            var value = this.value;
            var options = this.engine.options;
            if (!value || options.strip && /^\s*$/.test(value)) {
                return '';
            }
            return compileVariable(value, this.engine, 1);
        },
        clone: function () {
            return this;
        }
    };
    function Command(value, engine) {
        this.value = value;
        this.engine = engine;
        this.children = [];
        this.cloneProps = [];
    }
    Command.prototype = {
        addChild: function (node) {
            this.children.push(node);
        },
        open: function (context) {
            var parent = context.stack.top();
            parent && parent.addChild(this);
            context.stack.push(this);
        },
        close: function (context) {
            if (context.stack.top() === this) {
                context.stack.pop();
            }
        },
        getRendererBody: function () {
            var buf = [];
            var children = this.children;
            for (var i = 0; i < children.length; i++) {
                buf.push(children[i].getRendererBody());
            }
            return buf.join('');
        },
        clone: function () {
            var Clazz = this.constructor;
            var node = new Clazz(this.value, this.engine);
            for (var i = 0, l = this.children.length; i < l; i++) {
                node.addChild(this.children[i].clone());
            }
            for (var i = 0, l = this.cloneProps.length; i < l; i++) {
                var prop = this.cloneProps[i];
                node[prop] = this[prop];
            }
            return node;
        }
    };
    function autoCloseCommand(context, CommandType) {
        var stack = context.stack;
        var closeEnd = CommandType ? stack.find(function (item) {
            return item instanceof CommandType;
        }) : stack.bottom();
        if (closeEnd) {
            var node;
            while ((node = stack.top()) !== closeEnd) {
                if (!node.autoClose) {
                    throw new Error(node.type + ' must be closed manually: ' + node.value);
                }
                node.autoClose(context);
            }
            closeEnd.close(context);
        }
        return closeEnd;
    }
    var RENDERER_BODY_START = '' + 'data=data||{};' + 'var v={},fs=engine.filters,hg=typeof data.get=="function",' + 'gv=function(n,ps){' + 'var p=ps[0],d=v[p];' + 'if(d==null){' + 'if(hg){return data.get(n);}' + 'd=data[p];' + '}' + 'for(var i=1,l=ps.length;i<l;i++)if(d!=null)d = d[ps[i]];' + 'return d;' + '},' + 'ts=function(s){' + 'if(typeof s==="string"){return s;}' + 'if(s==null){s="";}' + 'return ""+s;' + '};';
    function TargetCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*(\(\s*master\s*=\s*([a-z0-9\/_-]+)\s*\))?\s*/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.master = match[3];
        this.name = match[1];
        Command.call(this, value, engine);
        this.blocks = {};
    }
    inherits(TargetCommand, Command);
    function BlockCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = match[1];
        Command.call(this, value, engine);
        this.cloneProps = ['name'];
    }
    inherits(BlockCommand, Command);
    function ImportCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = match[1];
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'state',
            'blocks',
            'target'
        ];
        this.blocks = {};
    }
    inherits(ImportCommand, Command);
    function VarCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = match[1];
        this.expr = match[2];
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'expr'
        ];
    }
    inherits(VarCommand, Command);
    function FilterCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = match[1];
        this.args = match[3];
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'args'
        ];
    }
    inherits(FilterCommand, Command);
    function UseCommand(value, engine) {
        var match = value.match(/^\s*([a-z0-9\/_-]+)\s*(\(([\s\S]*)\))?\s*$/i);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.name = match[1];
        this.args = match[3];
        Command.call(this, value, engine);
        this.cloneProps = [
            'name',
            'args'
        ];
    }
    inherits(UseCommand, Command);
    function ForCommand(value, engine) {
        var rule = new RegExp(stringFormat('^\\s*({0}[\\s\\S]+{1})\\s+as\\s+{0}([0-9a-z_]+){1}\\s*(,\\s*{0}([0-9a-z_]+){1})?\\s*$', regexpLiteral(engine.options.variableOpen), regexpLiteral(engine.options.variableClose)), 'i');
        var match = value.match(rule);
        if (!match) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }
        this.list = match[1];
        this.item = match[2];
        this.index = match[4];
        Command.call(this, value, engine);
        this.cloneProps = [
            'list',
            'item',
            'index'
        ];
    }
    inherits(ForCommand, Command);
    function IfCommand(value, engine) {
        Command.call(this, value, engine);
    }
    inherits(IfCommand, Command);
    function ElifCommand(value, engine) {
        IfCommand.call(this, value, engine);
    }
    inherits(ElifCommand, IfCommand);
    function ElseCommand(value, engine) {
        Command.call(this, value, engine);
    }
    inherits(ElseCommand, IfCommand);
    var TargetState = {
        READING: 1,
        READED: 2,
        APPLIED: 3,
        READY: 4
    };
    ImportCommand.prototype.applyMaster = TargetCommand.prototype.applyMaster = function (masterName) {
        if (this.state >= TargetState.APPLIED) {
            return 1;
        }
        var blocks = this.blocks;
        function replaceBlock(node) {
            var children = node.children;
            if (children instanceof Array) {
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (child instanceof BlockCommand && blocks[child.name]) {
                        child = children[i] = blocks[child.name];
                    }
                    replaceBlock(child);
                }
            }
        }
        var master = this.engine.targets[masterName];
        if (master) {
            if (master.applyMaster(master.master)) {
                this.children = master.clone().children;
                replaceBlock(this);
                this.state = TargetState.APPLIED;
                return 1;
            }
        } else if (this.engine.options.missTarget === 'error') {
            throw new Error('[ETPL_MISS_TARGET]' + masterName + ', when extended by ' + (this.target ? this.target.name : this.name));
        }
    };
    TargetCommand.prototype.isReady = function () {
        if (this.state >= TargetState.READY) {
            return 1;
        }
        var engine = this.engine;
        var targetName = this.name;
        var readyState = 1;
        function checkReadyState(node) {
            for (var i = 0, len = node.children.length; i < len; i++) {
                var child = node.children[i];
                if (child instanceof ImportCommand) {
                    var target = engine.targets[child.name];
                    if (!target && engine.options.missTarget === 'error') {
                        throw new Error('[ETPL_MISS_TARGET]' + child.name + ', when imported by ' + targetName);
                    }
                    readyState = readyState && target && target.isReady(engine);
                } else if (child instanceof Command) {
                    checkReadyState(child);
                }
            }
        }
        if (this.applyMaster(this.master)) {
            checkReadyState(this);
            readyState && (this.state = TargetState.READY);
            return readyState;
        }
    };
    TargetCommand.prototype.getRenderer = function () {
        if (this.renderer) {
            return this.renderer;
        }
        if (this.isReady()) {
            var realRenderer = new Function('data', 'engine', [
                RENDERER_BODY_START,
                RENDER_STRING_DECLATION,
                this.getRendererBody(),
                RENDER_STRING_RETURN
            ].join('\n'));
            var engine = this.engine;
            this.renderer = function (data) {
                return realRenderer(data, engine);
            };
            return this.renderer;
        }
        return null;
    };
    function addTargetToContext(target, context) {
        context.target = target;
        var engine = context.engine;
        var name = target.name;
        if (engine.targets[name]) {
            switch (engine.options.namingConflict) {
            case 'override':
                engine.targets[name] = target;
                context.targets.push(name);
            case 'ignore':
                break;
            default:
                throw new Error('[ETPL_TARGET_EXISTS]' + name);
            }
        } else {
            engine.targets[name] = target;
            context.targets.push(name);
        }
    }
    TargetCommand.prototype.open = function (context) {
        autoCloseCommand(context);
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        addTargetToContext(this, context);
    };
    VarCommand.prototype.open = UseCommand.prototype.open = function (context) {
        context.stack.top().addChild(this);
    };
    BlockCommand.prototype.open = function (context) {
        Command.prototype.open.call(this, context);
        context.stack.find(function (node) {
            return node.blocks;
        }).blocks[this.name] = this;
    };
    ElifCommand.prototype.open = function (context) {
        var elseCommand = new ElseCommand();
        elseCommand.open(context);
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };
    ElseCommand.prototype.open = function (context) {
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };
    ImportCommand.prototype.open = function (context) {
        this.parent = context.stack.top();
        this.target = context.target;
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
    };
    UseCommand.prototype.close = VarCommand.prototype.close = function () {
    };
    ImportCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = TargetState.READED;
    };
    TargetCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = this.master ? TargetState.READED : TargetState.APPLIED;
        context.target = null;
    };
    ImportCommand.prototype.autoClose = function (context) {
        var parentChildren = this.parent.children;
        parentChildren.push.apply(parentChildren, this.children);
        this.children.length = 0;
        for (var key in this.blocks) {
            this.target.blocks[key] = this.blocks[key];
        }
        this.blocks = {};
        this.close(context);
    };
    UseCommand.prototype.beforeOpen = ImportCommand.prototype.beforeOpen = VarCommand.prototype.beforeOpen = ForCommand.prototype.beforeOpen = FilterCommand.prototype.beforeOpen = BlockCommand.prototype.beforeOpen = IfCommand.prototype.beforeOpen = TextNode.prototype.beforeAdd = function (context) {
        if (context.stack.bottom()) {
            return;
        }
        var target = new TargetCommand(generateGUID(), context.engine);
        target.open(context);
    };
    ImportCommand.prototype.getRendererBody = function () {
        this.applyMaster(this.name);
        return Command.prototype.getRendererBody.call(this);
    };
    UseCommand.prototype.getRendererBody = function () {
        return stringFormat('{0}engine.render({2},{{3}}){1}', RENDER_STRING_ADD_START, RENDER_STRING_ADD_END, stringLiteralize(this.name), compileVariable(this.args, this.engine).replace(/(^|,)\s*([a-z0-9_]+)\s*=/gi, function (match, start, argName) {
            return (start || '') + stringLiteralize(argName) + ':';
        }));
    };
    VarCommand.prototype.getRendererBody = function () {
        if (this.expr) {
            return stringFormat('v[{0}]={1};', stringLiteralize(this.name), compileVariable(this.expr, this.engine));
        }
        return '';
    };
    IfCommand.prototype.getRendererBody = function () {
        return stringFormat('if({0}){{1}}', compileVariable(this.value, this.engine), Command.prototype.getRendererBody.call(this));
    };
    ElseCommand.prototype.getRendererBody = function () {
        return stringFormat('}else{{0}', Command.prototype.getRendererBody.call(this));
    };
    ForCommand.prototype.getRendererBody = function () {
        return stringFormat('' + 'var {0}={1};' + 'if({0} instanceof Array)' + 'for (var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}' + 'else if(typeof {0}==="object")' + 'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}', generateGUID(), compileVariable(this.list, this.engine), stringLiteralize(this.index || generateGUID()), stringLiteralize(this.item), generateGUID(), generateGUID(), Command.prototype.getRendererBody.call(this));
    };
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return stringFormat('{2}fs[{5}]((function(){{0}{4}{1}})(){6}){3}', RENDER_STRING_DECLATION, RENDER_STRING_RETURN, RENDER_STRING_ADD_START, RENDER_STRING_ADD_END, Command.prototype.getRendererBody.call(this), stringLiteralize(this.name), args ? ',' + compileVariable(args, this.engine) : '');
    };
    var commandTypes = {};
    function addCommandType(name, Type) {
        commandTypes[name] = Type;
        Type.prototype.type = name;
    }
    addCommandType('target', TargetCommand);
    addCommandType('block', BlockCommand);
    addCommandType('import', ImportCommand);
    addCommandType('use', UseCommand);
    addCommandType('var', VarCommand);
    addCommandType('for', ForCommand);
    addCommandType('if', IfCommand);
    addCommandType('elif', ElifCommand);
    addCommandType('else', ElseCommand);
    addCommandType('filter', FilterCommand);
    function Engine(options) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            commandSyntax: /^\s*(\/)?([a-z]*)\s*(?::([\s\S]*))?$/,
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };
        this.config(options);
        this.targets = {};
        this.filters = extend({}, DEFAULT_FILTERS);
    }
    Engine.prototype.config = function (options) {
        extend(this.options, options);
    };
    Engine.prototype.compile = Engine.prototype.parse = function (source) {
        if (source) {
            var targetNames = parseSource(source, this);
            if (targetNames.length) {
                return this.targets[targetNames[0]].getRenderer();
            }
        }
        return new Function('return ""');
    };
    Engine.prototype.getRenderer = function (name) {
        var target = this.targets[name];
        if (target) {
            return target.getRenderer();
        }
    };
    Engine.prototype.render = function (name, data) {
        var renderer = this.getRenderer(name);
        if (renderer) {
            return renderer(data);
        }
        return '';
    };
    Engine.prototype.addFilter = function (name, filter) {
        if (typeof filter === 'function') {
            this.filters[name] = filter;
        }
    };
    function parseSource(source, engine) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;
        var commandSyntax = engine.options.commandSyntax;
        var stack = new Stack();
        var analyseContext = {
            engine: engine,
            targets: [],
            stack: stack,
            target: null
        };
        var textBuf = [];
        function flushTextBuf() {
            var text;
            if (textBuf.length > 0 && (text = textBuf.join(''))) {
                var textNode = new TextNode(text, engine);
                textNode.beforeAdd(analyseContext);
                stack.top().addChild(textNode);
                textBuf = [];
                if (engine.options.strip && analyseContext.current instanceof Command) {
                    textNode.value = text.replace(/^[\x20\t\r]*\n/, '');
                }
                analyseContext.current = textNode;
            }
        }
        var NodeType;
        parseTextBlock(source, commandOpen, commandClose, 0, function (text) {
            var match = commandSyntax.exec(text);
            var nodeName;
            if (match && (nodeName = match[2] || 'target') && (NodeType = commandTypes[nodeName.toLowerCase()]) && typeof NodeType === 'function') {
                flushTextBuf();
                var currentNode = analyseContext.current;
                if (engine.options.strip && currentNode instanceof TextNode) {
                    currentNode.value = currentNode.value.replace(/\r?\n[\x20\t]*$/, '\n');
                }
                if (match[1]) {
                    currentNode = autoCloseCommand(analyseContext, NodeType);
                } else {
                    currentNode = new NodeType(match[3], engine);
                    if (typeof currentNode.beforeOpen === 'function') {
                        currentNode.beforeOpen(analyseContext);
                    }
                    currentNode.open(analyseContext);
                }
                analyseContext.current = currentNode;
            } else if (!/^\s*\/\//.test(text)) {
                textBuf.push(commandOpen, text, commandClose);
            }
            NodeType = null;
        }, function (text) {
            textBuf.push(text);
        });
        flushTextBuf();
        autoCloseCommand(analyseContext);
        return analyseContext.targets;
    }
    var etpl = new Engine();
    etpl.Engine = Engine;
    etpl.version = '3.1.1';
    if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = etpl;
    } else if (typeof define === 'function' && define.amd) {
        define('etpl/main', [], etpl);
    } else {
        root.etpl = etpl;
    }
}(this));

define('etpl', ['etpl/main'], function (main) { return main; });

void function (define) {
    define('eoo/oo', [], function () {
        var Empty = function () {
        };
        var NAME_PROPERTY_NAME = '__eooName__';
        var OWNER_PROPERTY_NAME = '__eooOwner__';
        function Class() {
            return Class.create.apply(Class, arguments);
        }
        Class.create = function (BaseClass, overrides) {
            overrides = overrides || {};
            BaseClass = BaseClass || Class;
            if (typeof BaseClass === 'object') {
                overrides = BaseClass;
                BaseClass = Class;
            }
            var kclass = inherit(BaseClass);
            var proto = kclass.prototype;
            eachObject(overrides, function (value, key) {
                if (typeof value === 'function') {
                    value[NAME_PROPERTY_NAME] = key;
                    value[OWNER_PROPERTY_NAME] = kclass;
                }
                proto[key] = value;
            });
            kclass.toString = toString;
            return kclass;
        };
        Class.static = typeof Object.create === 'function' ? Object.create : function (o) {
            if (arguments.length > 1) {
                throw new Error('Second argument not supported');
            }
            if (!(o instanceof Object)) {
                throw new TypeError('Argument must be an object');
            }
            Empty.prototype = o;
            return new Empty();
        };
        Class.toString = function () {
            return 'function Class() { [native code] }';
        };
        Class.prototype = {
            constructor: function () {
            },
            $self: Class,
            $superClass: Object,
            $super: function (args) {
                var method = this.$super.caller;
                var name = method[NAME_PROPERTY_NAME];
                var superClass = method[OWNER_PROPERTY_NAME].$superClass;
                var superMethod = superClass.prototype[name];
                if (typeof superMethod !== 'function') {
                    throw new TypeError('Call the super class\'s ' + name + ', but it is not a function!');
                }
                return superMethod.apply(this, args);
            }
        };
        function inherit(BaseClass) {
            var kclass = function () {
                return kclass.prototype.constructor.apply(this, arguments);
            };
            Empty.prototype = BaseClass.prototype;
            var proto = kclass.prototype = new Empty();
            proto.$self = kclass;
            if (!('$super' in proto)) {
                proto.$super = Class.prototype.$super;
            }
            kclass.$superClass = BaseClass;
            return kclass;
        }
        var hasEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString');
        var enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];
        function hasOwnProperty(obj, key) {
            return Object.prototype.hasOwnProperty.call(obj, key);
        }
        function eachObject(obj, fn) {
            for (var k in obj) {
                hasOwnProperty(obj, k) && fn(obj[k], k, obj);
            }
            if (hasEnumBug) {
                for (var i = enumProperties.length - 1; i > -1; --i) {
                    var key = enumProperties[i];
                    hasOwnProperty(obj, key) && fn(obj[key], key, obj);
                }
            }
        }
        function toString() {
            return this.prototype.constructor.toString();
        }
        return Class;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

void function (define) {
    define('eoo/main', [
        'require',
        './oo',
        './defineAccessor'
    ], function (require) {
        var oo = require('./oo');
        oo.defineAccessor = require('./defineAccessor');
        return oo;
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

define('eoo', ['eoo/main'], function (main) { return main; });

void function (define, undefined) {
    define('eoo/defineAccessor', ['require'], function (require) {
        var MEMBERS = '__eooPrivateMembers__';
        function simpleGetter(name) {
            var body = 'return typeof this.' + MEMBERS + ' === \'object\' ? this.' + MEMBERS + '[\'' + name + '\'] : undefined;';
            return new Function(body);
        }
        function simpleSetter(name) {
            var body = 'this.' + MEMBERS + ' = this.' + MEMBERS + ' || {};\n' + 'this.' + MEMBERS + '[\'' + name + '\'] = value;';
            return new Function('value', body);
        }
        return function (obj, name, accessor) {
            var upperName = name.charAt(0).toUpperCase() + name.slice(1);
            var getter = 'get' + upperName;
            var setter = 'set' + upperName;
            if (!accessor) {
                obj[getter] = !accessor || typeof accessor.get !== 'function' ? simpleGetter(name) : accessor.get;
                obj[setter] = !accessor || typeof accessor.set !== 'function' ? simpleSetter(name) : accessor.set;
            } else {
                typeof accessor.get === 'function' && (obj[getter] = accessor.get);
                typeof accessor.set === 'function' && (obj[setter] = accessor.set);
            }
        };
    });
}(typeof define === 'function' && define.amd ? define : function (factory) {
    module.exports = factory(require);
});

define('build/ui', [], function () {
});