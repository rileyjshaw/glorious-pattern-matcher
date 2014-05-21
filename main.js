var glorious = (function() {
  var exports = {};

  // takes a character pattern and a list of words
  // and returns true if they follow the same pattern
  exports.match = function(pattern, data) {
    var patternLength = pattern.length;
    var matches = {}, matchValues = {};
    var curPattern, curData;

    // handles arrays and strings
    if (typeof pattern === 'string') {
      pattern = pattern.split('');
    }

    // handles arrays and space-delimited strings
    if (typeof data === 'string') {
      data = data.split(' ');
    }

    if (patternLength !== data.length) {
      return false;
    }

    for (var i = 0; i < patternLength; i++) {
      curPattern = pattern[i];
      curData = data[i];

      if (!matches[curPattern]) {
        if (!matchValues[curData]) {
          matches[curPattern] = curData;
          matchValues[curData] = true;
        } else return false;
      } else { // already recorded
        if (matches[curPattern] !== curData) {
          return false;
        }
      }
    }
    return true;
  };


  // takes a string and returns an array of substrings.
  // splits are determined by the 'lengths' array
  function substringify(lengths, string) {
    var i = 0;

    return lengths.map(function(len) {
      var substring = string.substr(i, len);
      i += len;
      return substring;
    });
  }


  // finds likely substrings from non-delimited data
  // and runs them through the original match()
  function tryPossibleConfigurations(coefficients, patternLength, dataLength, func) {
    function weightedAdd(accum, cur, i) {
      return accum + cur * lengths[i];
    }
    // lengths holds the substring lengths represented by each character
    var lengths = [];
    var totalDepth = coefficients.length;

    // each level of the recursive call represents a unique
    // character in the pattern (in the order that they first appear)
    function loopThroughChars(depth) {
      var isInnermost = (depth === totalDepth - 1);
      var curCharCount = coefficients[depth];
      var derivedDataLength;
      // maxCharLength is the max substring length that this character can represent
      var maxCharLength = (dataLength - patternLength + curCharCount) / curCharCount;

      for(var i = 1; i <= maxCharLength; i++) {
        lengths[depth] = i;

        if (!isInnermost) {
          if (loopThroughChars(depth + 1)) {
            return true; // allows us to bubble up a true return
          }
        } else {
          derivedDataLength = coefficients.reduce(weightedAdd, 0);

          if (derivedDataLength < dataLength) continue;
          else if (derivedDataLength === dataLength) {
            if (func(lengths)) {
              return true; // break out of all loops (bubbles up)
            }
          }
          else {
            return false; // breaks out of this loop (no bubbling)
          }
        }
      }

      return false;
    }

    return loopThroughChars(0);
  }


  exports.megamatch = function(pattern, data) {
    var splitPattern = pattern.split('');
    var patternLength = splitPattern.length;
    var dataLength = data.length;
    // coefficients stores the count of each character
    // charIdx maps a character to its index in coefficients
    var coefficients = [], charIdx = {};

    // populate coefficients and charIdx
    splitPattern.forEach(function(char) {
      if (charIdx[char] === undefined) {
        charIdx[char] = coefficients.push(1) - 1;
      } else ++coefficients[ charIdx[char] ];
    });

    function splitAndMatch(lengths) {
      var substrings = splitPattern.map(function(char) {
        return lengths[ charIdx[char] ];
      });
      var splitData = substringify(substrings, data);
      return exports.match(splitPattern, splitData);
    }

    return tryPossibleConfigurations(coefficients, patternLength, dataLength, splitAndMatch);
  };


  return exports;
})();
