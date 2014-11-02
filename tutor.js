/*!
 * TutorJS - smart tutorials for site users
 * @version  v1.3
 * @author   Evgenii Dulikov
 * http://datatables.net/license_gpl2
 * Copyright 2014 Evgenii Dulikov <gerrproger@gmail.com>
 * https://github.com/Gerrproger/TutorJS
 */
(function(){
    "use strict";
    window.tutorJS = {
        VERSION: 1.3,
        canva: null,
        hole: null,
        bg: null,
        hint: null,
        text: null,
        wrap: null,
        bNext: null,
        bQuit: null,
        tNext: null,
        tQuit: null,
        aNext: null,
        aQuit: null,
        tCount: null,
        nAll: null,
        nCurr: null,
        inited: false,
        active: null,
        elements: null,
        nodes: [],
        html: null,
        scrolling: false,
        activeEl: null,
        defOptions: {
            showQuit: true,
            showNext: true,
            showCount: true,
            showHint: true,
            bgQuit: true,
            onQuit: null,
            auto: null,
            time: 300
        },
        options: null,
        butW: 80,  // Nav buttons width
        butH: 34,  // Nav buttons height
        pad: 10,   // Text padding
        shif: 10,  // Text margin
        lineL: 30, // Lines length in symbols
        lineH: 20, // Lines height


        /* Selectors */
        ID: function(str){
            return document.getElementById(str);
        },
        EL: function(str){
            return document.querySelector(str);
        },
        ELS: function(str){
            return document.querySelectorAll(str);
        },

        /* Staff functions */
        extend: function(obj1, obj2){
            var obj3 = {},
                key;
            for (key in obj1) { obj3[key] = obj1[key]; }
            for (key in obj2) { obj3[key] = obj2[key]; }
            return obj3;
        },

        anim: function(p, obj, f){
            var self = this,
                el = self.create('animate'),
                attr = {};
            self.attr(el, {'attributeName': obj.attr,
                'to': obj.to,
                'dur': obj.dur/1000+'s',
                'fill': 'freeze',
                'keySplines': '0.42 0 0.58 1',
                'calcMode': 'spline'});
            p.appendChild(el);
            if(el.beginElement) el.beginElement();
            attr[obj.attr] = obj.to;
            setTimeout(function(){
                self.attr(p, attr);
                p.removeChild(el);
                if(typeof f === 'function') f(p);
            }, obj.dur);
            return {
                and: function(objN, fN){ return self.anim(p, objN, fN); },
                anim: function(pN, objN, fN){ return self.anim(pN, objN, fN); }
            };
        },

        attr: function(el, vals){
            for(var attr in vals) el.setAttributeNS(null, attr, vals[attr]);
            return this;
        },

        on: function(el, ev, f){
            var self = this;
            el.addEventListener(ev, function(e){ f(e, el, self); }, false);
            return {on: function(evN, fN){ return self.on(el, evN, fN); }};
        },

        create: function(tag, node){
            return node ? document.createTextNode(tag) : document.createElementNS('http://www.w3.org/2000/svg', tag);
        },

        offset: function(el){
            return el.getBoundingClientRect();
        },
        width: function(el){
            return el.offsetWidth;
        },
        height: function(el){
            return el.offsetHeight;
        },
        positionTop: function(el){
            var p = 0;
            while(el){
                p += parseFloat(el.offsetTop);
                el = el.offsetParent;
            }
            return p;
        },

        easeInOutQuad: function(t, b, c, d) {
            t /= d / 2;
            if(t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        requestAnimFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
        || function(callback){ window.setTimeout(callback, 1000 / 60); },

        scrolledTop: function(){
            return (document.documentElement.scrollTop || document.body.scrollTop || 0);
        },
        animateScroll: function(to, callback){
            var self = this,
                start = self.scrolledTop(),
                change = to - start,
                currentTime = 0,
                increment = 20;
            self.scrolling = true;
            var animateScroll = function () {
                    currentTime += increment;
                    window.scrollTo(0, self.easeInOutQuad(currentTime, start, change, self.options.time));
                    if (currentTime < self.options.time) {
                        self.requestAnimFrame.call(window, animateScroll);
                    } else {
                        self.scrolling = false;
                        if(typeof(callback) === 'function')  callback();
                    }
                };
            animateScroll();
        },

        isInView: function(el){
            var self = this,
                elTop = el.top ? el.top : self.positionTop(el),
                elBottom = el.height ? el.top+el.height : elTop+self.height(el),
                wTop = self.scrolledTop(),
                wBottom = wTop+document.documentElement.clientHeight;
            return (elBottom<=wBottom && elTop>=wTop);
        },

        go: function(recalc){
            var self = this,
                el = self.activeEl.element,
                l, t, w, h;
            if(el.width !== undefined && el.height !== undefined && el.top !== undefined && el.left !== undefined){
                l = el.left;
                t = el.top - self.scrolledTop();
                w = el.width;
                h = el.height;
            } else {
                if(!(el instanceof HTMLElement))
                    throw new Error('No such element on this page! [' + (self.active+1) + '](' + self.elements[self.active].element +')');
                var offs = self.offset(el);
                l = offs.left;
                t = offs.top;
                w = self.width(el);
                h = self.height(el);
            }
            if(!w && !h && !l && !t)
                throw new Error('This element is hidden! [' + (self.active+1) + '](' + self.elements[self.active].element +')');
            if(recalc) self.attr(self.hole, {width: w, height: h, x: l, y: t});
            else self.anim(self.hole, {attr: 'width', to: w, dur: self.options.time})
            .and({attr: 'height', to: h, dur: self.options.time})
            .and({attr: 'x', to: l, dur: self.options.time})
            .and({attr: 'y', to: t, dur: self.options.time});
            return {l: l, t: t, w: w, h: h};
        },
        texter: function(offs){
            var self = this,
                text = self.activeEl.caption,
                t2 = Math.round(self.options.time/3),
                str = 1,
                needr = false,
                mass = [],
                bef = 0,
                i = null,
                l = null;
            if(text) {
                for (i = 0, l = text.length; i < l; i++) {
                    if (i + 1 > self.lineL * str) {
                        needr = true;
                        str++;
                    }
                    if (needr && text[i] == ' ') {
                        mass.push(text.substring(bef, i + 1));
                        bef = i + 1;
                        needr = false;
                    }
                }
                if (!mass.length) mass.push(text);
                else if (bef < text.length) mass.push(text.substring(bef, text.length));
            }
            if(self.nodes.length){
                self.anim(self.hint, {attr: 'opacity', to: 0, dur: t2}, function(){
                    for(var i=0,l=self.nodes.length; i<l; i++) self.text.removeChild(self.nodes[i]);
                    self.nodes.length = 0;
                });
            }
            setTimeout(function(){
                if(self.options.showCount) {
                    if(self.nCurr) self.tCount.removeChild(self.nCurr);
                    self.nCurr = self.create(self.active, true);
                    self.tCount.insertBefore(self.nCurr, self.nAll);
                }
                for(i=0,l=mass.length; i<l; i++){
                    var el = self.create('tspan'),
                        n = self.create(mass[i], true);
                    self.attr(el, {'x': 0});
                    if(i == 0) self.attr(el, {'dy': self.pad});
                    else self.attr(el, {'dy': self.lineH});
                    el.appendChild(n);
                    self.text.appendChild(el);
                    self.nodes.push(el);
                }
                self.hintPos(offs);
            }, self.options.time);
            return self;
        },
        hintPos: function(offs, recalc){
            var self = this,
                pos = self.activeEl.position;
            if(!(self.options.showHint && (self.activeEl.caption || self.options.showNext || self.options.showQuit || self.options.showCount))) return;
            var offs2 = self.text.getBBox(),
                x = null,
                y = null,
                posL = null,
                posC = null,
                posR = null,
                countIs = null;
            if(self.options.showNext){
                posR = {el1: self.bNext, el2: self.tNext, offs: self.tNext.getBBox()};
            }
            if(self.options.showQuit && self.options.showNext){
                posL = {el1: self.bQuit, el2: self.tQuit, offs: self.tQuit.getBBox()};
            } else
            if(self.options.showQuit){
                posR = {el1: self.bQuit, el2: self.tQuit, offs: self.tQuit.getBBox()};
            }
            if(self.options.showCount){
                posC = countIs = {el1: self.tCount, offs: self.tCount.getBBox()};
            }
            var tempW = (self.options.showNext ? self.butW : 0) + (self.options.showQuit ? self.butW : 0)
                    + (self.options.showCount ? countIs.offs.width : 0) + self.pad*2,
                anyControl = (self.options.showNext || self.options.showQuit || self.options.showCount) ? self.butH : 0;
            if(offs2.width < tempW){
                var offs0 = { // IE fix
                    width: tempW,
                    height: offs2.height,
                    x: offs2.x,
                    y: offs2.y
                };
                offs2 = offs0;
            }
            switch(pos){
                case 'top': {
                    x = offs.l + self.pad;
                    y = offs.t - offs2.height - self.shif - self.pad - anyControl;
                } break;
                case 'left': {
                    x = offs.l - offs2.width - self.shif - self.pad;
                    y = offs.t + self.pad;
                } break;
                case 'right': {
                    x = offs.l + offs.w + self.shif + self.pad;
                    y = offs.t + self.pad;
                }  break;
                default: {
                    x = offs.l + self.pad;
                    y = offs.t + offs.h + self.shif + self.pad;
                }
            }
            for(var i=0,l=self.nodes.length; i<l; i++) self.attr(self.nodes[i], {'x': x});
            self.attr(self.text, {'x': x, 'y': y})
                .attr(self.wrap, {'x': x-self.pad, 'y': y-self.pad,
                    'height':  offs2.height + self.pad*2 + (anyControl ? self.butH : 0),
                    'width': offs2.width+self.pad*2});
            if(posR) self.attr(posR.el1, {'x': x+offs2.width+self.pad-self.butW, 'y': y+offs2.height+self.pad})
                    .attr(posR.el2, {'x': x+self.pad/2+Math.round(offs2.width-(self.butW+posR.offs.width)/2),
                    'y': y+offs2.height+self.pad*2+Math.round((self.butH-posR.offs.height*1.2)/2)});
            if(posL) self.attr(posL.el1, {'x': x, 'y': y+offs2.height+self.pad})
                .attr(posL.el2, {'x': x-self.pad/2+Math.round((self.butW-posL.offs.width)/2),
                    'y': y+offs2.height+self.pad*2+Math.round((self.butH-posL.offs.height*1.2)/2)});
            if(posC){
                var nX = x+Math.round((offs2.width-posC.offs.width)/2);
                if((!posL || !posR) && (posL || posR)) nX -= self.butW/2;
                self.attr(posC.el1, {'x': nX, 'y': y+offs2.height+self.pad+self.butH/2});
            }
            if(!recalc) self.anim(self.hint, {attr: 'opacity', to: 1, dur: self.options.time});
            return self;
        },

        init: function(){
            var self = this;
            self.canva = self.ID('tutorJS-svg');
            self.hole = self.ID('tutorJS-hole');
            self.bg = self.ID('tutorJS-bg');
            self.text = self.ID('tutorJS-text');
            self.wrap = self.ID('tutorJS-wrap');
            self.bNext = self.ID('tutorJS-nextW');
            self.bQuit = self.ID('tutorJS-quitW');
            self.tNext = self.ID('tutorJS-nextT');
            self.tQuit = self.ID('tutorJS-quitT');
            self.aNext = self.ID('tutorJS-next');
            self.aQuit = self.ID('tutorJS-quit');
            self.tCount = self.ID('tutorJS-count');
            self.hint = self.ID('tutorJS-hint');
            self.html = self.EL('html');
            if(self.aNext) self.on(self.aNext, 'click', function(){
                self.next();
                self.attr(self.bNext, {fill: 'url(#tutorJS-gradient3)'});
            }).on('mouseover', function(){
                self.attr(self.bNext, {fill: 'url(#tutorJS-gradient5)'});
            }).on('mouseout', function(){
                self.attr(self.bNext, {fill: 'url(#tutorJS-gradient3)'});
            });
            if(self.aQuit) self.on(self.aQuit, 'click', function(){
                self.quit();
            }).on('mouseover', function(){
                self.attr(self.bQuit, {fill: 'url(#tutorJS-gradient6)'});
            }).on('mouseout', function(){
                self.attr(self.bQuit, {fill: 'url(#tutorJS-gradient4)'});
            });
            self.on(self.bg, 'click', function(){
                if(self.options.bgQuit) self.quit();
            });
            self.on(window, 'resize', function(){
                self.recalc();
            }).on('scroll', function(){
                if(!self.scrolling) self.recalc();
            });
            return self;
        },
        starter: function(reset) {
            var self = this;
            if (self.options.showQuit) {
                self.aQuit.style.display = 'block';
            } else {
                if (self.aQuit) self.aQuit.style.display = 'none';
            }
            if (self.options.showNext) {
                self.aNext.style.display = 'block';
            } else {
                if (self.aNext) self.aNext.style.display = 'none';
            }
            if (self.options.showCount) {
                if(!reset) {
                    self.nAll = self.create('/' + self.elements.length, true);
                    self.tCount.appendChild(self.nAll);
                }
                self.tCount.style.display = 'block';
            } else {
                if(!reset) self.nAll = null;
                if (self.tCount) self.tCount.style.display = 'none';
            }
            return self;
        },

        /* Api functions */
        next: function(auto){
            var self = this;
            if(auto=='re' && !self.options.auto) return;
            if(!self.elements || !self.elements[self.active]){
                if(self.active>0) self.quit();
                return self;
            }
            if(auto && auto!='re') self.options.auto = auto;
            self.activeEl = self.elements[self.active];
            var elem = self.activeEl.element,
                doThen = function(){
                    if (typeof self.activeEl.onActive === 'function')
                        self.activeEl.onActive(self.activeEl, self.active + 1);
                    self.texter(self.go()).active++;
                    if (self.options.auto) setTimeout(function () {
                        self.next('re');
                    }, self.options.auto);
                };
            if(!elem) throw new Error('Can not find argument "element"! [' + (self.active+1) + ']');
            if(typeof elem === 'string'){
                self.activeEl.element = elem = self.ID(elem);
            }
            if(!self.isInView(elem)){
                var t =  Math.round(self.options.time/3);
                self.anim(self.hole, {attr: 'opacity', to: 0, dur: t})
                .anim(self.hint, {attr: 'opacity', to: 0, dur:  t}, function() {
                        self.attr(self.hole, {'width': 0, 'height': 0, 'x': 0, 'y': 0, 'opacity': 1});
                        self.animateScroll((elem.top ? elem.top : self.positionTop(elem)) - self.pad, function(){
                            doThen();
                        });
                });
            } else doThen();
            return self;
        },
        set: function(options, slide){
            var self = this,
                oldElem = self.activeEl;
            if(typeof options === 'object') self.options = self.extend(self.options, options);
            if(typeof slide === 'object') self.activeEl = self.extend(self.activeEl, slide);
            self.anim(self.hint, {attr: 'opacity', to: 0, dur:  Math.round(self.options.time/3)}, function() {
                self.starter(true);
                var elem = self.activeEl.element,
                    doThen = function () {
                        if(typeof elem.onActive === 'function')
                            elem.onActive(self.activeEl, self.active);
                        if(oldElem.caption !== self.activeEl.caption) self.texter(self.go());
                        else self.hintPos(self.go(true));
                        if(self.options.auto) setTimeout(function() {
                            self.next('re');
                        }, self.options.auto);
                    };
                if (oldElem.element !== elem) {
                    if (!elem) throw new Error('Can not find argument "element"! [' + (self.active) + ']');
                    if (typeof elem === 'string') {
                        self.activeEl.element = elem = self.ID(elem);
                    }
                    if (!self.isInView(elem)) {
                        var t = Math.round(self.options.time / 3);
                        self.anim(self.hole, {attr: 'opacity', to: 0, dur: t})
                            .anim(self.hint, {attr: 'opacity', to: 0, dur: t}, function () {
                                self.attr(self.hole, {'width': 0, 'height': 0, 'x': 0, 'y': 0, 'opacity': 1});
                                self.animateScroll((elem.top ? elem.top : self.positionTop(elem)) - self.pad, function () {
                                    doThen();
                                });
                            });
                    } else doThen();
                } else doThen();
            });
            return self;
        },
        stop: function(){
            var self = this;
            self.options.auto = null;
            return self;
        },
        start: function(mass, options){
            var self = this,
                doThen = function(){
                    self.starter();
                    self.canva.style.display = 'block';
                    self.anim(self.bg, {attr: 'opacity', to: 1, dur: self.options.time * 3}, function () {
                        self.next();
                    });
                };
            self.active = 0;
            if(typeof options === 'object'){
                self.options = self.extend(self.defOptions, options);
            } else self.options = self.defOptions;
            self.elements = mass.length ? mass : [mass];
            if(!self.inited){
                self.init();
                self.inited = true;
                doThen();
            } else {
                if(self.nAll){
                    self.tCount.removeChild(self.nAll);
                    self.nAll = null;
                }
                self.anim(self.hint, {attr: 'opacity', to: 0, dur:  Math.round(self.options.time/3)}, function() {
                    doThen();
                });
            }
            return self;
        },
        quit: function(){
            var self = this;
            self.active = null;
            self.stop();
            self.anim(self.hole, {attr: 'opacity', to: 0, dur: self.options.time})
            .anim(self.hint, {attr: 'opacity', to: 0, dur: self.options.time})
            .anim(self.bg,{attr: 'opacity', to: 0, dur: self.options.time*3}, function(){
                self.canva.style.display = 'none';
                self.attr(self.hole, {'width': 0, 'height': 0, 'x': 0, 'y': 0, 'opacity': 1});
                if(typeof self.options.onQuit === 'function') self.options.onQuit(self);
            });
            return self;
        },
        recalc: function(){
            var self = this;
            if(self.active == null) return self;
            self.hintPos(self.go(true), true);
            return self;
        }
    }
})();
