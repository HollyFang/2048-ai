//import * as tf from '@tensorflow/tfjs';
var tf = require('@tensorflow/tfjs');
const good = require('../data/good.js');
const bad = require('../data/bad.js');

function AI() {
	const a = tf.variable(tf.scalar(Math.random()));
	const b = tf.variable(tf.scalar(Math.random()));
	const c = tf.variable(tf.scalar(Math.random()));
	const d = tf.variable(tf.scalar(Math.random()));
	const numIterations = 75;
	const learningRate = 0.5;
	const optimizer = tf.train.sgd(learningRate);
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.numIterations = numIterations;
	this.optimizer = optimizer;
}

AI.prototype = {
	predict: function(x1, x2, x3, x4) {
		return tf.tidy(() => {
			return this.a.mul(x1) // .pow(tf.scalar(3)) a * x^3
				.add(this.b.mul(x2)) // .square()+ b * x ^ 2
				.add(this.c.mul(x3)) // + c * x
				.add(this.d.mul(x4)); // + d
		});
	},
	loss: function(prediction, labels) {
		// Having a good error function is key for training a machine learning model
		const error = prediction.sub(labels).square().mean();
		return error;
	},
	train: async function(x1, x2, x3, x4, y) {
		for (let iter = 0; iter < this.numIterations; iter++) {
			this.optimizer.minimize(() => {
				// Feed the examples into the model
				const pred = this.predict(x1, x2, x3, x4);
				return this.loss(pred, y);
			});

			// Use tf.nextFrame to not block the browser.
			await tf.nextFrame();
		}
	},
	buildModel: async function(dataset) {
		await this.train(dataset.x1, dataset.x2, dataset.x3, dataset.x4, dataset.y);
	}

}
module.exports = AI;