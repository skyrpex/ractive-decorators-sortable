var ractive,
	sourceKeypath,
	sourceArray,
	sourceIndex,
	dragstartHandler,
	dragenterHandler,
	removeTargetClass,
	preventDefault;

const sortable = function ( node ) {
	node.draggable = true;

	node.addEventListener( 'dragstart', dragstartHandler, false );
	node.addEventListener( 'dragenter', dragenterHandler, false );
	node.addEventListener( 'dragleave', removeTargetClass, false );
	node.addEventListener( 'drop', removeTargetClass, false );

	// necessary to prevent animation where ghost element returns
	// to its (old) home
	node.addEventListener( 'dragover', preventDefault, false );

	return {
		teardown: function () {
			node.removeEventListener( 'dragstart', dragstartHandler, false );
			node.removeEventListener( 'dragenter', dragenterHandler, false );
			node.removeEventListener( 'dragleave', removeTargetClass, false );
			node.removeEventListener( 'drop', removeTargetClass, false );
			node.removeEventListener( 'dragover', preventDefault, false );
		}
	};
};

sortable.targetClass = 'droptarget';

const errorMessage = 'The sortable decorator only works with elements that correspond to array members';

dragstartHandler = function ( event ) {
	var storage = this._ractive, lastDotIndex;

	sourceKeypath = storage.keypath.str;

	// this decorator only works with array members!
	lastDotIndex = sourceKeypath.lastIndexOf( '.' );

	if ( lastDotIndex === -1 ) {
		throw new Error( errorMessage );
	}

	sourceArray = sourceKeypath.substr( 0, lastDotIndex );
	sourceIndex = +( sourceKeypath.substring( lastDotIndex + 1 ) );

	if ( isNaN( sourceIndex ) ) {
		throw new Error( errorMessage );
	}

	event.dataTransfer.setData( 'foo', true ); // enables dragging in FF. go figure

	// keep a reference to the Ractive instance that 'owns' this data and this element
	ractive = storage.root;
};

dragenterHandler = function () {
	var targetKeypath, lastDotIndex, targetArray, targetIndex, array, source;

	// If we strayed into someone else's territory, abort
	if ( this._ractive.root !== ractive ) {
		return;
	}

	targetKeypath = this._ractive.keypath.str;

	// this decorator only works with array members!
	lastDotIndex = targetKeypath.lastIndexOf( '.' );

	if ( lastDotIndex === -1 ) {
		throw new Error( errorMessage );
	}

	targetArray = targetKeypath.substr( 0, lastDotIndex );
	targetIndex = +( targetKeypath.substring( lastDotIndex + 1 ) );

	// if we're dealing with a different array, abort
	if ( targetArray !== sourceArray ) {
		return;
	}

	// if it's the same index, add droptarget class then abort
	if ( targetIndex === sourceIndex ) {
		this.classList.add( sortable.targetClass );
		return;
	}

	array = ractive.get( sourceArray );

	// remove source from array
	source = array.splice( sourceIndex, 1 )[0];

	// the target index is now the source index...
	sourceIndex = targetIndex;

	// add source back to array in new location
	array.splice( sourceIndex, 0, source );
};

removeTargetClass = function () {
	this.classList.remove( sortable.targetClass );
};

preventDefault = function ( event ) { event.preventDefault(); };

export default sortable;
