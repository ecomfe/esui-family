/**
 * @file 生成flash html
 * @author jon_neal
 * jQuery SWFObject v1.1.1 MIT/GPL @jon_neal
 * http://jquery.thewikies.com/swfobject
 */

define(function (require) {
    var jQuery = require('jquery');

    (function ($, flash, Plugin) {
        var OBJECT = 'object';
        var ENCODE = true;

        function compareArrayIntegers(a, b) {
            var x = (a[0] || 0) - (b[0] || 0);

            return x > 0 || (
                !x
                && a.length > 0
                && compareArrayIntegers(a.slice(1), b.slice(1))
            );
        }

        function objectToArguments(obj) {
            if (typeof obj !== OBJECT) {
                return obj;
            }

            var arr = [];
            var str = '';

            for (var i in obj) {
                if (typeof obj[i] === OBJECT) {
                    str = objectToArguments(obj[i]);
                }
                else {
                    str = [i, (ENCODE) ? encodeURI(obj[i]) : obj[i]].join('=');
                }

                arr.push(str);
            }

            return arr.join('&');
        }

        function objectFromObject(obj) {
            var arr = [];

            for (var i in obj) {
                if (obj[i]) {
                    arr.push([i, '="', obj[i], '"'].join(''));
                }
            }

            return arr.join(' ');
        }

        function paramsFromObject(obj) {
            var arr = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i) && obj[i]) {
                    arr.push([
                        '<param name="', i,
                        '" value="', objectToArguments(obj[i]), '" />'
                    ].join(''));
                }
            }

            return arr.join('');
        }

        try {
            var flashVersion = Plugin.description || (function () {
                var newPlugin = new Plugin('ShockwaveFlash.ShockwaveFlash');
                /*eslint-disable */
                return newPlugin.GetVariable('$version');
                /*eslint-enable */
            }());
        }
        catch (e) {
            flashVersion = 'Unavailable';
        }

        var flashVersionMatchVersionNumbers = flashVersion.match(/\d+/g) || [0];

        $[flash] = {
            available: flashVersionMatchVersionNumbers[0] > 0,

            activeX: Plugin && !Plugin.name,

            version: {
                original: flashVersion,
                array: flashVersionMatchVersionNumbers,
                string: flashVersionMatchVersionNumbers.join('.'),
                major: parseInt(flashVersionMatchVersionNumbers[0], 10) || 0,
                minor: parseInt(flashVersionMatchVersionNumbers[1], 10) || 0,
                release: parseInt(flashVersionMatchVersionNumbers[2], 10) || 0
            },

            hasVersion: function (version) {
                var versionArray = (/string|number/.test(typeof version))
                    ? version.toString().split('.')
                    : (/object/.test(typeof version))
                        ? [version.major, version.minor]
                        : version || [0, 0];

                return compareArrayIntegers(
                    flashVersionMatchVersionNumbers,
                    versionArray
                );
            },

            encodeParams: true,

            expressInstall: 'expressInstall.swf',
            expressInstallIsActive: false,

            create: function (obj) {
                var instance = this;

                if (
                    !obj.swf
                    || instance.expressInstallIsActive
                    || (!instance.available && !obj.hasVersionFail)
                ) {
                    return false;
                }

                if (!instance.hasVersion(obj.hasVersion || 1)) {
                    instance.expressInstallIsActive = true;

                    if (typeof obj.hasVersionFail === 'function') {
                        if (!obj.hasVersionFail.apply(obj)) {
                            return false;
                        }
                    }

                    obj = {
                        swf: obj.expressInstall || instance.expressInstall,
                        height: 137,
                        width: 214,
                        flashvars: {
                            MMredirectURL: location.href,
                            MMplayerType: (instance.activeX)
                                ? 'ActiveX' : 'PlugIn',
                            MMdoctitle: document.title.slice(0, 47)
                                + ' - Flash Player Installation'
                        }
                    };
                }

                var attrs = {
                    data: obj.swf,
                    type: 'application/x-shockwave-flash',
                    id: obj.id || 'flash_' + Math.floor(Math.random() * 999999999),
                    width: obj.width || 320,
                    height: obj.height || 180,
                    style: obj.style || ''
                };

                ENCODE = typeof obj.useEncode !== 'undefined' ? obj.useEncode : instance.encodeParams;

                obj.movie = obj.swf;
                obj.wmode = obj.wmode || 'opaque';

                delete obj.fallback;
                delete obj.hasVersion;
                delete obj.hasVersionFail;
                delete obj.height;
                delete obj.id;
                delete obj.swf;
                delete obj.useEncode;
                delete obj.width;

                var flashContainer = document.createElement('div');

                flashContainer.innerHTML = [
                    '<object ', objectFromObject(attrs), '>',
                    paramsFromObject(obj),
                    '</object>'
                ].join('');

                return flashContainer.firstChild;
            }
        };

        $.fn[flash] = function (options) {
            var $this = this.find(OBJECT).andSelf().filter(OBJECT);

            if (/string|object/.test(typeof options)) {
                this.each(
                    function () {
                        var $this = $(this);
                        var flashObject;

                        options = (typeof options === OBJECT) ? options : {
                            swf: options
                        };

                        options.fallback = this;

                        flashObject = $[flash].create(options);

                        if (flashObject) {
                            $this.children().remove();

                            $this.html(flashObject);
                        }
                    }
                );
            }

            if (typeof options === 'function') {
                $this.each(
                    function () {
                        var instance = this;
                        var jsInteractionTimeoutMs = 'jsInteractionTimeoutMs';

                        instance[jsInteractionTimeoutMs]
                            = instance[jsInteractionTimeoutMs] || 0;

                        if (instance[jsInteractionTimeoutMs] < 660) {
                            if (instance.clientWidth || instance.clientHeight) {
                                options.call(instance);
                            }
                            else {
                                setTimeout(
                                    function () {
                                        $(instance)[flash](options);
                                    },
                                    instance[jsInteractionTimeoutMs] + 66
                                );
                            }
                        }
                    }
                );
            }

            return $this;
        };
    }(
        jQuery,
        'flash',
        navigator.plugins['Shockwave Flash'] || window.ActiveXObject
    ));
});
