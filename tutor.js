/*!
 * TutorJS - smart tutorials for site users
 * @version  v1.0
 * @author   Evgenii Dulikov
 * http://datatables.net/license_gpl2
 * Copyright 2014 Evgenii Dulikov <gerrproger@gmail.com>
 * https://github.com/Gerrproger/TutorJS
 */
(function(){
    window.tutorJS = {
        VERSION: 1,
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
        tCount: null,
        nAll: null,
        nCurr: null,
        inited: false,
        active: null,
        elements: null,
        auto: null,
        onQuit: null,
        nodes: [],
        butW: 80,  // Nav buttons width
        butH: 34,  // Nav buttons height
        t: 300,    // Animation Speed
        pad: 10,   // Text padding
        shif: 10,  // Text margin
        lineL: 30, // Lines length in symbols
        lineH: 20, // Lines height

        /* Selectors */
        ID: function(str){
            return document.getElementById(str);
        },
        CLASS: function(str){
            return document.getElementsByClassName(str);
        },
        TAG: function(str){
            return document.getElementsByTagName(str);
        },

        /* Staff functions */
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
            el.beginElement();
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
            for(var attr in vals) el.setAttribute(attr, vals[attr]);
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
            var top=0,
                left=0;
            while(el){
                top += parseFloat(el.offsetTop);
                left += parseFloat(el.offsetLeft);
                el = el.offsetParent;
            }
            return {top: Math.round(top), left: Math.round(left)};
        },
        width: function(el){
            return el.offsetWidth;
        },
        height: function(el){
            return el.offsetHeight;
        },

        go: function(el){
            var self = this;
            if(typeof el === 'string') el = self.ID(el);
            if(!(el instanceof HTMLElement))
                throw new Error('No such element on this page! [' + (self.active+1) + '](' + self.elements[self.active].element +')');
            var offs = self.offset(el),
                w = self.width(el),
                h = self.height(el);
            if(!w && !h && !offs.left && !offs.top)
                throw new Error('This element is hidden! [' + (self.active+1) + '](' + self.elements[self.active].element +')');
            self.anim(self.hole, {attr: 'width', to: w, dur: self.t})
            .and({attr: 'height', to: h, dur: self.t})
            .and({attr: 'x', to: offs.left, dur: self.t})
            .and({attr: 'y', to: offs.top, dur: self.t});
            offs.w = w;
            offs.h = h;
            return offs;
        },
        texter: function(text, offs, pos){
            var self = this,
                t2 = Math.round(self.t/3),
                str = 1,
                needr = false,
                mass = [],
                bef = 0,
                x = null,
                y = null,
                i = null,
                l = null;
            for(i=0,l=text.length; i<l; i++){
                if(i+1 > self.lineL*str){
                    needr = true;
                    str++;
                }
                if(needr && text[i]==' '){
                    mass.push(text.substring(bef, i+1));
                    bef = i+1;
                    needr = false;
                }
            }
            if(!mass.length) mass.push(text);
            else if(bef<text.length) mass.push(text.substring(bef, text.length));
            if(self.nodes.length){
                self.anim(self.hint, {attr: 'opacity', to: 0, dur: t2}, function(){
                    for(var i=0,l=self.nodes.length; i<l; i++) self.text.removeChild(self.nodes[i]);
                    self.nodes.length = 0;
                });
            }
            setTimeout(function(){
                if(self.nCurr) self.tCount.removeChild(self.nCurr);
                self.nCurr = self.create(self.active, true);
                self.tCount.insertBefore(self.nCurr, self.nAll);
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
                var offs2 = self.text.getBBox(),
                    offs3 = self.tCount.getBBox(),
                    offs4 = self.tNext.getBBox(),
                    offs5 = self.tQuit.getBBox(),
                    temp = self.butW*2+offs3.width+self.pad*2;
                if(offs2.width < temp) offs2.width = temp;
                switch(pos){
                    case 'top': {
                        x = offs.left+self.pad;
                        y = offs.top-offs2.height-self.shif-self.pad-self.butH;
                    } break;
                    case 'left': {
                        x = offs.left-offs2.width-self.shif-self.pad;
                        y = offs.top+self.pad;
                    } break;
                    case 'right': {
                        x = offs.left+offs.w+self.shif+self.pad;
                        y = offs.top+self.pad;
                    } break;
                    default: {
                        x = offs.left+self.pad;
                        y = offs.top+offs.h+self.shif+self.pad;
                    }
                }
                for(i=0; i<l; i++) self.attr(self.nodes[i], {'x': x});
                self.attr(self.text, {'x': x, 'y': y})
                .attr(self.wrap, {'x': x-self.pad, 'y': y-self.pad,
                    'height':  offs2.height+self.pad*2+self.butH,
                    'width': offs2.width+self.pad*2})
                .attr(self.bNext, {'x': x+offs2.width+self.pad-self.butW,
                    'y': y+offs2.height+self.pad})
                .attr(self.tNext, {'x': x+self.pad/2+Math.round(offs2.width-(self.butW+offs4.width)/2),
                    'y': y+offs2.height+self.pad*2+Math.round((self.butH-offs4.height*1.2)/2)})
                .attr(self.bQuit, {'x': x,
                    'y': y+offs2.height+self.pad})
                .attr(self.tQuit, {'x': x-self.pad/2+Math.round((self.butW-offs5.width)/2),
                    'y': y+offs2.height+self.pad*2+Math.round((self.butH-offs5.height*1.2)/2)})
                .attr(self.tCount, {'x': x+Math.round((offs2.width-offs3.width)/2),
                    'y': y+offs2.height+self.pad+self.butH/2})
                .anim(self.hint, {attr: 'opacity', to: 1, dur: self.t});
            }, self.t);
            return self;
        },

        /* Api functions */
        next: function(auto){
            var self = this;
            if(auto=='re' && !self.auto) return;
            if(!self.elements || !self.elements[self.active]){
                if(self.active>0) self.quit();
                return self;
            }
            if(auto && auto!='re') self.auto = auto;
            if(typeof self.elements[self.active].onActive === 'function')
                self.elements[self.active].onActive(self.elements[self.active].element, self.active+1);
            var offs = self.go(self.elements[self.active].element);
            self.texter(self.elements[self.active].caption, offs, self.elements[self.active].position)
            .active++;
            if(self.auto) setTimeout(function(){self.next('re');}, self.auto);
            return self;
        },
        stop: function(){
            var self = this;
            self.auto = null;
            return self;
        },
        start: function(mass, options){
            var self = this;
            self.active = 0;
            if(typeof options === 'object'){
                self.auto = options.auto;
                self.onQuit = options.onQuit;
            }
            self.elements = mass.length ? mass : [mass];
            if(!self.inited){
                self.canva = self.ID('tutorJS-svg');
                self.hole = self.ID('tutorJS-hole');
                self.bg = self.ID('tutorJS-bg');
                self.text = self.ID('tutorJS-text');
                self.wrap = self.ID('tutorJS-wrap');
                self.bNext = self.ID('tutorJS-nextW');
                self.bQuit = self.ID('tutorJS-quitW');
                self.tNext = self.ID('tutorJS-nextT');
                self.tQuit = self.ID('tutorJS-quitT');
                self.tCount = self.ID('tutorJS-count');
                self.hint = self.ID('tutorJS-hint');
                self.on(self.ID('tutorJS-next'), 'click', function(){
                    self.next();
                }).on('mouseover', function(){
                    self.attr(self.bNext, {fill: 'url(#tutorJS-gradient5)'});
                }).on('mouseout', function(){
                    self.attr(self.bNext, {fill: 'url(#tutorJS-gradient3)'});
                });
                self.on(self.ID('tutorJS-quit'), 'click', function(){
                    self.quit();
                }).on('mouseover', function(){
                    self.attr(self.bQuit, {fill: 'url(#tutorJS-gradient6)'});
                }).on('mouseout', function(){
                    self.attr(self.bQuit, {fill: 'url(#tutorJS-gradient4)'});
                });
                self.inited = true;
            } if(self.nAll){
                    self.tCount.removeChild(self.nAll);
                    self.nAll = null;
                }
            self.nAll = self.create('/'+self.elements.length, true);
            self.tCount.appendChild(self.nAll);
            self.canva.style.display = 'block';
            self.anim(self.bg,{attr: 'opacity', to: 1, dur: self.t*3}, function(){
                self.next();
            });
            return self;
        },
        quit: function(){
            var self = this;
            self.stop();
            self.anim(self.hole, {attr: 'opacity', to: 0, dur: self.t})
            .anim(self.hint, {attr: 'opacity', to: 0, dur: self.t})
            .anim(self.bg,{attr: 'opacity', to: 0, dur: self.t*3}, function(){
                self.canva.style.display = 'none';
                self.attr(self.hole, {'width': 0, 'height': 0, 'x': 0, 'y': 0, 'opacity': 1});
                if(typeof self.onQuit === 'function') self.onQuit(self);
            });
            return self;
        }

    }
})();
