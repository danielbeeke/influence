function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
function intToRGB(i) {
  var c = (i & 16777215).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
}
export const stringToColor = (string) => {
  return intToRGB(hashCode(string));
};
