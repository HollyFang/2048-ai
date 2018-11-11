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

var INTERVAL=500;

Array.prototype.getMaxExcept = function(exp) {
	let _max, arr = [null];
	if (exp !== undefined) arr = arr.concat(exp);
	this.forEach((a) => {
		if (!arr.includes(a) && (_max === undefined || a > _max))
			_max = a;
	});
	return _max;
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
		}, INTERVAL);
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
		let e = $.extend(true, {}, FAKE_EVENT),
		_move= this.getBestMove();
		e.which =_move.which;
		if (e.which)
			this.playingGame.onKeydown(e);
		else {
			alert("OH,NO。。。。。。。。");
			this.togglePlay();
		}

	},
	getBestMove: function(times,nums) {
		let result = [],
			which = 37,
			newNumbers = [];
			times=times===undefined?1:times; 
		for (let i = 0; i < 4; i++) {
			let _a = this.ifMove(37 + i,nums,times);
			if (_a) {
				//let obj={};
				//obj[37 + i]=_a.weight2||_a.weight;
				result.push(_a.weight2||_a.weight);
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
		return {which,value:theMax};
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
	_move: function(key,nums) {
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
	ifMove: function(key,nums,times) {
		nums=nums||this.gameNumbers.numbers;
		let _res = null,
			_backNumbers = $.extend(true, [], nums);
		let calNums=new Numbers(_backNumbers),
			move = this._move(key,calNums);
		if (move && move.length > 0) {
			_res = {
				weight: this.getWight(calNums)
			};
			if(times>0){
				let cal2=this.getBestMove(times-1,calNums.numbers);
				_res.weight2=cal2.value;
			}
		}
		return _res;
	},
	getWight: function(nums) {
		let max = this._getMaxValueExcept(nums.numbers),
			max2 = this._getMaxValueExcept(nums.numbers, max);

		return max * 3 +this.nullCellCount(nums) - this.getJushi()*1.5;
	},
	nullCellCount: function(nums) {
		let cnt = 0;
		nums.numbers.forEach(function(row, rowIndex) {
			row.forEach(function(number, colIndex) {
				if (!number) cnt++;
			})
		});
		return cnt;
	},
	getJushi: function() {
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