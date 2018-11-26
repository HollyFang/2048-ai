'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//import * as tf from '@tensorflow/tfjs';
var tf = require('@tensorflow/tfjs');
var good = require('../data/good.js');
var bad = require('../data/bad.js');

function AI() {
	var a = tf.variable(tf.scalar(Math.random()));
	var b = tf.variable(tf.scalar(Math.random()));
	var c = tf.variable(tf.scalar(Math.random()));
	var d = tf.variable(tf.scalar(Math.random()));
	var numIterations = 75;
	var learningRate = 0.01;
	var optimizer = tf.train.sgd(learningRate);
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.numIterations = numIterations;
	this.optimizer = optimizer;
}

AI.prototype = {
	predict: function predict(x1, x2, x3, x4) {
		var _this = this;

		return tf.tidy(function () {
			return _this.a.mul(x1) // .pow(tf.scalar(3)) a * x^3
			.add(_this.b.mul(x2)) // .square()+ b * x ^ 2
			.add(_this.c.mul(x3)) // + c * x
			.add(_this.d.mul(x4)); // + d
		});
	},
	loss: function loss(prediction, labels) {
		// Having a good error function is key for training a machine learning model
		var error = prediction.sub(labels).square().mean();
		return error;
	},
	train: function () {
		var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(x1, x2, x3, x4, y) {
			var _this2 = this;

			var iter;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							iter = 0;

						case 1:
							if (!(iter < this.numIterations)) {
								_context.next = 8;
								break;
							}

							this.optimizer.minimize(function () {
								// Feed the examples into the model
								var pred = _this2.predict(x1, x2, x3, x4);
								return _this2.loss(pred, y);
							});

							// Use tf.nextFrame to not block the browser.
							_context.next = 5;
							return tf.nextFrame();

						case 5:
							iter++;
							_context.next = 1;
							break;

						case 8:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		function train(_x, _x2, _x3, _x4, _x5) {
			return _ref.apply(this, arguments);
		}

		return train;
	}(),
	buildModel: function () {
		var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(dataset) {
			return regeneratorRuntime.wrap(function _callee2$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return this.train(dataset.x1, dataset.x2, dataset.x3, dataset.x4, dataset.y);

						case 2:
						case 'end':
							return _context2.stop();
					}
				}
			}, _callee2, this);
		}));

		function buildModel(_x6) {
			return _ref2.apply(this, arguments);
		}

		return buildModel;
	}()

};
module.exports = AI;
