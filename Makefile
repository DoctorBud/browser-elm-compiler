all: \
	out.js \
	dist/browser-elm-compiler.js

elm-compiler:
	git clone https://github.com/elm-lang/elm-compiler.git
	cd elm-compiler && git checkout 0.18.0 && patch -p1 < ../patch/elm-compiler.diff

elm-package:
	git clone https://github.com/elm-lang/elm-package.git
	cd elm-package && git checkout 0.18.0 && patch -p1 < ../patch/elm-package.diff

out.js: src/*.hs
	stack build

dist/browser-elm-compiler.js: src/*.hs js/export.js
	cat \
		js/prelude.js \
		`stack path --dist-dir`/build/browser-elm-compiler-exe/browser-elm-compiler-exe.jsexe/rts.js \
		`stack path --dist-dir`/build/browser-elm-compiler-exe/browser-elm-compiler-exe.jsexe/lib.js \
		`stack path --dist-dir`/build/browser-elm-compiler-exe/browser-elm-compiler-exe.jsexe/out.js \
		js/export.js \
		> $@

clean:
	rm -rf .cabal-sandbox
