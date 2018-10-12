var $ = require('jquery')
var Game = require('./src/game')
var Auto = require('./src/autoPlay')
var AI = require('./src/ai')
//import jquery from 'jquery';

$(function() {
	var game = new Game()
	var ai = new AI(game);
	var $moves = $('.game-moves')
	var $toggle = $('#toggle')

	$('body').on('click', '.new-round', function() {
		game.newRound()
	})
	$('body').on('click', '#record', function() {
		ai.record();
	})
	$('body').on('click', '#buildModel', function() {
		ai.buildModel();
	})
	$('body').on('click', '#predict', function() {
		ai.predict();
	})

	game.on('move', function(e) {
		$moves.text(e.moves.length)
	})

	game.on('newRound', function() {
		$moves.empty()
	})

	game.newRound();
	var auto = new Auto(game);
	auto.autoPlay();
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