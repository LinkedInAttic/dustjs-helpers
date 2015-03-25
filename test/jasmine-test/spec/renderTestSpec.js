/*global expect:true,runs:true,waitsFor:true,describe:true,it:true,helpersTests:true*/

(function(root, factory) {
  if (typeof exports === 'object') {
    // in Node, require dust and helpers tests
    module.exports = factory(require('dustjs-linkedin'), require('./helpersTests.js'));
  } else {
    // in the browser use global dust and helpersTests objects
    factory(root.dust, root.helpersTests);
  }
}(this, function(dust, helpersTests) {

  dust.debugLevel = "DEBUG";

  function messageInLog(log, message, level) {
    var i;
    log = log || [];
    for(i = 0; i < log.length; i++) {
      if(log[i].message.indexOf(message) > -1) {
        return (!level || log[i].level === level);
      }
    }
    return false;
  }

  function render(test) {
    return function() {
      try {
        dust.loadSource(dust.compile(test.source, test.name));
        dust.render(test.name, test.context, function(err, output) {
          expect(err).toBeNull();
          expect(output).toEqual(test.expected);
          if(test.log) {
            expect(messageInLog(dust.logQueue, test.log, test.logLevel)).toEqual(true);
          }
        });
      }
      catch (error) {
        expect(error.message).toEqual(test.error || {} );
      }
    };
}

  function stream(test) {
  return function() {
    var output ="", flag;
    runs(function(){
      flag = false;
      output = "";
      try {
        dust.logQueue = [];
        dust.loadSource(dust.compile(test.source, test.name));
        dust.stream(test.name, test.context)
        .on("data", function(data) {
          output += data;
        })
        .on("end", function() {
          flag = true;
        })
        .on("error", function(err) {
          output = err.message;
        });
      } catch(error) {
        output = error.message;
        flag= true;
      }
    });

    waitsFor(function(){
      return flag;
    }, "the output", 500);

    runs(function(){
      if (test.error) {
        expect(output).toEqual(test.error || {} );
      } else {
        expect(output).toEqual(test.expected);
      }
      if(test.log) {
        expect(messageInLog(dust.logQueue, test.log, test.logLevel)).toEqual(true);
      }
    });
  };
}

  function pipe(test) {
    return function() {
      var output, flag;
      runs(function(){
        flag = false;
        output = "";
        try {
          dust.loadSource(dust.compile(test.source, test.name));
          dust.stream(test.name, test.context).pipe({
            write: function (data) {
              output += data;
            },
            end: function () {
              flag = true;
            },
            error: function (err) {
              flag = true;
              output = err.message;
            }
          });
        } catch(error) {
          output = error.message;
          flag= true;
        }
      });

      waitsFor(function(){
        return flag;
      }, "the output", 500);

      runs(function(){
        if (test.error) {
          expect(output).toEqual(test.error || {});
        } else {
          expect(output).toEqual(test.expected);
        }
        if(test.log) {
          expect(messageInLog(dust.logQueue, test.log, test.logLevel)).toEqual(true);
        }
      });
    };
  }

  describe ("Test the basic functionality of dust", function() {
    for (var index = 0; index < helpersTests.length; index++) {
      for (var i = 0; i < helpersTests[index].tests.length; i++) {
        var test = helpersTests[index].tests[i];
        it ("RENDER: " + test.message, render(test));
        it ("STREAM: " + test.message, stream(test));
        it ("PIPE: " + test.message, pipe(test));
      }
    }
  });
}));
