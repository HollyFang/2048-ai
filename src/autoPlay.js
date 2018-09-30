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
Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

Array.prototype.min = function() {
	return Math.min.apply(null, this);
};

function AutoPlay(game) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.playInterval = null;
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
		for (let i = 0; i < 4; i++) {
			let _a = this.ifMove(37 + i);
			if (_a) {
				//newNumbers.push(_a.resNumbers);
				result.push(_a.weight);
			} else {
				result.push(0);
			}
		}
		let theMax = result.max(),
			newWhich = [];
		for (let i in result) {
			if (result[i] == theMax) {
				//newWhich.push(i - 0);
				which += (i - 0);
				break
			}
		}
		/*if (newWhich.length == 1)
			which += newWhich[0];
		else {
			newNumbers
		}*/
		return which;
	},
	_getMaxValue: function(arr, result) {
		let max = 0;
		for (let i = arr.length - 1; i >= 0; i--) {
			let _a = arr[i].max();
			if (_a > max) max = _a;
		}
		result.push(max);
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
			lt = nums[0][0] ? Math.log(nums[0][0]) / Math.log(2) : 0,
			maxPos = this._getMaxValuePos(nums);

		//for (let i = 0; i < nums.length; i++) {
		//}
		//第一列按从大到小排列[0,0]最大,第二列从大到小
		let row = [],
			lastVal;
		//for (let i = 0; i < 2; i++) {
		for (let j = 0; j < nums[0].length; j++) {
			let r = nums[j][0] ? Math.log(nums[j][0]) / Math.log(2) : 0;
			if (!row.length)
				row.push(i ? (r - lastVal) * j : (lastVal - r) * (4 - j));
			lastVal = r;
		}
		//}
		return maxPos.max * 3 + lt * 2 + row.reduce((a, b) => a + b);
	},
	getWight2() {
		let nums = this.gameNumbers.numbers;
		//left=>right
		let l_r = 0,
			r_l = 0;
		for (let i = 0; i < nums.length; i++) {
			for (let j = 0; j < nums[i].length; j++) {
				if (nums[i][j] > 0 || j == nums[i].length - 1) {
					let l = nums[i][0] ? Math.log(nums[i][0]) / Math.log(2) : 0,
						r = nums[i][j] ? Math.log(nums[i][j]) / Math.log(2) : 0;
					if (l > r) l_r += r - l;
					else if (r > l) r_l += l - r;
					break;
				}
			}
		}
		//up=>down
		let u_d = 0,
			d_u = 0;
		for (let i = 0; i < nums.length; i++) {
			for (let j = 0; j < nums[i].length; j++) {
				if (nums[i][j] > 0 || j == nums[i].length - 1) {
					let u = nums[0][j] ? Math.log(nums[0][j]) / Math.log(2) : 0,
						d = nums[i][j] ? Math.log(nums[i][j]) / Math.log(2) : 0;
					if (l > r) l_r += r - l;
					else if (r > l) r_l += l - r;
					break;
				}
			}
		}
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