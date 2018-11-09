require('babel-polyfill')
var $ = require('jquery')
var Game = require('./game')
var Auto = require('./autoPlay')
var AI = require('./ai-b')

var m_Record = {
	"x1": [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3],
	"x2": [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3],
	"x3": [14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 14, 13, 13, 14, 13, 14, 13, 13, 13, 13, 13, 14, 13, 14, 12, 12, 12, 12],
	"x4": [2, 1, 4, 3, 3, 1, 6, 4, 4, 2, 8, 4, 3, 1, 8, 5, 7, 1, 11, 6, 1, 2, 6, 6, 3, 3, 8, 8],
	"y": [1, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 1, 0.8, 0.8, 1, 0.8, 1, 1, 0.9, 0.8, 0.9, 0.9, 1, 0.9, 1, 1, 1, 0, 0.5]
};
$(function() {
	var game = new Game();
	var $moves = $('.game-moves');
	var $toggle = $('#toggle');

	$('body').on('click', '.new-round', function() {
		game.newRound();
	})
	game.on('move', function(e) {
		$moves.text(e.moves.length);
	});

	game.on('newRound', function() {
		$moves.empty();
	});

	game.newRound();

	$('body').on('click', '#record', function() {
		for (let i = 37; i < 41; i++) {
			if ($('#Max_' + i).val()) {
				m_Record.x1.push($('#Max_' + i).val() - 0);
				m_Record.x2.push($('#Max2_' + i).val() - 0);
				m_Record.x3.push($('#Null_' + i).val() - 0);
				m_Record.x4.push($('#Jushi_' + i).val() - 0);
				m_Record.y.push($('#score_' + i).val() - 0);
			}
		}
	});
	var ai = new AI();
	var auto = new Auto(game);
	$toggle.on('click', function() {
		auto.togglePlay();
	});
	game.on('gameOver', function() {
		auto.pausePlay();
	});
	$('body').on('click', '#predict', function() {
		auto.getBestMove();
	});

	$('body').on('click', '#buildModel', function() {
		ai.buildModel(m_Record);
	});
	$('body').on('click', '#aiPredict', function() {
		for (let i = 37; i < 41; i++) {
			if ($('#Max_' + i).val()) {
				let x1 = $('#Max_' + i).val() - 0;
				let x2 = $('#Max2_' + i).val() - 0;
				let x3 = $('#Null_' + i).val() - 0;
				let x4 = $('#Jushi_' + i).val() - 0;
				let y = ai.predict(x1, x2, x3, x4);
				const values = y.dataSync();
				$('#aiScore_' + i).val(values);
			}
		}
	});
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