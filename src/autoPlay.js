var Keys = require('./keys')
var Numbers = require('./numbers')
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

var INTERVAL = 500;

Array.prototype.getMaxExcept = function(exp) {
	let _max, arr = [null];
	if (exp !== undefined) arr = arr.concat(exp);
	this.forEach((a) => {
		if (!arr.includes(a) && (_max === undefined || a > _max))
			_max = a;
	});
	return _max;
};
Array.prototype.getMinExcept = function(exp) {
	let _max, arr = [null];
	if (exp !== undefined) arr = arr.concat(exp);
	this.forEach((a) => {
		if (!arr.includes(a) && (_max === undefined || a < _max))
			_max = a;
	});
	return _max;
};
Array.prototype.max = function() {
	return Math.max.apply(null, this);
};


function AutoPlay(game) {
	this.playingGame = game;
	this.gameNumbers = game.numbers;
	this.calNumbers = new Numbers();
	this.playInterval = null;
	this.calculating = false;
}

AutoPlay.prototype = {
	autoPlay: function() {
		this.playInterval = requestAnimationFrame(() => {
			let timeOk = false;
			if (!INTERVAL || !this.startPlayTime || new Date().getTime() - this.startPlayTime > INTERVAL)
				timeOk = true;
			if (!this.calculating && !this.playingGame.actionTimer && timeOk)
				this.play();
			else
				console.log("没运行好");
			this.autoPlay();
		});
	},
	togglePlay: function() {
		if (this.playInterval)
			this.pausePlay();
		else
			this.autoPlay();
	},
	pausePlay: function() {
		cancelAnimationFrame(this.playInterval);
		this.playInterval = null;
	},
	play: function() {
		this.calculating = true;
		this.startPlayTime = (new Date()).getTime();
		let nullCount = this.nullCellCount(this.gameNumbers.numbers);
		let times = 3; //nullCount > 7 ? 1 : (nullCount < 5 ? 4 : 3);
		let e = $.extend(true, {}, FAKE_EVENT),
			_move = this.getBestMove(times, times);
		e.which = _move.move;
		console.log("****************最佳的方向", e.which);
		if (e.which)
			this.playingGame.onKeydown(e);
		else {
			alert("OH,NO。。。。。。。。");
			this.pausePlay();
		}
		this.calculating = false;
	},
	_getMaxValueExcept: function(arr, exp) {
		let max = 0;
		for (let i = arr.length - 1; i >= 0; i--) {
			let _a = arr[i].getMaxExcept(exp);
			if (_a > max) max = _a;
		}
		return max;
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
	_move: function(key, nums) {
		let move;
		switch (key) {
			case Keys.Left:
				move = nums.moveLeft()
				break
			case Keys.Up:
				move = nums.moveUp()
				break
			case Keys.Right:
				move = nums.moveRight()
				break
			case Keys.Down:
				move = nums.moveDown()
				break
		}
		return move;
	},
	getBestMove: function(max_time, times, nums) {
		nums = nums || this.gameNumbers.numbers;
		let _res = {
			score: -1,
			move: 0
		};
		for (let i = 0; i < 4; i++) {
			let key = 37 + i;
			this.calNumbers.numbers = $.extend(true, [], nums); 
			let move = this._move(key, this.calNumbers);
			console.log(`${times}=>${key}`);
			if (move && move.length > 0) {
				let a = this.getJushi(this.calNumbers.numbers);
				if (times > 0) {
					this.calNumbers.numbers[a.loc[0]][a.loc[1]] = 2;
					let cal2 = this.getBestMove(max_time, times - 1, this.calNumbers.numbers);
					a.max += cal2.score * Math.pow(0.9, max_time - times + 1);
				}
				if (a.max > _res.score) {
					_res.score = a.max;
					_res.move = key;
				}
			}
		}
		return _res;
	},
	nullCellCount: function(nums) {
		let cnt = 0;
		nums.forEach(function(row, rowIndex) {
			row.forEach(function(number, colIndex) {
				if (!number) cnt++;
			})
		});
		return cnt;
	},
	getJushi(nums) {
		let values = [0, 0, 0, 0, 0, 0, 0, 0],
			locs = [],
			weight = 1,
			commonRatio = 0.25,
			res = {
				max: 0,
				loc: null
			};
		for (let i = 0; i < nums.length; i++) {
			for (let j = 0; j < nums.length; j++) {
				if (i % 2 == 0) {
					values[0] += nums[i][j] * weight;
					if (!nums[i][j] && !locs[0])
						locs[0] = [i, j];

					values[1] += nums[j][i] * weight;
					if (!nums[j][i] && !locs[1])
						locs[1] = [j, i];

					values[2] += nums[i][nums.length - 1 - j] * weight;
					if (!nums[i][nums.length - 1 - j] && !locs[2])
						locs[2] = [i, nums.length - 1 - j];

					values[3] += nums[nums.length - 1 - j][i] * weight;
					if (!nums[nums.length - 1 - j][i] && !locs[3])
						locs[3] = [nums.length - 1 - j, i];

					values[4] += nums[nums.length - 1 - i][j] * weight;
					if (!nums[nums.length - 1 - i][j] && !locs[4])
						locs[4] = [nums.length - 1 - i, j];

					values[5] += nums[nums.length - 1 - i][nums.length - 1 - j] * weight;
					if (!nums[nums.length - 1 - i][nums.length - 1 - j] && !locs[5])
						locs[5] = [nums.length - 1 - i, nums.length - 1 - j];

					values[6] += nums[j][nums.length - 1 - i] * weight;
					if (!nums[j][nums.length - 1 - i] && !locs[6])
						locs[6] = [j, nums.length - 1 - i];

					values[7] += nums[nums.length - 1 - j][nums.length - 1 - i] * weight;
					if (!nums[nums.length - 1 - j][nums.length - 1 - i] && !locs[7])
						locs[7] = [nums.length - 1 - j, nums.length - 1 - i];
				} else {
					values[0] += nums[i][nums.length - 1 - j] * weight;
					if (!nums[i][nums.length - 1 - j] && !locs[0])
						locs[0] = [i, nums.length - 1 - j];

					values[1] += nums[nums.length - 1 - j][i] * weight;
					if (!nums[nums.length - 1 - j][i] && !locs[1])
						locs[1] = [nums.length - 1 - j, i];

					values[2] += nums[i][j] * weight;
					if (!nums[i][j] && !locs[2])
						locs[2] = [i, j];

					values[3] += nums[j][i] * weight;
					if (!nums[j][i] && !locs[3])
						locs[3] = [j, i];

					values[4] += nums[nums.length - 1 - i][nums.length - 1 - j] * weight;
					if (!nums[nums.length - 1 - i][nums.length - 1 - j] && !locs[4])
						locs[4] = [nums.length - 1 - i, nums.length - 1 - j];

					values[5] += nums[nums.length - 1 - i][j] * weight;
					if (!nums[nums.length - 1 - i][j] && !locs[5])
						locs[5] = [nums.length - 1 - i, j];

					values[6] += nums[nums.length - 1 - j][nums.length - 1 - i] * weight;
					if (!nums[nums.length - 1 - j][nums.length - 1 - i] && !locs[6])
						locs[6] = [nums.length - 1 - j, nums.length - 1 - i];

					values[7] += nums[j][nums.length - 1 - i] * weight;
					if (!nums[j][nums.length - 1 - i] && !locs[7])
						locs[7] = [j, nums.length - 1 - i];
				}
				weight *= commonRatio;
			}
			weight *= 0.25;
		}
		values.forEach((val, i) => {
			if (val > res.max) {
				res.max = val;
				res.loc = locs[i];
			}
		});
		return res;
	}
}
module.exports = AutoPlay;