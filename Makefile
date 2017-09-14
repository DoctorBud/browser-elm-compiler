all: dist/browser-elm-compiler.min.js

elm-compiler:
	git clone https://github.com/elm-lang/elm-compiler.git
	cd elm-compiler && git checkout 0.18.0 && patch -p1 < ../patch/elm-compiler.diff

elm-package:
	git clone https://github.com/elm-lang/elm-package.git
	cd elm-package && git checkout 0.18.0 && patch -p1 < ../patch/elm-package.diff

out.js: src/*.hs
	PATH=~/.stack/programs/x86_64-osx/ghc-7.10.3/bin:$$PATH stack build

dist/browser-elm-compiler.js: src/*.hs js/worker-interface.js
	cat \
		`stack path --dist-dir`/build/browser-elm-compiler-exe/browser-elm-compiler-exe.jsexe/all.js \
		js/worker-interface.js \
		> $@

dist/browser-elm-compiler.min.js: dist/browser-elm-compiler.js
	node_modules/.bin/uglifyjs --toplevel --compress --mangle --output dist/browser-elm-compiler.min.js -- dist/browser-elm-compiler.js

clean:
	rm -rf .cabal-sandbox
