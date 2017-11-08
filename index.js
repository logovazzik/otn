    function RateService(){
        this._getBTCrate =  function(){
            return $.ajax({
                crossDomain: true,
                dataType: "json",
                url: "https://blockchain.info/tobtc?currency=USD&value=1"
            }).then(function(data){
              return data;
            })
        };
       this.getCRtopiaPrice =  function() {
            return this._getBTCrate().then(function (rate) {
                return $.ajax({
                    url: "https://www.cryptopia.co.nz/api/GetMarket/OTN_BTC",
                    type: "GET",
                    crossDomain: true,
                    dataType: "json"
                }).then(function (data) {
                    var _data;
                    if((_data = (data && data.Data && data.Data.LastPrice))){
                        debugger
                        return (_data * (1/rate)).toFixed(2)
                    };

                })
            });
        }
        this.getLiveCoinPrice =  function(){
            return this._getBTCrate().then(function (rate ) {
                return $.ajax({
                    url: "https://otn.org/assets/resources/proxy.php?url=" + decodeURIComponent("https://api.livecoin.net/exchange/ticker?currencyPair=OTN/BTC&callback=?"),
                    type: "GET",
                    crossDomain: true
                }).then(function(data){
                    var bestAsk;
                    if((bestAsk = data && data.best_ask)){
                        return (bestAsk * (1/rate)).toFixed(2)
                    };

                })
            });
        }
    }



    function MainView(){
        this.init = function(){
            var $cryptoValue = $('.rate__value_crypto'),
                $liveValue = $('.rate__value_livecoin');
            var rateService = new RateService();

            rateService.getLiveCoinPrice().then(function(value){
                    $liveValue.html(value ? '$' + value : '-');
            })
            rateService.getCRtopiaPrice().then(function(value){
                    $cryptoValue.html(value ? '$' + value : '-');
            })

        };
    }
