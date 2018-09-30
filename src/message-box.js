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