/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file FileInput, 原生file input封装
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {
        var InputControl = require('esui/InputControl');
        var File = require('./File');

        var u = require('underscore');
        var lib = require('esui/lib');

        /**
         * FileInput控件
         *
         * @class ui.FileInput
         * @extends esui.InputControl
         */
        var exports = {
            name: 'file-data'
        };

        /**
         * 控件类型，始终为`"FileInput"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'FileInput';

        /**
         * @constructor
         * @param {Object} options
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


        // 恩，不知道怎么用特征判断
        // 这个判断无视了低版本的firefox，chrome等
        var supportMultiple = !(lib.ie && lib.ie <= 9);

        /**
         * IE9-不支持一次选择多个文件上传，这里做降级处理：
         * 一次选择一个文件，选择多次后一次上传
         * 因此，每次用户选择文件后要再创建一个file input,等待用户再次选择文件
         */
        function addInput() {

            var me = this;
            var uid = lib.getGUID('fileinput');

            // 如果用户已经选择过文件，则将用过的input移走
            // 这里不能删除用过的input，上传的时候还要用
            if (this.lastUid) {
                var currForm = lib.g(this.lastUid + '_form');
                if (currForm) {
                    u.extend(currForm.style, {top: '100%'});
                }
            }

            var form = document.createElement('form');
            form.setAttribute('id', uid + '_form');
            form.setAttribute('method', 'post');
            form.setAttribute('enctype', 'multipart/form-data');
            form.setAttribute('encoding', 'multipart/form-data');
            lib.addClass(form, this.helper.getPartClassName('form'));

            lib.extend(
                form.style,
                {
                    overflow: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }
            );

            var input = document.createElement('input');
            input.setAttribute('id', uid);
            input.setAttribute('type', 'file');
            input.setAttribute('name', this.name);
            input.setAttribute('accept', this.accept);

            lib.extend(
                input.style,
                {
                    fontSize: '999px',
                    opacity: 0, // TODO: IE9-
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }
            );

            if (lib.ie && lib.ie < 10) {
                lib.extend(
                    input.style,
                    {
                        filter : "progid:DXImageTransform.Microsoft.Alpha(opacity=0)"
                    }
                );
            }

            form.appendChild(input);
            this.main.appendChild(form);

            /**
             * input选择完文件后则移走，重新创建一个新的input等待下次上传
             */
            input.onchange = function() {
                var file;

                if (!this.value) {
                    return;
                }

                if (this.files && this.files.length) {
                    file = new File(this.files[0]);
                }
                else {
                    file = new File();
                    file.name = this.value;
                }
                u.extend(file, {id: uid});
                me.files = [file];

                // 一个input只用一次
                this.onchange = function() {};
                // 一般外部通过监听change事件来添加文件
                me.fire('change');
                // 重新创建一个input来接收用户上传
                addInput.call(me);
            };

            this.lastUid = uid;
        }

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = {};
            lib.extend(properties, this.$self.defaultProperties, options);

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            if (supportMultiple) {
                var tpl = '<input id="${inputId}" type="file"'
                    + ' style="font-size:999px;opacity:0;display:none;"'
                    + ' ${multiplel} ${accept} />';
                this.lastUid = this.helper.getId('input');
                this.main.innerHTML = lib.format(
                    tpl,
                    {
                        inputId: this.lastUid,
                        multiple: this.multiple,
                        accept: this.accept && this.accept.join(',') || ''
                    }
                );
            }
            else {
                addInput.call(this);
                // 对父元素添加一些必要样式，以保证file input元素显示在正确的位置
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
         * @override
         */
        exports.initEvents = function () {
            // IE不支持在用户事件中触发file input对话框
            if (supportMultiple) {
                var me = this;
                var input = lib.g(this.lastUid);
                this.browseButton.on(
                    'click',
                    function(e) {
                        if (input && !input.disabled) {
                            input.click();
                        }
                        e.preventDefault();
                    }
                );
                input.onchange = function () {
                    me.files = [];
                    u.each(
                        this.files,
                        function (file) {
                            me.files.push(new File(file));
                        }
                    )
                    // 重置input,保证下次可以重复选择同一个文件
                    me.reset();

                    me.fire('change');
                };
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
                name: 'accept',
                paint: function (fileInput, accept) {
                    var input = lib.g(fileInput.lastUid);
                    if (input && accept) {
                        lib.setAttribute(input, 'accept', accept.join(','));
                    }
                    else {
                        lib.removeAttribute(input, 'accept');
                    }
                }
            },
            {
                name: 'multiple',
                paint: function (fileInput, multiple) {
                    var input = lib.g(fileInput.lastUid);
                    if (input && multiple) {
                        lib.setAttribute(input, 'multiple', 'multiple');
                    }
                    else {
                        lib.removeAttribute(input, 'multiple');
                    }
                }
            },
            {
                name: ['disabled', 'readOnly'],
                paint: function (fileInput, disabled, readOnly) {
                    var input = lib.g(fileInput.lastUid);
                    input.disabled = disabled;
                    input.readOnly = readOnly;
                }
            }
        );

        /**
         * 重置input值，可以允许用户选择同一个文件
         */
        exports.reset = function () {
            var input = lib.g(this.lastUid);
            // 标准浏览器下清空value值
            if (!lib.ie) {
                input.value = '';
            }
            else {
                // IE input[type="file"] 为只读，只能重新搞一个
                var clone = input.cloneNode(true);
                input.parentNode.replaceChild(clone, input);
                clone.onchange = input.onchange;
            }
        };

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            this.$super(arguments);
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

        require('esui').register(FileInput);

        return FileInput;
    }
);
