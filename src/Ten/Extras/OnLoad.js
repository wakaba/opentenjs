
if (self.TenExtrasOnLoadFunctions) {
  for (var i = 0; i < self.TenExtrasOnLoadFunctions.length; i++) {
    self.TenExtrasOnLoadFunctions[i] ();
  }
  self.TenExtrasOnLoadFunctions = [];
}
