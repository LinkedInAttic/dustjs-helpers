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

function filter(chunk, context, bodies, params, filter) {
  var params = params || {},
      actual,
      expected;
  if (params.key) {
    actual = helpers.tap(params.key, chunk, context);
  } else if (isSelect(context)) {
    actual = context.current().selectKey;
    if (context.current().isResolved) {
      filter = function() { return false; };
    }
  } else {
    throw "No key specified for filter and no key found in context from select statement";
  }
  expected = helpers.tap(params.value, chunk, context);
  if (filter(expected, coerce(actual, params.type, context))) {
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

// Walk up stack, find the requested path and return the value
function getPathUp (stack, down) {
  var stk = stack,
    key = down[0],
    value, i, len;
    // Walk the stack up looking for the path
  while (stk) {
    if (stk.isObject) {
      if (!(stk.head[key] === undefined)) {
        // found a possible start to down path, follow it and see if rest matches
        len = down.length;
        hstk = stk.head[key];
        // Check that each level down has a match starting with 2nd elt. First already matched.
        i = 1;
        while(hstk && i < len) {
          hstk = hstk[down[i]];
          i++;
        }
        // If it matched all the way down, return hit
       if (hstk) {
          return hstk;
        }
      }
    } else {
      if (stk.tail === 'undefined') {
        return '';
      }
    }
    // Climb up another stack level
    stk = stk.tail;
  }
  return '';
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
 * access helper to access path value up the context stack.
 * @param key specifies path to dump.
 * key values will normally be paths that are up the stack. However,
 * paths at the current context will work, simple key names will work,
 * and things like ., .name, will work. There is no point using this
 * helper for simple keys and current context references but they do
 * work to avoid surprise for the user.
 * In addition to pathed names, it handles references containing subscripts.
 * Note that it does not support $idx, $len. This could be done but is a
 * non-trivial amount of work and does not really relate to normal usage
 * of this helper. It will be documented as a restriction.
 */
  access: function (chk, ctx, bodies, params) {
    var key = dust.helpers.tap(params.key, chk, ctx),
      nosubs = key.replace(']', ''),
      parts, val;
    nosubs =  nosubs.replace('[','.');
    // Special case .xxxx which will not be a path up
    if (nosubs.charAt(0) === '.') {
      nosubs = nosubs.substr(1);
    }
    parts = nosubs.split('.');
    // Finish special case of .xxx forms to give same result as {.xxx}
    if (key.charAt(0) === '.') {
      if (key === '.') {
        parts =[];
      }
      val = ctx.getPath(true,  parts);
      return chk.write(val);
    }
    // If only one name in key, treat same as {xxx} reference
    if (parts.length === 1) {
      val = ctx.get(key);
      if ( typeof val === 'undefined') {
        return chk;
      }
      return chk.write(ctx.get(key));
    }
    // See if findable in current context
    val = ctx.getPath(false, parts);
    if (val) {
      return chk.write(val);
     }
    //Look for it up the stack
    val = getPathUp(ctx.stack, parts);
    return chk.write(val);
},
 
  /**
   * contextDump helper
   * @param key specifies how much to dump. 
   * "current" dumps current context. "full" dumps the full context stack.
   * @param to specifies where to write dump output. 
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
      cond = this.tap(cond, chunk, context);
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
   * @param key is the value to perform math against
   * @param eq is the value to test for equality with key
   * @param method is the math method we will employ
   * in the absence of an equality test
   * @param operand is the second value needed for
   * operations like mod, add, subtract, etc.
   */
  "math": function ( chunk, context, bodies, params ) {
    //make sure we have key and eq or method params before continuing
    if( params && params.key && (params.eq ||  params.method) ){
      var key  = params.key;
      key  = this.tap(key, chunk, context);
      if (params.eq) {
        var eq = params.eq;
        eq = this.tap(eq, chunk, context);
        return chunk.write(key === eq);
      }
      //we are going to operate with math methods if not equals
      else {
        var method = params.method;
        var operand = params.operand || null;
        var operError = function(){_console.log("operand is required for this math method")};
        var returnExpression = function(exp){chunk.write( exp )};
        if (operand) {
          operand = this.tap(operand, chunk, context);
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
    }
    // no key parameter and no method or eq passed
    else {
      _console.log( "Key is a required parameter along with eq or method/operand!" );
    }
    return chunk;
  },
   /**
   select/eq/lt/lte/gt/gte/default helper
   @param key, either a string literal value or a dust reference
                a string literal value, is enclosed in double quotes, e.g. key="foo"
                a dust reference may or may not be enclosed in double quotes, e.g. key="{val}" and key=val are both valid
   @param type (optiona), supported types are  number, boolean, string, date, context, defaults to string
   **/
  select: function(chunk, context, bodies, params) {
    if( params && typeof(params.key) !== "undefined"){
      // returns given input as output, if the input is not a dust reference, else does a context lookup
      var key = this.tap(params.key, chunk, context);
      return chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: key }));
    }
    // no key
    else {
      _console.log( "No key given in the select helper!" );
    }
    return chunk;
  },

  eq: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual === expected; });
  },

  lt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual < expected; });
  },

  lte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual <= expected; });
  },

  gt: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual > expected; });
  },

  gte: function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return actual >= expected; });
  },

  "default": function(chunk, context, bodies, params) {
    return filter(chunk, context, bodies, params, function(expected, actual) { return true; });
  },
  "size": function( chunk, context, bodies, params ) {
    var subject = params.subject;
    var value   = 0;
    if (!subject) { //undefined, "", 0
      value = 0;
    }
    else if(dust.isArray(subject)) { //array
      value = subject.length;
    }
    else if (!isNaN(subject)) { //numeric values
      value = subject;
    }
    else if (Object(subject) === subject) { //object test
      var nr = 0;
      for(var k in subject)
        if(Object.hasOwnProperty.call(subject,k)) nr++;
          value = nr;
    } else {
      value = (subject + '').length; //any other value (strings etc.)
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
