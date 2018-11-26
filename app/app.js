require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = require('jquery')
var Game = require('./game')
var Auto = require('./autoPlay')

$(function() {
	var game = new Game()
	var $moves = $('.game-moves')
	var $toggle = $('#toggle')

	$('body').on('click', '.new-round', function() {
		game.newRound();
		game.gameNumbers = game.numbers;
	})

	game.on('move', function(e) {
		$moves.text(e.moves.length)
	})

	game.on('newRound', function() {
		$moves.empty()
	})

	game.newRound();
	var auto = new Auto(game);
	//auto.autoPlay();
	$toggle.on('click', function() {
		auto.togglePlay();
	})
	game.on('gameOver', function() {
		auto.pausePlay();
	})
})

if (location.protocol.indexOf('http') > -1 && 'serviceWorker' in navigator) {
	if (location.pathname.indexOf('/2048/app/') > -1) {
		navigator.serviceWorker.register('service-worker-online.js', {
			scope: './'
		})
	} else {
		navigator.serviceWorker.register('service-worker.js', {
			scope: './'
		})
	}
}
},{"./autoPlay":2,"./game":3,"jquery":"jquery"}],2:[function(require,module,exports){
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

const INTERVAL = 0;
const ITERATE_TIMES = 2;

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
	this.calculating = false;
}

AutoPlay.prototype = {
	autoPlay: function() {
		/*if (INTERVAL)
			this.startTime = (new Date()).getTime();*/
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
			_backNumbers = $.extend(true, [], nums);
		let calNums = new Numbers(_backNumbers),
			move = this._move(key, calNums);
		console.log(`${times}=>${key}`);
		if (move && move.length > 0) {
			_res = {
				weight: this.getWight(calNums.numbers)
			};
			if (times > 0) {
				let cal2 = this.getBestMove(times - 1, calNums.numbers);
				_res.weight = cal2.value > _res.weight ? cal2.value : _res.weight;
			}
		}
		console.log(_res);
		return _res;
	},
	getWight: function(nums) {
		let max = this._getMaxValueExcept(nums),
			nullCount = this.nullCellCount(nums),
			jushi = this.getJushi(nums),
			//m = Math.log(max) / Math.log(2) * Math.pow(0.5, nullCount) * 2 + nullCount + jushi;
			m = max + 1.5 * nullCount + 0.5 * jushi;
		console.log(`max:${max};nullCount:${nullCount};jushi:${jushi}`)
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
				if (lastVal1 !== null) {
					jushi += lastVal1 - val1;
					jushi += lastVal2 - val2;
					jushi2 += Math.abs(lastVal1 - val1);
					jushi2 += Math.abs(lastVal2 - val2);
				}
				lastVal1 = val1;
				lastVal2 = val2;
			}
		}
		return jushi;
	}
}
module.exports = AutoPlay;
},{"./keys":4,"./numbers":6}],3:[function(require,module,exports){
var $ = require('jquery')
var Keys = require('./keys')
var Numbers = require('./numbers')
var MessageBox = require('./message-box')

var MOVE_ANIMATION_TIME = 100 // ms

function Game(el) {
	this.$el = $(el || '.game-2048-board')
	this.$board = this.$el
	this.msgBox = new MessageBox()

	this.initEvents()
}

$.extend(Game.prototype, {

	/* events */

	on: function() {
		this.$el.on.apply(this.$el, arguments)
	},
	off: function() {
		this.$el.off.apply(this.$el, arguments)
	},
	trigger: function() {
		this.$el.trigger.apply(this.$el, arguments)
	},

	initEvents: function() {
		$(document).on('keydown', $.proxy(this.onKeydown, this))
	},

	newRound: function() {
		this.numbers = new Numbers();
		this.moves = []

		this.msgBox.hide();

		this.renderNumbers();
		this.addRandomNumber();
		this.addRandomNumber();

		this.running = true;

		this.trigger('newRound')
	},

	// TODO bug 不能正确检测游戏结束情况
	isGameOver: function() {
		// 检查无法继续合并的情况
		if (!this.numbers.canMerge()) {
			this.running = false;
			this.msgBox.show("Game Over!");
			this.trigger('gameOver')
		}

		this.numbers.forEach($.proxy(function(n) {
			if (n === 2048) {
				this.running = false;
				this.msgBox.show("Success! You got 2048!");
			}
		}, this))

		return !this.running
	},

	onKeydown: function(e) {
		var key = e.which
		if (!this.running || key < Keys.Left || key > Keys.Down) {
			return;
		}

		e.preventDefault();

		if (this.actionTimer) {
			return
		}

		var move

		switch (key) {
			case Keys.Left:
				move = this.numbers.moveLeft()
				break
			case Keys.Up:
				move = this.numbers.moveUp()
				break
			case Keys.Right:
				move = this.numbers.moveRight()
				break
			case Keys.Down:
				move = this.numbers.moveDown()
				break
		}

		// 没有产生任何变化时不做处理
		if (move && move.length > 0) {
			this.moves.push(move)
			this.showMove(move)

			// 等待动画完成
			this.actionTimer = setTimeout($.proxy(function() {
				if (!this.isGameOver()) {
					this.trigger({
						type: 'move',
						moves: this.moves
					})
					this.addRandomNumber()
					this.isGameOver()
				}
				this.actionTimer = null
			}, this), MOVE_ANIMATION_TIME);
		}
	},

	renderNumbers: function() {
		this.numbers.forEach($.proxy(function(num, row, col) {
			this.showNumber(row, col, num)
		}, this))
	},

	/*
	 * @param {Step[]} move - 由一系列的步骤组成的单次移动过程
	 */
	showMove: function(move) {
		for (var i = 0, len = move.length; i < len; i++) {
			this.showMoveStep(move[i]);
		}
	},

	showMoveStep: function(step) {
		var game = this
		var from = step.from
		var to = step.to
		var $cellFrom = this.getCell(from[0], from[1])
		var $cellFromClone = $cellFrom.clone().css('z-index', '1')
		var $cellTo = this.getCell(to[0], to[1])

		game.updateCell($cellFrom, 0)

		this.$board.append($cellFromClone)
		$cellFromClone.attr('data-row', to[0]).attr('data-col', to[1])

		setTimeout(function() {
			var result = step.result
			game.updateCell($cellTo, result)
			$cellFromClone.remove()
		}, 0)
	},

	showNumber: function(row, col, num) {
		this.updateCell(this.getCell(row, col), num)
	},

	updateCell: function($cell, num) {
		$cell.attr('num',
				num === 0 ?
				"no" :
				num > 2048 ? "super" : num
			)
			.find('i')
			.text(num === 0 ? "" : num)
	},

	addRandomNumber: function() {
		var pos = this.getCellPosition(this.getRandomFreeCell())
		var num = this.getRandomNumber()
		this.numbers.set(pos.row, pos.col, num)
		this.showNumber(pos.row, pos.col, num)
		console.log("******************************addRandomNumber");
	},

	getCellPosition: function($cell) {
		return {
			row: parseInt($cell.attr("data-row"), 10),
			col: parseInt($cell.attr("data-col"), 10)
		}
	},

	getRandomFreeCell: function() {
		// 空闲位置 num 属性为 no
		var cells = this.$board.find('[num="no"]')
		var count = cells.length
		var rand = cells.length - 1; //Math.floor(Math.random() * count)
		return cells.eq(rand)
	},

	// 随机数为 2 或 4
	getRandomNumber: function() {
		return 2;
		//return Math.random() > 0.1 ? 2 : 4
	},

	getCell: function(row, col) {
		return this.$board.find('.cell-' + row + '-' + col)
	}
})

module.exports = Game
},{"./keys":4,"./message-box":5,"./numbers":6,"jquery":"jquery"}],4:[function(require,module,exports){
module.exports = {
	Left: 37,
	Up: 38,
	Right: 39,
	Down: 40
}
},{}],5:[function(require,module,exports){
var jQuery = require('jquery')

function MessageBox(el) {
	this.$el = jQuery(el || '.game-message')
	var self = this
	this.$el.on('click', function() {
		self.hide()
	})
}

jQuery.extend(MessageBox.prototype, {

	show: function(message) {
		this.$el.text(message).show()
	},

	hide: function() {
		this.$el.hide()
	}

})

module.exports = MessageBox
},{"jquery":"jquery"}],6:[function(require,module,exports){
var ROW_COUNT = 4
var COL_COUNT = 4

function Numbers(numbers) {
	this.numbers = numbers||[
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	]
	// 历次移动的过程记录
	// TODO 利用记录的移动过程数据实现“撤销”、“重做”
	this.moves = []
	this.rowCount = ROW_COUNT
	this.colCount = COL_COUNT
}

Numbers.prototype = {

	forEach: function(callback) {
		if (typeof callback !== 'function') return
		this.numbers.forEach(function(row, rowIndex) {
			row.forEach(function(number, colIndex) {
				callback(number, rowIndex, colIndex)
			})
		})
	},

	get: function(row, col) {
		var row = this.numbers[row]
		return row ? row[col] : null
	},
	set: function(row, col, n) {
		if (row >= 0 && row < this.rowCount &&
			col >= 0 && row < this.colCount) {
			this.numbers[row][col] = n
		}
	},

	moveLeft: function() {
		return this.mergeRows('asc');
	},
	moveUp: function() {
		return this.mergeCols('asc');
	},
	moveRight: function() {
		return this.mergeRows('desc');
	},
	moveDown: function() {
		return this.mergeCols('desc');
	},

	mergeRows: function(order) {
		var move = this.currentMove = []

		for (var i = 0, len = this.rowCount; i < len; i++) {
			this.mergeRow(i, order);
		}

		if (move.length > 0) {
			this.moves.push(move)
		}
		this.currentMove = null
		return move
	},
	mergeCols: function(order) {
		var move = this.currentMove = []

		for (var i = 0, len = this.colCount; i < len; i++) {
			this.mergeCol(i, order);
		}

		if (move.length > 0) {
			this.moves.push(move)
		}
		this.currentMove = null
		return move
	},

	/*
	 * 任意 cell 值为 0，或与相邻 cell 值相等即可以合并
	 */
	canMerge: function() {
		var numbers = this.numbers
		var num
		var rowCount = this.rowCount
		var colCount = this.colCount
		for (var row = 0, len = rowCount; row < len; row++) {
			for (var col = 0; col < colCount; col++) {
				num = numbers[row][col]
				if (num === 0) {
					return true
				}
				if (row > 0) {
					if (num === numbers[row - 1][col]) {
						return true
					}
				}
				if (col > 0) {
					if (num === numbers[row][col - 1]) {
						return true
					}
				}
			}
		}
		return false
	},

	/*
	 * @param {'asc'|'desc'} order - 'asc' 从小往大; 'desc' 从大往小
	 */
	mergeRow: function(row, order) {
		var colX = this.colCount
		var col1
		var col2
		var cell

		if (order === 'asc') {
			col1 = 0;
			col2 = col1 + 1;

			while (col2 < colX) {
				cell = this.mergeCell(row, col1, row, col2);
				col1 = cell[1];
				col2 = col2 + 1;
			}
		} else {
			col1 = colX - 1;
			col2 = col1 - 1;

			while (col2 >= 0) {
				cell = this.mergeCell(row, col1, row, col2);
				col1 = cell[1];
				col2 = col2 - 1;
			}
		}
	},
	mergeCol: function(col, order) {
		var rowX = this.rowCount
		var row1
		var row2
		var cell

		if (order === 'asc') {
			row1 = 0;
			row2 = row1 + 1;

			while (row2 < rowX) {
				cell = this.mergeCell(row1, col, row2, col);
				row1 = cell[0];
				row2 = row2 + 1;
			}
		} else {
			row1 = rowX - 1;
			row2 = row1 - 1;

			while (row2 >= 0) {
				cell = this.mergeCell(row1, col, row2, col);
				row1 = cell[0];
				row2 = row2 - 1;
			}
		}
	},

	/*
	 * cell_2 => cell_1
	 * 将 cell_2(row2, col2) 的值合并到 cell_1(row1, col1)
	 * 返回在经过操作后值为 0 可以用作后续 cell 合并目标的 cell 坐标
	 * @return {[{number} row, {number} col] | null}
	 */
	mergeCell: function(row1, col1, row2, col2) {
		var num1 = this.numbers[row1][col1]
		var num2 = this.numbers[row2][col2]

		if (num1 == 0) {
			if (num2 === 0) {
				return [row1, col1]
			} else {
				// move
				this.moveCell({
					from: [row2, col2, num2],
					to: [row1, col1, 0],
					result: num2
				})
				return [row1, col1]
			}
		} else {
			if (num2 === 0) {
				return [row1, col1]
			} else {
				if (num1 === num2) {
					// merge
					this.moveCell({
						from: [row2, col2, num2],
						to: [row1, col1, num1],
						result: num1 + num2
					})
					// 检测是否相邻，不相邻时返回中间的空 cell
					var distance = row2 - row1 + col2 - col1
					if (distance > 1) {
						if (row1 === row2) {
							return [row1, col1 + 1]
						} else {
							return [row1 + 1, col1]
						}
					} else if (distance < -1) {
						if (row1 === row2) {
							return [row1, col1 - 1]
						} else {
							return [row1 - 1, col1]
						}
					} else {
						return [row2, col2]
					}
				} else {
					// 检测两个 cell 是否紧邻，不相邻时移动 cell2
					var distance = row2 - row1 + col2 - col1
					if (distance > 1) {
						// move
						if (row1 === row2) {
							// same row
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1, col1 + 1, 0],
								result: num2
							})
							return [row1, col1 + 1]
						} else {
							// same col
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1 + 1, col1, 0],
								result: num2
							})
							return [row1 + 1, col1]
						}
					} else if (distance < -1) {
						// move
						if (row1 === row2) {
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1, col1 - 1, 0],
								result: num2
							})
							return [row1, col1 - 1]
						} else {
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1 - 1, col1, 0],
								result: num2
							})
							return [row1 - 1, col1]
						}
					} else {
						return [row2, col2]
					}
				}
			}
		}
	},

	/*
	 * @param {Step} step - {from: [row2, col2, num2], to: [row1, col1, num1]}
	 */
	moveCell: function(step) {
		var from = step.from
		var to = step.to
		this.currentMove.push(step)
		this.numbers[from[0]][from[1]] = 0
		this.numbers[to[0]][to[1]] = step.result
	}
}

module.exports = Numbers
},{}],"jquery":[function(require,module,exports){
module.exports = window.jQuery
},{}]},{},[1]);
