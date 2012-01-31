all: scripts/Ten.js

scripts/Ten.js: src/Ten.base.js src/Ten/Deferred.js Makefile
	perl -MPath::Class -n -e 's{\Q/*include Ten.Deferred*/\E}{scalar file("src/Ten/Deferred.js")->slurp}ge; print' < $< > $@

src/Ten/Deferred.js: src/Ten/Deferred.base.js modules/jsdeferred/jsdeferred.js Makefile
	perl -MPath::Class -n -e 'sub mini ($$) { my $$s = $$_[0]; $$s =~ s{\x0A?/\*.*?\*/}{}gs; $$s =~ s{\x0A?\s*//.*}{}g; $$s =~ s{\A\s+|\s+\z}{}g; $$s } s{\Q/*include JSDeferred*/\E}{join "", map { s/^/    /mg; s/\t/    /g; $$_ } mini scalar file("modules/jsdeferred/jsdeferred.js")->slurp}ge; print' < $< > $@
