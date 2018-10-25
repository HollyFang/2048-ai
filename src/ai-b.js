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

		this.notRecord();
		this.playingGame.on('moveOver', function () {
			var arrs = _this.getNumberArray(_this.gameNumbers.numbers);
			//this.dataset.push(new Float32Array(arrs2));
			_this.dataset = _this.dataset.concat(arrs);
			_this.result.push(type);
		});
	},
	notRecord: function notRecord() {
		this.playingGame.off('moveOver');
	},
	getNumberArray: function getNumberArray(arr) {
		var arrs = arr[0].concat(arr[1]).concat(arr[2]).concat(arr[3]);

		return arrs.map(function (data) {
			if (data) return Math.log(data) / Math.log(2);else return data;
		});
	},
	predic: function predic() {
		var valLeft = predictDirection(0),
		    valUp = predictDirection(1),
		    valRight = predictDirection(2),
		    valDown = predictDirection(3);
		console.log(valLeft, valUp, valRight, valDown);
		debugger;
	},
	predictDirection: function predictDirection(direct) {
		var _res = null,
		    _numbers = this.gameNumbers.numbers,
		    _backNumbers = $.extend(true, [], _numbers),
		    move = this._move(direct);
		var nums = this.getNumberArray(_numbers);
		this.gameNumbers.numbers = _backNumbers;
		var result = this.model.predict(tf.tensor2d(nums, [1, 16]));
		return result.dataSync();
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
		var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
			var _this2 = this;

			var LEARNING_RATE, optimizer, dataLen, trainBatchCount, _dataset, _labels;

			return regeneratorRuntime.wrap(function _callee3$(_context3) {
				while (1) {
					switch (_context3.prev = _context3.next) {
						case 0:
							//this.dataset = "0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2,2,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2,3,0,0,2,1,0,0,0,0,0,0,0,0,2,0,3,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,4,0,0,0,1,0,0,0,0,0,0,0,2,2,0,2,4,0,0,0,1,0,0,0,2,0,0,0,0,0,0,3,4,0,0,0,1,0,0,0,3,0,0,0,0,0,0,3,4,0,0,0,1,0,0,2,3,0,0,0,0,0,1,3,4,0,0,2,1,0,0,0,3,0,0,0,0,0,1,3,4,0,0,2,1,0,0,0,3,0,0,0,1,0,1,3,4,0,2,2,1,0,0,0,3,0,0,0,1,0,1,3,4,0,1,3,1,0,0,0,3,0,0,0,1,1,2,4,4,0,0,0,1,0,0,0,3,0,0,0,1,0,1,2,5,0,0,0,1,0,0,2,3,0,0,0,1,1,1,3,5,0,0,0,1,0,0,0,3,0,0,0,1,0,2,3,5,0,0,2,1,0,0,0,3,0,0,0,1,2,3,5,0,2,1,0,0,1,3,0,0,1,0,0,0,0,2,3,5,0,2,1,2,0,0,1,3,0,0,0,1,0,3,3,5,0,0,2,2,0,0,2,3,0,0,0,1,0,1,4,5,0,0,0,3,0,0,2,3,0,0,0,1,1,1,4,5,0,0,2,4,0,0,0,1,0,0,0,0,0,2,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,2,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,3,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,3,4,5,0,0,3,4,0,0,0,1,0,0,0,2,2,3,4,5,1,3,4,0,1,0,0,0,2,0,0,0,2,4,5,5,2,0,0,2,2,0,0,0,0,0,0,0,0,2,4,6,0,0,0,3,0,0,0,3,0,0,0,0,0,3,4,6,0,0,0,4,0,0,0,0,0,0,0,0,1,3,4,6,0,0,0,4,0,0,0,0,0,0,0,0,1,3,4,6,4,0,0,0,2,0,0,0,0,0,0,0,1,3,4,6,0,0,0,4,0,0,0,3,0,0,0,0,1,3,4,6,0,0,1,4,0,0,0,3,0,0,0,0,1,3,4,6,0,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,0,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,1,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,0,1,2,4,0,0,1,3,0,0,0,0,2,3,4,6,0,1,2,4,0,0,2,3,0,0,0,0,3,3,4,6,0,1,3,4,0,0,0,3,0,0,0,0,0,4,4,6,0,1,3,4,0,0,2,3,0,0,0,0,0,0,5,6,0,1,3,4,0,0,2,3,0,0,0,2,0,1,5,6,0,1,3,4,0,0,2,3,0,0,0,2,0,2,5,6,0,0,3,4,0,0,3,3,0,0,0,2,2,2,5,6,0,0,4,4,0,0,0,3,0,0,0,2,0,3,5,6,0,0,0,5,0,0,0,3,0,0,0,3,0,3,5,6,0,1,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,6,0,3,5,5,0,1,2,4,2,0,0,0,6,0,0,0,3,6,0,0,1,2,4,0,0,0,0,2,0,0,6,1,0,0,3,6,0,1,2,4,0,2,6,2,0,1,3,1,0,0,2,6,0,0,0,4,0,0,0,2,0,0,6,1,0,2,3,6,2,1,2,4,0,0,0,2,0,1,6,1,0,2,3,6,2,1,2,4,3,1,6,2,0,2,3,1,0,1,2,6,0,0,0,4,3,1,6,2,1,2,3,1,1,2,6,0,4,0,0,0,3,1,6,2,1,2,3,1,0,1,2,6,0,0,4,2,0,0,6,2,3,1,3,1,1,2,2,6,2,1,4,2,0,1,6,2,3,1,3,1,0,1,3,6,2,1,4,2,0,0,0,2,1,0,6,1,3,2,4,6,2,2,4,2,0,0,0,2,1,0,0,1,3,2,6,6,2,3,5,2,0,0,0,2,0,0,1,2,0,3,2,7,2,3,5,2".split(',');
							//this.result = "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0".split(',');
							/*let pos = tf.ones([48, 1]),
       	nag = tf.zeros([14, 1]);
       this.result = tf.concat([pos, nag]); // pos.concat(nag);*/
							this.notRecord();
							LEARNING_RATE = 0.15;
							optimizer = tf.train.sgd(LEARNING_RATE);
							dataLen = this.dataset.length / 16;

							this.model.compile({
								optimizer: optimizer,
								loss: 'binaryCrossentropy', //'categoricalCrossentropy', //  'sparseCategoricalCrossentropy',
								metrics: ['accuracy']
							});
							trainBatchCount = 0, _dataset = new Float32Array(this.dataset), _labels = new Uint8Array(this.result);

							$('#record-datas').html(_dataset.join(',') + "\r\n" + _labels.join(','));
							_context3.next = 9;
							return this.model.fit(tf.tensor2d(_dataset, [dataLen, 16]), tf.tensor2d(_labels, [dataLen, 1]), { //tf.tensor2d(_labels, [dataLen, 1])
								batchSize: 6,
								epochs: 1,
								callbacks: {
									onBatchEnd: function () {
										var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(batch, logs) {
											return regeneratorRuntime.wrap(function _callee$(_context) {
												while (1) {
													switch (_context.prev = _context.next) {
														case 0:
															trainBatchCount++;
															$('#record-datas1').html('Training... (' + trainBatchCount + ')');
															_context.next = 4;
															return tf.nextFrame();

														case 4:
														case 'end':
															return _context.stop();
													}
												}
											}, _callee, _this2);
										}));

										function onBatchEnd(_x, _x2) {
											return _ref2.apply(this, arguments);
										}

										return onBatchEnd;
									}(),
									onEpochEnd: function () {
										var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(epoch, logs) {
											return regeneratorRuntime.wrap(function _callee2$(_context2) {
												while (1) {
													switch (_context2.prev = _context2.next) {
														case 0:
															$('#record-datas1').html('onEpochEnd... (' + logs.val_loss + '),(' + logs.val_acc + ')');
															_context2.next = 3;
															return tf.nextFrame();

														case 3:
														case 'end':
															return _context2.stop();
													}
												}
											}, _callee2, _this2);
										}));

										function onEpochEnd(_x3, _x4) {
											return _ref3.apply(this, arguments);
										}

										return onEpochEnd;
									}()
								}
							});

						case 9:
						case 'end':
							return _context3.stop();
					}
				}
			}, _callee3, this);
		}));

		function buildModel() {
			return _ref.apply(this, arguments);
		}

		return buildModel;
	}()

};
module.exports = AI;
