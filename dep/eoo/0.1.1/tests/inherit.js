describe('X.class Inherit Test', function () {
    var superStatics = {
        superSProp1: 1,
        superSProp2: 2,
        supersfn1: function () {
            return this.superSProp1
        },
        supersfn2: function () {
            return this.superSProp2
        },
        seach: function (arr, fn) {
            for (var i = 0; i < arr.length; ++i) {
                fn.call(arr, arr[i], i, arr)
            }
        },
        splus: function () {
            var sum = 0
            this.each(arguments, function (v) {
                sum += v
            })

            return sum
        }
    }

    var sub1Statics = {
        sub1SProp1: 1,
        sub1SProp2: 2,
        sub1sfn1: function () {
            return this.splus(this.supersfn1() + this.sub1SProp1)
        },
        sub1sfn2: function () {
            return this.splus(this.supersfn2() + this.sub1SProp2)
        },
        sminus: function () {
            var sum = 0
            this.each(arguments, function (v) {
                sum -= v
            })

            return sum
        }
    }

    var sub2Statics = {
        sub2SProp1: 1,
        sub2SProp2: 2,
        sub2sfn1: function () {
            return this.splus(this.sub1sfn1() + this.sub2SProp1)
        },
        sub2sfn2: function () {
            return this.splus(this.sub1sfn2() + this.sub2SProp2)
        },
        smulti: function () {
            var sum = 1
            this.each(arguments, function (v) {
                sum *= v
            })

            return sum
        }
    }

    var Super = X.Class.create({
        constructor: function (prop1, prop2) {
            this.superProp1 = prop1
            this.superProp2 = prop2
        },
        __statics: superStatics,
        fn1: function () {
            return this.superProp1
        },
        fn2: function () {
            return this.superProp2
        },
        each: function (arr, fn) {
            for (var i = 0; i < arr.length; ++i) {
                fn.call(arr, arr[i], i, arr)
            }
        },
        plus: function () {
            var sum = 0
            this.each(arguments, function (v) {
                sum += v
            })

            return sum
        },
        toString: function () {
            return this.plus(this.fn1(), this.fn2())
        }
    })

    var Sub1 = X.Class(Super, {
        constructor: function (prop1, prop2, prop3, prop4) {
            this.$super(arguments)
            this.sub1Prop1 = prop3
            this.sub1Prop2 = prop4
        },
        __statics: sub1Statics,
        fn1: function () {
            return this.plus(this.$super(arguments) + this.sub1Prop1)
        },
        fn2: function () {
            return this.plus(this.$super(arguments) + this.sub1Prop2)
        },
        minus: function () {
            var sum = 0
            this.each(arguments, function (v) {
                sum -= v
            })

            return sum
        }
    })

    var Sub2 = X.Class(Sub1, {
        constructor: function (prop1, prop2, prop3, prop4, prop5, prop6) {
            this.$super(arguments)
            this.sub2Prop1 = prop5
            this.sub2Prop2 = prop6
        },
        __statics: sub2Statics,
        fn1: function () {
            return this.plus(this.$super(arguments) + this.sub2Prop1)
        },
        fn2: function () {
            return this.plus(this.$super(arguments) + this.sub2Prop2)
        },
        multi: function () {
            var sum = 1
            this.each(arguments, function (v) {
                sum *= v
            })

            return sum
        },
        toString: function () {
            return this.plus(this.fn1(), this.fn2())
        }
    })


    var sup = new Super(1, 2)
    var sub1 = new Sub1(1, 2, 3, 4)
    var sub2 = new Sub2(1, 2, 3, 4, 5, 6)


    describe("One level inheritance test", function () {


        it("Sub1's $self is set", function () {
            expect(Sub1.prototype.$self).to.equal(Sub1)
        })


        it("Sub1's __super is equal to Super", function () {
            expect(Sub1.__super).to.equal(Super)
        })


        it("sub1's $super is called", function () {
            expect(sub1.superProp1).to.equal(1)
            expect(sub1.superProp2).to.equal(2)
        })

        it("sub1's inherited methods from Super are set", function () {
            expect(sub1.each).to.equal(sub1.$self.__super.prototype.each)
            expect(sub1.each).to.equal(sup.each)
            expect(sub1.plus).to.equal(sub1.$self.__super.prototype.plus)
            expect(sub1.plus).to.equal(sup.plus)
        })

        it("sub1's static properties are set", function () {
            for (var k in sub1Statics) {
                expect(Sub1[k]).to.equal(sub1Statics[k])
            }
        })

        it("sub1's inherited static properties are set", function () {
            for (var k in superStatics) {
                expect(Sub1[k]).to.equal(superStatics[k])
            }
        })

        it("sub1's own properties are set", function () {
            expect(sub1.sub1Prop1).to.equal(3)
            expect(sub1.sub1Prop2).to.equal(4)
        })

        it("sub1's own methods are set", function () {
            expect(sub1.fn1).to.equal(Sub1.prototype.fn1)
            expect(sub1.fn2).to.equal(Sub1.prototype.fn2)
            expect(sub1.minus).to.equal(Sub1.prototype.minus)
        })


        it("Super constructor method is called", function () {
            expect(sub1.superProp1).to.equal(1)
            expect(sub1.superProp2).to.equal(2)
        })
    })

    describe("Multiple level inheritance test", function () {

        it("Sub2's $self is set", function () {
            expect(Sub2.prototype.$self).to.equal(Sub2)
        })


        it("Sub2's __super is equal to Super", function () {
            expect(Sub2.__super).to.equal(Sub1)
        })

        it("sub2's $super is called", function () {
            expect(sub2.superProp1).to.equal(1)
            expect(sub2.superProp2).to.equal(2)
            expect(sub2.sub1Prop1).to.equal(3)
            expect(sub2.sub1Prop2).to.equal(4)
        })

        it("sub2's inherited methods from Super are set", function () {
            expect(sub2.each).to.equal(sub2.$self.__super.__super.prototype.each)
            expect(sub2.each).to.equal(sup.each)
        })

        it("sub2's inherited methods from Sub1 are set", function () {
            expect(sub2.minus).to.equal(sub2.$self.__super.prototype.minus)
            expect(sub2.minus).to.equal(sub1.minus)
        })

        it("sub2's static properties are set", function () {
            for (var k in sub2Statics) {
                expect(Sub2[k]).to.equal(sub2Statics[k])
            }
        })

        it("sub2's inherited static properties are set", function () {
            for (var k in superStatics) {
                expect(Sub2[k]).to.equal(superStatics[k])
            }
            for (var k in sub1Statics) {
                expect(Sub2[k]).to.equal(sub1Statics[k])
            }
        })


        it("sub2's own properties are set", function () {
            expect(sub2.sub2Prop1).to.equal(5)
            expect(sub2.sub2Prop2).to.equal(6)
        })

        it("sub2's own methods are set", function () {
            expect(sub2.fn1).to.equal(Sub2.prototype.fn1)
            expect(sub2.fn2).to.equal(Sub2.prototype.fn2)
            expect(sub2.multi).to.equal(Sub2.prototype.multi)
        })

        it("sub2's $self is set", function () {
            expect(sub2.$self).to.equal(Sub2)

        })

        it("Super constructor method is called", function () {
            expect(sub2.superProp1).to.equal(1)
            expect(sub2.superProp2).to.equal(2)
        })

        it("Sub1 constructor method is called", function () {
            expect(sub2.sub1Prop1).to.equal(3)
            expect(sub2.sub1Prop2).to.equal(4)
        })
    })


    describe("Inherited $super call test", function () {
        it("Super's instance methods are called right", function () {
            expect(sup.fn1()).to.equal(sup.superProp1)
            expect(sup.fn2()).to.equal(sup.superProp2)
            expect(sup.plus(sup.fn1(), sup.fn2())).to.equal(sup.superProp1 + sup.superProp2)
        })

        it("Sub1's instance methods are called right", function () {
            expect(sub1.fn1()).to.equal(sub1.superProp1 + sub1.sub1Prop1)
            expect(sub1.fn2()).to.equal(sub1.superProp2 + sub1.sub1Prop2)
            expect(sub1.plus(sup.fn1(), sup.fn2())).to.equal(sup.fn1() + sup.fn2())
            expect(sub1.minus(sup.fn1(), sup.fn2())).to.equal(-sup.fn1() - sup.fn2())
        })

        it("Sub2's instance methods are called right", function () {
            expect(sub2.fn1()).to.equal(sub1.fn1() + sub2.sub2Prop1)
            expect(sub2.fn2()).to.equal(sub1.fn2() + sub2.sub2Prop2)
            expect(sub2.plus(sub1.fn1(), sub1.fn2())).to.equal(sub1.fn1() + sub1.fn2())
            expect(sub2.minus(sub1.fn1(), sub1.fn2())).to.equal(-sub1.fn1() - sub1.fn2())
            expect(sub2.multi(sub1.fn1(), sub1.fn2())).to.equal(sub1.fn1() * sub1.fn2())
        })
    })

})