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
const ITERATE_TIMES = 3;

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
	this.playInterval = null;
	this.calculating = false;
}

AutoPlay.prototype = {
	autoPlay: function() {
		/*if (INTERVAL)
			this.startTime = (new Date()).getTime();*/
		/*this.playInterval = setInterval(() => {

			this.play();
		}, INTERVAL)*/
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
		let e = $.extend(true, {}, FAKE_EVENT),
			_move = this.getBestMove(ITERATE_TIMES);
		e.which = _move.which;
		console.log("****************最佳的方向", e.which);
		if (e.which)
			this.playingGame.onKeydown(e);
		else {
			alert("OH,NO。。。。。。。。");
			this.pausePlay();
		}
		this.calculating = false;
	},
	getBestMove: function(times, nums) {
		let result = [],
			which = 37,
			newNumbers = [];
		times = times === undefined ? 1 : times; 
		for (let i = 0; i < 4; i++) {
			let _a = this.ifMove(37 + i, nums, times);
			if (_a) {
				result.push(_a.weight);
			} else {
				result.push(null);
			}
		}
		let theMax = result.getMaxExcept();
		for (let i in result) {
			if (result[i] === theMax) {
				which += (i - 0);
				break
			}
		}
		return {
			which,
			value: theMax
		};
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
	ifMove: function(key, nums, times) {
		nums = nums || this.gameNumbers.numbers;
		let _res = null,
			_backGame = $.extend(true, {}, this.playingGame);
		_backGame.numbers.numbers = $.extend(true, [], nums);
		let calNums = _backGame.numbers,
			move = this._move(key, calNums);
		console.log(`${times}=>${key}`);
		if (move && move.length > 0) {
			let a = this.getJushi3(calNums.numbers);
			_res = {
				weight: a.max
			};
			if (times > 0) {
				_backGame.setNumber(a.loc, 2);
				let cal2 = this.getBestMove(times - 1, calNums.numbers);
				_res.weight += cal2.value * Math.pow(0.9, ITERATE_TIMES - times + 1);
			}
		}
		console.log(_res);
		return _res;
	},
	getWight: function(nums, times) {
		let max = this._getMaxValueExcept(nums),
			nullCount = this.nullCellCount(nums),
			jushi = this.getJushi2(nums),
			//m = Math.log(max) / Math.log(2) * (Math.log(nullCount) / Math.log(0.5) + 1) + nullCount + jushi * (Math.log(nullCount) / Math.log(2) + 1);
			m = /*Math.log(max) / Math.log(2) + nullCount -*/ -jushi;
		return m;
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
	getJushi: function(nums) {
		let jushi = 0,
			jushi2 = 0;
		for (let i = 0; i < nums.length; i++) {
			let lastVal1 = null,
				lastVal2 = null;
			for (let j = 0; j < nums[i].length; j++) {
				let val1 = nums[i][j] ? Math.log(nums[i][j]) / Math.log(2) : 0,
					val2 = nums[j][i] ? Math.log(nums[j][i]) / Math.log(2) : 0;
				if (lastVal1) {
					jushi += (lastVal1 - val1);
					jushi2 += Math.abs(lastVal1 - val1);
					jushi += (lastVal2 - val2);
					jushi2 += Math.abs(lastVal2 - val2);
				}
				lastVal1 = val1;
				lastVal2 = val2;
			}
		}
		return Math.abs(jushi);
	},
	getJushi2: function(nums) {
		let jushi = 0,
			jushi2 = 0,
			jushi3 = 0,
			jushi4 = 0,
			lastVal1 = null,
			lastVal2 = null,
			lastVal3 = null,
			lastVal4 = null,
			weight = 1,
			commonRatio = 1; // 0.25;
		for (let i = 0; i < nums.length; i++) {
			if (i % 2 == 0) {
				for (let j = 0; j < nums.length; j++) {
					let val1 = nums[i][j],
						val3 = nums[j][i];
					if (lastVal3) {
						jushi += (lastVal1 - val1) * weight;
						jushi3 += (lastVal3 - val3) * weight;
						if (j == 0) {
							jushi2 += (nums[i][nums.length - 1 - j] - nums[i - 1][nums.length - 1 - j]) * weight;
							jushi4 += (nums[nums.length - 1 - j][i] - nums[nums.length - 1 - j][i - 1]) * weight;
							lastVal2 = nums[i - 1][nums.length - 1 - j];
							lastVal4 = nums[nums.length - 1 - j][i - 1];
						} else {
							jushi2 += (lastVal2 - val1) * weight;
							jushi4 += (lastVal4 - val3) * weight;
							lastVal2 = val1;
							lastVal4 = val3;
						}
					}
					lastVal1 = val1;
					lastVal3 = val3;
				}
			} else {
				for (let j = nums.length - 1; j > -1; j--) {
					let val1 = nums[i][j],
						val3 = nums[j][i];
					if (lastVal1) {
						jushi += (lastVal1 - val1) * weight;
						jushi3 += (lastVal3 - val3) * weight;
						if (j == nums.length - 1) {
							jushi2 += (nums[i][nums.length - 1 - j] - nums[i - 1][nums.length - 1 - j]) * weight;
							jushi4 += (nums[nums.length - 1 - j][i] - nums[nums.length - 1 - j][i - 1]) * weight;
							lastVal2 = nums[i - 1][nums.length - 1 - j];
							lastVal4 = nums[nums.length - 1 - j][i - 1];
						} else {
							jushi2 += (lastVal2 - val1) * weight;
							jushi4 += (lastVal4 - val3) * weight;
							lastVal2 = nums[i - 1][nums.length - 1 - j];
							lastVal4 = nums[nums.length - 1 - j][i - 1];
						}
					}
					lastVal1 = val1;
					lastVal3 = val3;
				}
			}
			weight *= commonRatio;
		}
		return [-jushi, jushi, jushi2, -jushi2, jushi3, -jushi3, jushi4, -jushi4].getMaxExcept();
	},
	getJushi3(nums) {
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
		}
		values.forEach((val, i) => {
			if (val > res.max) {
				res.max = val;
				res.loc = locs[i];
			}
		});
		return res;
	},
	getLog2(val) {
		return val ? Math.log(val) / Math.log(2) : 0;
	}
}
module.exports = AutoPlay;