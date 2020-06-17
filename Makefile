PATH        := ./node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell node support/getGlobalName.js package)
NPM_VERSION := $(shell node support/getGlobalName.js version)

GLOBAL_NAME := $(shell node support/getGlobalName.js global)
BUNDLE_NAME := $(shell node support/getGlobalName.js microbundle)

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJ := https://github.com//GerHobbelt/${NPM_PACKAGE}


build: report-config lintfix browserify rollup doc test coverage demo todo

demo: lint
	-rm -rf ./demo
	mkdir ./demo
	#node support/build_demo.js
	./support/demodata.js > ./support/demo_template/sample.json
	pug ./support/demo_template/index.pug --pretty \
		--obj ./support/demo_template/sample.json \
		--out ./demo
	stylus -u autoprefixer-stylus \
		< ./support/demo_template/index.styl \
		> ./demo/index.css
	rm -rf ./support/demo_template/sample.json
	browserify ./index.js -s markdownit > ./demo/markdown-it.js
	# process ./support/demo_template/index.js:
	#rollup -c ./rollup.config4demo_template.js
	browserify ./support/demo_template/index.js > ./demo/index.js
	cp ./support/demo_template/README.md ./demo/
	cp ./support/demo_template/test.html ./demo/
	touch ./demo/.nojekyll

gh-demo: demo
	git add ./demo/
	touch ./demo/.nojekyll
	npx gh-pages -d demo -f -b master -r git@github.com:GerHobbelt/markdown-it.github.io.git
	git commit -m "Auto-generate demo"
	#rm -rf ./demo

lint:
	eslint .

lintfix:
	eslint --fix .

rollup:
	-mkdir dist
	# Rollup
	rollup -c

test: specsplit
	mocha

coverage:
	-rm -rf coverage
	-rm -rf .nyc_output
	cross-env NODE_ENV=test nyc mocha

report-coverage: lint coverage

doc:
	-rm -rf ./apidoc
	#node support/build_doc.js
	ndoc --link-format "https://github.com/{package.repository}/blob/${CURR_HEAD}/{file}#L{line}"
	touch ./apidoc/.nojekyll

gh-doc: doc
	git add ./apidoc/
	touch ./demo/.nojekyll
	npx gh-pages -d apidoc -f
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
	npm run pub

browserify:
	-rm -rf ./dist
	mkdir dist
	# Browserify
	( printf "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" ; \
		browserify ./index.js -s ${GLOBAL_NAME} \
		) > dist/${NPM_PACKAGE}.js

minify: browserify
	# Minify
	terser dist/${NPM_PACKAGE}.js -b beautify=false,ascii_only=true -c -m \
		--preamble "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" \
		> dist/${NPM_PACKAGE}.min.js

benchmark-deps:
	npm install --prefix benchmark/extra/ -g marked@0.3.6 commonmark@0.26.0 markdown-it/markdown-it.git#2.2.1

specsplit: 											\
			./test/fixtures/commonmark/good.txt     \
			./test/fixtures/commonmark/bad.txt

./test/fixtures/commonmark/good.txt : 				\
			./support/specsplit.js 					\
			./test/fixtures/commonmark/spec.txt
	./support/specsplit.js good ./test/fixtures/commonmark/spec.txt > ./test/fixtures/commonmark/good.txt
	./support/specsplit.js ./test/fixtures/commonmark/spec.txt

./test/fixtures/commonmark/bad.txt :    			\
			./support/specsplit.js 					\
			./test/fixtures/commonmark/spec.txt
	./support/specsplit.js bad ./test/fixtures/commonmark/spec.txt > ./test/fixtures/commonmark/bad.txt
	./support/specsplit.js ./test/fixtures/commonmark/spec.txt

todo:
	@echo ""
	@echo "TODO list"
	@echo "---------"
	@echo ""
	grep 'TODO' -n -r ./ --exclude-dir=node_modules --exclude-dir=unicode-homographs --exclude-dir=.nyc_output --exclude-dir=dist --exclude-dir=coverage --exclude=Makefile 2>/dev/null || test true

clean:
	-rm -rf ./coverage/
	-rm -rf ./demo/
	-rm -rf ./apidoc/
	-rm -rf ./dist/
	-rm -rf ./.nyc_output/

superclean: clean
	-rm -rf ./node_modules/
	-rm -f ./package-lock.json

prep: superclean
	-ncu -a --packageFile=package.json
	-npm install
	-npm audit fix

prep-ci: clean
	-rm -rf ./node_modules/
	-npm ci
	-npm audit fix

report-config:
	-echo "NPM_PACKAGE=${NPM_PACKAGE} NPM_VERSION=${NPM_VERSION} GLOBAL_NAME=${GLOBAL_NAME} BUNDLE_NAME=${BUNDLE_NAME} TMP_PATH=${TMP_PATH} REMOTE_NAME=${REMOTE_NAME} REMOTE_REPO=${REMOTE_REPO} CURR_HEAD=${CURR_HEAD}"


.PHONY: clean superclean prep prep-ci report-config publish lint lintfix test todo demo coverage report-coverage doc build browserify minify gh-demo gh-doc specsplit rollup
.SILENT: help todo report-config
