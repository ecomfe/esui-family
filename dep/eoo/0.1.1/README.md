eoo
==

Base library for OO style programming, supports both browser and node

## Usage

### inherits Class

Top Class is the ***Class***

```javascript
// var Class = require('oo')
require(['oo'], function(Class) {

    // a base class
    var Super = Class({
        // constructor will be called on instantiation
         constructor: function() {

         },
         // members that will be added to the prototype
         say: function(content) {
             console.log(content)
         }
    });

    // inherits the Super
    var Sub = Class(Super, {
        constructor: function(prop) {
        //  $super method will call the Super Class's method with the same name,
        // in this, is `constructor`
            this.$super(arguments);

            // other code
            this.prop = prop;
        },

        say: function(content) {
            this.$super(arguments);
            console.log(this.prop)
        }
    });

    var sup = new Super();
    sup.say('hi');

    var sub = new Sub('sub');
    sub.say('fuck!');
});
```

### inherits Object

This equals ```Object.create``` method.

```javascript
Class.static(obj);
```

## attribute

### Class#constructor
if config a constructor, and it is a function, it will be called on instantiation

### Class#$super
$super method will call the Super Class's method with the same name;

***notice:***
because `$super` internal implementation uses the `arguments.caller`, $super can not be used in strict mode!

###  Class#$self
this property references the instance's Class:

```javascript
var Base = Class();
var instance = new Base();
instance.$self === Base // true
```

### Class.$superClass
references the super class:

```javascript
var Super = Class();
var Sub = Class(Super);

Sub.$superClass === Super // true
```

### Class.create
alias of Class

### Class.static
creates a new object with the specified prototype object and properties.
Just equals ```Object.create``` method.

### Class.defineAccessor
quickly generator the accessor for the object;

 ```javascript
 Class.defineAccessor(obj, 'name');
 typeof obj.setName === 'function'; // true
 typeof obj.getName === 'function'; // true
 ```


