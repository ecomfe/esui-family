/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 文本标签控件
 * @author erik, otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var lib = require('./lib');
        var Control = require('./Control');
        var painters = require('./painters');
        var esui = require('./main');
        var eoo = require('eoo');
        var $ = require('jquery');

        /**
         * 文本标签控件
         *
         * 与{@link Panel}类似，但不允许有内部控件，
         * 设置的内容会被HTML转义，但支持{@link Label#click}事件
         *
         * @extends Control
         * @constructor
         */
        var Label = eoo.create(
            Control,
            {
                /**
                 * 控件类型，始终为`"Label"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Label',

                /**
                 * 创建控件主元素
                 *
                 * 如果初始化时提供{@link Label#tagName}属性，则以此创建元素，
                 * 默认使用`<span>`元素
                 *
                 * @param {Object} options 构造函数传入的参数
                 * @return {HTMLElement}
                 * @protected
                 * @override
                 */
                createMain: function (options) {
                    if (!options.tagName) {
                        return this.$super([options]);
                    }
                    return document.createElement(options.tagName);
                },

                /**
                 * 初始化参数
                 *
                 * 如果初始化时提供了主元素，则使用主元素的标签名作为{@link Label#tagName}属性
                 *
                 * 如果未提供{@link Label#text}属性，则使用主元素的文本内容作为此属性的初始值
                 *
                 * @param {Object} [options] 构造函数传入的参数
                 * @override
                 * @protected
                 */
                initOptions: function (options) {
                    var properties = {
                        title: ''
                    };
                    u.extend(properties, options);
                    /**
                     * @property {string} tagName
                     *
                     * 指定主元素标签名
                     *
                     * 此属性仅在初始化时生效，运行期不能修改
                     *
                     * @readonly
                     */
                    properties.tagName = this.main.nodeName.toLowerCase();
                    if (properties.text == null) {
                        properties.text = lib.trim(lib.getText(this.main));
                    }
                    u.extend(this, properties);
                },

                /**
                 * 初始化事件交互
                 *
                 * @protected
                 * @override
                 */
                initEvents: function () {
                    /**
                     * @event click
                     *
                     * 点击时触发
                     */
                    this.helper.delegateDOMEvent(this.main, 'click');
                },

                /**
                 * 重渲染
                 *
                 * @method
                 * @protected
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    /**
                     * @property {string} title
                     *
                     * 鼠标放置在控件上时的提示信息
                     */
                    painters.attribute('title'),
                    /**
                     * @property {string} text
                     *
                     * 文本内容，会被自动HTML转义
                     */
                    painters.text('text'),
                    /**
                     * @property {string} forTarget
                     *
                     * 与当前标签关联的输入控件的id，仅当主元素为`<label>`元素时生效，相当于`for`属性的效果，但指定的是控件的id
                     */
                    {
                        name: 'forTarget',
                        paint: function (label, forTarget) {
                            // 仅对`<label>`元素生效
                            if (!$(label.main).is('label')) {
                                return;
                            }

                            label.helper.addDOMEvent(
                                {once: true},
                                label.main,
                                'mousedown',
                                function fixForAttribute() {
                                    var targetControl = this.viewContext.get(forTarget);
                                    var targetElement = targetControl
                                        && (typeof targetControl.getFocusTarget === 'function')
                                        && targetControl.getFocusTarget();
                                    if (targetElement && targetElement.id) {
                                        lib.setAttribute(this.main, 'for', targetElement.id);
                                    }
                                }
                            );
                        }
                    }
                ),

                /**
                 * 设置文本
                 *
                 * @param {string} text 文本内容，参考{@link Label#text}属性的说明
                 */
                setText: function (text) {
                    this.setProperties({text: text});
                },

                /**
                 * 获取文本
                 *
                 * @return {string}
                 */
                getText: function () {
                    return this.text;
                },

                /**
                 * 设置标题
                 *
                 * @param {string} title 需要设置的值，参考{@link Label#title}属性的说明
                 */
                setTitle: function (title) {
                    this.setProperties({title: title});
                },

                /**
                 * 获取标题
                 *
                 * @return {string}
                 */
                getTitle: function () {
                    return this.title;
                }
            }
        );

        esui.register(Label);
        return Label;
    }
);
