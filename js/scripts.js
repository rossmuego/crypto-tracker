const jetpack = require('fs-jetpack');
const apiUrl = "https://api.cryptonator.com/api/ticker/"
var currency = 'gbp';
var currencyCode = '£'

// setInterval(getCoins, 5000);


function updateCurrency() {
  var e = document.getElementById("currencyPicker");
  currency = e.options[e.selectedIndex].value;

  if (currency == 'gbp') {
    currencyCode = '£'
  } else if (currency == 'usd') {
    currencyCode = '$'
  } else if (currency == 'eur') {
    currencyCode = '€'
  }

  getCoins();
}

function addNewCurrency(curr) {

  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", apiUrl + curr + "-" + currency, false);
  Httpreq.send(null);

  var coinObj = JSON.parse(Httpreq.responseText);
  var price = coinObj.ticker.price

  if (price > 0.01) {
    price = Math.round(coinObj.ticker.price * 100) / 100
  } else if (price < 0.01) {
    price = coinObj.ticker.price
  }

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.id = coinObj.ticker.base;

  var priceChange = ""

  if (coinObj.ticker.change > 0) {
    priceChange = "+" + coinObj.ticker.change
  } else {
    priceChange = coinObj.ticker.change
  }

  displayCard.innerHTML = '<div class="coin-name" onclick="expandCard(this.parentNode.id)">' + coinObj.ticker.base + '</div><div class="coin-price"><div class="current-price">' + currencyCode + price + '</div><div class="price-change">' + priceChange + '</div></div>'

  if (coinObj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #EF5350;")
  } else {
    displayCard.setAttribute("style", "background-color: #69F0AE;")
  }

  document.getElementById('coin-container').appendChild(displayCard);

  saveCoin({
    "name": coinObj.ticker.base
  })

  document.getElementById('coin-code-input').value = "";

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

  var coinObj = JSON.parse(Httpreq.responseText);
  var price = coinObj.ticker.price


  if (price > 0.01) {
    price = Math.round(coinObj.ticker.price * 100) / 100
  } else if (price < 0.01) {
    price = Math.round(coinObj.ticker.price * 10000) / 10000
  }

  var priceChange = ""

  if (coinObj.ticker.change >= 0) {
    priceChange = "+" + coinObj.ticker.change
  } else {
    priceChange = coinObj.ticker.change
  }

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.id = coinObj.ticker.base;

  displayCard.innerHTML = '<div class="coin-name" onclick="expandCard(this.parentNode.id)">' + coinObj.ticker.base + '</div><div class="coin-price"><div class="current-price">' + currencyCode + price + '</div><div class="price-change">' + priceChange + '</div></div>'

  if (coinObj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #EF5350;")
  } else {
    displayCard.setAttribute("style", "background-color: #69F0AE;")
  }

  document.getElementById('coin-container').appendChild(displayCard);
}



function expandCard(clicked_id) {

  var divheight = document.getElementById(clicked_id).clientHeight

  if (divheight == 200) {
    document.getElementById(clicked_id).style.height = "100px";
    var remove = document.getElementById(clicked_id+"-extension")
    document.getElementById(clicked_id).removeChild(remove)
  } else if (divheight == 100) {
    document.getElementById(clicked_id).style.height = "200px";

    var extension = document.createElement('div')
    extension.className = 'extended-card';
    extension.id = clicked_id + "-extension"
    extension.innerHTML = '<button onclick="(removeCoin(this.parentNode.parentNode.id))">Delete</button>'
    document.getElementById(clicked_id).appendChild(extension)
  }
}


function removeCoin(clicked_id) {

  var newData = []

  const data = jetpack.read('db/coins.json', 'json');

  for (var i = 0; i < data.length; i++) {
    var obj = data[i];
    for (var key in obj) {
      var coinName = obj[key];
      if (coinName != clicked_id) {
        newData.push(obj);
      }
    }
  }

  document.getElementById(clicked_id).remove()
  jetpack.write('db/coins.json', newData);
}
