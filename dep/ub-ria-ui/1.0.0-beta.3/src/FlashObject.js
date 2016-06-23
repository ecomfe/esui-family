/**
 * UB-RIA-UI 1.0
 *
 * @ignore
 * @file Flash组件
 * @author hongfeng(homfen@outlook.com)
 */

define(
    function (require) {
        require('esui/tplLoader!./tpl/FlashObject.tpl.html');

        var esui = require('esui');
        var Control = require('esui/Control');
        var painters = require('esui/painters');
        var eoo = require('eoo');
        var u = require('underscore');

        var FlashObject = eoo.create(
            Control,
            {
                /**
                 * 控件类型，始终为`"FlashObject"`
                 *
                 * @type {string}
                 * @override
                 */
                type: 'FlashObject',

                /**
                 * 初始化参数
                 *
                 * @param {Object} options 构造函数传入的参数
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var properties = {
                        url: '',
                        flashvars: '',
                        width: 214,
                        height: 137,
                        wmode: 'opaque'
                    };
                    u.extend(properties, options);
                    this.setProperties(properties);
                },

                /**
                 * 设置地址
                 *
                 * @public
                 * @param {string} url flash地址
                 */
                setUrl: function (url) {
                    if (url) {
                        this.setProperties({url: url});
                    }
                },

                /**
                 * 重绘
                 *
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        /**
                         * @property {boolean} icon
                         *
                         * 是否带提示图标
                         */
                        name: ['url', 'flashvars', 'width', 'height', 'wmode'],
                        paint: function (flash, url, flashvars, width, height, wmode) {
                            flash.main.innerHTML = flash.helper.renderTemplate('FlashObject', {
                                url: url,
                                flashvars: flashvars,
                                width: width,
                                height: height,
                                wmode: wmode
                            });
                        }
                    }
                )
            }
        );

        esui.register(FlashObject);
        return FlashObject;
    }
);
