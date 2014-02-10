# Dust Helpers  [![Build Status](https://secure.travis-ci.org/linkedin/dustjs-helpers.png)](http://travis-ci.org/linkedin/dustjs-helpers)
Additional functionality for [dustjs-linkedin](http://linkedin.github.com/dustjs/) package

Read more here : <https://github.com/linkedin/dustjs-helpers>

## Getting Started
A quick tutorial for how to use Dust <https://github.com/linkedin/dustjs/wiki/Dust-Tutorial>

## Contributing
* Open https://github.com/linkedin/dustjs-helpers in a browser and fork it. Then clone your fork:

        git clone https://github.com/<your github account>/dustjs-helpers dustjs-helpers
        cd dustjs-helpers

* Set up a branch for what you are working on

        git checkout -b myBranchName

* Install Grunt-cli, it lets you run `grunt` commands. For more information see <http://gruntjs.com/getting-started>

        npm install -g grunt-cli

* Install node dependencies needed for development in this project

        npm install

* Make your changes on the branch and run jshint\tests to make sure changes are OK

        grunt test

* Commit your changes and push them to github

        git add .
        git commit -m "My changes to dustjs-helpers repo"
        git push origin myBranchName

* Go to github and post a pull request, see <https://help.github.com/articles/creating-a-pull-request>

## Debugging
To debug code in a browser run `grunt dev` task. It will generate jasmine spec runner and serve it on `http://localhost:3000/_SpecRunner.html` URL.
Generated spec runner references unminified dust-helpers.js and dust-full.js files. This will allow you to easily step through the code and set up breakpoints.
This task also watches changes to lib directory, so you can simply refresh the page to see the changes without a need to re-run `grunt dev` task. Press `Ctrl + C` to disconnect from server.

## Using watch
`grunt watch` will monitor dust-helpers.js and test spec files. Whenever change is made to those files, it will jshint them and run unit tests in Phantom (will not run them in node or rhino).
 It is handy way to keep testing your changes without a need to manually run `grunt testPhantom` task.
 Be sure to run `grunt test` before sending pull request. It will test your change in all environments and make sure that a travis build for your pull request succeeds.

## Testing minified code in browser
Use `grunt testClient` to test prod version code in any browser. Similarly to `grunt dev` task it will host spec runner on `http://localhost:3000/_SpecRunner.html` URL.

## Coverage report
Task `grunt coverage` runs jasmine unit tests against unminified source code and generates coverage report under `tmp/coverage` folder.
Open `index.html` file in a browser to view the coverage.