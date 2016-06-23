/** navbar
 *
 * @file sitemap.js
 * @author fe
 */
function genNavigator() {
    var navItems = '<li><a href="Accordion.html">Accordion</a></li>'
        + '<li><a href="Alert.html">Alert</a></li>'
        + '<li><a href="AutoComplete.html">AutoComplete</a></li>'
        + '<li><a href="BarChart.html">BarChart</a></li>'
        + '<li><a href="Carousel.html">Carousel</a></li>'
        + '<li><a href="CheckboxGroup.html">CheckboxGroup</a></li>'
        + '<li><a href="ColorPicker.html">ColorPicker</a></li>'
        + '<li><a href="ControlRepeater.html">ControlRepeater</a></li>'
        + '<li><a href="CopyButton.html">CopyButton</a></li>'
        + '<li><a href="CustomField.html">CustomField</a></li>'
        + '<li><a href="Drawer.html">Drawer</a></li>'
        + '<li><a href="Filter.html">Filter</a></li>'
        + '<li><a href="ImageList.html">ImageList</a></li>'
        + '<li><a href="ImagePanel.html">ImagePanel</a></li>'
        + '<li><a href="InlineEdit.html">InlineEdit</a></li>'
        + '<li><a href="LightBox.html">LightBox</a></li>'
        + '<li><a href="LineChart.html">LineChart</a></li>'
        + '<li><a href="MediaPreview.html">MediaPreview</a></li>'
        + '<li><a href="MultiSelect.html">MultiSelect</a></li>'
        + '<li><a href="Radio.html">Radio</a></li>'
        + '<li><a href="RegionChart.html">RegionChart</a></li>'
        + '<li><a href="RichSelectors.html">RichSelectors</a></li>'
        + '<li><a href="SidebarNav.html">SidebarNav</a></li>'
        + '<li><a href="Slider.html">Slider</a></li>'
        + '<li><a href="Spinner.html">Spinner</a></li>'
        + '<li><a href="Sticky.html">Sticky</a></li>'
        + '<li><a href="TogglePanel.html">TogglePanel</a></li>'
        + '<li><a href="ToggleSelectors.html">ToggleSelectors</a></li>'
        + '<li><a href="TokenField.html">TokenField</a></li>'
        + '<li><a href="Uploader.html">Uploader</a></li>';

    var navigator = document.getElementById('navigator');
    navigator.innerHTML = navItems;
    var url = window.location.pathname;
    var filename = url.substring(url.lastIndexOf('/') + 1);
    var links = navigator.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute('href') === filename) {
            var parent = links[i].parentNode;
            parent.setAttribute('class', 'ui-nav-item-active');
        }
    }
}
genNavigator();

function footer() {
    var footHtml = '<p class="ui-text-center contrast">HI群：1401953</p>';
    var footerNode = document.createElement('div');
    footerNode.setAttribute('class', 'footer');
    footerNode.innerHTML = footHtml;
    document.getElementsByTagName('body')[0].appendChild(footerNode);
}
footer();
