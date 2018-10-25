//import * as tf from '@tensorflow/tfjs';
var tf = require('@tensorflow/tfjs');
const good = require('../data/good.js');
const bad = require('../data/bad.js');

function AI(game) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.dataset = [];
	this.result = [];
	const model = tf.sequential();
	this.model = model;
	/*model.add(tf.layers.dropout({
		rate: 0.5
	}));*/
	model.add(tf.layers.dense({
		units: 2,
		inputShape: [16],
		activation: 'sigmoid'
	}));
}

AI.prototype = {
	record: function(type) {
		this.notRecord();
		this.playingGame.on('moveOver', () => {
			let arrs = this.getNumberArray(this.gameNumbers.numbers);
			let a = this.rotate(this.gameNumbers.numbers);
			let b = this.rotate(a);
			let c = this.rotate(b);
			this.dataset = this.dataset.concat(arrs);
			let str = arrs.join(',') + "\r\n" + this.getNumberArray(a).join(',') +
				"\r\n" + this.getNumberArray(b).join(',') + "\r\n" + this.getNumberArray(c).join(',');
			$('#record-datas').html(str);
			this.result.push(type);
		})
	},
	rotate: function(arr) {
		let dst = arr.length - 1,
			COL = arr[0].length,
			ROW = arr.length,
			tmp = [];
		//顺时针旋转矩阵90度
		for (let i = 0; i < ROW; i++) {
			for (let j = 0; j < COL; j++) {
				if (!tmp[j]) tmp[j] = [];
				tmp[j][dst] = arr[i][j];
			}
			dst--;
		}
		return tmp;
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
		let valLeft = this.predictDirection(0),
			valUp = this.predictDirection(1),
			valRight = this.predictDirection(2),
			valDown = this.predictDirection(3);

		$("#predict-results").html(`left:${valLeft};<br />up:${valUp};<br />right:${valRight};<br />down:${valDown};`);
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
		this.notRecord();
		let _goodArr = good.split(','),
			_badArr = bad.split(',');
		this.dataset = _goodArr.concat(_badArr);
		this.result = [];
		for (var i = _goodArr.length / 16 - 1; i >= 0; i--) {
			this.result.push(1);
		};
		for (var i = _badArr.length / 16 - 1; i >= 0; i--) {
			this.result.push(0);
		};
		const LEARNING_RATE = 0.15;
		const optimizer = tf.train.sgd(LEARNING_RATE);
		const dataLen = this.dataset.length / 16;
		this.model.compile({
			optimizer: optimizer,
			loss: 'binaryCrossentropy', //'binaryCrossentropy', //  'sparseCategoricalCrossentropy',
			metrics: ['accuracy']
		});
		let trainBatchCount = 0,
			_dataset = new Float32Array(this.dataset),
			_labels = new Uint8Array(this.result);

		await this.model.fit(
			tf.tensor2d(_dataset, [dataLen, 16]), tf.tensor2d(_labels, [dataLen, 1]), { //tf.tensor2d(_labels, [dataLen, 1]) .expandDims(-1)
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