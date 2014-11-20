## Change Log

### upcoming (2014/11/20 00:55 +00:00)
- [#102](https://github.com/linkedin/dustjs-helpers/pull/102) Deprecate {@if} and {@idx} helpers (@sethkinast)
- [#105](https://github.com/linkedin/dustjs-helpers/pull/105) Comparison helpers should still execute when their key parameter is set, but it resolves to undefined. (@sethkinast)
- [#104](https://github.com/linkedin/dustjs-helpers/pull/104) Coerce falsy values when a type is specified by a comparison helper. (@sethkinast)
- [#101](https://github.com/linkedin/dustjs-helpers/pull/101) Update README and add CHANGELOG (@sethkinast)

### v1.4.0 (2014/11/04 22:03 +00:00)
- [#94](https://github.com/linkedin/dustjs-helpers/pull/94) Encode opening brackets in contextDump helper (@prashn64)

### v1.3.0 (2014/09/09 23:36 +00:00)
- [#89](https://github.com/linkedin/dustjs-helpers/pull/89) use peerDependencies instead of dependencies for dustjs-linkedin module (@qraynaud)
- [#88](https://github.com/linkedin/dustjs-helpers/pull/88) switched console.log for dust.log (@zaphod1984)
- [#73](https://github.com/linkedin/dustjs-helpers/pull/73) Extend the dust.helpers object instead of  clobbering. (@kate2753)
- [#77](https://github.com/linkedin/dustjs-helpers/pull/77) Fix contextDump test to align with dustjs-linkedin 2.3.x compiler changes (@prashn64)
- [#69](https://github.com/linkedin/dustjs-helpers/pull/69) Allow debugging unminified source code. Update README.md to explain these changes. (@kate2753)

### v1.2.0 (2014/02/20 23:55 +00:00)
- [#71](https://github.com/linkedin/dustjs-helpers/pull/71) dustjs-linkedin#423 fix dust.helpers.tap to work with dust body functions. Fix tap helper to not rely on isFunction flag set in dust core. Using helper.tap on Context functions (function in your JSON context) will now get chunk and context as arguments. (@kate2753)
- [#65](https://github.com/linkedin/dustjs-helpers/pull/65) Fix formatting in README.md (@kate2753)
- [#62](https://github.com/linkedin/dustjs-helpers/pull/62) Initial step to switch to grunt build process. (@kate2753)
- [#63](https://github.com/linkedin/dustjs-helpers/pull/63) semicolons (@mouyang)

### v1.1.2 (2013/12/06 23:49 +00:00)
- [#61](https://github.com/linkedin/dustjs-helpers/pull/61) Make @contextDump output consistent across different environments (@kate2753)
- [#60](https://github.com/linkedin/dustjs-helpers/pull/60) Fix spec runner (@kate2753)
- [#56](https://github.com/linkedin/dustjs-helpers/pull/56) Updates to make the client tests pass. (@smfoote)
- [#52](https://github.com/linkedin/dustjs-helpers/pull/52) Included ne as one of the supported helper in select's comment (@thefourtheye)

### v1.1.1 (2013/02/08 19:37 +00:00)
- [#28](https://github.com/linkedin/dustjs-helpers/pull/28) add idx and sep helper test cases (@vybs)
- [#27](https://github.com/linkedin/dustjs-helpers/pull/27) test page refactored. GH-26 (@jairodemorais)
- [#25](https://github.com/linkedin/dustjs-helpers/pull/25) Add unit tests for lt helper with variables (@vybs)
- [#24](https://github.com/linkedin/dustjs-helpers/pull/24) Fix the size helper for \n\\t (@vybs)
- [#18](https://github.com/linkedin/dustjs-helpers/pull/18) Removing swap file from some ancient editor. Updating .gitignore accordi... (@smfoote)
- [#14](https://github.com/linkedin/dustjs-helpers/pull/14) Add @ne helper as the complement to the @eq helper (@smfoote)

### v1.0.1 (2012/09/13 07:40 +00:00)
- [#12](https://github.com/linkedin/dustjs-helpers/pull/12) Math helper with Body issue #120 (@jimmyhchan)
- [#6](https://github.com/linkedin/dustjs-helpers/pull/6) Minor README markdown styling fix (@zzen)
- [#5](https://github.com/linkedin/dustjs-helpers/pull/5) Updated README to install node dependencies properly (@zzen)
- [#2](https://github.com/linkedin/dustjs-helpers/pull/2) Extend contextDump helper (@rragan)