function createNav() {
    var navItems = [
        'alert', 'accordion', 'autoComplete', 'carousel', 'lightBox',
        'multiCalendar', 'slider', 'spinner', 'sticky', 'togglePanel', 'tokenField'
    ];
    var navHtml = '';
    $(navItems).each(function (index, item) {
        var initial = item.slice(0, 1).toUpperCase() + item.slice(1);
        navHtml += '<li><a href="' + item + '.html">' + initial + '</a></li>';
    });
    $('body').append('<div id="navigator" class="navigator"></div>');
    $('#navigator').html(navHtml);
}
$(document).ready(
    function () {
        createNav();
    }
);
