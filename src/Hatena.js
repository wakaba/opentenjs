/*
// require Ten.js
*/

/* Hatena */
if (typeof(Hatena) == 'undefined') {
    Hatena = {};
}

/* Hatena.User */
Hatena.User = new Ten.Class({
    initialize: function(args) {
        if (typeof(args) == 'string') {
            this.name = args;
        } else {
            for (var key in args) {
                this[key] = args[key];
            }
        }
    },
    getProfileIcon: function(name) {
        if (!name) name = 'user';
        var pre = name.match(/^[\w-]{2}/)[0];
        var img = document.createElement('img');
        img.src = 'https://www.hatena.ne.jp/users/' + pre + '/' + name + '/profile_s.gif';
        img.setAttribute('alt', name);
        img.setAttribute('title', name);
        img.setAttribute('width','16px');
        img.setAttribute('height','16px');
        img.className =  'profile-icon';
        with (img.style) {
            margin = '0 3px';
            border = 'none';
            verticalAlign = 'middle';
        }
        return img;
    }
}, {
    profileIcon: function() {
        return Hatena.User.getProfileIcon(this.name);
    }
});
