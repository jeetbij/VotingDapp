App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if(typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function() {
        $.getJSON("Poll.json", function(poll) {
            App.contracts.Poll = TruffleContract(poll);
            
            App.contracts.Poll.setProvider(App.web3Provider);
            return App.render();
        });
    },

    render: function() {
        var pollInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                App.account = account;
                $("#accountAddress").html("Your Account: " + account);
            }
        });

        App.contracts.Poll.deployed().then(function(instance) {
            pollInstance = instance;
            return pollInstance.pollsCount();
        }).then(function(pollsCount) {
            var pollResults = $("#candidatesResults");
            pollResults.empty();

            for(var i=1; i <= pollsCount; i++) {
                pollInstance.polls(i).then(function(poll) {
                    var id = poll[0];
                    var question = poll[2];
                    var optionCount = poll[3];

                    var pollTemplate = "<tr><th>" + id + "</th><td>" + question + "</td><td>" + optionCount + "</td></tr>";
                    pollResults.append(pollTemplate);
                });
            }

            loader.hide();
            content.show();
        }).catch(function(error) {
            console.warn(error);
        });
    }
};


$(function() {
    $(window).load(function() {
        App.init();
    });
});