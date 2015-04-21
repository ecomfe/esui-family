define(function (require) {
    var u = require('underscore');

    var browser = (function () {
        var ua = navigator.userAgent;
        
        var result = {
            isStrict : document.compatMode == "CSS1Compat",
            isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua),
            isWebkit: /webkit/i.test(ua)
        };

        try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};

        // 蛋疼 你懂的
        switch (true) {
            case /msie (\d+\.\d+)/i.test(ua) :
                result.ie = document.documentMode || + RegExp['\x241'];
                break;
            case /chrome\/(\d+\.\d+)/i.test(ua) :
                result.chrome = + RegExp['\x241'];
                break;
            case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
                result.safari = + (RegExp['\x241'] || RegExp['\x242']);
                break;
            case /firefox\/(\d+\.\d+)/i.test(ua) : 
                result.firefox = + RegExp['\x241'];
                break;
            
            case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
                result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
                break;
        }

        return result;
    })();

    var swf = {};

    swf.version = (function () {
        var n = navigator;
        if (n.plugins && n.mimeTypes.length) {
            var plugin = n.plugins["Shockwave Flash"];
            if (plugin && plugin.description) {
                return plugin.description
                        .replace(/([a-zA-Z]|\s)+/, "")
                        .replace(/(\s)+r/, ".") + ".0";
            }
        } else if (window.ActiveXObject && !window.opera) {
            for (var i = 12; i >= 2; i--) {
                try {
                    var c = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + i);
                    if (c) {
                        var version = c.GetVariable("$version");
                        return version.replace(/WIN/g,'').replace(/,/g,'.');
                    }
                } catch(e) {}
            }
        }
    })();

    swf.createHTML = function (options) {
        options = options || {};
        var version = swf.version, 
            needVersion = options['ver'] || '6.0.0', 
            vUnit1, vUnit2, i, k, len, item, tmpOpt = {};
        
        // 复制options，避免修改原对象
        for (k in options) {
            tmpOpt[k] = options[k];
        }
        options = tmpOpt;
        
        // 浏览器支持的flash插件版本判断
        if (version) {
            version = version.split('.');
            needVersion = needVersion.split('.');
            for (i = 0; i < 3; i++) {
                vUnit1 = parseInt(version[i], 10);
                vUnit2 = parseInt(needVersion[i], 10);
                if (vUnit2 < vUnit1) {
                    break;
                } else if (vUnit2 > vUnit1) {
                    return ''; // 需要更高的版本号
                }
            }
        } else {
            return ''; // 未安装flash插件
        }
        
        var vars = options['vars'],
            objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];
        
        // 初始化object标签需要的classid、codebase属性值
        options['align'] = options['align'] || 'middle';
        options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
        options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
        options['movie'] = options['url'] || '';
        delete options['vars'];
        delete options['url'];
        
        // 初始化flashvars参数的值
        if ('string' == typeof vars) {
            options['flashvars'] = vars;
        } else {
            var fvars = [];
            for (k in vars) {
                item = vars[k];
                fvars.push(k + "=" + encodeURIComponent(item));
            }
            options['flashvars'] = fvars.join('&');
        }
        
        // 构建IE下支持的object字符串，包括属性和参数列表
        var str = ['<object '];
        for (i = 0, len = objProperties.length; i < len; i++) {
            item = objProperties[i];
            str.push(' ', item, '="', encodeHTML(options[item]), '"');
        }
        str.push('>');
        var params = {
            'wmode'             : 1,
            'scale'             : 1,
            'quality'           : 1,
            'play'              : 1,
            'loop'              : 1,
            'menu'              : 1,
            'salign'            : 1,
            'bgcolor'           : 1,
            'base'              : 1,
            'allowscriptaccess' : 1,
            'allownetworking'   : 1,
            'allowfullscreen'   : 1,
            'seamlesstabbing'   : 1,
            'devicefont'        : 1,
            'swliveconnect'     : 1,
            'flashvars'         : 1,
            'movie'             : 1
        };
        
        for (k in options) {
            item = options[k];
            k = k.toLowerCase();
            if (params[k] && (item || item === false || item === 0)) {
                str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
            }
        }
        
        // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
        options['src']  = options['movie'];
        options['name'] = options['id'];
        delete options['id'];
        delete options['movie'];
        delete options['classid'];
        delete options['codebase'];
        options['type'] = 'application/x-shockwave-flash';
        options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';
        
        
        // 构建embed标签的字符串
        str.push('<embed');
        // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
        // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
        var salign;
        for (k in options) {
            item = options[k];
            if (item || item === false || item === 0) {
                if ((new RegExp("^salign\x24", "i")).test(k)) {
                    salign = item;
                    continue;
                }
                
                str.push(' ', k, '="', encodeHTML(item), '"');
            }
        }
        
        if (salign) {
            str.push(' salign="', encodeHTML(salign), '"');
        }
        str.push('></embed></object>');
        
        return str.join('');
    };

    swf.create = function (options, target) {
        options = options || {};
        var html = swf.createHTML(options) 
                   || options['errorMessage'] 
                   || '';
                    
        if (target && 'string' == typeof target) {
            target = document.getElementById(target);
        }
        insertHTML( target || document.body ,'beforeEnd',html );
    };

    swf.getMovie = function (name) {
        //ie9下, Object标签和embed标签嵌套的方式生成flash时,
        //会导致document[name]多返回一个Object元素,而起作用的只有embed标签
        var movie = document[name], ret;
        return browser.ie == 9 ?
            movie && movie.length ? 
                (ret = removeFromArray(toArray(movie),function(item){
                    return item.tagName.toLowerCase() != "embed";
                })).length == 1 ? ret[0] : ret
                : movie
            : movie || window[name];
    };

    swf.Proxy = function(id, property, loadedHandler) {
        
        var me = this,
            flash = this._flash = swf.getMovie(id),
            timer;
        if (! property) {
            return this;
        }
        timer = setInterval(function() {
            try {
                
                if (flash[property]) {
                    me._initialized = true;
                    clearInterval(timer);
                    if (loadedHandler) {
                        loadedHandler();
                    }
                }
            } catch (e) {
            }
        }, 100);
    };

    swf.Proxy.prototype.getFlash = function() {
        return this._flash;
    };

    swf.Proxy.prototype.isReady = function() {
        return !! this._initialized;
    };

    swf.Proxy.prototype.call = function(methodName, var_args) {
        try {
            var flash = this.getFlash(),
                args = Array.prototype.slice.call(arguments);

            args.shift();
            if (flash[methodName]) {
                flash[methodName].apply(flash, args);
            }
        } catch (e) {
        }
    };

    function encodeHTML (source) {
        if (typeof source === 'number') {
            source += '';
        }
        return source.replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    }

    function insertHTML (position, html) {
        var range,begin,element = this[0];
    
        //在opera中insertAdjacentHTML方法实现不标准，如果DOMNodeInserted方法被监听则无法一次插入多element
        //by lixiaopeng @ 2011-8-19
        if (element.insertAdjacentHTML && !browser.opera) {
            element.insertAdjacentHTML(position, html);
        } else {
            // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
            // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
            range = element.ownerDocument.createRange();
            // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
            // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
            position = position.toUpperCase();
            if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
                range.selectNodeContents(element);
                range.collapse(position == 'AFTERBEGIN');
            } else {
                begin = position == 'BEFOREBEGIN';
                range[begin ? 'setStartBefore' : 'setEndAfter'](element);
                range.collapse(begin);
            }
            range.insertNode(range.createContextualFragment(html));
        }
        return element;
    }

    function removeFromArray (source, match) {
        var n = source.length;
            
        while (n--) {
            if (source[n] === match) {
                source.splice(n, 1);
            }
        }
        return source;
    }

    function toArray (source) {
        if (source === null || source === undefined)
            return [];
        if (u.isArray(source))
            return source;

        // The strings and functions also have 'length'
        if (typeof source.length !== 'number' || typeof source === 'string' || typeof source === 'function') {
            return [source];
        }

        //nodeList, IE 下调用 [].slice.call(nodeList) 会报错
        if (source.item) {
            var l = source.length, array = new Array(l);
            while (l--)
                array[l] = source[l];
            return array;
        }

        return [].slice.call(source);
    }


    return swf;
});