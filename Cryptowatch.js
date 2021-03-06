window.onload = function() {
const top100 = [];
fetchAllCardsHome();
search();

function search() {
  $('#searchBtn').click(e => {
    e.preventDefault();
    let searchedCoin = $('#search').val().toLowerCase();
    let symbolArr = top100.map(coin => coin.symbol);
    let nameArr = top100.map(coin => coin.id);
    if(symbolArr.filter(coin => coin === searchedCoin)[0] === searchedCoin) {
      searchedIndex = symbolArr.indexOf(searchedCoin)
      const cardsContainer = `<div id="cardsContainer"></div>`
      $('.row').empty().append(cardsContainer);
      createCoinCard(top100[searchedIndex])
      $('.toggle_child').bootstrapToggle( { 
        on: 'Saved',
        off: 'Not Saved'
      })
      toggler(checkedArr.map(coin => coin.id)); 
      coinInfo(nameArr[searchedIndex]);
      $('.card').attr('class','card col-xs-12');
      checkBoxLimiter();
      $('#search').val('')
      }
  });
}
$('#home,#logo').click(e => {
  $('.row').empty();
  fetchAllCardsHome()
})
$('#reports').click(e => {
  const chartDiv = `<div id="chartContainer" class="col-xs-10" style="height: 370px; margin-left: 20px"></div>`
  $('.row').empty().append(chartDiv);
  drawGraph();
})
$('#about').click(e => {
  showAbout();
})

function fetchAllCardsHome() {
  $('.row').append(loader())
  $.get('https://api.coingecko.com/api/v3/coins/list').then(data => {
    const cardsContainer = `<div id="cardsContainer"></div>`
    $('.row').empty().append(cardsContainer);
    for(let i = 170; i < 270; i++) {
      createCoinCard(data[i])
      top100.push({id: data[i].id, symbol: data[i].symbol})
    }  
    $(':button').click(e => {
      const myCoin = e.target.parentElement.id;
      coinInfo(myCoin);
    })
    checkBoxLimiter();
    toggler(checkedArr.map(coin => coin.id));
  })
}

let checkedArr = [];
function checkBoxLimiter() {
  const limit = 10;
  $('input.toggle_child').on('change', e => {
    const coinName = e.target.parentElement.parentElement.id.substring(0,e.target.parentElement.parentElement.id.indexOf('-'))
    const coinSymbol = e.target.parentElement.parentElement.id.substring(e.target.parentElement.parentElement.id.indexOf('-')+1,e.target.parentElement.parentElement.id.lastIndexOf('-'))
    if(e.target.checked === false) { 
     checkedArr = checkedArr.filter(coin => coin.id !== coinName)
    }
   if(e.target.checked === true) {
     const myCoin = {}
     myCoin.id = coinName;
     myCoin.symbol = coinSymbol;
     checkedArr.push(myCoin);
       if(checkedArr.length >= limit + 2){
         createModal(checkedArr.map(coin => coin.id)) 
         $('#myModal').modal('show');
       }
   }
 });
}
//loading wheel
function loader() {
  const spinDiv = `<div class="sk-cube-grid">
                      <div class="sk-cube sk-cube1"></div>
                      <div class="sk-cube sk-cube2"></div>
                      <div class="sk-cube sk-cube3"></div>
                      <div class="sk-cube sk-cube4"></div>
                      <div class="sk-cube sk-cube5"></div>
                      <div class="sk-cube sk-cube6"></div>
      
                   </div>`
  return spinDiv;
}

function coinInfo(coinName) {
  const d = new Date();
  const n = d.getTime(); //get time in milliseconds
  if(window.localStorage.getItem(coinName) === null || n - JSON.parse(window.localStorage.getItem(coinName)).minutes > 120000) {
    $.get('https://api.coingecko.com/api/v3/coins/' + coinName).then(coin => {
      $('.sk-cube-grid').remove();
      infoGet(coin.market_data.current_price, coin.id, coin.image.small)
      const coinInfo = {image: coin.image.small,
                        usd: coin.market_data.current_price.usd,
                        eur: coin.market_data.current_price.eur,
                        ils: coin.market_data.current_price.ils,
                        minutes:n}
      window.localStorage.setItem(coin.id,JSON.stringify(coinInfo));
  });
  }
  //fetch from localStorage if 2 minuted havent passed (120000 ms)
  else {
    $('.sk-cube-grid').remove();
    const myCoin = JSON.parse(window.localStorage.getItem(coinName));
    infoGet(myCoin,coinName,myCoin.image);
  }
}
//create the MoreInfo
function infoGet(coinObj,coinName,coinImg) {
  let infoDiv = `<div class='more-info'>
                   <img class="pic" src=${coinImg}></img>
                   <p><h4>Current Prices:</h4></p>
                   <ul>
                    <li>${coinObj.usd} $</li>
                    <li>${coinObj.eur} \u20AC</li>
                    <li>${coinObj.ils} \u20AA</li>
                   </ul>
                </div>
                 `;
  $('#info-' + coinName).empty().append(infoDiv).css({'marginTop':'15px'});
  $('.pic').css({'float':'right','marginTop':'20px'})
}
// function for building home cards
function createCoinCard(coin) {
  const cardDiv = `<div id=${coin.id} class="card col-lg-2 col-sm-11">
                  <div class="switch" name=${coin.id} id="${coin.id}-${coin.symbol}-switch">
                      <input class="toggle_child" id="${coin.id}-toggle" type="checkbox">
                  </div>
                    <div class="card-header">${coin.symbol.toUpperCase()}</div>
                    <div class="card-body" id=${coin.id}>
                      <h5 class="card-title">${coin.id}</h5>
                      <button id="moreInfo-${coin.id}" data-toggle="collapse" data-target="#info-${coin.id}" type="button" aria-expanded="false" class="btn btn-info">More Info</button>
                      <div id="info-${coin.id}" class="collapse">
                      </div>
                    </div>
                  </div>`
  $('.toggle_child').bootstrapToggle( { //define bootstrap toggle options
    on: 'Saved',
    off: 'Not Saved'
  })
  $('#cardsContainer').append(cardDiv);
}
//function to toggle all switches according to the saved array
function toggler(arr) {
  $('input.toggle_child').bootstrapToggle('off') // denies the switch animation
    for(let i = 0; i < $('input.toggle_child').length; i++) {
      let switchId = $('.toggle_child')[i].parentElement.parentElement.id.substring(0,$('.toggle_child')[i].parentElement.parentElement.id.indexOf('-')); //get coin name from id
      if(arr.filter(coin => coin === switchId)[0] === switchId) { //check if card id is in saved array  && $('input.toggle_child').length > 1
        $('#'+switchId+'-toggle').bootstrapToggle('on') // denies the switch animation
        $('#'+switchId+'-toggle').checked = true; // chec
      }
      else {
        $('.toggle_child')[i].checked = false; // check off
      }
    }
}

function createModal(arr) { //gets array to show selected coins
  $('#modalContainer').remove();
  const modalContainer = `<div id="modalContainer"></div>`
  $('body').append(modalContainer);
  const myModal = `
                  <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="basicModal" aria-hidden="true">
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h4 class="modal-title" id="myModalLabel">Saved Coins</h4>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">X</span>
                          </button>
                        </div>
                        <div class="modal-body">
                        <p>You can save up to 5 different coins, please uncheck one,
                        or press Cancel.</p>
                        <h3><input type="checkbox" class="close" name="coin1" value=${arr[0]} checked>${arr[0]}</h3>
                        <h3><input type="checkbox" class="close" name="coin2" value=${arr[1]} checked>${arr[1]}</h3>
                        <h3><input type="checkbox" class="close" name="coin3" value=${arr[2]} checked>${arr[2]}</h3>
                        <h3><input type="checkbox" class="close" name="coin4" value=${arr[3]} checked>${arr[3]}</h3>
                        <h3><input type="checkbox" class="close" name="coin5" value=${arr[4]} checked>${arr[4]}</h3>
                        </div>
                        <div class="modal-footer">
                          <button id="cancelModal" type="button" class="btn btn-default">Cancel</button>
                        </div>
                      </div>
                    </div>
                  </div>
              `
  $('#modalContainer').empty().append(myModal);
  $('input.close').on('change', e => {
    unchecked = e.target.value;
    arr = arr.filter(coin => coin !== unchecked);
    checkedArr = checkedArr.filter(coin => coin.id !== unchecked)
    $('#myModal').modal('hide'); // shuts the modal down after unchecking one coin
    toggler(checkedArr.map(coin => coin.id));
  });
  $('#cancelModal').on('click', e => {
    arr.pop();
    $('#myModal').modal('hide'); // shuts the modal down after unchecking one coin
    toggler(arr);
  })
}

function showAbout() {
  let aboutDiv = `<div id="aboutMeContainer" class="card col-lg-5 col-sm-12">
                    <div class="card-header">Who I am</div>
                    <div class="card-body">
                      <p><h5 class="card-title">
                        Welcome to Crypto-Watch! my name is Daniel Manoah, I'm 22 years old from Israel, currently studying at John Bryce TLV.
                      </h5></p>
                    </div>
                  </div>
                  <div id="aboutProjContainer" style="textSize: 200px"class="card col-lg-5 col-sm-12">
                    <div class="card-header">About Crypto-watch</div>
                      <div class="card-body">
                        <p><h5 class="card-title">
                          On this website you can get data for the coins of you have chosen </br>
                          In Home - "Save" and get a live graph in "Live Reports" tab.</br> Please note that some currencies do not have an active graph.
                        </h5></p>
                      </div>
                                  </div>`
  $('.row').empty().append(aboutDiv);
  $('.card-title').css({'font-size':'22px'})
}

function drawGraph() {
  const checkedSymbol = checkedArr.map(coin => coin.symbol.toUpperCase());
    let myTitle = '';
    let coinsArr = []
    for (let i = 0; i < checkedSymbol.length; i++) {
        myTitle += `${checkedSymbol[i]}, `;
        coinsArr.push([]);
    }
    let lineColor = ['#47ACD1', '#F4C951', 'lightblue', 'orange', 'maroon']
    let dataForMyCanvas = checkedSymbol.map((name, idx) => ({
        type: "line",
        showInLegend: true,
        name: name,
        markerType: "square",
        xValueFormatString: "hh:mm:ss",
        color: lineColor[idx],
        dataPoints: coinsArr[idx]
    }));
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "dark1",
            title:{
                text: `${(myTitle.slice(0, -2))} Live value reports`
            },
            axisX:{
                valueFormatString: "hh:mm:ss",
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                title: "Value in USD",
                suffix : " $",
                crosshair: {
                    enabled: true
                }
            },
            toolTip:{
                shared:true
            },
            legend:{
                cursor:"pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
            },
            data: dataForMyCanvas
        });
        function toogleDataSeries(e){
            if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else{
                e.dataSeries.visible = true;
            }
        }
    const dataLength = 15;
    var updateChart = function (count) {
      if($('#chartContainer').length === 1) {
        count = count || 1;
        $.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms='+ checkedSymbol +'&tsyms=USD').then(data => {
          for(let i = 0; i < checkedSymbol.length; i++) {
            const myCoin = Object.keys(data)[i];
            const myPrice = Object.values(data[myCoin])[0];
              let dataForCoin = {
                  x: new Date(),
                  y: myPrice
              }
              coinsArr[i].push(dataForCoin);
              if (coinsArr[i].length > dataLength) {
                  coinsArr[i].shift();
              }
            }
          chart.render();
      })
    }
    else { //kill interval once the user exits the live reports
      clearInterval(myInterval)
    }
    }
    updateChart(dataLength);
    let myInterval = setInterval(() =>{updateChart()}, 2000);
}
}
