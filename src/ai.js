//import * as tf from '@tensorflow/tfjs';
var tf = require('@tensorflow/tfjs')

function AI(game) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.dataset = [];
	this.result = [];
	const model = tf.sequential();
	this.model = model;
	model.add(tf.layers.dense({
		units: 1,
		inputShape: [16],
		activation: 'sigmoid'
	}));
}

AI.prototype = {
	record: function(type) {
		this.playingGame.off('moveOver');
		this.playingGame.on('moveOver', () => {
			this.dataset.push(this.getNumberArray(this.gameNumbers.numbers));
			this.result.push(type);
		})
	},
	getNumberArray: function(arr) {
		return arr[0].concat(arr[1]).concat(arr[2]).concat(arr[3]);
	},
	predict: function() {
		let _res = null,
			_numbers = this.gameNumbers.numbers,
			_backNumbers = $.extend(true, [], _numbers),
			move = this._move(0);
		let nums = this.getNumberArray(_numbers)
		console.log(this.model.predict(tf.tensor2d(nums, [1, 16])));
		this.gameNumbers.numbers = _backNumbers;
	},
	_move: function(key) {
		let move;
		switch (key) {
			case 0:
				move = this.gameNumbers.moveLeft()
				break
			case 1:
				move = this.gameNumbers.moveUp()
				break
			case 2:
				move = this.gameNumbers.moveRight()
				break
			case 3:
				move = this.gameNumbers.moveDown()
				break
		}
		return move;
	},
	buildModel: async function() {
		this.playingGame.off('moveOver');
		const LEARNING_RATE = 0.15;
		const optimizer = tf.train.sgd(LEARNING_RATE);
		const BATCH_SIZE = this.dataset.length;
		this.model.compile({
			optimizer: optimizer,
			loss: 'categoricalCrossentropy', // ,
			metrics: ['accuracy']
		});
		await this.model.fit(
			tf.tensor2d(this.dataset, [BATCH_SIZE, 16]), tf.tensor2d(this.result, [BATCH_SIZE, 1]), {
				batchSize: BATCH_SIZE,
				epochs: 1
			});
	}

}
module.exports = AI;