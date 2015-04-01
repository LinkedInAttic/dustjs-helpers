var window = this;

var isRhino = true;

print('Running unit tests with ' + environment['java.class.path']);

var requiredFiles = [
    'node_modules/grunt-contrib-jasmine/vendor/jasmine-2.0.1/jasmine.js',
    'test/rhino-test/bootstrap.js',
    'node_modules/dustjs-linkedin/dist/dust-full.min.js',
    'tmp/dust-helpers.min.js',
    'test/testUtils.js',
    'test/jasmine-test/spec/helpersTests.js',
    'test/jasmine-test/spec/renderTestSpec.js'
  ];

//load all of the dependencies and unit tests
for(var i = 0; i < requiredFiles.length; i++){
  load(requiredFiles[i]);
}

//execute unit tests
env.execute();
