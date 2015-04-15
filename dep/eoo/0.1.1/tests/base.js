describe('Class Base Test', function () {
    var init = function (prop1, prop2) {
        this.superProp1 = prop1;
        this.superProp2 = prop2;
    };

    var Super = Class({
        constructor: init,
        superMethod1: function () {
            console.log('super method1');
        },
        superMethod2: function () {
            console.log('super method2');
        }
    });


    it("class's constructor is set", function () {
        var ins = new Super()
        expect(Super.prototype.constructor).to.equal(init);
        expect(ins.constructor).to.be(init);
    });

    it("class's constructor is called", function () {
        var fn = function () {
        };
        var ins = new Super(1, fn);

        expect(ins.superProp1).to.equal(1);
        expect(ins.superProp2).to.equal(fn);
    });

    it("instance's $self is set to the class", function () {
        var ins = new Super;

        expect(ins.$self).to.equal(Super);
    });

    it("insanceof works right", function () {
        var ins = new Super;
        expect(ins instanceof Super).to.be(true);

        var C = Class({
            constructor: function () {
                if (!(this instanceof C)) {
                    return new C;
                }
            }
        })

        var c = C();

        expect(c instanceof C).to.be(true);
    })

    it("instance equal the constructor returned object", function () {
        var obj = {};
        var C = Class({
            constructor: function () {
                return obj;
            }
        });

        var c = new C(),
            d = C();

        expect(c instanceof C).to.not.be(true);
        expect(d instanceof C).to.not.be(true);
        expect(c).equal(d);
        expect(d).equal(obj);
    })
});