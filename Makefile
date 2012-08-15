WGET = wget

all: scripts/Ten.js scripts/ten-extras.js

scripts/Ten.js: src/Ten.base.js src/Ten/Deferred.js Makefile
	perl -n -e 's{\Q/*include Ten.Deferred*/\E}{open my $$file, "<", "src/Ten/Deferred.js"; local $$/ = undef; <$$file>}ge; print' < $< > $@

src/Ten/Deferred.js: src/Ten/Deferred.base.js modules/jsdeferred/jsdeferred.js Makefile
	perl -n -e 'sub mini ($$) { my $$s = $$_[0]; $$s =~ s{\x0A?/\*.*?\*/}{}gs; $$s =~ s{\x0A?\s*//.*}{}g; $$s =~ s{\A\s+|\s+\z}{}g; $$s } s{\Q/*include JSDeferred*/\E}{join "", map { s/^/    /mg; s/\t/    /g; s{\bthis\.Deferred = Deferred;}{}; $$_ } mini do { open my $$file, "<", "modules/jsdeferred/jsdeferred.js"; local $$/ = undef; <$$file> }}ge; print' < $< > $@

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
