/**
 * Created by exodia on 14-8-28.
 */
void function (define, undefined) {

    define(
        function (require) {
            var MEMBERS = '__eooPrivateMembers__';

            function simpleGetter(name) {
                var body = 'return typeof this.' + MEMBERS + ' === \'object\' ? this.'
                    + MEMBERS + '[\'' + name + '\'] : undefined;';
                return new Function(body);
            }

            function simpleSetter(name) {
                var body = 'this.' + MEMBERS + ' = this.' + MEMBERS + ' || {};\n'
                    + 'this.' + MEMBERS + '[\'' + name + '\'] = value;' ;
                return new Function('value', body);
            }

            /**
             * 根据指定的属性名生成对应的accessor
             *
             * @param {Object | Function} obj 需要生成 accessor 的对象
             * @param {string} name 需要生成 accessor 的属性名称
             * @param {Object | Function} [accessor] 自定义的 getter 和 setter 配置
             * @param {Function} [accessor.get] 自定义的 getter 函数, 配置了accessor，但未设置 get，则不会生成 getter
             * @param {Function} [accessor.set] 自定义的 setter 函数, 配置了accessor，但未设置 set，则不会生成 setter
             */
            return function (obj, name, accessor) {
                var upperName = name.charAt(0).toUpperCase() + name.slice(1);
                var getter = 'get' + upperName;
                var setter = 'set' + upperName;

                if (!accessor) {
                    obj[getter] = !accessor || typeof accessor.get !== 'function' ? simpleGetter(name) : accessor.get;
                    obj[setter] = !accessor || typeof accessor.set !== 'function' ? simpleSetter(name) : accessor.set;
                }
                else {
                    typeof accessor.get === 'function' && (obj[getter] = accessor.get);
                    typeof accessor.set === 'function' && (obj[setter] = accessor.set);
                }
            };
        }
    );

}(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });