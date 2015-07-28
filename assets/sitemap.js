define('sitemap', ['jquery'], function ($) {
    function mainNav(path) {
        path = path || '';
        var htmlItem = '<li><a href="{link}"><span class="{icon}"></span> {text}</a></li>';
        var items = [
            {
                link: '../help/start.html',
                icon: 'ui-icon-hand-o-right',
                text: 'Get Started'

            },
            {
                link: '../css/index.html',
                icon: 'ui-icon-css3',
                text: 'CSS'
            },
            {
                link: '../controls/index.html',
                icon: 'ui-icon-code',
                text: 'Controls'
            }
        ];
        var html = [];
        $.each(items, function (idx, item) {
            html.push(htmlItem.replace('{link}', path + item.link).replace('{icon}', item.icon).replace('{text}', item.text));
        });
        $('#global-nav').html(html.join(''));
    }

    function footer() {
        var footHtml = '<p class="ui-text-center contrast">HI群：1401953</p>';
        $('.footer').html(footHtml);
    }

    function renderNav() {
        // JS 组件列表
        var navItems =
            '<li class="ui-nav-item-header">按钮</li>' +
            '<li><a href="?control=Button">Button</a></li>' +
            '<li><a href="?control=CommandMenu">Command Menu</a></li>' +

            '<li class="ui-nav-item-header">表单和表单控件</li>' +
            '<li><a href="?control=AutoComplete">AutoComplete <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=BoxGroup">Box Group</a></li>' +
            '<li><a href="?control=Checkbox">Checkbox</a></li>' +
            '<li><a href="?control=ColorPicker">Color Picker <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=Form">Form</a></li>' +
            '<li><a href="?control=Label">Label</a></li>' +
            '<li><a href="?control=Region">Region</a></li>' +
            '<li><a href="?control=RichSelectors">Rich Selectors <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=ToggleSelectors">Rich Toggle Selectors <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=Select">Select</a></li>' +
            '<li><a href="?control=SearchBox">SearchBox</a></li>' +
            '<li><a href="?control=Slider">Slider <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=Spinner">Spinner</a></li>' +
            '<li><a href="?control=Schedule">Schedule</a></li>' +
            '<li><a href="?control=Textbox">TextBox</a></li>' +
            '<li><a href="?control=TextLine">TextLine</a></li>' +
            '<li><a href="?control=TokenField">TokenField <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=ValidityLabel">Validity</a></li>' +

            '<li class="ui-nav-item-header">表单日历</li>' +
            '<li><a href="?control=Calendar">Calendar</a></li>' +
            '<li><a href="?control=MonthView">Month View</a></li>' +
            '<li><a href="?control=MultiCalendar">Multi Calendar <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
            '<li><a href="?control=RangeCalendar">Range Calendar</a></li>' +
            '<li><a href="?control=RichCalendar">Rich Calendar</a></li>' +

            '<li class="ui-nav-item-header">导航</li>' +
            '<li><a href="?control=Accordion">Accordion <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
            '<li><a href="?control=Crumb">Breadcrumbs</a></li>' +
            '<li><a href="?control=Carousel">Carousel <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=Link">Link</a></li>' +
            '<li><a href="?control=Tab">Tab</a></li>' +
            '<li><a href="?control=Tree">Tree</a></li>' +
            '<li><a href="?control=Wizard">Wizard</a></li>' +

            '<li class="ui-nav-item-header">数据表格</li>' +
            '<li><a href="?control=Filter">Filter <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></a></li>' +
            '<li><a href="?control=Pager">Pager</a></li>' +
            '<li><a href="?control=Table">Table</a></li>' +

            '<li class="ui-nav-item-header">提示和消息</li>' +
            '<li><a href="?control=Alert">Alert <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
            '<li><a href="?control=Tip">Tip</a></li>' +
            '<li><a href="?control=TipLayer">TipLayer</a></li>' +
            '<li><a href="?control=Toast">Toast Notice</a></li>' +

            '<li class="ui-nav-item-header">其他</li>' +
            '<li><a href="?control=Dialog">Dialog</a></li>' +
            '<li><a href="?control=LightBox">LightBox <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>' +
            '<li><a href="?control=Panel">Panel</a></li>' +
            '<li><a href="?control=Sticky">Sticky <span class="ui-x-small ui-label-slim ui-label-custom ui-label-info">ub-ui</span></a></li>';

        function generateNav(id, items) {
            $(id).html(items);
            var url = window.location.pathname;
            if (url.indexOf('help')) {
                if (url.indexOf('guide.html') > 0) {
                    $('#navigator-help li:last a').css('color', '#444');
                }
                else {
                    $('#navigator-help li:first a').css('color', '#444');
                }
            }
            var filename = getQueryString('control');
            if (!filename) {
                filename = 'Button';
            }
            $(id + ' a[href="?control=' + filename + '"]').parent().addClass('ui-nav-item-active');
        }

        generateNav('#navigator', navItems);

        // 样式集合列表
        navItems = '<li class="ui-nav-item-header">样式集合</li>' +
            '<li><a href="?control=button">Button</a></li>' +
            '<li><a href="?control=checkbox">Checkbox</a></li>' +
            '<li><a href="?control=dropdown">Dropdown</a></li>' +
            '<li><a href="?control=form">Form</a></li>' +
            '<li><a href="?control=image">Image</a></li>' +
            '<li><a href="?control=input">Input</a></li>' +
            '<li><a href="?control=label">Label</a></li>' +
            '<li><a href="?control=loader">Loader</a></li>' +
            '<li><a href="?control=mask">Mask</a></li>' +
            '<li><a href="?control=navbar">Nav Bar</a></li>' +
            '<li><a href="?control=panel">Panel</a></li>' +
            '<li><a href="?control=progress">Progress</a></li>' +
            '<li><a href="?control=submenu">Submenu</a></li>' +
            '<li><a href="?control=text">Text</a></li>' +
            '<li><a href="?control=type">Type</a></li>' +
            '<li><a href="?control=wizard">Wizard</a></li>';
        generateNav('#navigator-esf', navItems);

        // get started 导航
        var startItems = 
            '<li><a href="start.html">开始使用</a></li>'
            + '<li><a href="guide.html">使用指南</a></li>';
        generateNav('#navigator-help', startItems);

    }

    function getQueryString(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        else {
            return null;
        }
    }

    function genBody(htmlReady) {
        var control = getQueryString('control');
        if (!control) {
            control = 'Button';
        }
        var url = '';
        var ubui = ['AutoComplete', 'ColorPicker', 'RichSelectors', 'ToggleSelectors',
        'Slider', 'Spinner', 'TokenField', 'MultiCalendar', 'Accordion', 'Carousel',
        'Filter', 'Alert', 'LightBox', 'Sticky'];

        url = '../dep/esui/3.2.0-beta.2/demo/' + control + '.html';

        for(var i = 0; i < ubui.length; i++) {
            if (ubui[i] === control) {
                url = '../dep/ub-ria-ui/1.0.0-beta.2/demo/' + control + '.html';
            }
        }

        if (window.location.pathname.indexOf("css") > 0) {
            url = '../dep/esf/1.0.0-rc.2/demo/' + control.toLowerCase() + '.html';
        }
        
        $.ajax({
            method: 'GET',
            url: url,
            dataType: 'html',
            success: function(result) {
                var $ele = $('<div></div>');
                $ele.html(result);
                $('#main').html($ele.find('#main').html());
                if (htmlReady) {
                    htmlReady();
                }
                if (window.location.pathname.indexOf("css") > 0) {
                    var esfMainScript = $ele.find('#main-js').html();
                    $('<script></script>').text('require(["jquery", "esui", "esui/Tab"], function ($, esui) {' + esfMainScript + ';esui.init();});').appendTo('body');
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
