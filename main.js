function substringify(lengths, string) {
  var i = 0;

  return lengths.map(function(len) {
    var substring = string.substr(i, len);
    i += len;
    return substring;
  });
}

function tryPossibleConfigurations(coefficients, patternLength, dataLength, func) {
  function weightedAdd(accum, cur, i) {
    return accum + cur * lengths[i];
  }
  var lengths = [];
  var totalDepth = coefficients.length;

  return (function level(depth) {
    var fullLength;
    var innermost = (depth === totalDepth - 1);
    var curCharCount = coefficients[depth];
    var _maxLen = (dataLength - patternLength + curCharCount) / curCharCount;
    for(var i = 1; i <= _maxLen; i++) {
      lengths[depth] = i;

      if (!innermost) {
        if (level(depth + 1)) {
          return true;
        }
      } else {
        fullLength = coefficients.reduce(weightedAdd, 0);

        if (fullLength < dataLength) continue;
        else if (fullLength === dataLength) {
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
  })(0);
}

function match(pattern, data) {
  var patternLength = pattern.length;
  var matches = {}, matchValues = {};
  var curPattern, curData;

  if (typeof pattern === 'string') {
    pattern = pattern.split('');
  }

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
  return true; // yay
}

function match2(pattern, data) {
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

  // find possible substring length groups
  return tryPossibleConfigurations(coefficients, patternLength, dataLength, function(lengths) {
    var substrings = splitPattern.map(function(char) {
      return lengths[ charIdx[char] ];
    });
    var splitData = substringify(substrings, data);
    return match(splitPattern, splitData);
  });
}
