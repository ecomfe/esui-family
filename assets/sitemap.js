define('sitemap', ['jquery'], function ($) {
    function mainNav(path) {
        path = path || '';
        var htmlItem = '<li><a href="{link}"><span class="{icon}"></span> {text}</a></li>';
        var items = [
            {
                link: 'help/start.html',
                icon: 'ui-icon-hand-o-right',
                text: 'Get Started'

            },
            {
                link: 'css/index.html',
                icon: 'ui-icon-css3',
                text: 'CSS'
            },
            {
                link: 'controls/index.html',
                icon: 'ui-icon-code',
                text: 'Controls'
            },
            {
                link: '../eicons/demo/demo.html',
                icon: 'ui-icon-send',
                text: 'ICONS'
            }
        ];
        var html = [];
        $.each(items, function (idx, item) {
            html.push(
                htmlItem.replace('{link}', path + item.link)
                    .replace('{icon}', item.icon)
                    .replace('{text}', item.text)
            );
        });
        $('#global-nav').html(html.join(''));
    }

    function footer() {
        var footHtml = '<p class="ui-text-center contrast">&copy;2016 <a href="http://efe.baidu.com">Baidu EFE</a> HI群：1401953</p>';
        $('.footer').html(footHtml);
    }

    function renderNav() {
        function render(data) {
            var ubUIIcon = ' <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span>';
            var newIcon = ' <span class="ui-x-small ui-label-slim ui-label-custom ui-label-warning">new</span>';
            var html = '';
            for (var i = 0, len = data.length; i < len; i++) {
                var item = data[i];
                if (item.type === 'header') {
                    html += '<li class="ui-nav-item-header">' + item.value + '</li>';
                }
                else {
                    html += '<li><a href="?control=' + item.value + (item.isUbUI ? '&isUbUI=true' : '') + '">'
                        + item.value.charAt(0).toUpperCase() + item.value.slice(1)
                        + (item.isUbUI ? ubUIIcon : '') + (item.isNew ? newIcon : '') + '</a></li>';
                }
            }
            return html;
        }

        function generateNav(id, items) {
            $(id).html(items);
            var pathName = location.pathname;
            if (pathName.indexOf('help')) {
                if (pathName.indexOf('guide.html') > 0) {
                    $('#navigator-help li:last a').css('color', '#444');
                }
                else {
                    $('#navigator-help li:first a').css('color', '#444');
                }
            }
            var control = getQueryString('control');
            var isUbUI = getQueryString('isUbUI');
            var ubUI = '';
            if (isUbUI) {
                ubUI = '&isUbUI=true';
            }
            if (!control) {
                control = 'Button';
            }
            $(id + ' a[href="?control=' + control + ubUI + '"]').parent().addClass('ui-nav-item-active');
        }

        // JS 组件列表
        var navItems = [
            {type: 'header', value: '按钮'},
            {type: 'control', value: 'Button', isUbUI: false, isNew: false},
            {type: 'control', value: 'CommandMenu', isUbUI: false, isNew: false},
            {type: 'header', value: '表单和表单控件'},
            {type: 'control', value: 'AutoComplete', isUbUI: true, isNew: false},
            {type: 'control', value: 'BoxGroup', isUbUI: false, isNew: false},
            {type: 'control', value: 'Checkbox', isUbUI: false, isNew: false},
            {type: 'control', value: 'CheckboxGroup', isUbUI: true, isNew: true},
            {type: 'control', value: 'CheckboxPanel', isUbUI: true, isNew: true},
            {type: 'control', value: 'ColorPicker', isUbUI: true, isNew: false},
            {type: 'control', value: 'ControlRepeater', isUbUI: true, isNew: true},
            {type: 'control', value: 'CopyButton', isUbUI: true, isNew: true},
            {type: 'control', value: 'CustomField', isUbUI: true, isNew: true},
            {type: 'control', value: 'Form', isUbUI: false, isNew: false},
            {type: 'control', value: 'Label', isUbUI: false, isNew: false},
            {type: 'control', value: 'MultiSelect', isUbUI: true, isNew: true},
            {type: 'control', value: 'Radio', isUbUI: true, isNew: true},
            {type: 'control', value: 'Region', isUbUI: false, isNew: false},
            {type: 'control', value: 'RichSelectors', isUbUI: true, isNew: false},
            {type: 'control', value: 'ToggleSelectors', isUbUI: true, isNew: false},
            {type: 'control', value: 'Select', isUbUI: false, isNew: false},
            {type: 'control', value: 'SearchBox', isUbUI: false, isNew: false},
            {type: 'control', value: 'Slider', isUbUI: true, isNew: false},
            {type: 'control', value: 'Spinner', isUbUI: true, isNew: false},
            {type: 'control', value: 'Schedule', isUbUI: false, isNew: false},
            {type: 'control', value: 'Textbox', isUbUI: false, isNew: false},
            {type: 'control', value: 'TextLine', isUbUI: false, isNew: false},
            {type: 'control', value: 'TokenField', isUbUI: true, isNew: false},
            {type: 'control', value: 'Uploader', isUbUI: true, isNew: true},
            {type: 'control', value: 'ValidityLabel', isUbUI: false, isNew: false},
            {type: 'header', value: '表单日历'},
            {type: 'control', value: 'Calendar', isUbUI: false, isNew: false},
            {type: 'control', value: 'MonthView', isUbUI: false, isNew: false},
            {type: 'control', value: 'RangeCalendar', isUbUI: false, isNew: false},
            {type: 'control', value: 'RichCalendar', isUbUI: false, isNew: false},
            {type: 'header', value: '导航'},
            {type: 'control', value: 'Accordion', isUbUI: true, isNew: false},
            {type: 'control', value: 'Crumb', isUbUI: false, isNew: false},
            {type: 'control', value: 'Carousel', isUbUI: true, isNew: false},
            {type: 'control', value: 'Link', isUbUI: false, isNew: false},
            {type: 'control', value: 'SidebarNav', isUbUI: true, isNew: true},
            {type: 'control', value: 'Tab', isUbUI: false, isNew: false},
            {type: 'control', value: 'Tree', isUbUI: false, isNew: false},
            {type: 'control', value: 'Wizard', isUbUI: false, isNew: false},
            {type: 'header', value: '数据表格'},
            {type: 'control', value: 'BarChart', isUbUI: true, isNew: true},
            {type: 'control', value: 'Filter', isUbUI: true, isNew: false},
            {type: 'control', value: 'InlineEdit', isUbUI: true, isNew: true},
            {type: 'control', value: 'LineChart', isUbUI: true, isNew: true},
            {type: 'control', value: 'MediaPreview', isUbUI: true, isNew: true},
            {type: 'control', value: 'Pager', isUbUI: false, isNew: false},
            {type: 'control', value: 'RegionChart', isUbUI: true, isNew: true},
            {type: 'control', value: 'Table', isUbUI: false, isNew: false},
            {type: 'header', value: '提示和消息'},
            {type: 'control', value: 'Alert', isUbUI: true, isNew: false},
            {type: 'control', value: 'Tip', isUbUI: false, isNew: false},
            {type: 'control', value: 'TipLayer', isUbUI: false, isNew: false},
            {type: 'control', value: 'Toast', isUbUI: false, isNew: false},
            {type: 'header', value: '其他'},
            {type: 'control', value: 'BehaviorDraggable', isUbUI: false, isNew: true},
            {type: 'control', value: 'BehaviorPosition', isUbUI: false, isNew: true},
            {type: 'control', value: 'BehaviorSelectable', isUbUI: false, isNew: true},
            {type: 'control', value: 'Dialog', isUbUI: false, isNew: false},
            {type: 'control', value: 'Drawer', isUbUI: true, isNew: true},
            {type: 'control', value: 'FlashObject', isUbUI: true, isNew: true},
            {type: 'control', value: 'Frame', isUbUI: false, isNew: false},
            {type: 'control', value: 'ImageList', isUbUI: true, isNew: true},
            {type: 'control', value: 'LightBox', isUbUI: true, isNew: false},
            {type: 'control', value: 'Panel', isUbUI: false, isNew: false},
            {type: 'control', value: 'Sticky', isUbUI: true, isNew: false},
            {type: 'control', value: 'TogglePanel', isUbUI: true, isNew: true}
        ];
        var navHtml = render(navItems);
        generateNav('#navigator', navHtml);

        var cssNavItems = [
            {type: 'header', value: '样式集合'},
            {type: 'control', value: 'button'},
            {type: 'control', value: 'checkbox'},
            {type: 'control', value: 'dropdown'},
            {type: 'control', value: 'form'},
            {type: 'control', value: 'image'},
            {type: 'control', value: 'input'},
            {type: 'control', value: 'label'},
            {type: 'control', value: 'loader'},
            {type: 'control', value: 'mask'},
            {type: 'control', value: 'navbar'},
            {type: 'control', value: 'panel'},
            {type: 'control', value: 'progress'},
            {type: 'control', value: 'submenu'},
            {type: 'control', value: 'text'},
            {type: 'control', value: 'type'},
            {type: 'control', value: 'wizard'}
        ];
        // 样式集合列表
        var cssNavHtml = render(cssNavItems);
        generateNav('#navigator-esf', cssNavHtml);

        // get started 导航
        var startItems = '<li><a href="start.html">开始使用</a></li>'
            + '<li><a href="guide.html">使用指南</a></li>';
        generateNav('#navigator-help', startItems);

    }

    function getQueryString(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    }

    function genBody(htmlReady) {
        var control = getQueryString('control');
        if (!control) {
            control = 'Button';
        }
        var isUbUI = getQueryString('isUbUI');
        var url = '';
        if (isUbUI) {
            url = '../dep/ub-ria-ui/1.0.0-beta.3/demo/' + control + '.html';
        }
        else {
            url = '../dep/esui/3.2.0-beta.6/demo/' + control + '.html';
        }

        if (location.pathname.indexOf('css') > 0) {
            url = '../dep/esf/1.0.0-rc.2/demo/' + control.toLowerCase() + '.html';
        }

        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'html',
            success: function (result) {
                var $ele = $('<div></div>');
                $ele.html(result);
                $('#main').html($ele.find('#main').html());
                if (htmlReady) {
                    htmlReady();
                }
                if (window.location.pathname.indexOf('css') > 0) {
                    var esfMainScript = $ele.find('#main-js').html();
                    $('<script></script>').html(
                        //'require(["jquery", "esui", "esui/Tab"], function ($, esui) {'
                        + esfMainScript // + ';esui.init();});'
                    ).appendTo('body');
                }
                else {
                    $ele.find('#main-js').appendTo($('body'));
                }
            }
        });
    }

    return {
        mainNav: mainNav,
        footer: footer,
        renderNav: renderNav,
        genBody: genBody
    };
});
