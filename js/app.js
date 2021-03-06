angular.module('PoGOApp', ['PoGOCtrl']);

angular.module('PoGOCtrl', []).controller('PoGOController', ['$scope', '$http', function($scope, $http) {

    $http.get('data/data.json').success(function(data) {
        $scope.language = "en";
        $scope.pokemonList = data.pokemonList;
        $scope.pokemonData = data.pokemonData;
        $scope.cpm = data.cpm;
        $scope.dustValues = data.dustValues;
        $scope.teams = data.teams;
    });

    $scope.team = {};
    $scope.poweredup = false;

    $scope.calculateIV = function() {
        if ($scope.pokemon && $scope.cp && $scope.hp && $scope.stardust) {
            $scope.results = [];
            var factor = $scope.poweredup ? 0.5 : 1;
            var minLevel = $scope.stardust * 2;
            for (var i = minLevel; i <= minLevel + 1.5; i = i + factor) {
                var LVL = i + 1;
                var ECpM = $scope.getECpM(i);
                for (var HP = 0; HP < 16; HP++) {
                    var THP = Math.floor(ECpM * ($scope.pokemon.BHP + HP));
                    THP = THP < 10 ? 10 : THP;
                    if (THP == $scope.hp) {
                        for (var ATK = 0; ATK < 16; ATK++) {
                            for (var DEF = 0; DEF < 16; DEF++) {
                                var CP = Math.floor(($scope.pokemon.BATK + ATK) * Math.pow($scope.pokemon.BDEF + DEF, 0.5)
                                        * Math.pow($scope.pokemon.BHP + HP, 0.5) * Math.pow(ECpM, 2) / 10);
                                CP = CP < 10 ? 10 : CP;
                                if (CP == $scope.cp) {
                                    var result = { level: LVL, HP: HP, ATK: ATK, DEF: DEF, total: HP+ATK+DEF };
                                    $scope.results.push(result);
                                }
                            }
                        }
                    }
                }
            }

            if ($scope.overall) {
                var i = 0;
                while (i < $scope.results.length) {
                    var result = $scope.results[i];
                    var totalIV = result.HP + result.ATK + result.DEF;
                    var accept = true;
                    if (($scope.overall.min <= totalIV) && (totalIV <= $scope.overall.max)) {
                        if ($scope.stats) {
                            if ($scope.highHP) {
                                if ((result.HP < result.ATK) || (result.HP < result.DEF)) {
                                    accept = false;
                                }
                                if ((result.HP == result.ATK) && (!$scope.highATK)) {
                                    accept = false;
                                }
                                if ((result.HP == result.DEF) && (!$scope.highDEF)) {
                                    accept = false;
                                }
                                if ((result.HP < $scope.stats.min) || ($scope.stats.max < result.HP)) {
                                    accept = false;
                                }
                            }
                            if ($scope.highATK) {
                                if ((result.ATK < result.HP) || (result.ATK < result.DEF)) {
                                    accept = false;
                                }
                                if ((result.ATK == result.HP) && (!$scope.highHP)) {
                                    accept = false;
                                }
                                if ((result.ATK == result.DEF) && (!$scope.highDEF)) {
                                    accept = false;
                                }
                                if ((result.ATK < $scope.stats.min) || ($scope.stats.max < result.ATK)) {
                                    accept = false;
                                }
                            }
                            if ($scope.highDEF) {
                                if ((result.DEF < result.ATK) || (result.DEF < result.HP)) {
                                    accept = false;
                                }
                                if ((result.DEF == result.HP) && (!$scope.highHP)) {
                                    accept = false;
                                }
                                if ((result.DEF == result.ATK) && (!$scope.highATK)) {
                                    accept = false;
                                }
                                if ((result.DEF < $scope.stats.min) || ($scope.stats.max < result.DEF)) {
                                    accept = false;
                                }
                            }
                        }
                    } else {
                        accept = false;
                    }

                    if (accept) {
                        i++;
                    } else {
                        $scope.results.splice(i, 1);
                    }
                }
            }
        }
    };

    $scope.getECpM = function(level) {
        if ($scope.cpm) {
            if (level == Math.floor(level)) {
                return $scope.cpm[level];
            } else {
                return Math.sqrt((Math.pow($scope.cpm[Math.floor(level)], 2) + Math.pow($scope.cpm[Math.ceil(level)], 2)) / 2);
            }
        }
    };



    $scope.selectPokemon = function(p) {
        $scope.pokemon = $scope.pokemonData[p.number];
        $scope.pokemonName = p.name;
        $scope.pokemonInputChanged = false;
    };

    $scope.selectTeam = function(team) {
        $scope.team = $scope.teams[team];
    };

    $scope.clearTeam = function() {
        $scope.team = {};
        $scope.overall = null;
        $scope.stats = null;
        $scope.highHP = false;
        $scope.highATK = false;
        $scope.highDEF = false;
    };

    $scope.toggleCheck = function(check) {
        $scope[check] = !$scope[check];
    };

    $scope.exportData = function() {
        var data = {};
        data.pokemon = $scope.pokemonName;
        data.cp = $scope.cp;
        data.hp = $scope.hp;
        data.stardust = $scope.stardust;
        if ($scope.team) {
            data.team = $scope.team.name;
            if ($scope.overall) {
                data.overall = $scope.overall;
            }
            if ($scope.stats) {
                data.stats = $scope.stats;
            }
        }
        data.results = $scope.results;
        var json = JSON.stringify(data);
        var file = new File([json], $scope.pokemonName + ".json", {type: "application/json"});
        saveAs(file);
    };

    $scope.startsWith = function(actual, expected) {
        var lowerStr = (actual + "").toLowerCase();
        return lowerStr.indexOf(expected.toLowerCase()) === 0;
    };

    $scope.switchLanguage = function(language) {
        $scope.language = language;
    }
}]);
