function arrayToQueryString(str, arr) {
  for (i = 0; i < arr.length; i++) {
    if (i < arr.length - 1) {
      str += `'${arr[i]}',`
    } else {
      str += `'${arr[i]}')`
    }
  }
  return str;
}