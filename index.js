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
    }
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
            var def = $.Deferred();
            setTimeout(function(){
                 $.ajax({
                    url: proxy + decodeURIComponent("https://iqoption.com/api/candles/history?active_id=824"),

                    type: "GET",
                    crossDomain: true
                }).then(function (data) {
                   def.resolve(data.result.actives[0].rate);
                })
            }, 5000)

            return def.promise();

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


        var _timer;
        $(document.body).on('touchstart', function(){
            alert(1)
            clearTimeout(_timer);
            _timer = setTimeout(function(){
                rateService.getBitCoinCashPrice().then(function(value){
                    $cashValue.html(value ? '$' + value : '-');
                }).then(function(){
                    $cashValue.addClass('layout__cash_visible');
                });
            }, 2000)
        }).on('touchend', function(){
            alert(2)
            clearTimeout(_timer);
            $cashValue.removeClass('layout__cash_visible');
        });
    };
}
