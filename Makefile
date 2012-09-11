WGET = wget
PERL = perl

all: \
  scripts/Ten.js scripts/ten-extras.js scripts/locale-all.js \
  scripts/HatenaStar.jp.js scripts/HatenaStar.com.js \
  src/Hatena/Emoji/Palette/Data.js

# ------ Generation of scripts ------

scripts/Ten.js: src/Ten.base.js src/Ten/Deferred.js Makefile
	$(PERL) -n -e 's{\Q/*include Ten.Deferred*/\E}{open my $$file, "<", "src/Ten/Deferred.js"; local $$/ = undef; <$$file>}ge; print' < $< > $@

src/Ten/Deferred.js: src/Ten/Deferred.base.js modules/jsdeferred/jsdeferred.js Makefile
	$(PERL) -n -e 'sub mini ($$) { my $$s = $$_[0]; $$s =~ s{\x0A?/\*.*?\*/}{}gs; $$s =~ s{\x0A?\s*//.*}{}g; $$s =~ s{\A\s+|\s+\z}{}g; $$s } s{\Q/*include JSDeferred*/\E}{join "", map { s/^/    /mg; s/\t/    /g; s{\bthis\.Deferred = Deferred;}{}; $$_ } mini do { open my $$file, "<", "modules/jsdeferred/jsdeferred.js"; local $$/ = undef; <$$file> }}ge; print' < $< > $@

src/NodeRect.js:
	$(WGET) -O $@ https://raw.github.com/wakaba/samijs/master/noderect/NodeRect.js

scripts/ten-extras.js: \
  src/Ten/Browser.js \
  src/Ten/Browser/CSS.js \
  src/json2.js \
  src/Ten/JSON.js \
  src/Ten/Extras.js \
  src/Ten/Extras/XHR.js \
  src/Ten/Extras/XHR/ErrorXHR.js \
  src/Ten/DOM.js \
  src/Ten/Draggable.js \
  src/Ten/Form.js \
  src/Ten/Form/Placeholder.js \
  src/Ten/TextArea.js \
  src/NodeRect.js \
  src/Ten/Box.js \
  src/Ten/Resizable.js \
  src/Ten/Widget.js \
  src/Ten/Widget/OptionButtons.js \
  src/Ten/Widget/DropDown.js \
  src/Ten/Widget/DropDown/FrameMenu.js \
  src/Ten/Widget/ItemList.js \
  src/Ten/Widget/Frame.js \
  src/Ten/Storage.js \
  src/Ten/Storage/Local.js \
  src/Ten/XDMessenger.js \
  src/Ten/Array.js \
  src/Ten/AsyncLoader/PageFragmentLoader.js \
  src/Ten/AsyncLoader/PageFragmentLoader/TextData.js \
  src/Ten/AsyncLoader/PageFragmentLoader/JSONData.js \
  src/Ten/AsyncLoader/PageFragmentLoader/HTTPData.js \
  src/Ten/AsyncLoader/Indicator.js \
  src/Ten/Style.js \
  src/NotificationArea.js \
  scripts/timeline.js \
  src/Ten/Extras/OnLoad.js \
  src/Ten/Extras/License.js \
  Makefile
	echo "/* Not the original file!  Don't edit! */" > $@
	echo "" >> $@
	cat src/Ten/Browser.js >> $@
	cat src/Ten/Browser/CSS.js >> $@
	cat src/Ten/DOM.js >> $@
	cat src/json2.js >> $@
	cat src/Ten/JSON.js >> $@
	cat src/Ten/Extras.js >> $@
	cat src/Ten/Extras/XHR.js >> $@
	cat src/Ten/Extras/XHR/ErrorXHR.js >> $@
	cat src/Ten/Draggable.js >> $@
	cat src/Ten/Form.js >> $@
	cat src/Ten/Form/Placeholder.js >> $@
	cat src/Ten/TextArea.js >> $@
	cat src/NodeRect.js >> $@
	cat src/Ten/Box.js >> $@
	cat src/Ten/Resizable.js >> $@
	cat src/Ten/Widget.js >> $@
	cat src/Ten/Widget/OptionButtons.js >> $@
	cat src/Ten/Widget/DropDown.js >> $@
	cat src/Ten/Widget/DropDown/FrameMenu.js >> $@
	cat src/Ten/Widget/ItemList.js >> $@
	cat src/Ten/Widget/Frame.js >> $@
	cat src/Ten/Storage.js >> $@
	cat src/Ten/Storage/Local.js >> $@
	cat src/Ten/XDMessenger.js >> $@
	cat src/Ten/Array.js >> $@
	cat src/Ten/AsyncLoader.js >> $@
	cat src/Ten/AsyncLoader/PageFragmentLoader.js >> $@
	cat src/Ten/AsyncLoader/PageFragmentLoader/TextData.js >> $@
	cat src/Ten/AsyncLoader/PageFragmentLoader/JSONData.js >> $@
	cat src/Ten/AsyncLoader/PageFragmentLoader/HTTPData.js >> $@
	cat src/Ten/AsyncLoader/Indicator.js >> $@
	cat src/Ten/Style.js >> $@
	cat src/NotificationArea.js >> $@
	cat scripts/timeline.js >> $@
	cat src/Ten/Extras/OnLoad.js >> $@
	cat src/Ten/Extras/License.js >> $@

scripts/locale-all.js: src/Hatena/Locale.js Makefile
	echo "/* Not the original file!  Don't edit! */" > $@
	echo "" >> $@
	cat $< >> $@

scripts/HatenaStar.jp.js: \
    scripts/Ten.js src/Ten/SubWindow.js src/Ten/Highlight.js \
    src/Hatena.js src/Hatena/Star/HatenaStar.base.js \
    src/Hatena/Star/BaseURL.jp.js
	cat $^ > $@

scripts/HatenaStar.com.js: \
    scripts/Ten.js src/Ten/SubWindow.js src/Ten/Highlight.js \
    src/Hatena.js src/Hatena/Star/HatenaStar.base.js \
    src/Hatena/Star/BaseURL.com.js
	cat $^ > $@

src/Hatena/Emoji/Palette/Data.js: \
  modules/hatena-emoji-data/collections/hatena.json Makefile JSONPP.pm
	$(PERL) \
            -e ' #\
	        require "JSONPP.pm"; #\
	        open $$file, "<", shift; #\
	        local $$/ = undef; #\
	        $$data = JSON::PP->new->utf8->decode(scalar <$$file>); #\
                $$palette = { #\
                    DS => $$data->{hatena_ds}, #\
                    KEITAI_1 => $$data->{hatena_keitai_1}, #\
                    KEITAI_2 => $$data->{hatena_keitai_2}, #\
                    KEITAI_3 => $$data->{hatena_keitai_3}, #\
                }; \
                print "\nif (typeof(self.Hatena) == \x27undefined\x27) var Hatena = {};\n"; \
                print "if (typeof(Hatena.Emoji) == \x27undefined\x27) Hatena.Emoji = {};\n"; \
                print "if (typeof(Hatena.Emoji.Palette) == \x27undefined\x27) Hatena.Emoji.Palette = {};\n\n"; \
                print "Hatena.Emoji.Palette.Data = "; \
                print JSON::PP->new->utf8->allow_blessed->convert_blessed->allow_nonref->pretty->canonical->encode($$palette); #\
                print ";"; #\
            ' $< > $@

JSONPP.pm:
	$(WGET) -O $@ http://cpansearch.perl.org/src/MAKAMAKA/JSON-PP-2.27200/lib/JSON/PP.pm

# ------ Tests ------

WGET = wget
PERL = perl
GIT = git
PERL_VERSION = latest
PERL_PATH = $(abspath local/perlbrew/perls/perl-$(PERL_VERSION)/bin)
REMOTEDEV_HOST = remotedev.host.example
REMOTEDEV_PERL_VERSION = $(PERL_VERSION)

PMB_PMTAR_REPO_URL =
PMB_PMPP_REPO_URL = 

Makefile-setupenv: Makefile.setupenv
	$(MAKE) --makefile Makefile.setupenv setupenv-update \
	    SETUPENV_MIN_REVISION=20120338

Makefile.setupenv:
	$(WGET) -O $@ https://raw.github.com/wakaba/perl-setupenv/master/Makefile.setupenv

lperl lprove lplackup local-perl perl-version perl-exec \
local-submodules pmb-install pmb-update \
local-phantomjs: %: Makefile-setupenv
	$(MAKE) --makefile Makefile.setupenv $@ \
            REMOTEDEV_HOST=$(REMOTEDEV_HOST) \
            REMOTEDEV_PERL_VERSION=$(REMOTEDEV_PERL_VERSION) \
	    PMB_PMTAR_REPO_URL=$(PMB_PMTAR_REPO_URL) \
	    PMB_PMPP_REPO_URL=$(PMB_PMPP_REPO_URL)

git-submodules:
	$(GIT) submodule update --init
	-cd t_deps/modules/Wight && ln -s poltergeist/lib/capybara/poltergeist/client/compiled/ share

PROVE = prove
PERL_ENV = PATH="$(abspath ./local/perl-$(PERL_VERSION)/pm/bin):$(PERL_PATH):$(PATH)" PERL5LIB="$(shell cat config/perl/libs.txt)"

test: test-deps test-main

test-deps: git-submodules local-phantomjs pmb-install

test-main:
	$(PERL_ENV) $(PERL) t_deps/bin/generate_ts.pl
	$(PERL_ENV) TEST_PHANTOMJS="$(abspath local/phantomjs/bin/phantomjs)" \
	$(PROVE) t/tap-perl/*.t
