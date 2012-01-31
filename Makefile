all: scripts/Ten.js

scripts/Ten.js: src/Ten.base.js src/Ten/Deferred.js Makefile
	perl -MPath::Class -n -e 's{\Q/*include Ten.Deferred*/\E}{scalar file("src/Ten/Deferred.js")->slurp}ge; print' < $< > $@
