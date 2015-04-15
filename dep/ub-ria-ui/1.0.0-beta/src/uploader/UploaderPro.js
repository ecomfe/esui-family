/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 上传增强控件,支持弹出dialog,在dialog中进行各种上传操作
 * @author maoquan(maoquan@baidu.com)
 */

define(
    function (require) {
        var InputControl = require('esui/InputControl');
        var Table = require('esui/Table');
        var Command = require('esui/extension/Command');
        var File = require('./File');
        require('esui/Dialog');
        require('esui/Button');

        var u = require('underscore');
        var lib = require('esui/lib');
        var ui = require('esui/main');

        /**
         * @type {ui.Dialog}
         *
         * 在弹出对话框中管理上传
         */
        var dialog;

        /**
         * UploaderPro控件
         *
         * @class ui.UploaderPro
         * @extends esui.InputControl
         */
        var exports = {};

        /**
         * 控件类型，始终为`"UploaderPro"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'UploaderPro';

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = { };
            lib.extend(properties, this.$self.defaultProperties, options);

            if (this.main.title) {
                properties.title = this.main.title;
            }
            // 文件上传数量限制
            var limit = properties.limit;
            if (u.isString(limit)) {
                properties.limit = parseInt(limit, 10);
            }

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            var buttonClasses = this.helper.getPartClassName('button');

            var tpl = '<button data-ui-id="button"'
                + ' data-ui="type:Button;variants:${variants}"'
                + ' class="${buttonClasses}"></button>';

            this.main.innerHTML = lib.format(
                tpl,
                {
                    buttonClasses: buttonClasses,
                    variants: this.buttonVariants
                }
            );

            ui.init(this.main, {viewContext: this.viewContext});
        };

        /**
         * 点击上传按钮后弹出`dialog`，所有上传操作，交互均在`dialog`中完成
         */
        function showDialog() {

            if (dialog) {
                dialog.show();
                return false;
            }

            var me = this;

            var properties = {
                skin: 'uploader',
                title: this.title,
                id: this.helper.getId('uploader-dialog'),
                closeOnHide: false,
                mask: true,
                alwaysTop: true,
                needFoot: false,
                viewContext: this.viewContext
            };

            dialog = ui.create('Dialog', properties);
            dialog.appendTo(document.body);
            dialog.setTitle(this.title);
            dialog.show();

            var body = dialog.getBody().main;
            // 表格上方的提示信息
            var tpl = [
                '<p class="${infoClass}">',
                '当前已添加文件<span id="${doneId}" class="${doneClass}">0</span>个, ',
                '还可以添加<span id="${avaliableId}" class="${avaliableClass}">0</span>个',
                '</p>'
            ].join('');
            body.innerHTML = lib.format(
                tpl,
                {
                    infoClass: dialog.helper.getPartClassName('info'),
                    doneId: dialog.helper.getId('info-done'),
                    doneClass: dialog.helper.getPartClassName('info-done'),
                    avaliableId: dialog.helper.getId('info-avaliable'),
                    avaliableClass: dialog.helper.getPartClassName('info-avaliable')
                }
            );

            // 创建用于显示上传信息的表格
            createTable.call(this);

            // 整个队列的上传信息
            var totalInfoTpl = [
                '<div class="ui-progress" style="display:none;">',
                '<div id="${progressId}" class="ui-progress-bar"></div>',
                '</div>',
                '<span id="${progressInfoId}" class="${progressInfoClass}">0%</span>',
                '<span id="${sizeId}" class="${sizeClass}">0KB</span>'
            ].join('');

            dialog.setFoot(
                lib.format(
                    totalInfoTpl,
                    {
                        progressId: dialog.helper.getId('progress'),
                        progressInfoId: dialog.helper.getId('progressInfo'),
                        progressInfoClass: dialog.helper.getPartClassName('progress'),
                        sizeId: dialog.helper.getId('size'),
                        sizeClass: dialog.helper.getPartClassName('size')
                    }
                )
            );

            // 创建上传按钮
            var uploader = createUploader.call(this);

            // 开始上传按钮
            var startButton = ui.create(
                'Button',
                {
                    content: '开始上传',
                    variants: 'link'
                }
            );
            var foot = dialog.getFoot();
            startButton.appendTo(foot);

            startButton.on(
                'click',
                function (event) {
                    uploader.start();
                }
            );
        }

        /**
         * 创建用于显示上传信息的表格
         */
        function createTable() {
            var table = ui.create(
                'Table',
                {
                    id: dialog.helper.getId('table'),
                    skin: 'uploader',
                    noFollowHeadCache: true,
                    noDataHtml: '<p style="margin:0;height:200px;">拖拽文件到此区域</p>',
                    extensions: [
                        new Command(
                            {
                                eventTypes: ['click'],
                                useCapture: false
                            }
                        )
                    ],
                    datasource: [],
                    fields: [
                        {
                            title: '文件名称',
                            field: 'id' ,
                            tip :'文件名称',
                            width: '82%',
                            content: function (file) {
                                return file.name;
                            }
                        },
                        {
                            title: '进度',
                            field: 'progress' ,
                            tip :'进度',
                            width: '4%',
                            align: 'center',
                            content: function (file) {
                                return file.getProgress();
                            }
                        },
                        {
                            title: '文件大小',
                            field: 'size' ,
                            tip :'文件大小',
                            width: '8%',
                            align: 'center',
                            content: function (file) {
                                return File.formatSize(file.size);
                            }
                        },
                        {
                            title: '操作',
                            field: 'op' ,
                            tip :'操作',
                            width: '6%',
                            align: 'center',
                            content: function (file) {
                                var tpl = '<span data-command="remove"'
                                    + ' data-command-args="${id}"'
                                    + ' class="ui-icon-${type} ui-eicons-fw"></span>';
                                var type = 'close';
                                if (file.status === File.DONE || file.status === File.FAILED) {
                                    type = 'unlink';
                                }
                                return lib.format(
                                    tpl,
                                    {
                                        id: file.id,
                                        type: type
                                    }
                                );
                            }
                        }
                    ]
                }
            );
            var body = dialog.getBody().main;
            table.appendTo(body);

            var me = this;
            // 移除该行以及对应的文件
            table.on(
                'command',
                function (event) {
                    var uploader = me.getUploader();
                    if (uploader) {
                        uploader.removeFile(event.args);
                    }
                }
            );

            return table;
        }

        /**
         * 创建`Uploader`，用于文件上传
         */
        function createUploader() {

            var uploader = ui.create(
                'Uploader',
                {
                    id: dialog.helper.getId('uploader'),
                    skin: 'pro',
                    width: 96,
                    action: this.action,
                    name: this.name,
                    autoUpload: false,
                    accept: this.accept,
                    showProgress: false,
                    multiple: true,
                    limit: Math.max(this.datasource.length, this.limit),
                    buttonVariants: this.buttonVariants
                }
            );

            var foot = dialog.getFoot();
            uploader.appendTo(foot);

            var me = this;
            var table = this.getTable();

            uploader.on(
                'filesadded',
                function (event) {
                    Array.prototype.push.apply(table.datasource, event.data);
                    table.setDatasource(table.datasource);
                    updateTotal.call(me);
                }
            );

            uploader.on(
                'filesremoved',
                function (event) {
                    var datasource = u.filter(
                        table.datasource,
                        function (file) {
                            return file !== event.data;
                        }
                    );
                    table.setDatasource(datasource);
                    updateTotal.call(me);
                }
            );

            uploader.on(
                'progress',
                function (event) {
                    u.each(
                        uploader.files,
                        function (file, index) {
                            // 更新进度
                            var cell = lib.g(table.getBodyCellId(index, 1));
                            var progressElem = cell.getElementsByTagName('span')[0];
                            progressElem.innerHTML = file.getProgress();
                        }
                    );
                    updateTotal.call(me);
                }
            );

            uploader.on(
                'uploaded',
                function (event) {
                    var index = u.indexOf(table.datasource, event.file);
                    // 更新完成状态
                    var cell = lib.g(table.getBodyCellId(index, 3));
                    var statusElem = lib.dom.first(cell.getElementsByTagName('span')[0]);
                    lib.removeClass(statusElem, 'ui-icon-close');
                    lib.addClass(statusElem, 'ui-icon-unlink');
                    updateTotal.call(me);
                }
            );

            uploader.on(
                'complete',
                function (event) {
                    var progressElem = dialog.helper.getPart('progress');
                    setTimeout(
                        function () {
                            progressElem.parentNode.style.display = 'none';
                            progressElem.style.width = '0px';
                        },
                        100
                    );
                }
            );

            uploader.on(
                'error',
                function (event) {
                    // TODO 错误处理
                    console.log(event);
                }
            );

            // `modify`时要添加已存在的文件
            uploader.setRawValue(this.datasource);

            return uploader;
        }

        /**
         * 更新队列上传信息
         */
        function updateTotal() {
            var uploader = this.getUploader();
            var total = uploader.getTotal();
            var percent = total.percent + '%';
            if (total.percent > 0) {
                var progressElem = dialog.helper.getPart('progress');
                progressElem.style.width = percent;
                progressElem.parentNode.style.display = 'block';
                progressElem.innerHTML = percent;
            }
            // 更新队列总尺寸
            var sizeElem = dialog.helper.getPart('size');
            sizeElem.innerHTML = File.formatSize(total.size);
            // 更新进度
            var progressInfoElem = dialog.helper.getPart('progressInfo');
            progressInfoElem.innerHTML = percent;
            // 表格上方提示信息
            var table = this.getTable();
            var done = table.datasource.length;
            var doneElem = dialog.helper.getPart('info-done');
            doneElem.innerHTML = done;
            var avaliable = Math.max(this.limit - done, 0);
            var avaliableElem = dialog.helper.getPart('info-avaliable');
            avaliableElem.innerHTML = avaliable;

        }

        /**
         * @override
         */
        exports.initEvents = function () {
            var me = this;
            var button = this.viewContext.get('button');
            button.on(
                'click',
                function (event) {
                    showDialog.call(me);
                }
            );

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
                name: ['text'],
                paint: function (control, text) {
                    var button = control.viewContext.get('button');
                    button.setContent(u.escape(text));
                }
            },
            {
                name: ['width'],
                paint: function (control, width) {
                    var widthWithUnit = width + 'px';

                    control.main.style.width = widthWithUnit;
                    var button = control.viewContext.get('button');
                    button.setProperties(
                        {
                            width: width,
                        }
                    );
                }
            },
            {
                name: 'rawValue',
                paint: function (control, rawValue) {
                    if (!u.isArray(rawValue)) {
                        return;
                    }
                    var uploader = control.getUploader();
                    if (uploader) {
                        uploader.setRawValue(rawValue);
                    }
                }
            }
        );

        /**
         * 获取上传对话框控件
         *
         * @return {ui.Dialog}
         */
        exports.getDialog = function () {
            return this.viewContext.get(this.helper.getId('uploader-dialog'));
        }

        /**
         * 获取上传列表
         *
         * @return {ui.Table}
         */
        exports.getTable = function () {
            return this.viewContext.get(dialog.helper.getId('table'));
        }

        /**
         * 获取上传控件
         *
         * @return {ui.Table}
         */
        exports.getUploader = function () {
            return this.viewContext.get(dialog.helper.getId('uploader'));
        }

        /**
         * 上传错误处理
         *
         * @param {string} message 失败消息
         * @protected
         */
        exports.notifyError = function (message) {
            // TODO 错误处理
        };

        /**
         * @override
         */
        exports.getRawValue = function () {
            var uploader = this.getUploader();
            if (uploader) {
                return uploader.getRawValue();
            }
            return null;
        };

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            this.$super(arguments);
        };

        var UploaderPro = require('eoo').create(InputControl, exports);

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        UploaderPro.defaultProperties = {
            width: 80,
            fileType: '*',
            text: '点击上传',
            autoUpload: true,
            action: '',
            extraArgs: {},
            buttonVariants: 'primary'

        };

        require('esui').register(UploaderPro);

        return UploaderPro;
    }
);
