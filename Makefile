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


build: report-config lintfix rollup doc test coverage demo todo

demo: lint
	-rm -rf ./demo
	mkdir ./demo
	#node support/build_demo.js
	./support/demodata.js > ./support/demo_template/sample.json
	npx pug ./support/demo_template/index.pug --pretty \
		--obj ./support/demo_template/sample.json \
		--out ./demo
	npx stylus -u autoprefixer-stylus \
		< ./support/demo_template/index.styl \
		> ./demo/index.css
	rm -rf ./support/demo_template/sample.json
	rollup -c support/demo_template/rollup.config.js
	cp ./support/demo_template/README.md ./demo/
	#cp ./support/demo_template/test.html ./demo/
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

rollup:
	-rm -rf ./dist
	mkdir dist
	rollup -c support/rollup.config.js

benchmark-deps:
	npm install --prefix benchmark/extra/ -g marked@0.3.6 commonmark@0.26.0 markdown-it/markdown-it.git#2.2.1

benchmark: benchmark-deps
	node benchmark/benchmark.js

profile:
	# kill all old node profile dump files
	rm isolate*.log
	# WARNING NOTE: this is the old way of profiling...
	# Use make target `profile2chrome` for thee new way.
	node --prof benchmark/profile.js 30
	node --prof-process  ./isolate*.log > ./cpu-profile.log
	cat ./cpu-profile.log

profile2chrome:
	# kill all old node profile dump files
	rm *.cpuprofile
	# extra options for node are: --cpu-prof-dir=DIR and --cpu-prof-name=FILE
	node --cpu-prof benchmark/profile.js 30
	# now open this file in Chrome DevTools (after we've edited the HTML page that we use to ease this process)
	#
	# wait 1 to ensure the FS has updated; seems we don't always get the latest file when we don't wait for a bit
	sleep 1
	node support/mk-profile-devtools.js
	start chrome support/profile-devtools.html

specsplit:
	./support/specsplit.js good -o test/fixtures/commonmark/good.txt
	./support/specsplit.js bad -o test/fixtures/commonmark/bad.txt
	./support/specsplit.js

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
	-rm *.cpuprofile
	-rm *.log

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


.PHONY: clean superclean prep prep-ci report-config publish lint lintfix test todo demo coverage report-coverage doc build minify gh-demo gh-doc specsplit rollup benchmark-deps benchmark profile profile2chrome
.SILENT: help todo report-config
