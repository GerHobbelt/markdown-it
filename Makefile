PATH        := ./node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJ := https://github.com//markdown-it/${NPM_PACKAGE}


build: lint browserify doc test coverage demo todo 

demo: lint
	-rm -rf ./demo
	mkdir ./demo
	./support/demodata.js > ./support/demo_template/sample.json
	jade ./support/demo_template/index.jade --pretty \
		--obj ./support/demo_template/sample.json \
		--out ./demo
	stylus -u autoprefixer-stylus \
		< ./support/demo_template/index.styl \
		> ./demo/index.css
	rm -rf ./support/demo_template/sample.json
	browserify ./ -s markdownit > ./demo/markdown-it.js
	browserify ./support/demo_template/index.js > ./demo/index.js
	cp ./support/demo_template/README.md ./demo/
	cp ./support/demo_template/test.html ./demo/
	touch ./demo/.nojekyll

gh-demo: demo
	git add ./demo/
	touch ./demo/.nojekyll
	git commit -m "Auto-generate demo"
	#rm -rf ./demo

lint:
	eslint .

test: lint specsplit
	mocha

coverage:
	-rm -rf coverage
	istanbul cover node_modules/mocha/bin/_mocha

report-coverage: coverage

doc:
	-rm -rf ./apidoc
	ndoc --link-format "https://github.com/{package.repository}/blob/${CURR_HEAD}/{file}#L{line}"
	touch ./apidoc/.nojekyll

gh-doc: doc
	git add ./apidoc/
	touch ./demo/.nojekyll
	git commit -m "Auto-generate API doc"
	#rm -rf ./apidoc

publish:
	@if test 0 -ne `git status --porcelain | wc -l` ; then \
		echo "Unclean working tree. Commit or stash changes first." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git fetch ; git status | grep '^# Your branch' | wc -l` ; then \
		echo "Local/Remote history differs. Please push/pull changes." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git tag -l ${NPM_VERSION} | wc -l` ; then \
		echo "Tag ${NPM_VERSION} exists. Update package.json" >&2 ; \
		exit 128 ; \
		fi
	git tag ${NPM_VERSION} && git push origin ${NPM_VERSION}
	npm publish ${GITHUB_PROJ}/tarball/${NPM_VERSION}

browserify:
	-rm -rf ./dist
	mkdir dist
	# Browserify
	( printf "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" ; \
		browserify ./ -s markdownit \
		) > dist/markdown-it.js

minify: browserify
	# Minify
	uglifyjs dist/markdown-it.js -b beautify=false,ascii_only=true -c -m \
		--preamble "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" \
		> dist/markdown-it.min.js

benchmark-deps:
	npm install --prefix benchmark/extra/ -g marked@0.3.6 commonmark@0.26.0 markdown-it/markdown-it.git#2.2.1

specsplit:
	./support/specsplit.js good ./test/fixtures/commonmark/spec.txt > ./test/fixtures/commonmark/good.txt
	./support/specsplit.js bad ./test/fixtures/commonmark/spec.txt > ./test/fixtures/commonmark/bad.txt
	./support/specsplit.js ./test/fixtures/commonmark/spec.txt

todo:
	@echo ""
	@echo "TODO list"
	@echo "---------"
	@echo ""
	grep 'TODO' -n -r ./lib 2>/dev/null || test true

clean:
	-rm -rf ./coverage/
	-rm -rf ./demo/
	-rm -rf ./apidoc/
	-rm -rf ./dist/

.PHONY: clean publish lint test todo demo coverage report-coverage doc build browserify minify gh-demo gh-doc specsplit
.SILENT: help lint test todo
