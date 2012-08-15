all: scripts/Ten.js

scripts/Ten.js: src/Ten.base.js src/Ten/Deferred.js Makefile
	perl -n -e 's{\Q/*include Ten.Deferred*/\E}{open my $$file, "<", "src/Ten/Deferred.js"; local $$/ = undef; <$$file>}ge; print' < $< > $@

src/Ten/Deferred.js: src/Ten/Deferred.base.js modules/jsdeferred/jsdeferred.js Makefile
	perl -n -e 'sub mini ($$) { my $$s = $$_[0]; $$s =~ s{\x0A?/\*.*?\*/}{}gs; $$s =~ s{\x0A?\s*//.*}{}g; $$s =~ s{\A\s+|\s+\z}{}g; $$s } s{\Q/*include JSDeferred*/\E}{join "", map { s/^/    /mg; s/\t/    /g; $$_ } mini do { open my $$file, "<", "modules/jsdeferred/jsdeferred.js"; local $$/ = undef; <$$file> }}ge; print' < $< > $@
