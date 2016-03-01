/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file TokenField Unit Test
 * @author maoquan(maoquan@baidu.com)
 */
define(
    function (require) {

        require('jquery-simulate');
        require('ubRiaUi/TokenField');

        var esui = require('esui');

        var container = document.getElementById('container');
        // tokenField实例
        var tokenField = esui.init(container)[0];

        // 控件主元素
        var $main = $(tokenField.main);
        // 控件中的输入元素
        var $input = $main.find('input');

        // 传入参数测试
        describe('param ceheck', function () {

            it('param limit', function () {
                expect(tokenField.get('limit')).toEqual(5);
            });

            var tokensEqual = {
                asymmetricMatch: function (tokens) {
                    return tokens[1].value === 'lisijin';
                }
            };
            it('param tokens', function () {
                expect(tokenField.get('tokens')).toEqual(tokensEqual);
            });

            it('param delimiter', function () {
                expect(tokenField.get('delimiter')).toEqual(',');
            });

            it('param width', function () {
                expect(tokenField.get('width')).toEqual(600);
            });

        });

        // DOM测试
        describe('dom check', function () {

            // 初始token数量
            var originItemCount = tokenField.get('tokens').length;

            afterEach(
                function () {
                    $input.val('');
                }
            );

            // 初始填入元素
            it('initial count of items', function () {
                expect($main.find('.ui-tokenfield-item')).toHaveLength(originItemCount);
            });

            // 删除一个item
            it('remove item', function () {
                $input.focus();
                $input.simulate('keydown', {keyCode: 8});
                $input.simulate('keyup', {keyCode: 8});

                var itemCount = $main.find('.ui-tokenfield-item').length;
                expect(itemCount).toEqual(originItemCount - 1);
            });

            // 输入新元素
            it('add item', function () {
                var text = 'new item';
                $input.focus();
                $input.val(text);
                $input.simulate('keypress', {keyCode: 13});
                var itemCount = $main.find('.ui-tokenfield-item').length;
                expect(itemCount).toEqual(originItemCount);

                // 新增元素为最后一个输入元素
                expect($main.find('.ui-tokenfield-item:last')).toHaveText(text);
            });

            // 测试关闭按钮
            it('close button', function () {
                $main.find('.ui-tokenfield-item:last .ui-tokenfield-close').simulate('click');
                var itemCount = $main.find('.ui-tokenfield-item').length;
                expect(itemCount).toEqual(originItemCount - 1);
            });

            // 测试limit上限
            it('limit', function () {
                for (var i = 0; i < 10; i++) {
                    var text = 'text' + i;
                    $input.focus();
                    $input.val(text);
                    $input.simulate('keypress', {keyCode: 13});
                }
                var itemCount = $main.find('.ui-tokenfield-item').length;
                // 最多添加limit数量的item
                expect(itemCount).toEqual(tokenField.get('limit'));
            });

        });
    }
);
