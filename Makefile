#
# Shorthand script to run Bundler/Jekyll
# locally, to test the site in real time.
#

all:
	bundle exec jekyll build

run:
	bundle exec jekyll serve

clean:
	rm -rf site/
	rm -rf .sass-cache/
	rm -f Gemfile.lock

