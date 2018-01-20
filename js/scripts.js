const apiUrl = "https://api.cryptonator.com/api/ticker/"

function addNewCurrency(curr) {

  var Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET", apiUrl + curr + "-gbp", false);
  Httpreq.send(null);

  var json_obj = JSON.parse(Httpreq.responseText);

  var displayCard = document.createElement('div')
  displayCard.className = 'coinCard';
  displayCard.innerHTML = '<p>' + json_obj.ticker.base + ' ' + json_obj.ticker.price + '</p>'

  if (json_obj.ticker.change < 0) {
    displayCard.setAttribute("style", "background-color: #F44336;")
  } else {
    displayCard.setAttribute("style", "background-color: #4CAF50;")
  }

  document.getElementById('coin-container').appendChild(displayCard);

}
