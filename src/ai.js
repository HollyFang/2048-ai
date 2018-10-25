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
		this.notRecord();
		this.playingGame.on('moveOver', () => {
			let arrs = this.getNumberArray(this.gameNumbers.numbers);
			//this.dataset.push(new Float32Array(arrs2));
			this.dataset = this.dataset.concat(arrs);
			this.result.push(type);
		})
	},
	notRecord: function() {
		this.playingGame.off('moveOver');
	},
	getNumberArray: function(arr) {
		let arrs = arr[0].concat(arr[1]).concat(arr[2]).concat(arr[3]);

		return arrs.map((data) => {
			if (data) return Math.log(data) / Math.log(2);
			else return data;
		});
	},
	predict: function() {
		let valLeft = predictDirection(0),
			valUp = predictDirection(1),
			valRight = predictDirection(2),
			valDown = predictDirection(3);
		console.log(valLeft, valUp, valRight, valDown);
		debugger;
	},
	predictDirection: function(direct) {
		let _res = null,
			_numbers = this.gameNumbers.numbers,
			_backNumbers = $.extend(true, [], _numbers),
			move = this._move(direct);
		let nums = this.getNumberArray(_numbers);
		this.gameNumbers.numbers = _backNumbers;
		let result = this.model.predict(tf.tensor2d(nums, [1, 16]));
		return result.dataSync();
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
		//this.dataset = "0,0,0,2,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2,2,0,0,2,1,0,0,0,0,0,0,0,0,0,0,2,3,0,0,2,1,0,0,0,0,0,0,0,0,2,0,3,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,4,0,0,0,1,0,0,0,0,0,0,0,2,2,0,2,4,0,0,0,1,0,0,0,2,0,0,0,0,0,0,3,4,0,0,0,1,0,0,0,3,0,0,0,0,0,0,3,4,0,0,0,1,0,0,2,3,0,0,0,0,0,1,3,4,0,0,2,1,0,0,0,3,0,0,0,0,0,1,3,4,0,0,2,1,0,0,0,3,0,0,0,1,0,1,3,4,0,2,2,1,0,0,0,3,0,0,0,1,0,1,3,4,0,1,3,1,0,0,0,3,0,0,0,1,1,2,4,4,0,0,0,1,0,0,0,3,0,0,0,1,0,1,2,5,0,0,0,1,0,0,2,3,0,0,0,1,1,1,3,5,0,0,0,1,0,0,0,3,0,0,0,1,0,2,3,5,0,0,2,1,0,0,0,3,0,0,0,1,2,3,5,0,2,1,0,0,1,3,0,0,1,0,0,0,0,2,3,5,0,2,1,2,0,0,1,3,0,0,0,1,0,3,3,5,0,0,2,2,0,0,2,3,0,0,0,1,0,1,4,5,0,0,0,3,0,0,2,3,0,0,0,1,1,1,4,5,0,0,2,4,0,0,0,1,0,0,0,0,0,2,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,2,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,3,4,5,0,0,2,4,0,0,0,1,0,0,0,2,2,3,4,5,0,0,3,4,0,0,0,1,0,0,0,2,2,3,4,5,1,3,4,0,1,0,0,0,2,0,0,0,2,4,5,5,2,0,0,2,2,0,0,0,0,0,0,0,0,2,4,6,0,0,0,3,0,0,0,3,0,0,0,0,0,3,4,6,0,0,0,4,0,0,0,0,0,0,0,0,1,3,4,6,0,0,0,4,0,0,0,0,0,0,0,0,1,3,4,6,4,0,0,0,2,0,0,0,0,0,0,0,1,3,4,6,0,0,0,4,0,0,0,3,0,0,0,0,1,3,4,6,0,0,1,4,0,0,0,3,0,0,0,0,1,3,4,6,0,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,0,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,1,0,2,4,0,0,0,3,0,0,0,0,2,3,4,6,0,1,2,4,0,0,1,3,0,0,0,0,2,3,4,6,0,1,2,4,0,0,2,3,0,0,0,0,3,3,4,6,0,1,3,4,0,0,0,3,0,0,0,0,0,4,4,6,0,1,3,4,0,0,2,3,0,0,0,0,0,0,5,6,0,1,3,4,0,0,2,3,0,0,0,2,0,1,5,6,0,1,3,4,0,0,2,3,0,0,0,2,0,2,5,6,0,0,3,4,0,0,3,3,0,0,0,2,2,2,5,6,0,0,4,4,0,0,0,3,0,0,0,2,0,3,5,6,0,0,0,5,0,0,0,3,0,0,0,3,0,3,5,6,0,1,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,6,0,3,5,5,0,1,2,4,2,0,0,0,6,0,0,0,3,6,0,0,1,2,4,0,0,0,0,2,0,0,6,1,0,0,3,6,0,1,2,4,0,2,6,2,0,1,3,1,0,0,2,6,0,0,0,4,0,0,0,2,0,0,6,1,0,2,3,6,2,1,2,4,0,0,0,2,0,1,6,1,0,2,3,6,2,1,2,4,3,1,6,2,0,2,3,1,0,1,2,6,0,0,0,4,3,1,6,2,1,2,3,1,1,2,6,0,4,0,0,0,3,1,6,2,1,2,3,1,0,1,2,6,0,0,4,2,0,0,6,2,3,1,3,1,1,2,2,6,2,1,4,2,0,1,6,2,3,1,3,1,0,1,3,6,2,1,4,2,0,0,0,2,1,0,6,1,3,2,4,6,2,2,4,2,0,0,0,2,1,0,0,1,3,2,6,6,2,3,5,2,0,0,0,2,0,0,1,2,0,3,2,7,2,3,5,2".split(',');
		//this.result = "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0".split(',');
		/*let pos = tf.ones([48, 1]),
			nag = tf.zeros([14, 1]);
		this.result = tf.concat([pos, nag]); // pos.concat(nag);*/
		this.notRecord();
		const LEARNING_RATE = 0.15;
		const optimizer = tf.train.sgd(LEARNING_RATE);
		const dataLen = this.dataset.length / 16;
		this.model.compile({
			optimizer: optimizer,
			loss: 'binaryCrossentropy', //'categoricalCrossentropy', //  'sparseCategoricalCrossentropy',
			metrics: ['accuracy']
		});
		let trainBatchCount = 0,
			_dataset = new Float32Array(this.dataset),
			_labels = new Uint8Array(this.result);
		$('#record-datas').html(_dataset.join(',') + "\r\n" + _labels.join(','));
		await this.model.fit(
			tf.tensor2d(_dataset, [dataLen, 16]), tf.tensor2d(_labels, [dataLen, 1]), { //tf.tensor2d(_labels, [dataLen, 1])
				batchSize: 6,
				epochs: 1,
				callbacks: {
					onBatchEnd: async (batch, logs) => {
						trainBatchCount++;
						$('#record-datas1').html(`Training... (${trainBatchCount})`);
						await tf.nextFrame();
					},
					onEpochEnd: async (epoch, logs) => {
						$('#record-datas1').html(`onEpochEnd... (${logs.val_loss}),(${logs.val_acc})`);
						await tf.nextFrame();
					}
				}
			});
	}

}
module.exports = AI;