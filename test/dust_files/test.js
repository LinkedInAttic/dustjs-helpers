(function(){
	dust.register("select",body_0);
  function body_0(chk,ctx){
  	return chk.write("<select style=\"clear: both;width: 496px;\">").section(ctx.get("examples"),ctx,{"block":body_1},null).write("</select>");
  }
	function body_1(chk,ctx){
		return chk.write("<option ").reference(ctx.get("selected"),ctx,"h").write("value=\"").helper("idx",ctx,{"block":body_2},null).write("\">").reference(ctx.get("name"),ctx,"h").write("</option>");
	}
	function body_2(chk,ctx){
		return chk.reference(ctx.getPath(true,[]),ctx,"h");
	}
return body_0;})();
	
jsDump.parsers['function'] = function(fn) { return fn.toString();}

function renderDemo() {
	var tmpl = dust.cache["demo"],
	source = $('#input-context').val();
	$('#output-text').empty();
	if (tmpl && source) {
		setPending('#input-context');
		setPending('#output-text');
		try {
			eval("var context = " + source + ";");
			if (typeof context === 'function') {
				context = context();
			}
			dust.stream("demo", context).on('data', function(data) {
				$('#output-text').append(dust.escapeHtml(data));
			}).on('end', function() {
				setOkay('#input-context');
				setOkay('#output-text');
			}).on('error', function(err) {
				setError('#input-context', err);
			});
		} catch(err) {
			setError('#input-context', err);
		}
	}
}

function setOkay(sel) {
	$(sel).next()
	.removeClass('pending')
	.addClass('ok')
	.html('<i class="icon iconOk"></i> <span>Ready </span>');
}

function setPending(sel) {
	$(sel).next()
	.removeClass('ok')
	.removeClass('error')
	.addClass('pending')
	.html('<i class="icon"></i> <span>Pending </span>');
}

function setError(sel, err) {
	$(sel).next()
	.removeClass('pending')
	.addClass('error')
	.html('<i class="icon iconFail"></i> <span>' + err.toString() + '</span>');
}

function dump(obj) {
	return js_beautify(jsDump.parse(obj), { indent_size: 2 });
}

$(document).ready(function() {
  helpersTests.forEach(function(ex) {
  	if (ex.error) {
    	helpersTests.splice(helpersTests.indexOf(ex), 1);  
  	} else {
			dust.loadSource(dust.compile(ex.source, ex.name));
  	}
	});
    
  $('#tagline').empty().show().css({left: ($(window).width() * .02) + 165});
	dust.loadSource(dust.compile(helpersTests[0].source, "intro"));
	dust.stream("intro", helpersTests[0].context).on('data', function(data) {
	  $('#tagline').append(data);
	}).on('end', function() {
	  $('#tagline').delay(500).fadeOut('slow');
	});
	
	dust.render("select", {
	  	examples: helpersTests,
	  	selected: function(chk, ctx) {
	    	if (ctx.current().name === "replace") return " selected ";
	  	}
	 	}, function(err, output) { $('#select').html(output);
	});

	$('#select > select').change(function() {
		var idx = $(this).val();
		$('#input-source').val(helpersTests[idx].source);
		$('#input-context').val(dump(helpersTests[idx].context));
		$('#input-source').change();
	});

	$('#input-source').change(function() {
		setPending('#input-source');
		try {
			var compiled = dust.compile($(this).val(), "demo");
			dust.loadSource(compiled);
			$('#output-js').text(js_beautify(compiled, { indent_size: 2 }));
			setOkay('#input-source');
		} catch(err) {
			setError('#input-source', err); return;
		}
	renderDemo();
	});

	$('#input-context').change(renderDemo);
	$('#select > select').change();
});