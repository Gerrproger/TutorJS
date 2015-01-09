TutorJS
=======

## <a href="http://gerrproger.github.io/TutorJS/" target="_blank">Demo & examples</a>

### Browser compatibility
* IE 9+
* All other popular browsers

### Dependences
* None

### License
* [https://github.com/Gerrproger/TutorJS/blob/master/LICENS](https://github.com/Gerrproger/TutorJS/blob/master/LICENSE)


## You can use <a href="http://bower.io/" target="_blank">bower</a> for installation:
#### `bower install tutorjs`  

# Usage

Include the script in the `<head>` of your document:
```html
<script type="text/javascript" src="js/tutor.min.js"></script>
```

Place code in the `<body>` of your document:
```html
<svg id="tutorJS-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: fixed; z-index: 100000; width:100%; height: 100%; cursor: default; top: 0; left: 0; display: none">
  ...
</svg>
```
_Note:_ You can change svg styles as you like!

And just start your tutorial:
```javascript
tutorJS.start([{
    element: 'someId',
    caption: 'This is it!'
},{
    element: 'anotherId',
    position: 'top'
}], {
    auto: 4000,
    time: 400
});
```




# Api

## start

The main method that starts your tutorial.
```javascript
tutorJS.start(elements, options);
```
_Note:_ You can start the new tutorial not even quitting the previous!

#### elements
An array of objects or just an object with steps data for your tutorial.
```javascript
[{
  element: 'someId',
  captions: 'My element'
}, {
  element: 'anotherId',
  position: 'top',
  onActive: function(){}
}]
```
<br>**Required:** yes
#### options
An object with options for this tutorial instance.
```javascript
{
  auto: 1000,
  onQuit: function(){},
  showHint: false
}
```
<br>**Required:** no

### element.element
An element to highlight. Can be the `id` or DOM object or coordinates object (`{top: , left: , width: , height: }` in px).
```javascript
element: 'someId'
// or
element: {top: 100, left: 100, width: 50, height: 50}
```
<br>**Type:** string / DOM obj / coordianates
<br>**Required:** yes

### element.caption
Text that would be displayed on the hint when the element would be highlighted
```javascript
caption: 'This is some super button!'
```
<br>**Type:** string
<br>**Default:** null
<br>**Required:** no

### element.position
Position of the hint  relative to the element. Can be `left`, `top`, `right` or `bottom`.
```javascript
position: 'right'
```
<br>**Type:** string
<br>**Default:** bottom
<br>**Required:** no

### element.onActive
Function that would be called when this element would be highlighted.
```javascript
onActive: function(element, step){ console.log('This is it!', element) }
```
<br>**Type:** function
<br>**Default:** null
<br>**Required:** no


### options.auto
Automatically switches steps (autoplay). Just pass dalay for viewing one step (ms). Pass `0` for no autoplaying.
```javascript
auto: 1000
```
<br>**Type:** number
<br>**Default:** 0
<br>**Required:** no

### options.onQuit
Function that would be called on quitting active tutorial. 
```javascript
onQuit: function(instance){ console.log('Tutor has ended!'); }
```
<br>**Type:** function
<br>**Default:** null
<br>**Required:** no

### options.bgQuit
Quit this tutorial on the background dark layout click or not. 
```javascript
bgQuit: false
```
<br>**Type:** boolen
<br>**Default:** true
<br>**Required:** no

### options.showNext
Show the `Next` button or not.
```javascript
showNext: false
```
<br>**Type:** boolen
<br>**Default:** true
<br>**Required:** no

### options.showQuit
Show the `Quit` button or not.
```javascript
showQuit: false
```
<br>**Type:** boolen
<br>**Default:** true
<br>**Required:** no

### options.showCount
Show the pagination or not.
```javascript
showCount: false
```
<br>**Type:** boolen
<br>**Default:** true
<br>**Required:** no

### options.showHint
Show the hint block or not.
```javascript
showHint: false
```
<br>**Type:** boolen
<br>**Default:** true
<br>**Required:** no

### options.time
The average duration of animations and effects in ms (this actionally is the factor).
```javascript
time: 1000
```
<br>**Type:** number
<br>**Default:** 300
<br>**Required:** no


## quit

The method that quits your tutorial. No parametrs.
```javascript
tutorJS.quit();
```


## next

The method that shows the next step of your tutorial or quits it if no next step is available. No parametrs.
```javascript
tutorJS.next();
```


## recalc

Recalculates TutorJS elements positions (highlighting and the hint). No parametrs.
```javascript
tutorJS.next();
```


## set

Reconfigures current tutorial options and the current element.
```javascript
tutorJS.set(options, element);
```

#### options
An object with options for the current tutorial instance (as in the start method).
<br>**Required:** no

#### element
An object with the current step data for the current tutorial (as in the start method).
<br>**Required:** no


------
## Getting data
You can get some data of the current tutorial and the current element.

#### Elements (steps) 
```javascript
var elements = tutorJS.elements;
var stepsN = elements.length;
```

#### Current element
```javascript
var currentStep = tutorJS.activeEl;
```

#### Current step number
```javascript
var stepN = tutorJS.active;
```

#### Instance options
```javascript
var options = tutorJS.options;
```

#### TutorJS version
```javascript
var ver = tutorJS.VERSION;
```




# Utils
You can use some other methods of the TutorJS for your needs.

### tutorJS.ID
Returns the DOM object for the element with the passed id.
```javascript
var el = tutorJS.ID('myId');
```

### tutorJS.EL
Returns the DOM object for the element with the passed jQuery-like selector (only the first found).
```javascript
var el = tutorJS.EL('.myClass > someTag');
```

### tutorJS.ELS
Returns an array with the DOM objects for the elements with the passed jQuery-like selector.
```javascript
var els = tutorJS.ELS('.myClass > someTag');
```

### tutorJS.extend
Returns the new object extended by another.
```javascript
var obj = tutorJS.extend(obj1, obj2);
```

### tutorJS.attr
Adds attributes to the element from the passed object.
```javascript
var el = tutorJS.extend(tutorJS.EL('input'), {required: 'required', placeholder: 'Required input!'});
```

### tutorJS.offset
Returns an offset of the element relative to the window (in px).
```javascript
var offset = tutorJS.offset(element);
var offTop = offset.top;
```

### tutorJS.width
Returns width of the element (in px).
```javascript
var elementWidth = tutorJS.width(element);
```

### tutorJS.height
Returns height of the element (in px).
```javascript
var elementHeight = tutorJS.height(element);
```

### tutorJS.positionTop
Returns the top offset of the element relative to the document (in px).
```javascript
var elementTop = tutorJS.positionTop(element);
```

### tutorJS.scrolledTop
Returns number odf scrolled pixels (from the top of the document).
```javascript
var scr = tutorJS.scrolledTop();
```

### tutorJS.animateScroll
Scrolles to the passed psition with animation (vertically).
```javascript
tutorJS.animateScroll(position, callback);
```

### tutorJS.isInView
Checks if specified element is fully visible on the page (only vertically).
```javascript
var isInView = tutorJS.isInView(element);
```

### tutorJS.on
Calls specified callback when an event fired on the element. Supports chaining.
```javascript
tutorJS.on(element, 'click', callback)
       .on(element2, 'mouseover', callback2);
```

-----
### tutorJS.create
Creates new SVG element tag or node if specified the second argument. Only SVG tags!
```javascript
var newCircle = tutorJS.create('circle');
var newNode = tutorJS.create('My special text', true);
```

### tutorJS.anim
Animates SVG element via adding animate tag. Just pass the special object with the parametrs (`{attr: , to: , dur: }`). Supports chaining. Only for SVG!
```javascript
tutorJS.anim(element, {attr: 'opacity', to: 1, dur: 300}, callback1)
        .and({attr: 'height', to: '200px', dur: 1000}, callback2)
       .anim(anotherElement, {attr: 'width', to: '100px', dur: 500}, callback3);
```

