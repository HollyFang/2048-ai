require('babel-polyfill')
var $ = require('jquery')
var Game = require('./game')
var Auto = require('./autoPlay')
var AI = require('./ai-b')

$(function() {
	var game = new Game()
	var $moves = $('.game-moves')
	var $toggle = $('#toggle')

	$('body').on('click', '.new-round', function() {
		game.newRound()
	})
	game.on('move', function(e) {
		$moves.text(e.moves.length)
	})

	game.on('newRound', function() {
		$moves.empty()
	})

	game.newRound();

	var auto = new Auto(game);
	$toggle.on('click', function() {
		auto.togglePlay();
	})
	game.on('gameOver', function() {
		auto.pausePlay();
	})


	var ai = new AI(game);
	$('body').on('click', '#record', function() {
		ai.record(1);
	})
	$('body').on('click', '#recordBad', function() {
		ai.record(0);
	})
	$('body').on('click', '#recordOK', function() {
		ai.record(0.5);
	})
	$('body').on('click', '#buildModel', function() {
		ai.buildModel();
	})
	$('body').on('click', '#predict', function() {
		ai.predict();
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