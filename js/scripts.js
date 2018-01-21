const jetpack = require('fs-jetpack');
const apiUrl = "https://api.cryptonator.com/api/ticker/"
var currency = 'usd';

function addNewCurrency(curr) {

  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", apiUrl + curr + "-" + currency, false);
  Httpreq.send(null);

  var json_obj = JSON.parse(Httpreq.responseText);
  var price = json_obj.ticker.price

  if (price > 0.01) {
    price = Math.round(json_obj.ticker.price * 100) / 100
  } else if (price < 0.01) {
    price = json_obj.ticker.price
  }

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.id = json_obj.ticker.base;

  displayCard.innerHTML = '<p>' + json_obj.ticker.base + ' £' + price + '</p>'

  if (json_obj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #EF5350;")
  } else {
    displayCard.setAttribute("style", "background-color: #69F0AE;")
  }

  document.getElementById('coin-container').appendChild(displayCard);

  saveCoin({
    "name": json_obj.ticker.base
  })

}


function getCoins() {

  var elm = document.getElementById('coin-container');
  while (elm.hasChildNodes()) {
    elm.removeChild(elm.lastChild);
  }

  const data = jetpack.read('db/coins.json', 'json');

  for (var i = 0; i < data.length; i++) {
    var obj = data[i];
    for (var key in obj) {
      var coinName = obj[key];
      reloadCoins(coinName)
    }
  }
}

function saveCoin(newCoin) {

  const data = jetpack.read('db/coins.json', 'json');
  var newData = []
  jetpack.remove('db/coins.json')

  for (var i = 0; i < data.length; i++) {
    var obj = data[i];
    for (var key in obj) {
      var coinName = obj[key];
      newData.push(obj);
    }
  }
  newData.push(newCoin);

  jetpack.write('db/coins.json', newData);

}


function reloadCoins(curr) {

  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", apiUrl + curr + "-" + currency, false);
  Httpreq.send(null);

  var json_obj = JSON.parse(Httpreq.responseText);
  var price = json_obj.ticker.price

  if (price > 0.01) {
    price = Math.round(json_obj.ticker.price * 100) / 100
  } else if (price < 0.01) {
    price = json_obj.ticker.price
  }

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.id = json_obj.ticker.base;

  displayCard.innerHTML = '<p>' + json_obj.ticker.base + ' £' + price + '</p>'

  if (json_obj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #EF5350;")
  } else {
    displayCard.setAttribute("style", "background-color: #69F0AE;")
  }

  document.getElementById('coin-container').appendChild(displayCard);
}
