jQuery(function ($) {
	var socket 			= io.connect(),
		mayMove			= false,
		dragElement		= $('.circle'),
		discriptionElem = $('.discription'),
		mouseOwner		= false
	;

	function handleMayMove(mayIMove) {
		if (mayIMove || mouseOwner) {
			dragElement.draggable({
				disabled: false,
				containment: 'parent',
				cursorType: 'crosshair',
				start: function() {
					mouseOwner = true;
					discriptionElem.text('Your mouse move is now broadcasting');
					socket.emit('changeMayMove', false);
				},
				drag: function(drag, helper) {
					socket.emit('castMove', helper.position);
				},
				stop: function() {
					mouseOwner = false;
					socket.emit('changeMayMove', true);
					discriptionElem.text('Drag mouse to broadcast it');
				}
			});
		} else {
			dragElement.draggable( { disabled: true } );
			discriptionElem.text('The mouse is broadcasted by someone else, wait till he stops');
		}
	}

	socket.on('mayMove', function (boolMayMove) {
		mayMove = boolMayMove;
		handleMayMove(mayMove);

		if (mayMove) discriptionElem.text('Drag mouse to broadcast it');
	});


	socket.on('castMove', function(position) {
		if (!mayMove && !mouseOwner) {
			dragElement.css({ 'left' : position.left, 'top' : position.top});
		}
	});
})