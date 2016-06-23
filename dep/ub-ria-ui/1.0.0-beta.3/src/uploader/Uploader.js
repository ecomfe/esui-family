/**
 * UB-RIA-UI 1.0
 * Copyright 2015 Baidu Inc. All rights reserved.
 *
 * @file 富上传组件集合
 * @exports Uploader
 * @author weifeng(weifeng@baidu.com)
 */

define(
    function (require) {
        require('esui/Button');
        require('./FileInput');
        require('./Progress');

        var eoo = require('eoo');
        var esui = require('esui');
        var ui = require('esui/main');
        var Control = require('esui/Control');
        var painters = require('esui/painters');

        var File = require('./File');

        var $ = require('jquery');
        var u = require('underscore');
        var lib = require('esui/lib');


        var supportXHR = (window.File && window.XMLHttpRequest);
        var supportXHR2 = (supportXHR && new window.XMLHttpRequest().upload);

        /**
         * 控件类
         *
         * 上传控件有如下结构特点：
         *
         * - 上传组件          (必须，至少一个)
         *   -- 文件上传控件
         * - 上传列表        (可选，可自定义容器)
         *   -- 由一个或多个进度条组件构成
         *
         * 上传控件有两种模式：
         *
         * - 单文件上传
         * - 多文件上传
         *
         * @class ui.Uploader
         * @extends esui.Control
         */
        var Uploader = eoo.create(
            Control,
            {

                /**
                 * 控件类型，始终为`"Uploader"`
                 *
                 * @type {string}
                 * @readonly
                 * @override
                 */
                type: 'Uploader',

                /*
                 * 文件上传队列
                 */
                queue: {
                    // 队列长度
                    length: 0,
                    // 正在上传的文件
                    uploadingFiles: [],
                    // 等待开始的文件
                    waitingFiles: [],
                    // 出错的文件
                    failedFiles: [],
                    // 遗弃的文件
                    // 当文件过长时会遗弃多余的文件
                    abandonedFiles: [],
                    // 上传完成的文件
                    completeFiles: []
                },

                /**
                 * @override
                 */
                initOptions: function (options) {
                    var properties = {};
                    u.extend(properties, this.$self.defaultProperties, options);

                    var adaptProperties = ['sequentialUploads', 'showProgress', 'multiple'];

                    u.each(
                        adaptProperties,
                        function (propertyName) {
                            if (properties[propertyName] === 'false') {
                                properties[propertyName] = false;
                            }
                        }
                    );

                    this.$super([properties]);
                },

                /**
                 * @override
                 */
                initStructure: function () {
                    var tpl = [
                        '<div class="${uploadComboxClass}">',
                        // 上传input
                        '   <div data-ui-child-name="fileInput"',
                        '      data-ui="type:FileInput;accept:${accept};multiple:${multiple};name:${paramKey};"></div>',
                        // 伪装ge按钮
                        '   <div data-ui-child-name="submitButton" ',
                        '      data-ui="type:Button;">${text}</div>',
                        '</div>',
                        '<div id="${defaultProgressContainerId}"></div>'
                    ].join('');
                    this.main.innerHTML = lib.format(
                        tpl,
                        {
                            uploadComboxClass: this.helper.getPartClassName('combox'),
                            accept: this.accept,
                            multiple: this.multiple,
                            text: this.text,
                            variants: this.buttonVariants || '',
                            paramKey: this.paramKey,
                            defaultProgressContainerId: this.helper.getId('default-progress-container')
                        }
                    );

                    // 创建控件树
                    this.helper.initChildren();

                    // 绑事件
                    var fileInput = this.getChild('fileInput');
                    fileInput.on('change', u.bind(inputChangeHandler, this));

                    var submitButton = this.getChild('submitButton');
                    submitButton.on(
                        'click',
                        function (e) {
                            fileInput.triggerUploadOutside();
                            e.preventDefault();
                        }
                    );
                },

                /**
                 * @override
                 */
                repaint: painters.createRepaint(
                    Control.prototype.repaint,
                    {
                        name: ['text'],
                        paint: function (uploader, text) {
                            var button = uploader.getChild('submitButton');
                            button.setContent(text);
                        }
                    },
                    {
                        name: ['disabled', 'readOnly'],
                        paint: function (uploader, disabled, readOnly) {
                            var input = uploader.getChild('fileInput');
                            var button = uploader.getChild('submitButton');
                            input.setProperties({disabled: disabled});
                            input.setProperties({readOnly: readOnly});
                            button.setProperties({disabled: disabled});
                            button.setProperties({readOnly: readOnly});
                        }
                    },
                    painters.style('width')
                ),

                /**
                 * 接收文件并做上传前的校验
                 *
                 * @param {Array} files 接收到的文件，可以是input中取到的，也可以是drag外部传入的
                 * @public
                 */
                receiveFile: function (files) {
                    // 如果仍然在uploading，则不执行新的上传操作
                    if (this.stage === 'UPLOADING') {
                        return;
                    }

                    var event = this.fire('beforeupload', {files: files});
                    if (event.isDefaultPrevented()) {
                        return;
                    }

                    this.doUpload(files);
                },

                /**
                 * 开始上传
                 *
                 * @param {Array} files 接收到的文件
                 * @protected
                 */
                doUpload: function (files) {
                    // 超出最大限制，直接返回
                    if (files.length > this.maxFileNumber) {
                        this.notifyFail(this.message.ERROR_FILE_MAX_NUMBER);
                        return;
                    }

                    files = u.map(
                        files,
                        function (file, index) {
                            // 文件格式检查
                            if (!this.checkFileFormat(file)) {
                                file.status = 'client-error';
                                file.message = this.message.ERROR_FILE_EXTENSIONS;
                            }
                            else if (!this.checkFileSize(file)) {
                                file.status = 'client-error';
                                file.message = this.message.ERROR_FILE_MAX_SIEZ;
                            }
                            else {
                                file.status = 'waiting';
                                // 单文件上传要覆盖之前的文件
                                if (this.multiple === false) {
                                    this.queue.waitingFiles = [file];
                                }
                                else {
                                    this.queue.waitingFiles.push(file);
                                }
                            }
                            return file;
                        },
                        this
                    );

                    initFileList.call(this, files);
                    operationFileQueue.call(this);
                },

                /**
                 * 获取Uploader中的文件上传组件
                 *
                 * @return {DOMElement} 容器中FileInput组件
                 * @public
                 */
                getFileInput: function () {
                    return this.getChild('fileInput');
                },

                /**
                 * 验证文件格式
                 *
                 * @param {Object} file file对象
                 * @return {boolean}
                 * @protected
                 */
                checkFileFormat: function (file) {
                    if (this.accept) {
                        // 这里就是个内置的`Rule`，走的完全是标准的验证流程，
                        // 主要问题是上传控件不能通过`getValue()`获得验证用的内容，
                        // 因此把逻辑写在控件内部了
                        var extension = file.name.split('.');
                        extension = '.' + extension[extension.length - 1].toLowerCase();

                        var isValid = false;
                        if (typeof this.accept === 'string') {
                            this.accept = lib.splitTokenList(this.accept);
                        }
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

                        return isValid;
                    }

                    return true;
                },

                /**
                 * 验证文件大小
                 *
                 * @param {Object} file file对象
                 * @return {boolean}
                 * @protected
                 */
                checkFileSize: function (file) {
                    // IE9中filechange返回的event只有fileName以及fileId
                    // 所以如果出现这种情况就放过去，让后端做长度校验
                    if (this.maxFileSize && file.originalSize) {
                        var isValid = false;
                        if (file.originalSize) {
                            isValid = parseInt(file.originalSize, 10) <= parseInt(this.maxFileSize, 10);
                        }

                        return isValid;
                    }

                    return true;
                },

                /**
                 * 解析返回中的错误 TODO 这个的具体解析格式要跟后端商定
                 *
                 * @param {Object} response 请求返回的对象
                 * @return {string}
                 * @protected
                 */
                parseError: function (response) {
                    if (response.success === 'false') {
                        return {message: response.error};
                    }

                    return null;
                },

                /**
                 * 通知上传失败
                 *
                 * @method ui.Uploader#notifyFail
                 * @param {string} message 失败消息
                 * @protected
                 */
                notifyFail: function (message) {
                    message = message || '上传失败';
                    this.fire('fail', {message: message});
                },

                /**
                 * 通知上传完成
                 *
                 * @protected
                 * @method ui.Uploader#notifyComplete
                 */
                notifyComplete: function () {
                    this.stage = 'COMPLETE';
                    this.fire('complete', {
                        completeFiles: this.queue.completeFiles,
                        failedFiles: this.queue.failedFiles
                    });
                }
            }
        );

        /**
         * 默认属性
         *
         * @type {Object}
         * @public
         */
        Uploader.defaultProperties = {
            // 上传按钮文本
            text: '点击上传',
            // 文件上传的路径
            action: '/uploadFile',
            // 后台接收时的key名
            paramKey: 'files',
            // 接收的文件类型
            accept: '.gif,.jpg,.png,.swf,.xlsx',
            // 默认为单文件上传控件
            // 单文件上传控件一次只能选择一个文件
            multiple: false,
            // 单个文件最大大小，单位B，默认2M
            maxFileSize: 2147483648,
            // 单次最大上传文件数量
            maxFileNumber: 6,
            // 多文件上传时，请求同时开始还是逐个开始
            sequentialUploads: true,
            // 当前允许的最大连接数
            // sequentialUploads为true时该选项无效
            maxConnections: 6,
            // 提示信息
            // 目前支持提供成功提示，文件大小不符
            // 文件类型不匹配,
            message: {
                // 上传成功
                SUCCESS_INFO: '上传成功',
                // 重新上传
                RESTART_INFO: '正在重新上传',
                // http错误，一般来说就是status返回不是200
                ERROR_HTTP: '上传失败，网络连接错误或上传路径无效',
                // 文件类型错误
                ERROR_FILE_EXTENSIONS: '上传失败，安全因素不支持此类文件',
                // 文件超出最大尺寸, 标准浏览器下可以判断
                ERROR_FILE_MAX_SIEZ: '超出最大上传尺寸',
                // 文件数量超过最大限制了
                ERROR_FILE_MAX_NUMBER: '发生错误，上传文件超过限定。',
                // 格式错误
                ERROR_FILE_FORMAT: '文件格式错误'
            },
            // 是否显示进度
            showProgress: true,
            // 进度模式，seperate和total两种，seperate代表每个文件独立进度；total代表所有文件统一计算进度
            progressMode: 'seperate',
            singleProgressMode: 'detail',
            // 文件列表的容器
            // 如果没有会添加一个默认容器
            progressContainer: null
        };

        /**
         * 上传输入组件变化事件处理
         *
         * @param {mini-event.Event} e 事件对象
         */
        function inputChangeHandler(e) {
            var files = this.getFileInput().files;
            this.receiveFile(files);
        }

        /**
         * 创建上传进度队列
         *
         * @param {Array} fileList 在队列中的文件
         */
        function initFileList(fileList) {
            if (!this.showProgress) {
                return;
            }

            var files = fileList ? fileList : this.queue.waitingFiles;
            this.progressContainer = this.progressContainer || this.helper.getId('default-progress-container');
            var container;
            // 字符串处理
            if (u.isString(this.progressContainer)) {
                // 先作为DOM id寻找
                container = $('#' + this.progressContainer);
                // 如果没找到，找控件id
                if (!container[0] && this.viewContext.get(this.progressContainer)) {
                    container = $(this.viewContext.get(this.progressContainer).main);
                }
            }
            // 只能认为扔了个控件进来
            else {
                container = $(this.progressContainer.main);
            }

            if (!container[0]) {
                return;
            }

            var me = this;

            if (this.progressMode === 'seperate') {
                u.each(files, function (file, index) {
                    // 创建主容器
                    var progressContainer = $('<div></div>');
                    container.append(progressContainer);
                    var options = {
                        file: file,
                        childName: 'progress-' + file.id,
                        main: progressContainer[0],
                        progressMode: me.singleProgressMode
                    };

                    // 如果不支持进度，那就强制不展示进度详情
                    if (!supportXHR) {
                        options.singleProgressMode = 'general';
                    }

                    // 如果定义了进度模板，使用定义的
                    if (me.progressItemTemplate) {
                        options.template = me.progressItemTemplate;
                    }

                    var progress = ui.create('Progress', options);
                    progress.render();
                    me.addChild(progress);

                    progress.on('restart', function (e) {
                        // 重新上传
                        var file = e.target.file;
                        e.target.dispose();
                        // 将文件移出上传队列，然后重新进行上传
                        removeFileFromUploading.call(me, file, 'restart');
                        me.receiveFile([file]);
                    });
                    progress.on('cancel', function (e) {
                        var file = e.target.file;
                        if (file.request) {
                            file.request.abort();
                            removeFileFromUploading.call(me, file, 'cancel');
                            if (me.sequentialUploads) {
                                operationFileQueue.call(me);
                            }
                        }
                        // 从等待队列中清除
                        else {
                            removeFileFromWaiting.call(me, file);
                        }
                        e.target.dispose();
                    });
                });
            }
            // TODO 文件的总进度条，待实现
            // else {

            // }
        }

        /**
         * 执行上传队列
         *
         */
        function operationFileQueue() {
            // 当队列中
            if (this.queue.waitingFiles && this.queue.waitingFiles.length) {
                // 一个个上传
                if (this.sequentialUploads && this.queue.uploadingFiles.length < 1) {
                    chooseProgressFile.call(this);
                }
                // 多文件上传，如果当前连接数未满就继续上传
                else if ((this.maxConnections && this.queue.uploadingFiles.length < this.maxConnections)
                    || !this.maxConnections) {
                    chooseProgressFile.call(this);
                    operationFileQueue.call(this);
                }
            }
            else if (this.queue.uploadingFiles.length === 0) {
                this.notifyComplete();
            }
        }

        /**
         * 选择一个文件上传
         */
        function chooseProgressFile() {
            this.stage = 'UPLOADING';
            // 等待队列中弹出
            var file = this.queue.waitingFiles.shift();
            // 进入上传队列
            this.queue.uploadingFiles.push(file);
            // 执行上传
            uploadFile.call(this, file);
        }

        /**
         * 上传文件
         *
         * @param {ui.File} file 目标文件
         */
        function uploadFile(file) {
            // 文件对应的进度组件
            var progress = this.getChild('progress-' + file.id);
            var me = this;

            // 创建请求
            var request = getHttpRequest.call(this);
            // Need to modified
            file.request = request;
            // 修改文件状态
            file.status = File.UPLOADING;

            // 创建一个符合后端接口的数据对象
            file[this.paramKey] = file.fileData;
            delete file.fileData;

            request.send(
                {
                    container: this.main
                },
                file
            );

            // 上传中
            request.on(
                'progress',
                function (response) {
                    var loaded = response.loaded;
                    var total = response.total;
                    progress.setProperties({loaded: loaded, total: total});
                }
            );

            // 上传完成
            request.on(
                'load',
                function (event) {
                    var response = event.target.response;

                    // 解析一些校验错误
                    var error = me.parseError(response);

                    if (error) {
                        // 修改进度状态
                        progress.updateStatus('client-error', error.message);
                        me.removeFileFromUploading.call(me, file, 'error');
                        me.fire('error', {file: file});
                        addToErrorQueue.call(me, file);
                        event.preventDefault();
                        return;
                    }

                    file.status = File.DONE;

                    // 修改进度状态
                    progress.updateStatus('done', me.message.SUCCESS_INFO);
                    progress.fadeOut(
                        1000,
                        function () {

                            removeFileFromUploading.call(me, file, 'load');

                            if (me.sequentialUploads) {
                                operationFileQueue.call(me);
                            }

                            // 通知完成，供外部捕获，执行预览等操作
                            me.fire(
                                'onecomplete',
                                {
                                    file: file,
                                    data: response
                                }
                            );
                        }
                    );
                }
            );

            // 上传出错
            request.on(
                'error',
                function (event) {
                    // 修改进度状态
                    removeFileFromUploading.call(me, file, 'error');
                    progress.updateStatus('server-error', event.message || me.message.ERROR_HTTP);

                    me.fire('error', {file: file});
                    addToErrorQueue.call(me, file);
                }
            );

            // 传输终止
            request.on(
                'abort',
                function (event) {
                    removeFileFromUploading.call(me, file, 'abort');
                    me.fire('abort', {file: file});
                }
            );
        }

        /**
         * 将文件移出等待队列
         *
         * @param {ui.File} file 目标文件
         */
        function removeFileFromWaiting(file) {
            var queue = this.queue.waitingQueue;
            this.queue.waitingQueue = u.without(queue, file);
        }

        /**
         * 需要添加的错误文件
         *
         * @param {ui.File} file 目标文件
         */
        function addToErrorQueue(file) {
            var sameFile = u.filter(this.queue.failedFiles, function (rawFile) {
                    return rawFile.id === file.id;
                });
            sameFile ? '' : this.queue.failedFiles.push(file);
        }

        /**
         * 将文件移出上传队列并放入完成队列
         *
         * @param {ui.File} file 目标文件
         * @param {string} operation 操作
         */
        function removeFileFromUploading(file, operation) {
            var queue = this.queue.uploadingFiles;
            file = u.find(
                queue,
                function (rawFile) {
                    return rawFile.id === file.id;
                }
            );
            this.queue.uploadingFiles = u.without(queue, file);
            if ('load' === operation) {
                var completeFiles = this.queue.completeFiles;
                var sameFile = u.filter(completeFiles, function (rawFile) {
                    return rawFile.id === file.id;
                });
                sameFile ? '' : completeFiles.push(file);
            }

            operationFileQueue.call(this);
        }

        /**
         * 获取合适的HttpRequest，用于文件上传
         * 目前实现了Leve1 XHR、Level2 XHR以及iframe的封装
         *
         * @return {ui.HttpRequest}
         */
        function getHttpRequest() {
            var HTTPRequest;

            if (supportXHR2) {
                HTTPRequest = require('./L2XMLHttpRequest');
                // HTTPRequest = require('./XMLHttpRequest');
            }
            else if (supportXHR) {
                HTTPRequest = require('./XMLHttpRequest');
            }
            else {
                HTTPRequest = require('./IframeHttpRequest');
            }

            var httpInstance = new HTTPRequest('POST', this.action);
            httpInstance.setRequestHeader([{key: 'token', value: this.token}]);

            return httpInstance;
        }

        esui.register(Uploader);
        return Uploader;
    }
);
