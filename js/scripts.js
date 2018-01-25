const jetpack = require('fs-jetpack');
const apiUrl = "https://api.cryptonator.com/api/ticker/"
var currency = 'gbp';
var currencyCode = '£'
const notifier = require('node-notifier');
var alertTime = 1800000;

setInterval(getCoins, 60000);


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

function updateTime() {
  var e = document.getElementById("setAlertTime")
  timeframe = e.options[e.selectedIndex].value

  if (timeframe == '15') {
    alertTime = 1800000
  } else if (timeframe == '30') {
    alertTime = 3600000
  } else if (timeframe == '45') {
    alertTime = 5400000
  } else if (timeframe == '60') {
    alertTime = 7200000
  }
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

  document.getElementById('coin-code-input').value = ""

}


function getCoins() {

  console.log(__dirname)
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

  if (coinObj.ticker.change > 0) {
    pushNotification("Increase", coinObj.ticker.base, coinObj.ticker.change)
    priceChange = "+" + coinObj.ticker.change
  } else {
    pushNotification("Decrease", coinObj.ticker.base, coinObj.ticker.change)
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
    document.getElementById(clicked_id + "-extended").remove()
  } else if (divheight == 100) {
    var displayCard = document.createElement('div')
    displayCard.id = clicked_id + "-extended"
    displayCard.className = 'coin-extended';
    displayCard.innerHTML = '<button onclick="removeCoin(this.parentNode.parentNode.id)">Remove</button><input id="alertValue" type="text" /><select id="setAlertPicker"><option value="Increase">Increase</option> <option value ="Decrease" >Decrease</option></select><button onclick="setAlert(this.parentNode.parentNode.id)">Set Alert</button><button onclick="removeAlert(this.parentNode.parentNode.id)">Delete</button>'
    document.getElementById(clicked_id).appendChild(displayCard);

    document.getElementById(clicked_id).style.height = "200px";
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

function pushNotification(direction, coin, change) {

  const data = jetpack.read('db/alerts.json', 'json');
  var currentTime = new Date()

  for (var i = 0; i < data.length; i++) {
    var current = data[i];

    if (current.name == coin) {
      if ((currentTime.getTime() - current.lastAlert) > alertTime) {
        current.lastAlert = new Date().getTime()
        if (current.type == "Increase") {
          if (change > current.value) {
            notifier.notify({
                title: 'Price Increase!',
                message: coin + " has increaded in price by " + change + " in the last hour!",
              },
              function(err, response) {
                // Response is response from notification
              }
            );
          }
        } else if (current.type == "Decrease") {
          if ((change * -1) > current.value) {
            notifier.notify({
                title: 'Price Decrease!',
                message: coin + " has decreased in price by " + (change * -1) + " in the last hour!",
              },
              function(err, response) {
                // Response is response from notification
              }
            );
          }
        }
      }
    }
  }
}

function setAlert(clicked_id) {

  var namecoin = document.getElementById(clicked_id).id;
  var amount = document.getElementById('alertValue').value;
  var direction = document.getElementById('setAlertPicker').value;
  var time = new Date()

  var newAlert = {
    name: namecoin,
    type: direction,
    value: parseInt(amount),
    lastAlert: time.getTime()
  }

  const data = jetpack.read('db/alerts.json', 'json')
  data.push(newAlert)

  jetpack.write('db/alerts.json', data);

}

function removeAlert(clicked_id) {

  var newData = []

  const data = jetpack.read('db/alerts.json', 'json');

  for (var i = 0; i < data.length; i++) {
    var obj = data[i];

    var coinName = obj.name;
    if (coinName != clicked_id) {
      newData.push(obj);
    }
  }
  jetpack.write('db/alerts.json', newData);

}
