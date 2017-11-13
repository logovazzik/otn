function RateService(){
    var proxy = 'https://otn.org/assets/resources/proxy.php?url=';
    this._getBTCrateInternal =  function(){
        return $.ajax({
            crossDomain: true,
            dataType: "json",
            url: proxy + decodeURIComponent('https://iqoption.com/api/candles/history?active_id=816')
        }).then(function(data){
            return (data.result.actives[0].rate);
        });
    };

    this._getBTCrate =  function(){
        var self = this;
        if(this._getBTCrate.def) {
            return this._getBTCrate.def.promise()
        }
        this._getBTCrate.def = $.Deferred();

        this._getBTCrateInternal().then(function(data){
            self._getBTCrate.def.resolve(data);
        });

        return this._getBTCrate.def.promise();
    }
    this.getCRtopiaPrice =  function() {
        return this._getBTCrate().then(function (rate) {
            return $.ajax({
                url: proxy + decodeURIComponent("https://www.cryptopia.co.nz/api/GetMarket/OTN_BTC"),
                type: "GET",
                crossDomain: true,
                dataType: "json"
            }).then(function (data) {
                var _data;
                if((_data = (data && data.Data && data.Data.LastPrice))){
                    return (_data * rate).toFixed(2)
                }
            })
        });
    };

    this.getDollarWeight =  function(){
        return $.ajax({
            url:  "https://api.fixer.io/latest?base=USD&symbols=RUB&callback=?",
            type: "GET",
            dataType: "jsonp"
        }).then(function (data) {
            return data.rates.RUB;
        })
    };


    this.getLiveCoinPrice =  function(){
        return this._getBTCrate().then(function (rate ) {
            return $.ajax({
                url: proxy + decodeURIComponent("https://api.livecoin.net/exchange/ticker?currencyPair=OTN/BTC&callback=?"),
                type: "GET",
                crossDomain: true
            }).then(function(data){
                var bestAsk;
                if((bestAsk = data && data.best_ask)){
                    return (bestAsk * rate).toFixed(2)
                }

            })
        });
    }

    this.getYouBitCoinPrice =  function(){
        return this._getBTCrate().then(function (rate ) {
            return $.ajax({
                url: proxy +          decodeURIComponent("https://yobit.net/api/2/otn_btc/ticker"),
                type: "GET",
                crossDomain: true
            }).then(function(data){
                return (rate * data.ticker.last).toFixed(2);

            })
        });
    }

    this.getBitCoinCashPrice =  function() {
        return this._getBTCrate().then(function () {
           return $.ajax({
                    url: proxy + decodeURIComponent("https://iqoption.com/api/candles/history?active_id=824?v="+ Math.random()),

                    type: "GET",
                    crossDomain: true
                }).then(function (data) {
                   return data.result.actives[0].rate;
                })
        })
    }

}

function MainView(){
    this.init = function(){
        var $cryptoValue = $('.rate__value_crypto'),
            $liveValue = $('.rate__value_livecoin'),
            $youbitValue = $('.rate__value_youbit'),
            $cashValue = $('.layout__cash');


        var rateService = new RateService();
        rateService.getLiveCoinPrice().then(function(value){
            $liveValue.html(value ? '$' + value : '-');
        })
        rateService.getCRtopiaPrice().then(function(value){
            $cryptoValue.html(value ? '$' + value : '-');
        })
        rateService.getYouBitCoinPrice().then(function(value){
            $youbitValue.html(value ? '$' + value : '-');
        });


        var _timer, history = [
               {bitcashCount:2.0814, price: 200000, curreny: 'RUB'},
               {bitcashCount:0.3846, price: 499.9, curreny: 'USD'},
               {bitcashCount:0.3796, price: 499.93, curreny: 'USD'},
               {bitcashCount:0.3627, price: 484.93, curreny: 'USD'},
               {bitcashCount:0.3814, price: 499.94, curreny: 'USD'},
               {bitcashCount:0.3796, price: 499.93, curreny: 'USD'},
               {bitcashCount:0.3796, price: 499.93, curreny: 'USD'},
               {bitcashCount:0.0036, price: 4.93, curreny: 'USD'}
        ];
            
        
        
        $(document.body).on('touchstart mousedown', function(){
            clearTimeout(_timer);
            _timer = setTimeout(function(){
                $.when(rateService.getBitCoinCashPrice(), rateService.getDollarWeight())
                    .then(function(cashValue, dollarWeight){
                      if(cashValue && dollarWeight){
                   var total  = history.reduce(function(acc, current)  {
                             return acc += cashValue * current.bitcashCount * dollarWeight;
                            
                       }, 0);
                            $cashValue.html('RATE: $' + cashValue + ' ' + ' TOTAL: ' + (total).toFixed(2) + ' RUB');
                            $cashValue.addClass('layout__cash_visible');
                      }
                      
                        
                    });
            }, 1000)
        }).on('touchend mouseup', function(){
            clearTimeout(_timer);
            $cashValue.removeClass('layout__cash_visible');
        });
    };
}
