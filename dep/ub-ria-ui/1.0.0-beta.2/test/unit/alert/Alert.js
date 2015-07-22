define(function (require) {
    var esui = require('esui');
    var Alert = require('ubRiaUi/Alert');
    var container = document.getElementById('container');
    describe('Alert common', function () {
        it('should be a constructor', function () {
            expect(Alert).toBeOfType('function');
        });
    });

});