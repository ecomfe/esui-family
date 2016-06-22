/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file FileInput, 原生file input封装
 * @author maoquan(maoquan@baidu.com),weifeng(weifeng@baidu.com)
 */

define(
    function (require) {
        var InputControl = require('esui/InputControl');
        var File = require('./File');

        var $ = require('jquery');
        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * FileInput控件
         *
         * @class ui.FileInput
         * @extends esui.InputControl
         */
        var exports = {
            name: 'files'
        };

        /**
         * 控件类型，始终为`"FileInput"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'FileInput';

        /**
         * 构造函数
         *
         * @constructor
         * @param {Object} options 参数
        */
        exports.constructor = function () {
            this.$super(arguments);
            /**
             * 存放用户当前选择文件
             * 标准浏览器一次可选择多个文件,所以使用数组存放
             * @type {Array}
             */
            this.files = [];

            // 记住上次的uid
            this.lastUid = null;
        };

        /**
         * 浏览器multiple属性特征检测
         *
         * @return {boolean}
         */
        function supportInputMultiple() {
            var elem = document.createElement('input');
            return 'multiple' in elem;
        }

        /**
         * 封装原生file开始
         */
        function addInput() {
            var uid = lib.getGUID('file');

            var input = createInput.call(this, uid + '-input');
            input.onchange = u.bind(fileChangeHandler, this);

            // 不支持multiple即视为不支持html5，上传需要创建form
            if (!supportInputMultiple()) {
                // 如果用户已经选择过文件，则将用过的input移走
                // 这里不能删除用过的input，上传的时候还要用
                if (this.lastUid) {
                    var currForm = lib.g(this.lastUid + '-form');
                    if (currForm) {
                        u.extend(currForm.style, {top: '100%'});
                    }
                }

                var form = createForm.call(this, uid + '-form');

                form.appendChild(input);
                this.main.appendChild(form);
            }
            else {
                this.main.appendChild(input);
            }

            this.lastUid = uid;
        }

        /**
         * 创建表单
         *
         * @param {string} id form的id
         * @return {Element} 创建好的form元素
         */
        function createForm(id) {
            return $(
                lib.format(
                    '<form id="${id}" method="post"'
                    + ' enctype="multipart/form-data" encoding="multipart/form-data"'
                    + ' class="${className}"></form>',
                    {
                        id: id,
                        className: this.helper.getPartClassName('form')
                    }
                )
            )[0];
        }

        /**
         * 创建input
         *
         * @param {string} id input元素id
         * @return {Element} 创建好的input元素
         */
        function createInput(id) {
            var multiple = '';
            var style = '';

            if (supportInputMultiple()) {
                // HTML5的input外部没有form包裹，会冲出边界，所以隐藏掉
                style = 'style="display:none;"';
                if (this.multiple) {
                    multiple = 'multiple="multiple"';
                }
            }

            return $(
                lib.format(
                    '<input id="${id}" type="file" name="${name}" accept="${accept}" ${multiple}'
                    + ' class="${className}" ${style}></input>',
                    {
                        id: id,
                        name: this.name,
                        accept: this.accept,
                        multiple: multiple,
                        style: style,
                        className: this.helper.getPartClassName('input')
                    }
                )
            )[0];
        }

        /**
         * input事件处理
         *
         * @param {miniEvent.event} e 事件对象
         */
        function fileChangeHandler(e) {
            this.files = [];
            var target = e.target;
            if (e.target.files) {
                u.each(
                    e.target.files,
                    function (file) {
                        this.files.push(new File(file));
                    },
                    this
                );
            }
            else {
                if (!target.value) {
                    return;
                }
                var uid = target.id.split('-')[0];
                var file = new File({name: target.value, id: uid});
                this.files = [file];
            }

            // 重置input,保证下次可以重复选择同一个文件
            this.reset();

            this.fire('change');
        }

        /**
         * 获取input
         *
         * @return {Element} input元素
         */
        function getInput() {
            var id = this.lastUid + '-input';
            return lib.g(id);
        }

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);


            if (properties.multiple === 'false') {
                properties.multiple = false;
            }

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            addInput.call(this);

            // 对父元素添加一些必要样式，以保证file input元素显示在正确的位置
            if (!supportInputMultiple) {
                var parentNode = this.main.parentNode;
                if (parentNode) {
                    if (lib.getStyle(parentNode, 'position') === 'static') {
                        parentNode.style.position = 'relative';
                    }
                    var height = lib.getStyle(parentNode, 'height');
                    if (height === 'auto' || parseInt(height, 10) === 0) {
                        parentNode.style.height = '100%';
                    }
                }
                u.extend(
                    this.main.style,
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }
                );
            }
        };

        /**
         * 渲染自身
         *
         * @override
         * @protected
         */
        exports.repaint = require('esui/painters').createRepaint(
            InputControl.prototype.repaint,
            {
                name: ['disabled', 'readOnly'],
                paint: function (fileInput, disabled, readOnly) {
                    var input = getInput.call(fileInput);
                    input.disabled = disabled;
                    input.readOnly = readOnly;
                }
            }
        );

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            this.$super(arguments);
        };

        /**
         * 提供给外部触发上传的接口
         *
         * @method ui.FileInput#triggerUploadOutside
         * @public
         */
        exports.triggerUploadOutside = function () {
            var input = getInput.call(this);
            if (input && !input.disabled) {
                input.click();
            }
        };

        /**
         * 重置input值，可以允许用户选择同一个文件
         *
         * @method ui.FileInput#reset
         * @public
         */
        exports.reset = function () {
            var input = getInput.call(this);

            // 支持HTML5的浏览器直接清空value即可
            if (supportInputMultiple()) {
                // 但是IE即便是高版本仍然不允许修改js修改input值，即便IE11可以修改，也有重复触发change事件的问题
                // 所以对于IE，只能重新搞一个
                if (isIE()) {
                    var clone = input.cloneNode(true);
                    input.parentNode.replaceChild(clone, input);
                    clone.onchange = input.onchange;
                }
                else {
                    input.value = '';
                }
            }
            else {
                // 对于不支持多文件上传的浏览器做降级处理：
                // 一次选择一个文件，选择多次后一次上传
                // 因此，每次用户选择文件后要再创建一个file input,等待用户再次选择文件
                // 一个input只用一次
                input.onchange = function () {};
                addInput.call(this);
            }
        };

        var FileInput = require('eoo').create(InputControl, exports);

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        FileInput.defaultProperties = {
        };

        /**
         * IE判断
         *
         * @return {boolean}
         */
        function isIE() {
            if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                return true;
            }
            return false;
        }

        require('esui').register(FileInput);
        return FileInput;
    }
);
