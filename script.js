function setMail() {

  var words = ["ai", "@gm", "", "l", ".", "snakenyancat", "to", ":", "mail", "com"];
  var indices = [8, 6, 7, 5, 1, 2, 0, 2, 3, 4, 9];
  var result = "";
  for (var i = 0; i < indices.length; i++) {
    
    result += words[indices[i]];
  }
  var mailElement = document.getElementById("mail");
  mailElement.href = result;
  
}