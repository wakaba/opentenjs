/*
// require Ten.js
// require Ten/SubWindow.js
// require Ten/Highlight.js
// require Hatena.js
*/

/* Hatena.Star */
if (typeof(Hatena.Star) == 'undefined') {
    Hatena.Star = {};
}
Hatena.Star.VERSION = 1.95;

/*
// Hatena.Star.* classes //
*/
Hatena.Star.BaseURL = 'http://s.hatena.ne.jp/';
if (!Hatena.Star.BaseURLProtocol) {
    Hatena.Star.BaseURLProtocol = ( location.protocol === "http:" ? "http:" : "https:" );
}
Hatena.Star.PortalURL = 'http://www.hatena.ne.jp/';
Hatena.Star.ProfileURL = 'http://profile.hatena.ne.jp/';
Hatena.Star.UgoMemoURL = 'http://ugomemo.hatena.ne.jp/';
Hatena.Star.HaikuURL   = 'http://h.hatena.ne.jp/';
Hatena.Star.HatenaHostRegexp = /(\.hatena\.ne\.jp|\.hatelabo.jp|\.hatena\.com)$/;
Hatena.Star.Token = null;
Hatena.Star.UseAnimation = false;

Hatena.Star.isTouchUA = Ten.Browser.isTouch || Ten.Browser.isIPad;

// ---- user setting ----
Hatena.Star.Config = {
    isColorPalletAvailable: true,
    isStarDeletable: true,
    isCommentButtonAvailable: true
}

Hatena.Star.Delayed = new Ten.Class({
    initialize: function () {
        this.waiting = [];
    }
}, {
    isReady : false,
    ready : function (value) {
        this.value = value;
        while (this.waiting.length) {
            this.waiting.shift()(value);
        }
        this.isReady = true;
    },
    required : function (fun) {
        var self = this;
        if (typeof(this.value) == "undefined") {
            this.waiting.push(fun);
        } else {
            fun(this.value);
        }
    }
});

/* Hatena.Star.User */
Hatena.Star.User = new Ten.Class({
    base: [Hatena.User],
    initialize: function(name) {
        if (Hatena.Star.User._cache[name]) {
            return Hatena.Star.User._cache[name];
        } else {
            this.name = name;
            Hatena.Star.User._cache[name] = this;
            return this;
        }
    },
    profileIconType: 'icon',
    getProfileIcon: function(name,src) {
        if (!name) name = 'user';
        var img = document.createElement('img');
        if (src) {
            img.src = src;
        } else {
            if (this.profileIconType == 'icon' &&
                !/\@/.test(name)) {
                var pre = name.match(/^[\w-]{2}/)[0];
                var pp = pre + '/' + name + '/profile_s.gif';
                if ( location.protocol == 'https:' ) {
                    img.src = 'https://www.hatena.com/users/' + pp;
                } else {
                    img.src = 'http://cdn1.www.st-hatena.com/users/' + pp;
                }
            } else {
                img.src = 'http://n.hatena.com/' + name + '/profile/image?size=16&type=' + encodeURIComponent(this.profileIconType);
            }
        }
        img.setAttribute('alt', name);
        img.setAttribute('title', name);
        img.setAttribute('width','16px');
        img.setAttribute('height','16px');
        img.className =  'profile-icon';
        var s = img.style;
        s.margin = '0 3px';
        s.border = 'none';
        s.verticalAlign = 'middle';
        s.width = '16px';
        s.height = '16px';
        return img;
    },
    RKS : new Hatena.Star.Delayed(),
    _cache: {},
    _nicknames: {},
    useHatenaUserNickname: false,
    withNickname: function (urlName, nextCode) {
        var cached = urlName ? Hatena.Star.User._nicknames[urlName] : null;
        if (!urlName) {
            cached = null;
        } else if (!Hatena.Star.User.useHatenaUserNickname &&
                   urlName &&
                   !/\@/.test(urlName)) {
            cached = urlName;
        }
        if (cached !== undefined) {
            setTimeout(function () {
                nextCode.apply(Hatena.Star.User, [cached]);
            }, 10);
            return;
        }
        this._getNickname(urlName, nextCode);
    },
    _getNicknames: {},
    _getNickname: function (urlName, nextCode) {
      this._getNicknames[urlName] = this._getNicknames[urlName] || [];
      this._getNicknames[urlName].push(nextCode);
      clearTimeout(this._getNicknameTimer);
      this._getNicknameTimer = setTimeout(function () {
        var names = Hatena.Star.User._getNicknames;
        Hatena.Star.User._getNicknames = {};
        var url = 'http://h1beta.hatena.com/api/friendships/show.json?url_name=sample';
        for (var n in names) {
          url += '&url_name=' + encodeURIComponent(n);
        }
        new Ten.JSONP(url, function (users) {
          for (var n in users) {
            var user = users[n];
            var codes = names[n] || [];
            for (var i = 0; i < codes.length; i++) {
              Hatena.Star.User._nicknames[n] = user.name || null;
              var nickname = user.name;
              if (nickname) nickname += ' (id:' + n + ')';
              codes[i].apply(Hatena.Star.User, [nickname]);
            }
          }
        });
      }, 500);
    }
},{
    userPage: function() {
        var hostname = location.hostname || '';
        if (this.name.match(/@(.*)/)) {
            return Hatena.Star.ProfileURL + this.name + '/';
        } else {
            if (Hatena.Star.HatenaHostRegexp.test(hostname)) {
                return 'http://' + location.host + '/' + this.name + '/';
            } else {
                return Hatena.Star.ProfileURL + this.name + '/';
            }
        }
    }
});

/* Hatena.Star.Entry */
Hatena.Star.Entry = new Ten.Class({
    initialize: function(e) {
        this.entry = e;
        this.uri = e.uri;
        this.title = e.title;
        this.star_container = e.star_container;
        this.comment_container = e.comment_container;
        this.entryNode = e.entryNode;
        this.stars = [];
        this.colored_stars = [];
        this.comments = [];
        this._hasBoundToStarEntry = false;
    },
    maxStarCount: 11
},{
    flushStars: function() {
        this.stars = [];
        this.star_container.innerHTML = '';
    },
    hasBoundToStarEntry: function () {
        return this._hasBoundToStarEntry;
    },
    bindStarEntry: function(se) {
        this._hasBoundToStarEntry = true;
        if (se.colored_stars) {
            var colored_star_hash = {};
            for (var i = 0, len = se.colored_stars.length; i < len ; i++){
                colored_star_hash[se.colored_stars[i].color] = se.colored_stars[i].stars;
            }
            var cs = [ "purple", "blue", "red", "green" ];
            for (var i = 0, len = cs.length; i < len ; i++){
                var csh = colored_star_hash[cs[i]];
                if (csh) this.pushStars(csh,cs[i]);
            }
        }
        this.pushStars(se.stars);
        if (se.comments && !this.comments.length) {
            for (var i = 0; i < se.comments.length; i++) {
                this.comments.push(new Hatena.Star.Comment(se.comments[i]));
            }
        }
        this.can_comment = se.can_comment;
    },
    pushStars: function(s,c) {
        for (var i = 0; i < s.length; i++) {
            if (typeof(s[i]) == 'number') {
                this.stars.push(new Hatena.Star.InnerCount(s[i],this,c));
            } else if(s[i]) {
                var args = s[i];
                args.entry = this.entry;
                args.container = this.star_container;
                args.color = c;
                this.stars.push(new Hatena.Star.Star(args));
            }
        }
    },
    setCanComment: function(v) {
        this.can_comment = v;
    },
    showButtons: function() {
        this.addAddButton();
        this.addCommentButton();
    },
    addAddButton: function() {
        var addButtonClass =
            this.constructor.AddButtonClass || (
                (Hatena.Star.useSmartPhoneStar && Hatena.Star.isTouchUA)
                    ? Hatena.Star.AddButton.SmartPhone
                    : Hatena.Star.AddButton
            );

        var sc = this.star_container;
        if (sc) {
            this.addButton = new addButtonClass(this,sc);
            sc.appendChild(this.addButton);
        }
    },
    addCommentButton: function() {
        var cc = this.comment_container;
        if (cc) {
            this.commentButton = new Hatena.Star.CommentButton(this,cc);
            cc.appendChild(this.commentButton.img);
        }
    },
    showStars: function() {
        var sc = this.star_container;
        for (var i = 0; i < this.stars.length; i++) {
            sc.appendChild(this.stars[i].asElement());
        }
    },
    showCommentButton: function() {
        if ( this.can_comment && Hatena.Star.Config.isCommentButtonAvailable ) {
            this.commentButton.show();
            if (this.comments.length) this.commentButton.activate();
        } else {
            // this.commentButton.hide();
        }
    },
    addTemporaryStar: function(args) {
        if (!this.temporaryStars) this.temporaryStars = [];
        var star = new Hatena.Star.Star({
            color: 'temp',
            name: '',
            entry: this,
            container: this.star_container
        }).asElement();
        this.temporaryStars.push(star);
        this.star_container.appendChild(star);
    },
    removeTemporaryStar: function() {
        if (this.temporaryStars) {
            var star = this.temporaryStars.shift();
            if (star) this.star_container.removeChild(star);
            return star;
        }
        return null;
    },
    addStar: function(args) {
        var star = new Hatena.Star.Star({
            color: args.color,
            name: args.name,
            quote: args.quote,
            entry: this,
            container: this.star_container
        });
        this.stars.push(star);
        if (this.temporaryStars && this.temporaryStars.length) {
            this.star_container.insertBefore(star.asElement(), this.temporaryStars[0]);
        } else {
            this.star_container.appendChild(star.asElement());
        }
        this.constructor.dispatchEvent('starAdded', this);
    },
    addComment: function(com) {
        if (!this.comments) this.comments = [];
        if (this.comments.length == 0) {
            this.commentButton.activate();
        }
        this.comments.push(com);
    },
    showCommentCount: function() {
        this.comment_container.innerHTML += this.comments.length;
    }
});
Ten.EventDispatcher.implementEventDispatcher(Hatena.Star.Entry);

/* Hatena.Star.Button */
Hatena.Star.Button = new Ten.Class({
    createButton: function(args) {
        var img = document.createElement('img');
        for (var attr in args) {
            img.setAttribute(attr, args[attr]);
        }
        var s = img.style;
        s.cursor = 'pointer';
        s.margin = '0 3px';
        s.padding = '0';
        s.border = 'none';
        s.verticalAlign = 'middle';
        return img;
    },
    getImgSrc: function(c,container) {
        var sel = c.ImgSrcSelector;
        if (container) {
            var cname = sel.replace(/\./,'');
            var span = new Ten.Element('span',{
                className: cname
            });
            container.appendChild(span);
            var bgimage = Ten.Style.getElementStyle(span,'backgroundImage');
            container.removeChild(span);
            if (bgimage) {
                var url = Ten.Style.scrapeURL(bgimage);
                if (url) return url;
            }
        }
        if (sel) {
            var prop = Ten.Style.getGlobalStyle(sel,'backgroundImage');
            if (prop) {
                var url = Ten.Style.scrapeURL(prop);
                if (url) return url;
            }
        }
        return c.ImgSrc;
    }
});

/* Hatena.Star.AddButton */
Hatena.Star.AddButton = new Ten.Class({
    base: [Hatena.Star.Button],
    initialize: function(entry,container) {
        this.entry = entry;
        this.lastPosition = null;
        this.selectedText = null;
        this.showSelectedColorTimerId = null;
        this.hideSelectedColorTimerId = null;
        var src = Hatena.Star.Button.getImgSrc(this.constructor,container);
        var img = this.constructor.createButton({
            src: src,
            tabIndex: 0,
            alt: 'Add Star',
            title: 'Add Star'
        });
        if (!img.className) {
            img.className = 'hatena-star-add-button';
        }
        this.img = img;
        this.setupObservers();
        return img;
    },
    ImgSrcSelector: '.hatena-star-add-button-image',
    ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/add.gif',
    AddStarPath: 'star.add.json'
},{
    setupObservers: function () {
        new Ten.Observer(this.img,'onclick',this,'addStar');
        new Ten.Observer(this.img,'onkeyup',this,'handleKeyUp');
        new Ten.Observer(this.img,'onmouseover',this,'copySelectedText');
        if ( Hatena.Star.Config.isColorPalletAvailable ) {
            new Ten.Observer(this.img,'onclick',this,'hideColorPallet');
            new Ten.Observer(this.img,'onmouseover',this,'showColorPalletDelay');
//          new Ten.Observer(this.img,'onmouseover',this,'showSelectedColor');
//          new Ten.Observer(this.img,'onmouseout',this,'hideSelectedColor');
            new Ten.Observer(this.img,'onmouseout',this,'clearSelectedColorTimer');
        }
    },
    handleKeyUp: function(e) {
        if (!e.isKey('enter')) return;
        this.addStar(e);
    },
    clearSelectedColorTimer : function() {
        try{ clearTimeout(this.showSelectedColorTimerId); }catch(e){};
        try{ clearTimeout(this.hideSelectedColorTimerId); }catch(e){};
    },
    showSelectedColor : function(e) {
        var self = this;
        this.clearSelectedColorTimer();
        this.showSelectedColorTimerId = setTimeout(function(){
            //if (!self.pallet || (self.pallet && self.pallet.isColorPallet()) ) self._showSelectedColor();
            self._showSelectedColor();
        },300);
    },
    _showSelectedColor : function(e) {
        if (this.pallet) {
        } else {
            this.pallet = new Hatena.Star.Pallet();
        }
        if (this.pallet.isNowLoading) return;
        var pos = Ten.Geometry.getElementPosition(this.img);
        if (Ten.Browser.isFirefox || Ten.Browser.isOpera) {
            pos.y += 15;
            pos.x += 2;
        } else {
            pos.y += 13;
        }
        this.pallet.showSelectedColor(pos, this);
    },
    hideColorPallet : function(e) {
        try {
            this.pallet.hide();
        } catch(e) {}
    },
    hideSelectedColor : function(e) {
        var self = this;
        this.clearSelectedColorTimer();
        this.hideSelectedColorTimerId = setTimeout(function(){
            if (self.pallet.isSelectedColor) {
                //if (!self.pallet || (self.pallet && self.pallet.isSelectedColor()) ) self._showSelectedColor();
                self.pallet.hide();
            }
        },2000);
    },
    showColorPalletDelay : function(e) {
        var self = this;
        this.clearSelectedColorTimer();
        this.showSelectedColorTimerId = setTimeout(function(){
            //if (!self.pallet || (self.pallet && self.pallet.isColorPallet()) ) self._showSelectedColor();
            self.showColorPallet();
        },800);
    },
    showColorPallet : function(e) {
        this.clearSelectedColorTimer();
        if (!this.pallet) this.pallet = new Hatena.Star.Pallet();
        var pos = Ten.Geometry.getElementPosition(this.img);
        if (Ten.Browser.isFirefox || Ten.Browser.isOpera) {
            pos.y += 15;
            pos.x += 2;
        } else {
            pos.y += 13;
        }
        this.pallet.showPallet(pos, this);
    },
    copySelectedText: function(e) {
        try {
        this.selectedText = Ten.DOM.getSelectedText().substr(0,200);
        } catch (e) {  }
    },
    addStar: function(e) {
        this.clearSelectedColorTimer();
        this.color = (this.color) ? this.color : 'yellow';
        this.entry.addTemporaryStar({color: this.color});
        this.lastPosition = e.mousePosition();
        var quote = this.selectedText || '';
        var uri = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + this.constructor.AddStarPath + '?uri=' + encodeURIComponent(this.entry.uri) +
            '&title=' + encodeURIComponent(this.entry.title) +
            '&quote=' + encodeURIComponent(quote) +
            '&location=' + encodeURIComponent(document.location.href);
        if (Hatena.Star.Token) {
            uri += '&token=' + Hatena.Star.Token;
        }

        if (Hatena.Visitor) {
            if (Hatena.Visitor.RKS) {
                Hatena.Star.User.RKS.ready(Hatena.Visitor.RKS);
            }
            if (Hatena.Visitor.sessionParams) {
                var params = Hatena.Visitor.sessionParams;
                for (var key in params) {
                    uri += '&' + key + '=' + encodeURIComponent(params[key]);
                }
            }
        }

        var self = this;
        Hatena.Star.User.RKS.required(function (rks) {
            uri += '&rks=' + rks;
            new Ten.JSONP(uri, self, 'receiveResult');
        });
    },
    receiveResult: function(args) {
        this.entry.removeTemporaryStar();
        var name = args ? args.name : null;
        var color = args ? args.color : '';
        var pos = this.lastPosition;
        pos = (pos) ? pos : Ten.Geometry.getElementPosition(this.img);
        pos.x -= 10;
        pos.y += 25;
        if (name) {
            this.entry.addStar({
                color: color,
                name: name,
                quote: args.quote
            });
            //alert('Succeeded in Adding Star ' + args);
        } else if (args.is_guest && args.html) {
            var win = new Hatena.LoginWindow();
            win.addLoginForm(args.html);
            win.show(pos);
        } else if (args.errors) {
            var scroll = Ten.Geometry.getScroll();
            var scr = new Hatena.Star.AlertScreen();
            var alert = args.errors[0];
            scr.showAlert(alert, pos);
        }
    }
});

/* Hatena.Star.Pallet */
Hatena.Star.Pallet = new Ten.Class({
    base: [Ten.SubWindow],
    style: {
        padding: '0px',
        textAlign: 'center',
        border: '0px'
    },
    containerStyle: {
        textAlign: 'left',
        margin: 0,
        padding: 0
    },
    handleStyle: null,
    showScreen: false,
    closeButton: null,
    draggable: false,
    SELECTED_COLOR_ELEMENT_ID: 'hatena-star-selected-color',
    PALLET_ELEMENT_ID: 'hatena-star-color-pallet',
    PALLET_PATH: 'colorpalette',
    PALLET_STYLE: 'width:16px;height:51px;overflow:hidden;'
},{
    isSelectedColor : function() {
        return (this.container && this.container.getElementById && this.container.getElementById(Hatena.Star.Pallet.SELECTED_COLOR_ELEMENT_ID)) ? true : false;
    },
    isColorPallet : function() {
        return (this.container && this.container.getElenentById && this.container.getElementById(Hatena.Star.Pallet.PALLET_ELEMENT_ID)) ? true : false;
    },
    showSelectedColor: function(pos, addButton) {
        this.hide();
        this.container.innerHTML = '';
        if (addButton) this.addButton = addButton;
        if (pos) this.selected_color_pos = pos;
        var iframeStyle;
        if (Ten.Browser.isIE) iframeStyle = "width:16px;height:5px;border:1px solid #bbbbbb;";
        else iframeStyle = "width:14px;height:3px;border:1px solid #bbbbbb;";
        this.container.innerHTML = '<iframe id="' + Hatena.Star.Pallet.SELECTED_COLOR_ELEMENT_ID + '" src="' + 
        Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'colorpalette.selected_color?uri=' + encodeURIComponent(this.addButton.entry.uri) +
            '" frameborder="0" border="0" scrolling="no" style="' + iframeStyle + 'position:absolute;margin:0;padding:0;overflow:hidden;"/>';
        var clickhandlerStyle = {
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "16px",
            height: "5px",
            margin: "0",
            padding: "0",
            display: "block",
            cursor: "pointer"
        }; 
        var E = Ten.Element;
        var div = E('div',{
                title : 'select color',
                alt   : 'select color',
                style : clickhandlerStyle
            });
        this.container.appendChild(div);
        this.selectedColor =this.container.childNodes[0];
        this.isNowLoading = true;
        new Ten.Observer(this.selectedColor,'onload',this , 'showSelectedColorDelay');
        new Ten.Observer(this.container.childNodes[1],'onclick',this.addButton,'showColorPallet');
        //this.show(this.selected_color_pos);
    },
    showSelectedColorDelay: function() {
        this.show(this.selected_color_pos);
        this.isNowLoading = false;
        this.screen.style.display = 'none';
    },
    getPalletFrameURL: function () {
        return Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + this.constructor.PALLET_PATH + '?uri=' + encodeURIComponent(this.addButton.entry.uri) + '&location=' + encodeURIComponent(document.location.href);
    },
    showPallet: function(pos, addButton) {
        this.hide();
        this.container.innerHTML = '';
        if (addButton) this.addButton = addButton;
        if (pos) this.pallet_pos = pos;
        this.addButton.clearSelectedColorTimer();
        this.container.innerHTML = '<iframe id="' + Hatena.Star.Pallet.PALLET_ELEMENT_ID + '" src="' + this.getPalletFrameURL() + '" frameborder="0" border="0" scrolling="no" style="' + this.constructor.PALLET_STYLE +'"/>';
        this.pallet =this.container.childNodes[0];
        this.isNowLoading = true;
        this._pallet_onloaded = 0;
        new Ten.Observer(this.pallet,'onload',this , 'observerSelectColor');
//        new Ten.Observer(this.pallet,'onmouseout',this , 'hidePallet');
//        this.show(this.pallet_pos);
    },
    hidePallet: function() {
        var self = this;
        setTimeout(function() {
            if( self.isColorPallet) self.showSelectedColor();
        },2000);
    },
    selectColor: function(e){
        this.addButton.color = e.target.className.split('-')[2];
        this.showSelectedColor();
//        this.hide();
    },
    observerSelectedColor: function(){
        this.show(this.pallet_pos);
    },
    observerSelectColor: function(e){
        this._pallet_onloaded = (this._pallet_onloaded) ? this._pallet_onloaded : 0;
        this._pallet_onloaded ++;
        if (this._pallet_onloaded == 1){
            this.show(this.pallet_pos);
            this.isNowLoading = false;
        } else if (this._pallet_onloaded > 1) {
            this._pallet_onloaded = 0;
            this.hide();
            this.addButton.addStar(e);
            this._pallet_onloaded = 0;
//            this.hide();
//            this.showSelectedColor();
//            this.isNowLoading = true;
//            this.addButton.hideSelectedColor();
        }
    }
});

/* Hatena.Star.AddButton.SmartPhone */
Hatena.Star.AddButton.SmartPhone = new Ten.Class({
    base: [Hatena.Star.AddButton],
    AddStarPath: 'star.add_multi.json',
    createButton: function (args) {
        var a = document.createElement('a');
        var img = this.SUPER.createButton(args);
        img.className = 'hatena-star-add-button';
        a.className = 'hatena-star-add-button-link-smartphone';
        a.href = 'javascript:void(0)';
        a.appendChild(img);
        return a;
    }
}, {
    setupObservers: function () {
        if ( Hatena.Star.Config.isColorPalletAvailable ) {
            new Ten.Observer(this.img, 'onclick', this, 'showColorPallet');
            //new Ten.Observer(this.img, 'onclick', this, 'hideColorPallet');
        }
    },
    receiveResult: function (args) {
        if (args.silent_error) {
            this.entry.removeTemporaryStar();
            return;
        }

        if (args.stars instanceof Array) {
            this.entry.removeTemporaryStar();
            var stars = args.stars;
            for (var i = 0, len = stars.length; i < len; i++) {
                var star = stars[i];
                for (var j = 0; j < (star.count || 1); j++) {
                    this.entry.addStar({
                        color: star.color,
                        name:  star.name,
                        quote: star.quote
                    });
                }
            }
        } else {
            this.constructor.SUPER.prototype.receiveResult.apply(this, arguments);
        }
    },
    showColorPallet: function (e) {
        this.clearSelectedColorTimer();

        if (!this.pallet) {
            this.pallet = new Hatena.Star.Pallet.SmartPhone();
        }

        var pos = Ten.Geometry.getElementPosition(this.img);
        pos.x = Ten.Browser.isDSi ? 5 : 15;
        pos.y += 18;
        this.pallet.showPallet(pos, this);
        this.pallet.show(Hatena.Star.UseAnimation ? { x: 0, y: 0 } : pos);
    },
    getPalletFrameURL: function () {
        return Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + this.constructor.PALLET_PATH + '?uri=' + encodeURIComponent(this.addButton.entry.uri) + '&location=' + encodeURIComponent(document.location.href) + '&colorscheme=' + this.constructor.getColorScheme();
    }
});

/* Hatena.Star.Pallet.SmartPhone */
Hatena.Star.Pallet.SmartPhone_BASE_WIDTH = Ten.Browser.isDSi ? 230 : 45 * 6 + 5 * 2;
Hatena.Star.Pallet.SmartPhone = new Ten.Class({
    base: [Hatena.Star.Pallet],
    PALLET_PATH: 'colorpalette.smartphone',
    PALLET_STYLE: 'top: 0px; left: 0px; width:100px; height:80px; overflow:hidden;' + (!Ten.Browser.isDSi ? 'background:transparent;' : ''),
    closeButton: null,
    style: {
        padding: '0px',
        textAlign: 'center',
        border: '0px',
        background: (!Ten.Browser.isDSi ? 'transparent' : '')
    },
    containerStyle: {
        color: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('color') },
        textAlign: 'left',
        margin: 0,
        padding: 0,
        width: Hatena.Star.Pallet.SmartPhone_BASE_WIDTH + 'px',
        height: '125px',
        background: (!Ten.Browser.isDSi ? 'transparent' : '')
    },
    backgroundContainerStyle: {
        margin: 0,
        padding: 0,
        width: Hatena.Star.Pallet.SmartPhone_BASE_WIDTH + 'px',
        height: '125px',
        background: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('backgroundContainerBackground') },
        border: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('backgroundContainerBorder') },
        borderRadius: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('backgroundContainerBorderRadius') },
        MozBorderRadius: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('backgroundContainerBorderRadius') },
        WebkitBorderRadius: function () { return Hatena.Star.Pallet.SmartPhone.getColorSchemeItem('backgroundContainerBorderRadius') },
        position: 'absolute',
        display: 'inline',
        zIndex: 10000
    },
    closeIframeStyle: {
        position: 'absolute',
        zIndex: 5,
        width: '19px',
        height: '19px',
        background: 'rgba(0, 0, 0, 0)',
        border: '0px'
    },
    closeButtonStyle: {
        position: 'absolute',
        margin: 0,
        padding: 0,
        top: '0px',
        left: '0px',
        cursor: 'pointer'
    },

    // Color schems
    // Hatena.Star.Pallet.SmartPhone.ColorScheme = 'dark';
    COLOR_SCHEME_DEFINITIONS: {
        dark: {
            backgroundContainerBackground: (!Ten.Browser.isDSi ? 'rgba(10, 10, 10, 0.7)' : '#505050'),
            color: 'white',
            closeButtonColor: 'white',
            closeButtonImagePadding: '0 3px 0 0',
            closeButtonTop: '8px',
            closeButtonRight: '10px',
            getCloseButtonImage: function () { return Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/close_wh.png' }
        },
        light: {
            backgroundContainerBackground: '#FFF',
            backgroundContainerBorder: '1px solid #BBB',
            backgroundContainerBorderRadius: '6px',
            color: 'black',
            closeButtonColor: 'rgb(187,187,187)',
            closeButtonImagePadding: '0 1px 3px 0',
            closeButtonTop: '5px',
            closeButtonRight: (Ten.Browser.isDSi ? '5px' : '15px'),
            getCloseButtonImage: function () { return Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/close.gif' }
        }
    },
    DEFAULT_COLOR_SCHEME: 'light',
    getColorScheme: function () {
        return this.ColorScheme || this.DEFAULT_COLOR_SCHEME;
    },
    getColorSchemeItem: function (name) {
        var schemeName = this.getColorScheme();
        var scheme = this.COLOR_SCHEME_DEFINITIONS[schemeName] || this.COLOR_SCHEME_DEFINITIONS[this.DEFAULT_COLOR_SCHEME];
        return scheme[name];
    }
}, {
    showPallet: function (pos, addButton) {
        if (Hatena.Star.UseAnimation) {
            this.container.style.width = Ten.Geometry.getDocumentSize().w + 'px';
            this.container.style.height = Ten.Geometry.getDocumentSize().h + 'px';
        }

        this.hide();
        this.container.innerHTML = '';
        if (addButton) this.addButton = addButton;
        if (pos) this.pallet_pos = pos;
        this.addButton.clearSelectedColorTimer();
        this.container.innerHTML =
            '<div id="hatena-star-pallet-container">' + 
                '<div id="touch-instruction" class="message">' + Hatena.Star.Text.colorstar_for_smartphone + '</div>' +
                '<div id="sending-message" class="message" style="display: none">' + Hatena.Star.Text.sending + '</div>' +
                '<div class="pallet-container">' +
                    '<div class="pallet">' +
                        '<a href="#"><img src="' + Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + '/images/spacer.gif" id="hatena-star-yellow" class="star yellow post" alt="Add Yellow Star" title="Add Yellow Star" /></a>' +
                        '<div class="star"><span class="star yellow unlimited">' + Hatena.Star.Text.unlimited + '</span></div>' +
                    '</div>' +
                    '<div class="iframe-loading-message">' + Hatena.Star.Text.loading + '</div>' +
                    '<iframe id="' + Hatena.Star.Pallet.PALLET_ELEMENT_ID + '" src="' + this.getPalletFrameURL() + '" frameborder="0" border="0" scrolling="no"></iframe>' +
                '</div>' + 
                '<a href="' + Hatena.Star.PortalURL.replace(/http/, 'https') + '/shop/star?location=' + encodeURIComponent(location.href) + '" id="buy" target="' + (Ten.Browser.isDSi ? '_top' : '_blank' ) + '"><img src="' + Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/buy_star_cart_purple.gif" class="cart">' + Hatena.Star.Text.for_colorstar_shop + '</a>' +
            '</div>' + 
            '<style type="text/css">' +
                '#hatena-star-pallet-container {' +
                    'color: ' + (Hatena.Star.Pallet.SmartPhone.ColorScheme == 'dark' ? 'white' : 'black') + ';' +
                '}' +
                '#hatena-star-pallet-container .message {' +
                    'padding: 7px 10px;' +
                    'font-size: 14px;' +
                '}' +
                '#hatena-star-pallet-container .pallet-container {' +
                    'position: relative;' + 
                    'margin: 0 5px 0 45px;' + 
                    'height: 65px;' +
                    (Ten.Browser.isDSi ? 'margin: 0 10px 0 10px;' : '') +
                '}' +
                '#hatena-star-pallet-container .pallet {' +
                    'position: absolute;' +
                    'top: 0;' +
                    'left: 0;' +
                    'width: 39px;' +
                    'height: 60px;' +
                    'text-align: center;' +
                    'color: #FECD69;' + 
                    'font-weight: bold;' + 
                '}' +
                '#hatena-star-pallet-container #hatena-star-yellow {' +
                    'background: url(' + Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + (Hatena.Star.Pallet.SmartPhone.ColorScheme == 'dark' ? '/images/add_star_for_smartphone_bk.gif' : '/images/add_star_for_smartphone_wh.gif') + ') 0 0;' +
                    'width: 39px;' +
                    'height: 39px;' +
                    'border: 0;' +
                '}' +
                '#hatena-star-pallet-container a.active #hatena-star-yellow {' +
                    'background: url(' + Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + (Hatena.Star.Pallet.SmartPhone.ColorScheme == 'dark' ? '/images/add_star_for_smartphone_bk.gif' : '/images/add_star_for_smartphone_wh.gif') + ') 0 39px;' +
                    'width: 39px;' +
                    'height: 39px;' +
                    'border: 0;' +
                '}' +
                '#hatena-star-pallet-container iframe ,' +
                '#hatena-star-pallet-container .iframe-loading-message {' +
                    'position: absolute;' +
                    'top: 0;' +
                    'left: 42px;' +
                    'width: 173px;' +
                    'height: 65px;' +
                '}' +
                '#hatena-star-pallet-container .iframe-loading-message {' +
                    'text-align: left;' +
                    'padding: 12px 40px 12px 40px;' +
                '}' +
                '#hatena-star-pallet-container #buy {' +
                    'text-align: right;' +
                    'float: right;' +
                    'color: #ff7000;' +
                    'text-decoration:none;' +
                    'margin-top: 5px;' +
                    'margin-right: 12px;' +
                '}' +
            '</style>'
        ;
        this.pallet =this.container.getElementsByTagName('iframe')[0];
        this.pallet.style.visibility = 'hidden';
        this.isNowLoading = true;
        this._pallet_onloaded = 0;
        this.loadingMessage = Ten.querySelector('div.iframe-loading-message', this.container);

        var star_yellow = document.getElementById('hatena-star-yellow');
        new Ten.Observer(star_yellow, 'onclick', function (e) {
            e.stop();
            Hatena.Star.AddButton.SmartPhone.AddStarPath = 'star.add.json';
            addButton.addStar(e);
            Hatena.Star.AddButton.SmartPhone.AddStarPath = 'star.add_multi.json';
        });
        if (Ten.Browser.isDSi) {
            var img = star_yellow;
            new Ten.Observer(star_yellow, 'onmousedown', function (e) {
                if (img._activeTimer) {
                    clearTimeout(img._activeTimer);
                }
                img.parentNode.className = 'active';
            });
            new Ten.Observer(star_yellow, 'onmouseup', function (e) {
                img._activeTimer = setTimeout(
                    function () { img.parentNode.className = '' },
                    100
                );
            });
        }

        new Ten.Observer(this.pallet, 'onload', this, 'observerSelectColor');

        var self = this;
        window.addEventListener("message", function (e) { if (e.data == 'sending') self.sending() }, false);

        this.showBackgroundContainer(this.pallet_pos);
        this.showCloseButton();
        if (Ten.Browser.isAndroid) {
            var self = this;
//            var listener = function (e) {
//                e.preventDefault();
//                e.stopPropagation();
//                self.hide();
//                document.body.removeEventListener('click', listener, true);
//            };
//            document.body.addEventListener('click', listener, true);
        } else {
            this.showScreen();
        }

        if (Ten.Browser.isAndroid) {
            var self = this;
            setTimeout(function () { try {

            // var time = new Date().getTime();

            var xs = self.pallet_pos.x - document.body.scrollLeft;
            var ys = self.pallet_pos.y - document.body.scrollTop;
            var xe = xs + (self.container.offsetWidth  || 500);
            var ye = ys + (self.container.offsetHeight || 300);

            // alert([xs, ys, xe, ye, self.container.offsetWidth, self.container.offsetHeight, document.elementFromPoint(0, 0)]);

            self._checkedElements = [];

            self.backgroundContainer.style.display = 'none';
            self.container.style.display = 'none';
            for (var y = ys; y < ye; y += 5) {
                for (var x = xs; x < xe; x += 5) {
                    var e = document.elementFromPoint(x, y);
                    if (!e) continue;
                    if (e._checked) continue;

                    if (e.nodeName == 'INPUT' || e.nodeName == 'TEXTAREA') {
                        e._orig_disabled = e.disabled;
                        e.disabled = true;
                    } else
                    if ((a = ancestor(e, 'A', 3))) {
                        if (a._checked) continue; a._checked = true; self._checkedElements.push(a);
                        a._orig_style = a.getAttribute('style');
                        a.setAttribute('style', document.defaultView.getComputedStyle(a, "").cssText);
                        // a.style.outline = "1px solid red";

                        a.setAttribute('xhref', a.getAttribute('href'));
                        a.removeAttribute('href');
                    }

                    e._checked = true; self._checkedElements.push(e);
                }
            }
            self.backgroundContainer.style.display = 'block';
            self.container.style.display = 'block';

            function ancestor(e, name, deep) {
                if (e.nodeName == name) return e;
                if (e.parentNode) {
                    if (deep < 0) return null;
                    return ancestor(e.parentNode, name, deep - 1);
                } else {
                    return null;
                }
            }

            // console.log((new Date()).getTime() - time + 'msec');
            } catch (e) { alert(e) } }, 10);
        }

    },
    hide: function (e) {
        if (e && e.stop) {
            e.stop();
        }

        if (Ten.Browser.isAndroid) {
            try {
            var links  = document.querySelectorAll('a[xhref]');
            for (var i = 0, len = links.length; i < len; i++) {
                var a = links[i];
                a.setAttribute('href', a.getAttribute('xhref'));
                a.removeAttribute('xhref');

                a.setAttribute('style', a._orig_style);
            }
            var inputs = document.querySelectorAll('input, textarea');
            for (var i = 0, len = inputs.length; i < len; i++) {
                inputs[i].disabled = inputs[i]._orig_disabled;
            }

            if (this._checkedElements) for (var i = 0, len = this._checkedElements.length; i < len; i++) {
                this._checkedElements[i]._checked = false;
            }
            } catch (e) { alert(e) }
        }


        this.hideBackgroundContainer();
        this.hideCloseIframe();
        this.constructor.SUPER.prototype.hide.apply(this, arguments);

    },
    showScreen: function() {
        if (!this.screen) {
            var c = this.constructor;
            var screen = document.createElement('div');
            Ten.Style.applyStyle(screen, Ten.SubWindow._baseScreenStyle);
            Ten.Style.applyStyle(screen, c.screenStyle);
            document.body.appendChild(screen);
            screen.style.position = 'fixed';
            screen.style.height = document.body.scrollHeight + 'px';
            this.screen = screen;
            new Ten.Observer(screen, 'click', this, 'hide');
        } else {
            Ten.DOM.show(this.screen);
        }
    },
    hideScreen: function () {
        if (this.screen) {
            Ten.DOM.hide(this.screen);
        }
    },
    showBackgroundContainer: function(pos) {
        if (!this.backgroundContainer) {
            var div = document.createElement('div');
            Ten.Style.applyStyle(div, this.constructor.backgroundContainerStyle);
            this.backgroundContainer = div;
            document.body.appendChild(div);
        }
        this.backgroundContainer.style.left = pos.x + 'px';
        this.backgroundContainer.style.top  = pos.y + 'px';
        Ten.DOM.show(this.backgroundContainer);
    },
    hideBackgroundContainer: function() {
        if (this.backgroundContainer) {
            Ten.DOM.hide(this.backgroundContainer);
        }
    },
    showCloseButton: function () {
        if (!this.closeButton) {
            var closeButton = Ten.Element(
                'a', { href: 'javascript:void(0)' },
                Ten.Element('img', { src: this.constructor.getColorSchemeItem('getCloseButtonImage')(), style: { verticalAlign: 'middle', padding: this.constructor.getColorSchemeItem('closeButtonImagePadding') } }),
                Hatena.Star.Text.close || 'Close'
            );
            new Ten.Observer(closeButton, 'onclick', this, 'hide');
            with (closeButton.style) {
                overflow      = 'hidden';
                position      = 'absolute';
                top           = this.constructor.getColorSchemeItem('closeButtonTop');
                right         = this.constructor.getColorSchemeItem('closeButtonRight');
                color         = this.constructor.getColorSchemeItem('closeButtonColor');
                verticalAlign = 'middle';
                lineHeight    = '19px';
                fontSize      = '12px';
            }
            this.window.appendChild(closeButton);
            this.closeButton = closeButton;
        }
    },
    showCloseIframe: function(pos) {
        if (!this.closeIframes) {
            var iframes = {  };
            var setupIframe = function(callback) {
                var iframe = document.createElement('iframe');
                document.body.appendChild(iframe);
                var doc = frames[frames.length-1].window.document;
                doc.open();
                doc.write('<h1>dummy</h1>');
                Ten.DOM.removeAllChildren(doc.body);
                if (callback) { callback(doc); };
                doc.close();
                return iframe;
            };
            var self = this;
            // var iframe = setupIframe(function(doc) {
            //     var btn = doc.createElement('img');
            //     btn.src = self.constructor.getColorSchemeItem('getCloseButtonImage')();
            //     btn.alt = 'close';
            //     //Ten.Style.applyStyle(btn, self.constructor.closeButtonStyle);
            //     btn.style.cursor = 'pointer';
            //     new Ten.Observer(doc.body, 'onclick', self, 'hide');
            //     doc.body.style.color = self.constructor.getColorSchemeItem('color');
            //     doc.body.appendChild(btn);
            //     doc.body.appendChild(
            //         document.createTextNode(Hatena.Star.Text.close || 'Close')
            //     );
            // });
            // iframes.button = iframe;
            this.showCloseButton();
            this.closeButton.style.right = Ten.Geometry.getWindowSize().w - (pos.x + Hatena.Star.Pallet.SmartPhone_BASE_WIDTH) + 'px';
            this.closeButton.style.top = pos.y + 12 + 'px';
            for(var i = 0;i < 4 && Hatena.Star.UseAnimation; i++) {
                iframes[i] = setupIframe(function(doc) {
                    new Ten.Observer(doc, 'onclick', self, 'hide');
                });
            }
            this.closeIframes = iframes;
        } else {
            var iframes = this.closeIframes;
        }
        var max = function(a, b) {
            return a > b ? a : b;
        };
        var docSize = {
            w: max(Ten.Geometry.getDocumentSize().w, Ten.Geometry.getWindowSize().w),
            h: max(Ten.Geometry.getDocumentSize().h, Ten.Geometry.getWindowSize().h)
        };
        var styles = [{
            // k
            top: '0px',
            left: '0px',
            width: docSize.w + 'px',
            height: pos.y + 'px'
        },{
            // l
            top: '0px',
            left: pos.x + Hatena.Star.Pallet.SmartPhone_BASE_WIDTH + 'px',
            width: docSize.w - Hatena.Star.Pallet.SmartPhone_BASE_WIDTH - pos.x + 'px',
            height: docSize.h + 'px'
        },{
            // h
            top: '0px',
            left: '0px',
            width: (Ten.Browser.isDSi ? 5 : 15 ) + 'px',
            height: docSize.h + 'px'
        },{
            // j
            top: pos.y + 140 + 'px',
            left: '0px',
            width: docSize.w + 'px',
            height: docSize.h - pos.y - 140 + 'px'
        }];
        for (var key in iframes) if (iframes.hasOwnProperty(key)) {
            var iframe = iframes[key];
            if (key == 'button') {
                Ten.Style.applyStyle(iframe, this.constructor.closeIframeStyle);
                Ten.Style.applyStyle(iframe, {
                    left: pos.x + Hatena.Star.Pallet.SmartPhone_BASE_WIDTH - 19 - 12 + 'px',
                    top: pos.y + 12 + 'px'
                });
            } else {
                Ten.Style.applyStyle(iframe, styles[key]);
                Ten.Style.applyStyle(iframe, {
                    position: 'absolute',
                    margin: '0px',
                    padding: '0px',
                    border: '0px',
                    zIndex: 100
                });
            }
            Ten.DOM.show(iframe);
        }
        this.closeIframes = iframes;
    },
    hideCloseIframe: function() {
        if (this.closeIframes) {
            var iframes = this.closeIframes;
            for (key in iframes) if (iframes.hasOwnProperty(key)) {
                var iframe = iframes[key];
                Ten.DOM.hide(iframe);
            }
        }
    },
    getPalletFrameURL: function () {
        var pos = this.pallet_pos;
        return this.constructor.SUPER.prototype.getPalletFrameURL.apply(this, arguments) + (Hatena.Star.UseAnimation ? '&left=' + pos.x + '&top=' + pos.y + '&anime=1' : '') + '&colorscheme=' + this.constructor.getColorScheme();
    },
    observerSelectColor: function (e) {
        this.pallet.style.visibility = 'visible';
        this.loadingMessage.style.display = 'none';
        this._pallet_onloaded = this._pallet_onloaded ? this._pallet_onloaded : 0;
        this._pallet_onloaded++;

        this.isNowLoading = false;
        if (this._pallet_onloaded > 1) {
            this.addButton.addStar(e);
        }

        Ten.DOM.show(document.getElementById('touch-instruction'));
        Ten.DOM.hide(document.getElementById('sending-message'));
    },
    sending : function () {
        Ten.DOM.hide(document.getElementById('touch-instruction'));
        Ten.DOM.show(document.getElementById('sending-message'));
    }
});

/* Hatena.Star.CommentButton */
Hatena.Star.CommentButton = new Ten.Class({
    base: [Hatena.Star.Button],
    initialize: function(entry,container) {
        this.entry = entry;
        this.lastPosition = null;
        this.container = container;
        var src = Hatena.Star.Button.getImgSrc(this.constructor,container);
        var img = Hatena.Star.Button.createButton({
            src: src,
            tabIndex: 0,
            alt: 'Comments',
            title: 'Comments'
        });
        img.className = 'hatena-star-comment-button';
        new Ten.Observer(img,'onclick',this,'showComments');
        new Ten.Observer(img,'onkeyup',this,'handleKeyUp');
        this.img = img;
        this.hide();
    },
    ImgSrcSelector: '.hatena-star-comment-button-image',
    ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/comment.gif'
}, {
    handleKeyUp: function(e) {
        if (!e.isKey('enter')) return;
        var pos = Ten.Geometry.getElementPosition(this.img);
        e.mousePosition = function() {return pos};
        this.showComments(e);
    },
    showComments: function(e) {
        if (!this.screen) this.screen = new Hatena.Star.CommentScreen();
        this.screen.bindEntry(this.entry);
        var pos = e.mousePosition();
        pos.y += 25;
        this.screen.showComments(this.entry, pos);
    },
    hide: function() {
        this.img.style.margin = '0';
        this.img.style.display = 'none';
    },
    show: function() {
        this.img.style.margin = '0 3px';
        this.img.style.display = 'inline';
    },
    activate: function() {
        this.show();
        this.constructor = Hatena.Star.CommentButtonActive;
        this.img.src = Hatena.Star.Button.getImgSrc(this.constructor,this.container);
        Ten.DOM.addClassName(this.container, 'hatena-star-comment-active');
    }
});

/* Hatena.Star.CommentButtonActive */
Hatena.Star.CommentButtonActive = new Ten.Class({
    base: [Hatena.Star.CommentButton],
    ImgSrcSelector: '.hatena-star-comment-button-image-active',
    ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/comment_active.gif'
});

/* Hatena.Star.Star */
Hatena.Star.Star = new Ten.Class({
    initialize: function(args) {
        if (args.img) {
            this.img = args.img;
            this.name = this.img.getAttribute('alt');
        } else {
            this.name = args.name;
            this.screen_name = args.screen_name || args.name;
            this.profile_icon = args.profile_icon;
            this.container = args.container;
            this.container._starColor = args.color;
            this.color = args.color;
            this.generateImg();
        }
        this.quote = args.quote;
        this.entry = args.entry;
        this.setImgObservers();

        this.user = new Hatena.Star.User(this.name);
        if (!this.screen_name || this.screen_name == this.name) {
            var self = this;
            Hatena.Star.User.withNickname(this.name, function (name) {
                self.screen_name = name;
            });
        }
        this.anchor = document.createElement('a');
        this.anchor.href = this.getAnchor();
        this.anchor.appendChild(this.img);

        this.count = args.count;

        if (this.quote && this.quote.length >= 3) {
            this.highlight = new Hatena.Star.Highlight(this.quote);
        }
    },
    gotImage: {},
    getImage: function(container) {
        var color = this.ColorPallet[container._starColor];
        color = (color) ? color : this.ColorPallet['yellow'];
        if (!this.gotImage[color.ImgSrc]) {
            var img = document.createElement('img');
            img.src = Hatena.Star.Button.getImgSrc(color,container);
            img.setAttribute('tabIndex', 0);
            img.className = 'hatena-star-star';
            var s = img.style;
            s.padding = '0';
            s.border = 'none';
            this.gotImage[color.ImgSrc] = img;
        }
        return this.gotImage[color.ImgSrc].cloneNode(false);
    },
//    ImgSrcSelector: '.hatena-star-star-image',
//    ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star.gif',
    ColorPallet : {
        'yellow' : {
            ImgSrcSelector: '.hatena-star-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star.gif'
        },
        'green' : {
            ImgSrcSelector: '.hatena-star-green-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star-green.gif'
        },
        'red' : {
            ImgSrcSelector: '.hatena-star-red-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star-red.gif'
        },
        'blue' : {
            ImgSrcSelector: '.hatena-star-blue-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star-blue.gif'
        },
        'purple' : {
            ImgSrcSelector: '.hatena-star-purple-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star-purple.gif'
        },
        'temp' : {
            ImgSrcSelector: '.hatena-star-temp-star-image',
            ImgSrc: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/star-temp.gif'
        }
    }
},{
    generateImg: function () {
        var img = Hatena.Star.Star.getImage(this.container);
        img.alt = this.screen_name;
        img.title = '';
        if (this.color && this.color != 'yellow' && this.color != 'temp') {
            img.alt = img.alt + ' (' + this.color  + ')';
        }
        this.img = img;
    },
    setImgObservers: function () {
        new Ten.Observer(this.img,'onmouseover',this,'showName');
        new Ten.Observer(this.img,'onmouseout',this,'hideName');
        if ( Hatena.Star.Config.isStarDeletable ) {
            new Ten.Observer(this.img,'onmouseover',this,'setTimerStarDeletion');
            new Ten.Observer(this.img,'onmouseout',this,'clearTimerStarDeletion');
        }
    },
    asElement: function() {
        if (this.count && this.count > 1) {
            var c = document.createElement('span');
            c.className = 'hatena-star-inner-count';
            var style = Hatena.Star.InnerCount.getStyle();
            if (style) Ten.Style.applyStyle(c, style);
            c.innerHTML = this.count;
            var s = document.createElement('span');
            s.appendChild(this.anchor);
            s.appendChild(c);
            return s;
        } else {
            return this.anchor;
        }
    },
    setTimerStarDeletion: function(e) {
        var self = this;
        if (this.deleteTimer) return;
        if (!this.name || !this.entry) return;
        if (!Hatena.Visitor) return;
        if (!Hatena.Visitor.RKS) return;
        this.deleteTimer = setTimeout(function() {
            self.deleteTimer = null;
            var uri = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'star.deletable.json?name='
                + self.name + '&uri=' + encodeURIComponent(self.entry.uri);
            if (self.color) uri += '&color=' + self.color;
            if (self.quote) {
                uri += '&quote=' + encodeURIComponent(self.quote);
            }
            new Ten.JSONP(uri, self, 'confirmDeletable');
        }, 4000);
    },
    clearTimerStarDeletion: function() {
        if (this.deleteTimer) {
            clearTimeout(this.deleteTimer);
            this.deleteTimer = null;
        }
    },
    confirmDeletable: function(res) {
        if (res.result && res.confirm_html) {
          var pos = Ten.Geometry.getElementPosition(this.anchor);
          var scr = new Hatena.Star.DeleteConfirmScreen();
          scr.showConfirm(res.confirm_html, this, pos);
        } else if (res.result && res.message && confirm(res.message)) {
            this.deleteStar();
        }
    },
    deleteStar: function() {
        var uri = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'star.delete.json?name='
            + this.name + '&uri=' + encodeURIComponent(this.entry.uri)
            + '&rks=' + Hatena.Visitor.RKS;
        if (this.color) uri += '&color=' + this.color;
        if (this.quote) {
            uri += '&quote=' + encodeURIComponent(this.quote);
        }
        new Ten.JSONP(uri, this, 'receiveDeleteResult');
    },
    receiveDeleteResult: function(res) {
        if (res && res.result) {
            this.anchor.style.display = 'none';
        }
    },
    showName: function(e) {
        if (!this.screen) this.screen = new Hatena.Star.NameScreen();
        var pos = e.mousePosition();
        pos.x += 10;
        pos.y += 25;
        if (this.highlight) this.highlight.show();
        this.screen.showName(this.screen_name, this.quote, pos, this.profile_icon, this.name);
    },
    hideName: function() {
        if (!this.screen) return;
        if (this.highlight) this.highlight.hide();
        this.screen.hide();
    },
    getAnchor: function () {
        if (Hatena.Star.isTouchUA) {
            if (Hatena.Star.getSmartPhoneDetailURL) {
                var url = Hatena.Star.getSmartPhoneDetailURL(this);
                if (url) {
                    return url;
                }
            }
            return Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + '/mobile/entry?uri=' + encodeURIComponent(this.entry.uri);
        } else {
            return this.user.userPage();
        }
    }
});

/* Hatena.Star.Highlight */
Hatena.Star.Highlight = new Ten.Class({
    base: [Ten.Highlight],
    ClassName: 'hatena-star-highlight'
});

/* from Hatena::Bookmark */
/* thx id:amachang / id:Yuichirou / id:os0x */
Hatena.Star.Highlight._show = Hatena.Star.Highlight.show;
Hatena.Star.Highlight.show = function() {
    setTimeout(function() {
        if (Hatena.Star.Highlight.asyncMakeTextNode) 
            Hatena.Star.Highlight.asyncMakeTextNode();
        Hatena.Star.Highlight._show();
    }, 10);
};

Hatena.Star.Highlight._makeTextNodes = Hatena.Star.Highlight.makeTextNodes;
Hatena.Star.Highlight.makeTextNodes = function(c) {
    if (c.asyncMakeTextNode || c.textNodes || c.textNodePositions || c.documentText) return;
    if (Ten.Highlight.highlighted) Ten.Highlight.highlighted.hide();
    
    if (!c.loaded && !c.prototype._show) {
        c.prototype._show = c.prototype.show;
        c.prototype.show = function() {
            c.prototype.show = c.prototype._show;
            var _self = this;
            var exec = function() {
                if (c.asyncMakeTextNode) {
                    c.asyncMakeTextNode();
                }
                _self.show();
            };
            exec();
        }
    }
    c.asyncMakeTextNode = function() {
        var textNodes = c.textNodes = [];
        var textNodePositions = c.textNodePositions = [];

        var pos = 0; 

        if (Ten.Browser.isSupportsXPath) {
            var result = document.evaluate('descendant::text()', document.body, null, 7, null);

            for (var i = 0, len = result.snapshotLength; i < len ; i ++) {
                var node = result.snapshotItem(i);
                textNodes.push(node);
                textNodePositions.push(pos);
                pos += node.length;
            }

            c.documentText = document.body.textContent || document.body.innerText;

        } else {
            var isIE = Ten.Browser.isIE;
            var texts = [];

            var fn = function(node, parent) {
                if (isIE && parent && parent != node.parentNode) return;
                if (node.nodeType == 3) {
                    textNodes.push(node);
                    texts.push(node.nodeValue);
                    textNodePositions.push(pos);
                    pos += node.nodeValue.length;
                } else {
                    var childNodes = node.childNodes;
                    for (var i = 0, len = childNodes.length; i < len; ++i) {
                        fn(childNodes[i], node);
                    }
                }
            };
            fn(document.body);

            c.documentText = texts.join('');
        }
        c.loaded = true;
        c.asyncMakeTextNode = null;
    };
    return;
}

/* Hatena.Star.InnerCount */
Hatena.Star.InnerCount = new Ten.Class({
    initialize: function(count, e, color) {
        this.count = count;
        this.entry = e;
        this.color = (color) ? color : '';
        var c = document.createElement('span');
        c.className = Hatena.Star.InnerCount.className(this.color);
        c.setAttribute('tabIndex', 0);
        var style = Hatena.Star.InnerCount.getStyle(color);
        if (style) Ten.Style.applyStyle(c, style);
        c.style.cursor = 'pointer';
        c.innerHTML = count;
        new Ten.Observer(c,'onclick',this,'showInnerStars');
        new Ten.Observer(c,'onkeyup',this,'handleKeyUp');
        this.container = c;
    },
    selectorName: function(color) {
        color = (color) ? color : '';
        var base = '.hatena-star-inner-count';
        if (color) base += '-';
        return base + color;
    },
    getStyle: function(color) {
        color = (color) ? color : '';
        var c = Hatena.Star.InnerCount;
        if (Ten.Style.getGlobalRule(c.selectorName(color))) {
            return null;
        } else {
            color = (color) ? color : 'yellow';
            var fontColor = Hatena.Star.InnerCount.fontColor[color];
            if (fontColor) c.style.color = fontColor;
            return c.style;
        }
    },
    className: function(color){
        return Hatena.Star.InnerCount.selectorName(color).substr(1);
    },
    style: {
        fontWeight: 'bold',
        fontSize: '80%',
        fontFamily: '"arial", sans-serif',
        margin: '0 2px'
    },
    fontColor: {
        yellow: '#f4b128',
        green: '#8ed701',
        red: '#ea475c',
        purple: '#cd34e3',
        blue: '#57b1ff'
    }
},{
    asElement: function() {
        return this.container;
    },
    handleKeyUp: function(e) {
        if (!e.isKey('enter')) return;
        this.showInnerStars(e);
    },
    showInnerStars: function() {
        var url = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'entry.json?uri=' +
        encodeURIComponent(this.entry.uri);
        new Ten.JSONP(url, this, 'receiveStarEntry');
    },
    receiveStarEntry: function(res) {
        var se = res.entries[0];
        var e = this.entry;
        if (encodeURIComponent(se.uri) != encodeURIComponent(e.uri)) return;
        e.flushStars();
        e.bindStarEntry(se);
        e.addAddButton();
        e.showStars();
    }
});

/* Hatena.Star.Comment */
Hatena.Star.Comment = new Ten.Class({
    initialize: function(args) {
        this.name = args.name;
        this.body = args.body;
        this.id = args.id;
    }
},{
    asElement: function() {
        var div = new Ten.Element('div', {
            style: {
                margin: '0px 0',
                padding: '5px 0 5px 22px',
                lineHeight: '1.3',
                borderBottom: '1px solid #ddd'
            }
        });
        var ico = Hatena.Star.User.getProfileIcon(this.name);
        ico.style.marginLeft = '-22px';
        Hatena.Star.User.withNickname(this.name, function (name) {
            ico.title = name;
        });
        div.appendChild(ico);
        var span = document.createElement('span');
        span.style.fontSize = '90%';
        span.innerHTML = this.body;
        div.appendChild(span);
        if (this.deletable()) {
            new Hatena.Star.CommentDeleteButton(div, this);
        }
        return div;
    },
    deletable: function() {
        if (typeof(Hatena.Visitor) != 'undefined' &&
            typeof(Hatena.Visitor.name) != 'undefined' &&
            Hatena.Visitor.name == this.name) {
                return true;
            }
        return false;
    },
    deleteComment: function(callback) {
        if (!this.deletable()) return;
        if (!this.id) return;
        if (!Hatena.Visitor.RKS) return;
        var uri = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'comment.delete.json?comment_id=' + this.id
            + '&rks=' + Hatena.Visitor.RKS;
        new Ten.JSONP(uri, callback);
    }
});

/* Hatena.Star.CommentDeleteButton */
Hatena.Star.CommentDeleteButton = new Ten.Class({
    initialize: function(parent, comment) {
        this.parent = parent;
        this.comment = comment;
        this.button = new Ten.Element('img', {
            src: Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/delete2.gif',
            alt: 'Delete',
            title: 'Delete',
            style: {
                margin: '0 3px',
                verticalAlign: 'middle',
                cursor: 'pointer',
                display: 'none'
            }
        });
        new Ten.Observer(this.parent, 'onmouseover', this, 'showButton');
        new Ten.Observer(this.button, 'onclick', this, 'deleteComment');
        this.parent.appendChild(this.button);
    }
}, {
    showButton: function() {
        this.button.style.display = 'inline';
        if (!this.hideObserver) {
            this.hideObserver = new Ten.Observer(this.parent, 'onmouseout', this, 'hideButton');
        }
    },
    hideButton: function() {
        this.button.style.display = 'none';
    },
    deleteComment: function() {
        var self = this;
        this.comment.deleteComment(function(res) {
            if (res.result) self.parent.style.display = 'none';
        });
    }
});

/* Hatena.Star.NameScreen */
Hatena.Star.NameScreen = new Ten.Class({
    base: [Ten.SubWindow],
    style: {
        padding: '2px',
        textAlign: 'center'
    },
    containerStyle: {
        textAlign: 'left',
        margin: 0,
        padding: 0
    },
    quoteStyle: {
        margin: '.3em .2em',
        padding: '.5em 0 0 0',
        fontSize: '80%',
        borderTop: '1px solid #bbb',
        color: '#777'
    },
    handleStyle: null,
    showScreen: false,
    closeButton: null,
    draggable: false
},{
    showName: function(name, quote, pos, src, urlName) {
        this.container.innerHTML = '';
        this.container.appendChild(Hatena.Star.User.getProfileIcon(urlName || name, src));
        this.container.appendChild(document.createTextNode(name || urlName));
        if (quote) {
            var blockquote = document.createElement('blockquote');
            Ten.Style.applyStyle(blockquote, this.constructor.quoteStyle);
            blockquote.innerHTML = '&quot; ' + quote + ' &quot;';
            this.container.appendChild(blockquote);
        }
        this.show(pos);
    }
});

/* Hatena.LoginWindow */
Hatena.LoginWindow = new Ten.Class({
    base: [Ten.SubWindow],
    style: {
        padding: '2px',
        textAlign: 'left',
        borderRadius: '6px',
        MozBorderRadius: '6px'
    },
    handleStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundColor: '#f3f3f3',
        borderBottom: '1px solid #bbb',
        width: '100%',
        height: '30px',
        borderRadius: '6px 6px 0 0',
        MozBorderRadius: '6px 6px 0 0'
    }
},{
    addLoginForm: function(html) {
        this.container.innerHTML = html;
        var form = this.container.getElementsByTagName('form')[0];
        var input = new Ten.Element('input',{
            type: 'hidden',
            name: 'location',
            value: document.location.href
        });
        form.appendChild(input);
    },
    hide: function () {
        var script = document.createElement('script');
        script.src = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'js/HatenaStar.js';
        Hatena.Star = undefined;
        document.body.appendChild(script);
        Ten.SubWindow.prototype.hide.apply(this, arguments);
    }
});

/* Hatena.Star.AlertScreen */
Hatena.Star.AlertScreen = new Ten.Class({
    base: [Ten.SubWindow],
    style: {
        padding: '2px',
        textAlign: 'center',
        borderRadius: '6px',
        MozBorderRadius: '6px',
        width: '240px',
        height: '120px'
    },
    handleStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundColor: '#f3f3f3',
        borderBottom: '1px solid #bbb',
        width: '100%',
        height: '30px',
        borderRadius: '6px 6px 0 0',
        MozBorderRadius: '6px 6px 0 0'
    }
},{
    showAlert: function(msg, pos) {
        this.container.innerHTML = msg;
        var win = Ten.Geometry.getWindowSize();
        var scr = Ten.Geometry.getScroll();
        var w = parseInt(this.constructor.style.width) + 20;
        if (pos.x + w > scr.x + win.w) pos.x = win.w + scr.x - w;
        this.show(pos);
    }
});

/* Hatena.Star.DeleteConfirmScreen */
Hatena.Star.DeleteConfirmScreen = new Ten.Class({
    base: [Ten.SubWindow],
    style: {
        padding: '2px',
        textAlign: 'center',
        borderRadius: '6px',
        MozBorderRadius: '6px',
        width: '320px',
        height: '170px'
    },
    handleStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundColor: '#f3f3f3',
        borderBottom: '1px solid #bbb',
        width: '100%',
        height: '30px',
        borderRadius: '6px 6px 0 0',
        MozBorderRadius: '6px 6px 0 0'
    }
},{
  showConfirm: function(msg, star, pos) {
        this.container.innerHTML = msg;
        var win = Ten.Geometry.getWindowSize();
        var scr = Ten.Geometry.getScroll();
        var w = parseInt(this.constructor.style.width) + 20;
        if (pos.x + w > scr.x + win.w) pos.x = win.w + scr.x - w;
        this.show(pos);
    }

    // XXX star.receiveDeleteResult({result: 1})
});

/* Hatena.Star.CommentScreen */
Hatena.Star.CommentScreen = new Ten.Class({
    base: [Ten.SubWindow],
    initialize: function() {
        var self = this.constructor.SUPER.call(this);
        if (!self.commentsContainer) self.addCommentsContainer();
        return self;
    },
    style: {
        width: '280px',
        height: '280px',
        // overflow: 'auto',
        // overflowX: 'hidden',
        backgroundColor: '#f3f3f3',
        padding: '0',
        textAlign: 'center',
        borderRadius: '6px',
        MozBorderRadius: '6px'
    },
    handleStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px',
        backgroundColor: '#f3f3f3',
        borderBottom: '1px solid #bbb',
        width: '100%',
        height: '30px',
        borderRadius: '6px 6px 0 0',
        MozBorderRadius: '6px 6px 0 0'
    },
    containerStyle: {
        backgroundColor: '#fff',
        overflow: 'auto',
        overflowX: 'hidden',
        height: '248px',
        margin: '32px 0 0 0',
        textAlign: 'left',
        padding: '0 10px'
    },
    getLoadImage: function() {
        var img = document.createElement('img');
        img.src = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'images/load.gif';
        img.setAttribute('alt', 'Loading');
        var s = img.style;
        s.verticalAlign = 'middle';
        s.margin = '0 2px';
        return img;
    }
},{
    addCommentsContainer: function() {
        var div = document.createElement('div');
        Ten.Style.applyStyle(div, {
            margin: '0'
        });
        this.container.appendChild(div);
        this.commentsContainer = div;
    },
    showComments: function(e, pos) {
        var comments = e.comments;
        if (!comments) comments = [];
        this.commentsContainer.innerHTML = '';
        var cc = this.commentsContainer;
        for (var i=0; i<comments.length; i++) {
            cc.appendChild(comments[i].asElement());
        }
        if ( e.hasBoundToStarEntry() && !e.can_comment ) {
            this.hideCommentForm();
        } else {
            this.addCommentForm();
        }
        var win = Ten.Geometry.getWindowSize();
        var scr = Ten.Geometry.getScroll();
        var w = parseInt(this.constructor.style.width) + 20;
        var h = parseInt(this.constructor.style.height) + 20;
        if (pos.x + w > scr.x + win.w) pos.x = win.w + scr.x - w;
        if (pos.y + h > scr.y + win.h) pos.y = win.h + scr.y - h;
        this.show(pos);
    },
    bindEntry: function(e) {
        this.entry = e;
    },
    resizeCommentInput: function(e) {
        var ci = this.commentInput;
        if (ci.scrollHeight && (ci.clientHeight < ci.scrollHeight) && (ci.scrollHeight < 100)) {
            var h = ci.scrollHeight + 10;
            ci.style.height = h + 'px';
        }
    },
    sendComment: function(e) {
        var ci = this.commentInput;
        var body = ci.value;
        if (!body) return;
        ci.disabled = 'true';
        this.showLoadImage();
        var url = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'comment.add.json?body=' + encodeURIComponent(body) +
            '&uri=' + encodeURIComponent(this.entry.uri) +
            '&title=' + encodeURIComponent(this.entry.title);
        if (Hatena.Visitor && Hatena.Visitor.RKS) {
            url += '&rks=' + Hatena.Visitor.RKS;
        }
        new Ten.JSONP(url, this, 'receiveResult');
    },
    handleKeyPress: function(e) {
        if (e.isKey('enter') && e.ctrlKey) {
            this.sendComment();
        }
    },
    receiveResult: function(args) {
        if (!args.name || !args.body) return;
        this.commentInput.value = ''; 
        this.commentInput.disabled = '';
        this.commentInput.style.height = '3em';
        this.commentInput.focus();
        this.hideLoadImage();
        var com = new Hatena.Star.Comment(args);
        this.entry.addComment(com);
        this.commentsContainer.appendChild(com.asElement());
    },
    showLoadImage: function() {
        if (!this.loadImage) return; 
        this.loadImage.style.display = 'inline';
    },
    hideLoadImage: function() {
        if (!this.loadImage) return; 
        this.loadImage.style.display = 'none';
    },
    hideCommentForm: function() {
        if (!this.commentForm) return;
        this.commentForm.style.display = 'none';
    },
    addCommentForm: function() {
        if (this.commentForm) {
            this.commentForm.style.display = 'block';
            return;
        }
        var form = new Ten.Element('div', {
            style : {
                margin: '0px 0',
                padding: '5px 0'
            }
        });
        this.container.appendChild(form);
        this.commentForm = form;
        var input = new Ten.Element('textarea', {
            style: {
                width: '220px',
                height: '3em',
                border: '1px solid #bbb',
                padding: '3px',
                overflow: 'auto'
            }
        });
        form.appendChild(input);
        this.commentInput = input;
        this.commentInputHeight = input.scrollHeight;
        form.appendChild(new Ten.Element('br'));
        var submit = new Ten.Element('input', {
            type: 'button',
            value: 'send'
        });
        form.appendChild(submit);
        this.submit = submit;
        var img = this.constructor.getLoadImage();
        this.loadImage = img;
        this.hideLoadImage();
        form.appendChild(img);
        new Ten.Observer(submit,'onclick',this,'sendComment');
        new Ten.Observer(input,'onkeypress',this,'handleKeyPress');
        new Ten.Observer(input,'onkeyup',this,'resizeCommentInput');
    }
});

/* Hatena.Star.EntryLoader */
Hatena.Star.EntryLoader = new Ten.Class({
    initialize: function() {
        var c = Hatena.Star.EntryLoader;
        c.loadNewEntries();
        c.finishLoad();
    },
    loadNewEntries: function(node) {
        var c = Hatena.Star.EntryLoader;
        if (!node) node = document.body;
        var entries_org = c.entries;
        c.entries = null;
        var entries;
        if (c.headerTagAndClassName) {
            entries = c.loadEntriesByHeader(node);
        } else if (c.loadEntries) {
            entries = c.loadEntries(node);
        } else {
            entries = c.loadEntriesByConfig(node);
        }
        c.entries = [];
        if (entries && typeof(entries.length) == 'number') {
            for (var i = 0; i < entries.length; i++) {
                var e = new Hatena.Star.Entry(entries[i]);
                e.showButtons();
                c.entries.push(e);
            }
        }
        c.getStarEntries();
        if (entries_org) {
            c.entries.push(entries_org);
            c.entries = Ten.Array.flatten(c.entries);
        }
    },
    createStarContainer: function() {
        var sc = document.createElement('span');
        sc.className = 'hatena-star-star-container';
        return sc;
    },
    createCommentContainer: function() {
        var cc = document.createElement('span');
        cc.className = 'hatena-star-comment-container';
        return cc;
    },
    scrapeTitle: function(node) {
        var rval = [];
        (function (node) {
            if (node.className == 'sanchor' || node.className == 'timestamp' ||
                node.className == 'edit') {
                    return;
            } else if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
                return;
            }
            var cn = node.childNodes;
            if (cn) {
                for (var i = 0; i < cn.length; i++) {
                    arguments.callee.call(this, cn[i]);
                }
            }
            var nodeValue = node.nodeValue;
            if (typeof(nodeValue) == 'string') {
                rval.push(nodeValue);
            }
        })(node);
        var title = rval.join('');
        title = title.replace(/^[\s\n\r]+/, '');
        title = title.replace(/[\s\n\r]+$/, '');
        title = title.replace(/[\n\r]/g, '');
        return title;
    },
    getHeaders: function(node) {
        var t = Hatena.Star.EntryLoader.headerTagAndClassName;
        if (typeof(t[0]) == 'string') {
            return Ten.DOM.getElementsByTagAndClassName(t[0],t[1],node || document);
        } else {
            var elements = [];
            for (var i = 0; i < t.length; i++) {
                var elems = Ten.DOM.getElementsByTagAndClassName(t[i][0],t[i][1],node || document);
                for (var j = 0; j < elems.length; j++) {
                    elements.push(elems[j]);
                }
            }
            return elements;
        }
    },
    loadEntriesByHeader: function(node) {
        var c = Hatena.Star.EntryLoader;
        if (c.entries) return c.entries;
        var entries = [];
        var headers = c.getHeaders(node);
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            var a = header.getElementsByTagName('a')[0];
            if (!a) continue;
            var uri = a.href;
            var title = '';
            // Ten.DOM.removeEmptyTextNodes(header);
            var cns = header.childNodes;
            title = c.scrapeTitle(header);
            var cc = c.createCommentContainer();
            header.appendChild(cc);
            var sc = c.createStarContainer();
            header.appendChild(sc);
            entries.push({
                uri: uri,
                title: title,
                star_container: sc,
                comment_container: cc
            });
        }
        c.entries = entries;
        return entries;
    },
    loadEntriesByConfig: function(node) {
        var c = Hatena.Star.EntryLoader;
        if (c.entries) return c.entries;
        var entries = [];
        if (!Hatena.Star.SiteConfig) return null;
        var conf = Hatena.Star.SiteConfig.entryNodes;
        if (!conf) return null;
        for (var eselector in conf) {
            var enodes = Ten.Selector.getElementsBySelector(eselector,node);
            if (!enodes) continue;
            var sels = conf[eselector];
            if (!Ten.Array.isArray(sels)) sels = [sels];
            for (var i = 0; i < sels.length; i++) {
                var selectors = sels[i];
                for (var j = 0; j < enodes.length; j++) {
                    var enode = enodes[j];
                    var e = c.getEntryByENodeAndSelectors(enode, selectors);
                    if (e) entries.push(e);
                }
            }
        }
        c.entries = entries;
        return entries;
    },
    getEntryByENodeAndSelectors: function(enode,selectors) {
        var c = Hatena.Star.EntryLoader;
        var e = {entryNode: enode};
        var a = c.getElementByConfigSelector(selectors.uri, enode);
        if (!a) return null;
        e.uri = a.href;
        if (!e.uri) return null;
        var title = c.getElementByConfigSelector(selectors.title, enode);
        if (!title) return null;
        if (typeof(title) == 'string') {
            e.title = title;
        } else {
            e.title = c.scrapeTitle(title) || title.title || title.alt || '';
        }
        var cont = c.getElementByConfigSelector(selectors.container, enode);
        if (!cont) return null;
        e.comment_container = c.createCommentContainer();
        cont.appendChild(e.comment_container);
        e.star_container = c.createStarContainer();
        cont.appendChild(e.star_container);
        return e;
    },
    getElementByConfigSelector: function(selector,parent) {
        var truncate = false;
        selector = selector.replace(/::-ten-truncate$/, function () {
            truncate = true; return '';
        });

        var result = null;
        if (selector.match(/^document\.(location|title)$/)) {
            result = document[RegExp.$1];
        } else if (selector == 'window.location') {
            result = window.location;
        } else if (selector == 'parent') {
            result = parent;
        } else if (selector.match(/^link\[rel~?="?canonical"?\]$/)) {
            result = Ten.querySelector(selector);
        } else {
            result = Ten.Selector.getElementsBySelector(selector,parent)[0];
        }

        if (truncate && result && result.nodeType == 1) {
            result = Hatena.Star.EntryLoader.scrapeTitle(result) || result.title || result.alt || '';
            if (result.length > 30) {
                result = result.substring(0, 30) + '...';
            }
        }

        return result;
    },
    finishLoad: function() {
        var c = Hatena.Star.EntryLoader;
        c.dispatchEvent('load');
        c.loaded = true;
    },
    getStarEntries: function() {
        var c = Hatena.Star.EntryLoader;
        var entries = c.entries;
        if (!entries.length) return;
        var url = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'entries.json?';
        for (var i = 0; i < entries.length; i++) {
            if (url.length > Ten.JSONP.MaxBytes) {
                new Ten.JSONP(url, c, 'receiveStarEntries');
                url = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'entries.json?';
            }
            url += 'uri=' + encodeURIComponent(entries[i].uri) + '&';
        }
        if (!Hatena.Visitor) url += 'timestamp=1';
        new Ten.JSONP(url, c, 'receiveStarEntries');
    },
    receiveStarEntries: function(res) {
        var c = Hatena.Star.EntryLoader;
        var entries = res.entries;
        var encodedUriToEntryInfoMap = {};
        if (!entries) entries = [];
        for ( var i = 0, len = entries.length; i < len; ++i ) {
            var entryInfo = entries[i];
            if ( !entryInfo.uri ) continue;
            var eURI = entryInfo.eURI;
            if ( !eURI ) eURI = entryInfo.eURI = encodeURIComponent( entryInfo.uri );
            encodedUriToEntryInfoMap[eURI] = entryInfo;
        }
        for ( var i = 0, len = c.entries.length; i < len; ++i ) {
            var e = c.entries[i];
            var entryInfo;
            if ( e.hasBoundToStarEntry() ) continue;
            if ( !e.eURI ) e.eURI = encodeURIComponent(e.uri);
            if ( entryInfo = encodedUriToEntryInfoMap[e.eURI] ) {
                e.bindStarEntry( entryInfo );
            }
            if (typeof(e.can_comment) == 'undefined') {
                e.setCanComment(res.can_comment);
            }
            e.showStars();
            e.showCommentButton();
        }
        if (res.rks) {
            if (!Hatena.Visitor || typeof(Hatena.Visitor) == 'undefined') {
                Hatena.Visitor = {};
            }
            if (!Hatena.Visitor.RKS) {
                Hatena.Visitor.RKS = res.rks;
            }
        }
        Hatena.Star.User.RKS.ready(res.rks);
    },
    loaded: false,
    entries: null
});
Ten.EventDispatcher.implementEventDispatcher(Hatena.Star.EntryLoader);

/* Hatena.Star.ConfigLoader */
Hatena.Star.ConfigLoader = new Ten.Class({
    initialize: function() {
        var c = Hatena.Star.ConfigLoader;
        if (c.loaded) return true;
        if (Hatena.Star.SiteConfig ||
            Hatena.Star.EntryLoader.headerTagAndClassName ||
            Hatena.Star.EntryLoader.loadEntries) {
                c.finishLoad();
                return true;
            } else {
                c.loadConfig();
                return null;
            }
    },
    loadConfig: function() {
        var uri = Hatena.Star.BaseURL.replace(/^http:/, Hatena.Star.BaseURLProtocol) + 'siteconfig.json?host=' + location.hostname;
        new Ten.JSONP(uri, Hatena.Star.ConfigLoader, 'setConfig');
    },
    setConfig: function(data) {
        var host = location.hostname;
        var conf = data[host];
        if (!conf && host.match(/^[\w-]+(\..+)$/)) {
            var host = '*' + RegExp.$1;
            conf = data[host] || [];
        }
        var path = location.pathname;
        for (var i = 0; i < conf.length; i++) {
            var c = conf[i];
            if (path.match(new RegExp(c.path))) {
                Hatena.Star.SiteConfig = c;
                Hatena.Star.ConfigLoader.finishLoad();
                return true;
            }
        }
        Hatena.Star.ConfigLoader.finishLoad();
        return null;
    },
    finishLoad: function() {
        var c = Hatena.Star.ConfigLoader;
        c.dispatchEvent('load');
        c.loaded = true;
    },
    loaded: false
});
Ten.EventDispatcher.implementEventDispatcher(Hatena.Star.ConfigLoader);

/* Hatena.Star.WindowObserver */
Hatena.Star.WindowObserver = new Ten.Class({
    initialize: function() {
        var c = Hatena.Star.WindowObserver;
        if (c.observer) return;
        Hatena.Star.loaded = true;
        if (Hatena.Star.onLoadFunctions) {
            for (var i = 0; i < Hatena.Star.onLoadFunctions.length; i++) {
                Hatena.Star.onLoadFunctions[i]();
            }
            Hatena.Star.onLoadFunctions = [];
        }
        c.observer = Ten.DOM.addEventListener('onload', function() {
            c.finishLoad();
            if (!Ten.Browser.isFirefox || parseInt(Ten.Browser.version) > 2) {
                new Ten.Observer(document.body, 'onclick', function(event){
                    try{
                        var pallet = new Hatena.Star.Pallet();
                        pallet.hide();
                    } catch(e) {}
                });
            }
            Hatena.Star.ConfigLoader.addEventListener('load', function() {
                new Hatena.Star.EntryLoader();
            });
            new Hatena.Star.ConfigLoader();
        });
    },
    finishLoad: function() {
        var c = Hatena.Star.WindowObserver;
        c.dispatchEvent('load');
        c.loaded = true;
    },
    observer: null
});
Ten.EventDispatcher.implementEventDispatcher(Hatena.Star.WindowObserver);

/* Hatena.Star.Text */
Hatena.Star.Text = {};

Hatena.Star.useSmartPhoneStar = true;


/* start */
new Hatena.Star.WindowObserver();

/* Hatena.Star.SiteConfig */
/* sample configuration for Hatena Diary */
/*
// Hatena.Star.SiteConfig = {
//     entryNodes: {
//         'div.section': {
//             uri: 'h3 a',
//             title: 'h3',
//             container: 'h3'
//         }
//     }
// };
*/

/*
=head1 NAME

HatenaStar.js - Make your blog more fun!

=head1 SYNOPSIS

In your blog header or body,

  <script type="text/javascript" src="http://s.hatena.com/js/HatenaStar.js"></script>

You may have to configure these settings for your blog if you don't use
major  blog hosting service.

  <script type="text/javascript" src="http://s.hatena.com/js/HatenaStar.js"></script>
  <script type="text/javascript>
    Hatena.Star.SiteConfig = {
      entryNodes: {
        'div.entry': {
          uri: 'a.permalink',
          title: 'h3.title',
          container: 'h3.title'
        }
      }
    };
  </script>

You can also register your Hatena ID by adding your blog's url at

  http://s.hatena.com/ (English)
  http://s.hatena.ne.jp/ (Japanese)

You can receive comments from your favorite users if you register your ID.

=head1 SITE CONFIGURATION

Site configuration style changed in Sep. 2007. To configure Hatena Star
for your site, please specify your html element structure as below.

  <script type="text/javascript>
    Hatena.Star.SiteConfig = {
      entryNodes: {
        'div.entry': {
          uri: 'a.permalink',
          title: 'h3.title',
          container: 'h3.title'
        }
      }
    };
  </script>

(to be continued..)

=head1 CUTOMIZE IMAGES

You can customize the default image settings for your page if you want.

  // change the images of stars, buttons by editing your style sheets
  .hatena-star-add-button-image {
    background-image: url(http://exapmle.com/add.gif);
  }
  .hatena-star-comment-button-image {
    background-image: url(http://exapmle.com/comment.gif);
  }
  .hatena-star-star-image {
    background-image: url(http://exapmle.com/star.gif);
  }

=head1 CHANGES

Please see E<lt>http://s.hatena.com/js/Hatena/Star/HatenaStar.ChangesE<gt>.

=head1 AUTHOR

Junya Kondo, E<lt>http://d.hatena.ne.jp/jkondo/E<gt>
Yuichi Tateno, motemen, nagayama

=head1 COPYRIGHT AND LICENSE

Copyright (C) Hatena Inc. All Rights Reserved.

This library is free software; you may redistribute it and/or modify
it under the same terms as the Perl programming language.

=cut
*/
