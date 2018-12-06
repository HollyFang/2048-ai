var $ = require('jquery')
var Game = require('./game')
var Auto = require('./autoPlay')

$(function() {
	var game = new Game()
	var $moves = $('.game-moves')
	var $toggle = $('#toggle')

	$('body').on('click', '.new-round', function() {
		game.newRound();
		//game.gameNumbers = game.numbers;
	})

	game.on('move', function(e) {
		$moves.text(e.moves.length)
	})

	game.on('newRound', function() {
		$moves.empty()
	})

	game.newRound();
	var auto = new Auto(game);
	//auto.autoPlay();
	$toggle.on('click', function() {
		auto.togglePlay();
	})
	game.on('gameOver', function() {
		auto.pausePlay();
	})
})

if (location.protocol.indexOf('http') > -1 && 'serviceWorker' in navigator) {
	if (location.pathname.indexOf('/2048/app/') > -1) {
		navigator.serviceWorker.register('service-worker-online.js', {
			scope: './'
		})
	} else {
		navigator.serviceWorker.register('service-worker.js', {
			scope: './'
		})
	}
}