const jetpack = require('fs-jetpack');
const apiUrl = "https://api.cryptonator.com/api/ticker/"

function addNewCurrency(curr) {

  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", apiUrl + curr + "-gbp", false);
  Httpreq.send(null);

  var json_obj = JSON.parse(Httpreq.responseText);
  var price = json_obj.ticker.price

  if (price > 0.01) {
    price = Math.round(json_obj.ticker.price * 100) / 100
  }
  else if(price < 0.01) {
    price = json_obj.ticker.price
  }

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.innerHTML = '<p>' + json_obj.ticker.base + ' £' + price + '</p>'

  if (json_obj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #F44336;")
  } else {
    displayCard.setAttribute("style", "background-color: #4CAF50;")
  }

  document.getElementById('coin-container').appendChild(displayCard);

}


function getCoins() {

  const data = jetpack.read('db/coins.json', 'json');

  for (var i = 0; i < data.length; i++) {
    var obj = data[i];
    for (var key in obj) {
      var coinName = obj[key];
      addNewCurrency(coinName)

    }
  }

}
