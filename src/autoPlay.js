var Keys = require('./keys')
var PREFER_DIRECT = {
	left: 1,
	up: 1,
	down: 0,
	right: 0
};
var FAKE_EVENT = {
	which: null,
	preventDefault: () => {}
};
Array.prototype.getMaxExcept = function(exp) {
	let _max, arr = [null];
	if (exp !== undefined) arr = arr.concat(exp);
	this.forEach((a) => {
		if (!arr.includes(a) && (_max === undefined || a > _max))
			_max = a;
	});
	return _max;
};

function AutoPlay(game, ai) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.playInterval = null;
	this.ai = ai;
}

AutoPlay.prototype = {
	autoPlay: function() {
		this.playInterval = setInterval(() => {
			this.play();
		}, 600);
	},
	togglePlay: function() {
		if (this.playInterval)
			this.pausePlay();
		else
			this.autoPlay();
	},
	pausePlay: function() {
		clearInterval(this.playInterval);
		this.playInterval = null;
	},
	play: function() {
		let e = $.extend(true, {}, FAKE_EVENT);
		e.which = this.getBestMove();
		if (e.which)
			this.playingGame.onKeydown(e);
		else {
			alert("OH,NO。。。。。。。。");
			this.togglePlay();
		}

	},
	getBestMove: function() {
		let result = [],
			which = 37,
			newNumbers = []; 
		[null, 0, -32, null].getMaxExcept(0)
		for (let i = 0; i < 4; i++) {
			let _a = this.ifMove(37 + i);
			if (_a) {
				result.push(this.ai.predictDirection(i));
			} else {
				result.push(null);
			}
		}
		let theMax = result.getMaxExcept(),
			newWhich = [];
		for (let i in result) {
			if (result[i] === theMax) {
				which += (i - 0);
				break
			}
		}

		return which;
	},
	_getMaxValueExcept: function(arr, exp) {
		let max = 0;
		for (let i = arr.length - 1; i >= 0; i--) {
			let _a = arr[i].getMaxExcept(exp);
			if (_a > max) max = _a;
		}
		return Math.log(max) / Math.log(2);
	},
	_getMaxValuePos: function(arr) {
		let max = 0,
			pos = [];
		for (let i = 0; i < arr.length; i++) {
			for (let j = 0; j < arr[i].length; j++) {
				if (max < arr[i][j]) {
					max = arr[i][j];
					pos = [i, j]
				}
			}
		}
		return {
			max: Math.log(max) / Math.log(2),
			pos
		}
	},
	_move: function(key) {
		let move;
		switch (key) {
			case Keys.Left:
				move = this.gameNumbers.moveLeft()
				break
			case Keys.Up:
				move = this.gameNumbers.moveUp()
				break
			case Keys.Right:
				move = this.gameNumbers.moveRight()
				break
			case Keys.Down:
				move = this.gameNumbers.moveDown()
				break
		}
		return move;
	},
	ifMove: function(key) {
		let _res = null,
			_numbers = this.gameNumbers.numbers,
			_backNumbers = $.extend(true, [], this.gameNumbers.numbers),
			move = this._move(key);
		if (move && move.length > 0) { //&& this.willNextWorst(key)

			/*
			let maxPos = this._getMaxValuePos(this.gameNumbers.numbers),
				_weight = 0;
				if (axPos.max < 32)
				_weight = (8 - maxPos.pos[0] - maxPos.pos[1]) * axPos.max;
			else {
				_weight += this.gameNumbers.numbers[0][1] * 3 + this.gameNumbers.numbers[0][2] * 2 this.gameNumbers.numbers[0][3]
			}*/
			_res = {
				weight: this.getWight()
			};
		}
		this.gameNumbers.numbers = _backNumbers;
		return _res;
	},
	getWight() {
		let nums = this.gameNumbers.numbers,
			max = this._getMaxValueExcept(nums),
			max2 = this._getMaxValueExcept(nums, max);

		return max * 3 + max2 * 2 + this.gameNumbers.nullCellCount() * 2 - this.getJushi();
	},
	getJushi() {
		let nums = this.gameNumbers.numbers,
			jushi = 0;
		for (let i = 0; i < nums.length; i++) {
			let lastVal1 = null,
				lastVal2 = null;
			for (let j = 0; j < nums[i].length; j++) {
				let val1 = nums[i][j] ? Math.log(nums[i][j]) / Math.log(2) : 0,
					val2 = nums[j][i] ? Math.log(nums[j][i]) / Math.log(2) : 0;
				if (lastVal1 !== null) {
					if (val1)
						jushi += Math.abs(lastVal1 - val1);
					if (val2)
						jushi += Math.abs(lastVal2 - val2);
				}
				lastVal1 = val1;
				lastVal2 = val2;
			}
		}
		return jushi;
	},
	willNextWorst: function(key) {
		let _backNumbers = $.extend(true, [], this.gameNumbers.numbers),
			move = this._move(key),
			_worst = true;

		if (move && move.length > 0) {
			if (this.ifMove(37) || this.ifMove(38))
				_worst = false;
		}
		this.gameNumbers.numbers = _backNumbers;
		return _worst;
	}
}
module.exports = AutoPlay;