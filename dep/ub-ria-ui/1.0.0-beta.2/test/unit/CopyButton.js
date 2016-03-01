/**
 * @file CopyButton的UI测试用例。由于使用了Flash插件，
         需要启动edp server，否则Flash会初始化失败。
 * @author yankun01(yankun01@baidu.com)
 */

define(function (require) {
    var CopyButton = require('ubRiaUi/CopyButton');
    var u = require('underscore');
    var $ = require('jquery');

    // 注意，这个case因为用到了flash，因此必须运行在localhost服务器上才能成功运行
    describe('CopyButton', function () {
        var copyButton;

        // 每次测试循环前创建用例
        beforeEach(function () {
            var copyButtonTest = $('#copybuttontest')[0];
            copyButton = new CopyButton({
                main: copyButtonTest,
                content: 'copyText'
            });
        });

        // 测试组件是否初始化成功
        it('初始化和Ready事件', function (done) {
            copyButton.on('ready', function () {
                var flash = $('#' + this.flashId)[0];
                // 初始化完成了
                expect(u.isFunction(flash.flashInit)).toBe(true);
                expect(u.isFunction(window[this.copyScriptFun])).toBe(true);
                this.dispose();
                done();
            });
            copyButton.render();
        });

        // 测试正确销毁，移除了全局的Proxy
        it('销毁', function (done) {
            copyButton.on('ready', function () {
                this.dispose();
                expect(u.isFunction(window[this.copyScriptFun])).toBe(false);
                done();
            });
            copyButton.render();
        });

        // 核心逻辑测试，模拟Copy事件
        it('Copy事件', function (done) {
            copyButton.on('ready', function () {
                window[this.copyScriptFun]();
            });

            copyButton.on('copy', function (e) {
                expect(e.content).toEqual('copyText');
                this.dispose();
                done();
            });
            copyButton.render();
        });
    });
});
