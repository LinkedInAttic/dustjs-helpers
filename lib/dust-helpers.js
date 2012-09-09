(function(){

if (typeof exports !== "undefined")
{
  dust = require("dustjs-linkedin");
}

/* make a safe version of console if it is not available
 * currently supporting:
 *   _console.log
 * */
var _console = (typeof console !== 'undefined')? console: {
  log: function(){
     /* a noop*/
   }
};

function isSelect(context) {
  var value = context.current();
  return typeof value === "object" && value.isSelect === true;
}

// Display functions as strings for contextDump
function jsonFilter(key, value) {
  if (typeof value === "function") {
    return value.toString();
  }
  return value;   
}

// 
function filter(chunk, context, bodies, params, filter) {
  var params = params || {},
      actualKey,
      expectedValue;
  if (params.key) {
    actualKey = dust.helpers.tap(params.key, chunk, context);
  } else if (isSelect(context)) {
    actualKey = context.current().selectKey;
    if (context.current().isResolved) {
      filter = function() { return false; };
    }
  } else {
    throw "No key specified for filter and no key found in context from select statement";
  }
  expectedValue = dust.helpers.tap(params.value, chunk, context);
  if (filter(expectedValue, coerce(actualKey, params.type, context))) {
    if (isSelect(context)) {
      context.current().isResolved = true;
    }
    return chunk.render(bodies.block, context);
  } else if (bodies['else']) {
    return chunk.render(bodies['else'], context);
  }

  return chunk.write('');
}

function coerce (value, type, context) {
  if (value) {
    switch (type || typeof(value)) {
      case 'number': return +value;
      case 'string': return String(value);
      case 'boolean': return Boolean(value);
      case 'date': return new Date(value);
      case 'context': return context.get(value);
    }
  }

  return value;
}

var helpers = {
  
  sep: function(chunk, context, bodies) {
    if (context.stack.index === context.stack.of - 1) {
      return chunk;
    }
    return bodies.block(chunk, context);
  },

  idx: function(chunk, context, bodies) {
    return bodies.block(chunk, context.push(context.stack.index));
  },
  
  /**
   * contextDump helper
   * @param key, specifies how much to dump. 
   * "current" dumps current context. "full" dumps the full context stack.
   * @param to, specifies where to write dump output. 
   * Values can be "console" or "output". Default is output.
   */
  contextDump: function(chunk, context, bodies, params) {
    var p = params || {},
      to = p.to || 'output',
      key = p.key || 'current',
      dump;
    to = dust.helpers.tap(to, chunk, context),
    key = dust.helpers.tap(key, chunk, context);
    if (key === 'full') {
      dump = JSON.stringify(context.stack, jsonFilter, 2);
    }
    else {
      dump = JSON.stringify(context.stack.head, jsonFilter, 2);
    }
    if (to === 'console') {
      _console.log(dump);
      return chunk;
    }
    else {
      return chunk.write(dump);
    }
  },
  
  // Utility helping to resolve dust references in the given chunk
  tap: function( input, chunk, context ){
    // return given input if there is no dust reference to resolve
    var output = input;
    // dust compiles a string to function, if there are references
    if( typeof input === "function"){
      if( ( typeof input.isReference !== "undefined" ) && ( input.isReference === true ) ){ // just a plain function, not a dust `body` function
        output = input();
      } else {
        output = '';
        chunk.tap(function(data){
          output += data;
          return '';
        }).render(input, context).untap();
        if( output === '' ){
          output = false;
        }
      }
    }
    return output;
  },

  /**
  if helper
   @param cond, either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. cond="2>3"
                a dust reference is also enclosed in double quotes, e.g. cond="'{val}'' > 3"
    cond argument should evaluate to a valid javascript expression
   **/

  "if": function( chunk, context, bodies, params ){
    if( params && params.cond ){
      var cond = params.cond;
      cond = dust.helpers.tap(cond, chunk, context);
      // eval expressions with given dust references
      if( eval( cond ) ){
       return chunk.render( bodies.block, context );
      }
      if( bodies['else'] ){
       return chunk.render( bodies['else'], context );
      }
    }
    // no condition
    else {
      _console.log( "No condition given in the if helper!" );
    }
    return chunk;
  },
  
  /**
   * math helper
   * @param key, is the value to perform math against
   * @param method ,is the math method 
   * @param operand, is the second value needed for operations like mod, add, subtract, etc.
   */
  "math": function ( chunk, context, bodies, params ) {
    //make sure we have key and eq or method params before continuing
    if( params && typeof params.key !== "undefined" && params.method ){
      var key  = params.key;
      key  = dust.helpers.tap(key, chunk, context);
        var method = params.method;
        var operand = params.operand || null;
        var operError = function(){_console.log("operand is required for this math method")};
        var returnExpression = function(exp){chunk.write( exp )};
        if (operand) {
          operand = dust.helpers.tap(operand, chunk, context);
        }
        switch(method) {
            case "mod":
              (operand) ? returnExpression( parseFloat(key) % parseFloat(operand) ) : operError();
              break;
            case "add":
              (operand) ? returnExpression( parseFloat(key) + parseFloat(operand) ) : operError();
              break;
            case "subtract":
              (operand) ? returnExpression( parseFloat(key) - parseFloat(operand) ) : operError();
              break;
            case "multiply":
              (operand) ? returnExpression( parseFloat(key) * parseFloat(operand) ) : operError();
              break;
            case "divide":
              (operand) ? returnExpression( parseFloat(key) / parseFloat(operand) ) : operError();
              break;
            case "ceil":
              returnExpression( Math.ceil(parseFloat(key)) );
              break;
            case "floor":
              returnExpression( Math.floor(parseFloat(key)) );
              break;
            case "abs":
              returnExpression( Math.abs(parseFloat(key)) );
              break;
            default:
              _console.log( "method passed is not supported" );
        }
    }
    // no key parameter and no method 
    else {
      _console.log( "Key is a required parameter along with method/operand!" );
    }
    return chunk;
  },
   /**
   select helper works with one of the eq/gt/gte/lt/lte/default providing the functionality
   of branching conditions
   @param key,  ( required ) either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   **/
  select: function(chunk, context, bodies, params) {
    if( params && typeof params.key !== "undefined"){
      // returns given input as output, if the input is not a dust reference, else does a context lookup
      var key = dust.helpers.tap(params.key, chunk, context);
      return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: key }));
    }
    // no key
    else {
      _console.log( "No key given in the select helper!" );
    }
    return chunk;
  },

  /**
   eq helper, compares the given key is same as the expected value
   It can be used standalone or in conjucntion with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric

   **/
  eq: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual === expected; });
  },

  /**
   lt helper , compares the given key is less than the expected value
   It can be used standalone or in conjucntion with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone  or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric

   **/
  lt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual < expected; });
  },

  /**
   lte helper , compares the given key is less or equal to the expected value
   It can be used standalone or in conjucntion with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
  **/
  lte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual <= expected; });
  },


  /**
   gt helper , compares the given key is greater than the expected value
   It can be used standalone or in conjucntion with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone  or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric

   **/
  gt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual > expected; });
  },

 /**
   gt helper , compares the given key is greater than or equal to the expected value
   It can be used standalone or in conjucntion with select for multiple branching
   @param key,  The actual key to be compared ( optional when helper used in conjunction with select)
                either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param value, The expected value to compare to, when helper is used standalone or in conjunction with select
   @param type (optional), supported types are  number, boolean, string, date, context, defaults to string
   Note : use type="number" when comparing numeric
  **/
  gte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual >= expected; });
  },

  // to be used in conjunction with the select helper
  // TODO: fix the helper to throw error when used standalone
  "default": function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return true; });
  },

  /**
  * Size helper prints the size of the given key
  * @param key, the element whose size is returned
  */
  "size": function( chunk, context, bodies, params ) {
    var key = params.key;
    var value   = 0;
    if (!key) { //undefined, "", 0
      value = 0;
    }
    else if(dust.isArray(key)) { //array
      value = key.length;
    }
    else if (!isNaN(key)) { //numeric values
      value = key;
    }
    else if (Object(key) === key) { //object test
      var nr = 0;
      for(var k in key)
        if(Object.hasOwnProperty.call(key,k)) nr++;
          value = nr;
    } else {
      value = (key + '').length; //any other value (strings etc.)
    }
    return chunk.write(value);
  }
};

dust.helpers = helpers;

if (typeof exports !== "undefined")
{
  module.exports = dust;
}
})();
