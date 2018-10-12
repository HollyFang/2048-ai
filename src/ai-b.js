'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//import * as tf from '@tensorflow/tfjs';
var tf = require('@tensorflow/tfjs');

function AI(game) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.dataset = [];
	this.result = [];
	var model = tf.sequential();
	this.model = model;
	model.add(tf.layers.dense({
		units: 1,
		inputShape: [16],
		activation: 'sigmoid'
	}));
}

AI.prototype = {
	record: function record(type) {
		var _this = this;

		this.playingGame.off('moveOver');
		this.playingGame.on('moveOver', function () {
			_this.dataset.push(_this.getNumberArray(_this.gameNumbers.numbers));
			_this.result.push(type);
		});
	},
	getNumberArray: function getNumberArray(arr) {
		return arr[0].concat(arr[1]).concat(arr[2]).concat(arr[3]);
	},
	predict: function predict() {
		var _res = null,
		    _numbers = this.gameNumbers.numbers,
		    _backNumbers = $.extend(true, [], _numbers),
		    move = this._move(0);
		var nums = this.getNumberArray(_numbers);
		console.log(this.model.predict(tf.tensor2d(nums, [1, 16])));
		this.gameNumbers.numbers = _backNumbers;
	},
	_move: function _move(key) {
		var move = void 0;
		switch (key) {
			case 0:
				move = this.gameNumbers.moveLeft();
				break;
			case 1:
				move = this.gameNumbers.moveUp();
				break;
			case 2:
				move = this.gameNumbers.moveRight();
				break;
			case 3:
				move = this.gameNumbers.moveDown();
				break;
		}
		return move;
	},
	buildModel: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
			var LEARNING_RATE, optimizer, BATCH_SIZE;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							this.playingGame.off('moveOver');
							LEARNING_RATE = 0.15;
							optimizer = tf.train.sgd(LEARNING_RATE);
							BATCH_SIZE = this.dataset.length;

							this.model.compile({
								optimizer: optimizer,
								loss: 'meanSquaredError', // 'categoricalCrossentropy',
								metrics: ['accuracy']
							});
							_context.next = 7;
							return this.model.fit(tf.tensor2d(this.dataset, [BATCH_SIZE, 16]), tf.tensor2d(this.result, [BATCH_SIZE, 1]), {
								batchSize: BATCH_SIZE,
								epochs: 1
							});

						case 7:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function buildModel() {
			return _ref.apply(this, arguments);
		}

		return buildModel;
	}()

};
module.exports = AI;
