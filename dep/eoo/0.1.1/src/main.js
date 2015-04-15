/**
 * Created by exodia on 14-8-28.
 */
void function (define) {
    define(
        function (require) {
            var oo = require('./oo');
            oo.defineAccessor = require('./defineAccessor');

            return oo;
        }
    );
}(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });