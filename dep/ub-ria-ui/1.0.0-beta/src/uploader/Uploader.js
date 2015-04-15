/**
 * UB-RIA-UI 1.0
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 上传控件
 * @author maoquan(maoquan@baidu.com), zhanglili(otakustay@gmail.com)
 */

define(
    function (require) {
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var InputControl = require('esui/InputControl');

        var File = require('./File');
        require('./FileInput');

        var u = require('underscore');
        var lib = require('esui/lib');
        var ui = require('esui/main');

        /**
         * 状态常量
         */
        // 已开始上传
        var UPLOADER_STARTED = 0;
        // 已停止上传，表示未选择文件或上传结束
        var UPLOADER_STOPPED = 1;

        /**
         * 常见错误枚举
         */
        var ERROR = {
            // http错误，一般来说就是status返回不是200
            HTTP: 1,
            // 文件类型错误
            FILE_EXTENSIONS: 2,
            // 文件重复了,且配置项为不允许重复文件
            FILE_DUPLICATE: 3,
            // 文件超出最大尺寸, 标准浏览器下可以判断
            FILE_MAX_SIZE: 4,
            // 文件数量超过最大限制了
            FILE_MAX_NUMBER: 5
        };

        // 错误信息
        var ERROR_MESSAGE_LIST = [
            '',
            '网络错误',
            '仅接受以下文件格式: {0}',
            '不允许重复',
            '超出最大上传尺寸',
            '文件数量超过最大限制'
        ];

        /**
         * 获取错误信息
         * @param {number} code 错误代码
         * @param data 格式化错误信息用到的数据
         */
        function getErrorMessage(code, data) {
            return lib.format(
                ERROR_MESSAGE_LIST[code],
                data || {}
            );
        };


        /**
         * Uploader控件
         *
         * @class ui.Uploader
         * @extends esui.InputControl
         */
        var exports = {};

        /**
         * 控件类型，始终为`"Uploader"`
         *
         * @type {string}
         * @override
         */
        exports.type = 'Uploader';

        /**
         * @constructor
         */
        exports.constructor = function () {
            this.$super(arguments);
            /**
             * 所有用户选择文件，包括已上传 / 未上传 / 正在上传的
             *
             * @type {Array}
             */
            this.files = [];
            /**
             * 当前状态
             * UPLOADER_STARTED: 已开始上传
             * UPLOADER_STOPPED: 上传完成或用户未选择文件
             */
            this.state = UPLOADER_STOPPED;
        };

        /*
         * 上传进度
         */
        var total = {
            // 队列所有文件的尺寸和
            size: undefined,
            // 已上传的所有文件字节数
            loaded: 0,
            // 已上传文件数量
            uploaded: 0,
            // 上传失败文件数量
            failed: 0,
            // 等待文件上传数量
            queued: 0,
            // 已上传进度
            // 标准浏览器下，如果可以计算已上传文件字节数，则使用字节百分比
            // 否则使用文件数百分比
            percent: 0
        };

        /**
         * 计算上传进度
         */
        function calc() {
            // 重置进度
            u.each(u.keys(total), function (key) {total[key] = 0;})

            var files = this.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (!u.isUndefined(file.size) && !u.isUndefined(total.size)) {
                    total.size += file.size;
                    total.loaded += (file.loaded || 0);
                }
                else {
                    total.size = undefined;
                }

                if (file.status == File.DONE) {
                    total.uploaded++;
                }
                else if (file.status == File.FAILED) {
                    total.failed++;
                }
                else {
                    total.queued++;
                }
            }

            // 如果不能算出字节比例，则使用文件数量计算
            if (u.isUndefined(total.size)) {
                total.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;
            }
            else {
                total.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;
            }
            total.percent = Math.min(total.percent, 100);
        }

        /**
         * 上传进度条
         */
        function updateProgress() {
            var progressBar = lib.g(this.helper.getId('progress'));
            if (this.state === UPLOADER_STARTED && total.percent > 0) {
                progressBar.style.width = total.percent + '%';
                progressBar.parentNode.style.display = 'block';
            }
            else {
                // 进度条延迟一会儿再隐藏
                setTimeout(
                    function () {
                        progressBar.parentNode.style.display = 'none';
                    },
                    500
                );
            }
        }

        var isXhrLevel2 = window.File && window.XMLHttpRequest && new window.XMLHttpRequest().upload;

        /**
         * 获取合适的XMLHttpRequest，用于文件上传
         * 目前实现了html5 / html4的XMLHttpRequest,后面根据需要增加flash的上传
         *
         * @return {ui.XMLHttpRequest}
         */
        function getXhr() {
            var XMLHttpRequest;
            if (isXhrLevel2) {
                XMLHttpRequest = require('./HTML5XMLHttpRequest');
            }
            else {
                XMLHttpRequest = require('./HTML4XMLHttpRequest');
            }
            return new XMLHttpRequest;
        }

        /**
         * @override
         */
        exports.initOptions = function (options) {
            var properties = { };
            lib.extend(properties, this.$self.defaultProperties, options);

            if (lib.isInput(this.main)) {
                properties.accept = properties.accept || lib.getAttribute(this.main, 'accept');
                properties.name = properties.name || this.main.name;
                if (lib.hasAttribute(this.main, 'multiple')) {
                    properties.multiple = true;
                }
                else {
                    properties.multiple = false;
                }
            }

            if (typeof properties.accept === 'string') {
                properties.accept = lib.splitTokenList(properties.accept);
            }

            var autoUpload = properties.autoUpload;
            if (autoUpload === 'true') {
                properties.autoUpload = true;
            }

            var multiple = properties.multiple;
            if (multiple === 'false' || !multiple) {
                properties.multiple = false;
                // 单文件上传，autoUpload强制为true
                properties.autoUpload = true;
            }

            if (!properties.hasOwnProperty('title') && this.main.title) {
                properties.title = this.main.title;
            }

            this.setProperties(properties);
        };

        /**
         * @override
         */
        exports.initStructure = function () {
            if (this.main.nodeName !== 'FORM') {
                this.helper.replaceMain();
            }

            var inputContainerId = this.helper.getId('input-container');

            var tpl = [
                '<div id="${inputContainerId}">',
                // 按钮
                '<button data-ui-id="${buttonId}" data-ui="type:Button;variants:${variants}"></button>',
                '</div>',
                '<div class="ui-progress" class="hide">',
                '<div id="${progressId}" class="ui-progress-bar"></div>',
                '</div>'
            ].join('');

            var buttonId = this.helper.getId('button');
            this.main.innerHTML = lib.format(
                tpl,
                {
                    buttonId: buttonId,
                    inputContainerId: inputContainerId,
                    name: this.name ? 'name="' + this.name + '" ' : ' ',
                    progressId: this.helper.getId('progress'),
                    variants: this.buttonVariants || ''
                }
            );
            ui.init(this.main, {viewContext: this.viewContext});

            var fileInput = ui.create(
                'FileInput',
                {
                    id: this.helper.getId('input'),
                    browseButton: this.viewContext.get(buttonId),
                    name: this.name
                }
            );
            fileInput.appendTo(lib.g(inputContainerId));
            fileInput.on(
                'change',
                lib.bind(this.receiveFile, this)
            );

            if (!this.multiple) {
                var label = lib.dom.createElement(
                    lib.format(
                        '<label id="${labelId}" class="${labelClasses}"></label>',
                        {
                            labelId: this.helper.getId('label'),
                            labelClasses: this.helper.getPartClassName('label')
                        }
                    )
                );
                lib.insertAfter(label, this.main);
            }
        };

        /**
         * @override
         */
        exports.initEvents = function () {
            // 上传进度计算
            // 队列文件变化
            this.on('filesadded', calc, this);
            this.on('filesremoved', calc, this);
            // 开始 / 结束上传
            this.on('statechanged', calc, this);
            // 单文件上传完成
            this.on('uploaded', calc, this);
            // 进度条控制
            if (this.showProgress) {
                this.on('progress', updateProgress, this);
                this.on('complete', updateProgress, this);
            }
            // 所有文件上传完成
            this.on('complete', this.notifyComplete, this);

            // 针对单文件上传，要显示一下当前上传的文件名
            if (this.multiple === false) {
                this.on(
                    'filesadded',
                    function (event) {
                        var files = event.data;
                        var label = this.helper.getPart('label');
                        label.innerHTML = files[0].name;
                    },
                    this
                );
            }

            this.on('error', this.notifyFail, this);
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
                paint: function (uploader, text) {
                    var button = getButton.call(uploader);
                    button.setContent(text);
                }
            },
            {
                name: ['accept', 'multiple', 'disabled', 'readOnly'],
                paint: function (uploader, accept, multiple, disabled, readOnly) {
                    var fileInput = uploader.getFileInput();
                    fileInput.setProperties(
                        {
                            accept: accept,
                            multiple: multiple,
                            disabled: disabled,
                            readOnly: readOnly
                        }
                    );
                }
            },
            {
                name: ['width'],
                paint: function (uploader, width) {
                    if (!isNaN(width)) {
                        uploader.main.style.width = width + 'px';
                        var button = getButton.call(uploader);
                        button.setProperties(
                            {
                                width: width
                            }
                        );
                    }
                }
            },
            {
                name: 'rawValue',
                paint: function (uploader, rawValues) {
                    if (!u.isObject(rawValues)) {
                        return;
                    }
                    if (!u.isArray(rawValues)) {
                        rawValues = [rawValues];
                    }
                    var files = [];
                    u.each(
                        rawValues,
                        function (rawValue) {
                            var file = new File();
                            file.status = File.DONE;
                            file.serverData = rawValue;
                            file.name = rawValue.name || '';
                            files.push(file);
                        }
                    );
                    if (files.length) {
                        uploader.setFile(files);
                        if (uploader.multiple === false) {
                            // 其实单文件上传，`setFile`会出发`complete`事件，从而改变按钮文本
                            // 不过`complete`改变按钮文本有一个setTimeout延时
                            // 所以这里直接置为`overrideText`
                            var button = getButton.call(uploader);
                            button.setContent(uploader.overrideText);
                        }
                    }
                }
            }
        );

        /**
         * 获取fileInput控件
         *
         * @return {ui.FileInput}
         */
        exports.getFileInput = function () {
            var inputId = this.helper.getId('input');
            return this.viewContext.get(inputId);
        }

        /**
         * 检查文件格式是否正确，不正确时直接提示
         *
         * @param {ui.File} file 上传的文件
         * @return {boolean}
         * @protected
         */
        exports.checkFileFormat = function (file) {
            if (this.accept) {
                // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                // 因此把逻辑写在控件内部了
                var extension = file.name.split('.');
                extension = '.' + extension[extension.length - 1].toLowerCase();

                var isValid = false;
                for (var i = 0; i < this.accept.length; i++) {
                    var acceptPattern = this.accept[i].toLowerCase();
                    if (acceptPattern === extension) {
                        isValid = true;
                        break;
                    }

                    // image/*之类的，表示一个大类
                    if (acceptPattern.slice(-1)[0] === '*') {
                        var mimeType = acceptPattern.split('/')[0];
                        var targetExtensions = this.mimeTypes[mimeType];
                        if (targetExtensions && targetExtensions.hasOwnProperty(extension)) {
                            isValid = true;
                            break;
                        }
                    }
                }

                if (!isValid) {
                    var errorCode = ERROR.FILE_EXTENSIONS;
                    me.fire(
                        'error',
                        {
                            code: errorCode,
                            message: getErrorMessage(errorCode, this.accept.join(',')),
                            data: file
                        }
                    );
                }

                return isValid;
            }

            return true;
        };

        /**
         * 上传队列中处于File.QUEUED状态的文件
         */
        function uploadNext() {
            if (this.state == UPLOADER_STARTED) {
                var me = this;
                var count = 0;
                // 找到第一个队列中的文件
                u.find(
                    this.files,
                    function (file) {
                        if (file.status == File.QUEUED) {
                            var event = me.fire('beforeupload', file);
                            if (event.isDefaultPrevented()) {
                                file.status = File.DONE;
                                return false;
                            }
                            file.status = File.UPLOADING;
                            var data = u.clone(me.extraArgs);
                            data[file.name] = file;

                            var xhr = getXhr();
                            xhr.open('POST', me.action);
                            xhr.send(
                                {
                                    container: me.main
                                },
                                data
                            );
                            xhr.on(
                                'load',
                                function (event) {
                                    file.status = File.DONE;
                                    var xhr = event.target;
                                    var response = xhr.getResponse();
                                    file.serverData = response;

                                    me.fire(
                                        'uploaded',
                                        {
                                            file: file,
                                            data: response
                                        }
                                    );
                                    // 继续上传下一个文件
                                    uploadNext.call(me);
                                }
                            );
                            xhr.on(
                                'uploadprogress',
                                function (event) {
                                    file.loaded = Math.min(file.size, event.loaded);
                                    calc.call(me);
                                    me.fire('progress', total);
                                }
                            );
                            xhr.on(
                                'error',
                                function (event) {
                                    me.fire(
                                        'error',
                                        {
                                            code: ERROR.HTTP,
                                            message: getErrorMessage(ERROR.HTTP),
                                            data: file
                                        }
                                    );
                                    // 失败不能灰心，继续上传下一个文件
                                    uploadNext.call(me);
                                }
                            );
                            return true;
                        }
                        else {
                            count++;
                        }
                    }
                );

                // 如果没找到需上传的文件，表示文件全部完成或失败
                if (count == me.files.length) {
                    if (this.state !== UPLOADER_STOPPED) {
                        this.state = UPLOADER_STOPPED;
                        this.fire('statechanged');
                    }
                    this.fire('complete', me.files);
                }
            }
        }

        /**
         * 提交文件上传
         */
        exports.start = function () {
            if (this.state != UPLOADER_STARTED) {
                this.showUploading();
                this.state = UPLOADER_STARTED;
                this.fire('statechanged');
                uploadNext.call(this);
            }
        };

        /**
         * 停止上传队列文件
         */
        exports.stop = function() {
            if (this.state != UPLOADER_STOPPED) {
                this.state = UPLOADER_STOPPED;
                this.fire('statechanged');
                this.fire('cancelupload');
                // TODO
            }
        },


        /**
         * 上传文件
         *
         * @protected
         */
        exports.receiveFile = function () {
            addFiles.call(this);
            if (this.autoUpload) {
                this.start();
            }
        };

        /**
         * 提示用户正在上传
         *
         * @protected
         */
        exports.showUploading = function () {
            // 正在上传提示
            var button = getButton.call(this);
            button.setContent(this.busyText);
        };

        /**
         * 添加上传文件
         */
        function addFiles() {
            var me = this;
            var fileInput = this.getFileInput();
            var addedFiles = [];
            var errorList = [];
            // 用find方法表示长度超过最大限制后就不再遍历了
            u.each(
                fileInput.files,
                function (file) {
                    file.status = File.QUEUED;
                    var errorCode;
                    // 文件数量限制检查
                    if (me.multiple === true && me.limit && me.files.length >= me.limit) {
                        errorCode = ERROR.FILE_MAX_NUMBER;
                    }
                    else if (!me.checkFileFormat(file)) {
                        errorCode = ERROR.FILE_EXTENSIONS;
                    }
                    if (errorCode) {
                        errorList.push(
                            {
                                code: errorCode,
                                message: getErrorMessage(errorCode),
                                data: file
                            }
                        );
                        return;
                    }
                    else {
                        // 单文件上传要覆盖之前的文件
                        if (me.multiple === false) {
                            me.files = [file];
                        }
                        else {
                            me.files.push(file);
                        }
                        addedFiles.push(file);
                    }
                }
            );
            if (addedFiles.length > 0) {
                this.fire('filesadded', {data: addedFiles});
            }
            // 错误处理
            if (errorList.length > 0) {
                this.fire('error', errorList);
            }
        }

        /**
         * 从队列中删除指定文件
         *
         * @param {ui.File|string} file 要删除的文件
         */
        exports.removeFile = function(file) {
            var id = typeof file === 'string' ? file : file.id;
            var files = this.files;
            for (var i = files.length - 1; i >= 0; i--) {
                if (files[i].id === id) {
                    var file = files.splice(i, 1)[0];
                    this.fire('filesremoved', {data: file});
                    return file;
                }
            }
        };

        /**
         * 添加文件到队列中,
         * 一般用在`modify`的场景，文件来源不是`FileInput`控件
         *
         * @param {ui.File|Array<ui.File>} files 要添加的文件
         */
        exports.addFile = function(files) {
            if (!u.isArray(files)) {
                files = [files];
            }
            Array.prototype.push.apply(this.files, files);
            this.fire('filesadded', {data: files});
        };

        /**
         * 添加文件到队列中,并覆盖之前已经存在的文件
         *
         * @param {ui.File|Array<ui.File>} files
         */
        exports.setFile = function(files) {
            // 先清空已存在文件
            for (var i = 0, len = this.files.length; i < len; i++) {
                this.removeFile(this.files[i]);
            }
            this.addFile(files);
            // 如果所有添加的文件状态均为`DONE`, 则触发`complete`事件
            var shouldFireComplete = u.every(files, function (file) {return file.status === File.DONE;});
            if (shouldFireComplete) {
                this.fire('complete', files);
            }
        }

        /**
         * @override
         * 因为已经在this.main后面跟了个label(上传文本),
         * 所有验证信息应该跟在这个上传文本后面
         */
        exports.getValidityLabel = function (dontCreate) {
            var label = this.helper.getPart('label');
            var main = this.main;
            var validateLabel;
            if (label) {
                // 暂时把this.main指向上传文本的label，让验证信息跟在这个label后面
                this.main = label;
            }
            validateLabel = this.$super(arguments);
            this.main = main;
            return validateLabel;
        };

        /**
         * 获取队列上传进度信息
         */
        exports.getTotal = function () {
            return total;
        };

        /**
         * 通知上传失败
         *
         * @param {Event} event 失败事件
         * @protected
         */
        exports.notifyFail = function (event) {
            // 只处理单个文件上传时的错误提示
            // 多文件上传，外部程序通过监听`error`事件自行处理
            if (this.multiple === false) {
                var message = event.message || '上传失败';
                var validity = new Validity();
                var state = new ValidityState(false, message);
                validity.addState('upload', state);
                this.showValidity(validity);
            }
        };

        /**
         * 通知上传完成
         *
         * @protected
         */
        exports.notifyComplete = function () {
            var button = getButton.call(this);
            button.setContent(this.completeText);

            // 恢复初始的文本
            var text = this.multiple === true ? this.text : this.overrideText;
            setTimeout(function () { button.setContent(text); }, 1000);
        };

        exports.getRawValue = function () {
            var data = [];
            u.each(
                this.files,
                function (file) {
                    if (file && file.status === File.DONE) {
                        data.push(file.serverData);
                    }
                }
            );
            if (data.length > 0) {
                if (this.multiple === false) {
                    data = data[0];
                }
                return data;
            }
            return null;
        };

        /**
         * 获取上传按钮
         * @return {ui.Button}
         */
        function getButton() {
            var buttonId = this.helper.getId('button');
            return this.viewContext.get(buttonId);
        }

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            this.$super(arguments);
        };

        var Uploader = require('eoo').create(InputControl, exports);

        /**
         * accpet中含 image/*、flash/* 等时用到
         */
        var mimeTypes = {
            image: {
                '.jpg': true, '.jpeg': true, '.gif': true,
                '.bmp': true, '.tif': true, '.tiff': true, '.png': true
            },

            flash: {
                '.flv': true, '.swf': true
            }
        };


        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            width: '',
            fileType: '*',
            text: '点击上传',
            busyText: '正在上传...',
            completeText: '上传完成',
            overrideText: '重新上传',
            autoUpload: false,
            action: '',
            mimeTypes: mimeTypes,
            // 默认为单文件上传控件
            // 单文件上传控件一次只能选择一个文件，且后续上传覆盖上一次上传结果
            // 单文件上传，按钮旁边有一个展示文件名的label
            // 单文件上传支持rawValue,多文件不支持
            multiple: false,
            extraArgs: {},
            // 是否显示上传进度
            showProgress: true,
            // 进度条高度
            progressHeight: 2,
            // 最大上传文件数量, >0有效
            limit: 0,
            buttonVariants: 'primary'
        };

        require('esui').register(Uploader);

        return Uploader;
    }
);
