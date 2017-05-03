var request = require('request');
request.get('http://localhost:4567/api/category/27/arma-iii',function(error, response, body){
  var category = JSON.parse(body)
  // category.topics = category.topics.reverse()
  console.log(JSON.stringify(category))
})
