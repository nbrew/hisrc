/*
 * Breakpoint jQuery Plugin
 *
 * Copyright (c) 2012
 * Licensed under the MIT license.
 *
 */

(function($){
	$.breakpoint = {
		els: $(),
		init: false
	};
	$.breakpoint.defaults = {
		breakpoints: []
	};

	$.fn.breakpoint = function(options) {
		var settings = $.extend({}, $.breakpoint.defaults, options);

		$.breakpoint.els = $.breakpoint.els.add(this);

		if (!$.breakpoint.init) {
			$(window).on('resize.breakpoint', function(){
				$.breakpoint.els.trigger('swapres.breakpoint');
			});
		}

		return this.each(function(){
			var $el = $(this),
				maxWidths = [],
				minWidths = [],
				breakpoint_images = [];

			$el.data('m1src', $el.attr('src'));

			var deepsearch = function(blob, hunt) {
				var results = [],
						tmp = null;
				$.each( blob, function(i, item) {
					if (item instanceof Array) {
						if ((tmp = $.inArray(hunt, item)) >= 0) {
							results.push(i);
						}
					} else {
						if (hunt == item) {
							results.push(i);
						}
					}
				});
				return results;
			};

			parse_data_breakpoint = function(key, value) {
				if (key && (key.toLowerCase().indexOf('maxwidth') === 0 || key.toLowerCase().indexOf('minwidth') === 0)) {
					var width = key.substring(3).match( /\d+/g );
					if (width.length === 1) {
						var bp = {
							key: key,
							type: ( key.toLowerCase().indexOf('max') === 0 ? 'max' : 'min' ),
							width: width[0]
						};

						if ( bp.type === 'max' ) {
							maxWidths.push( bp );
						}
						else {
							minWidths.push( bp )
						}
					}
				}
			};

			parse_breakpoints_option = function() {
				// get bp-widthn options
				$.each( $el.data(), function(key, value) {
					if (key && (key.toLowerCase().indexOf('bpwidth') === 0)) {
						breakpoint_images[key.toString().match( /\d+/g )] = value;
					}
				});
				$.each( settings.breakpoints, function(index, value) {
					if (value instanceof Array) {
						$.each(value, function(k, width_bp){
							parse_data_breakpoint(width_bp, breakpoint_images[index]);
						});
					} else {
						parse_data_breakpoint(value, breakpoint_images[index]);
					}
				});
			};

			// parse breakpoints.
			$.each( $el.data(), function(key, value) {
				parse_data_breakpoint(key, value);
			});
			parse_breakpoints_option();

			console.log(minWidths);
			// sort low to high.
			minWidths.sort(function( a, b ) {
				return a.width - b.width;
			});
			console.log(minWidths);

			console.log(maxWidths);
			// sort high to low.
			maxWidths.sort(function( a, b ) {
				return b.width - a.width;
			});
			console.log(maxWidths);

			$el
				.on('swapres.breakpoint', function(){
					console.log('swapres');

					// if breakpoints are defined just use them and ignore the rest.
					if ( maxWidths.length > 0 || minWidths.length > 0 ) {

						// loop threw each break point and try apply it.
						var windowWidth = $(window).width();
						var activeBreakpoint = null;
						$.each( maxWidths, function(index, bp) {
							if ( windowWidth <= bp.width ) {
								console.log('matched breakpoint: ' +  bp.key);
								activeBreakpoint = bp;
							}
						});
						$.each( minWidths, function(index, bp) {
							if ( windowWidth >= bp.width ) {
								console.log('matched breakpoint: ' +  bp.key);
								activeBreakpoint = bp;
							}
						});
						// fallback to mobile first if no matches.
						if ( activeBreakpoint != null ) {
							console.log('using breakpoint: ' + activeBreakpoint.key);
							console.log(settings.breakpoints)
							console.log('breakpoint index: ' +
													deepsearch(
														settings.breakpoints,
														activeBreakpoint.key
													)
												);
							$el.attr( 'src',
												$el.data( activeBreakpoint.key ) ||
													breakpoint_images[
														deepsearch(
															settings.breakpoints,
															activeBreakpoint.key
														)]
								);
						} else {
							console.log('using mobile1st');
							$el.attr( 'src', $el.data('m1src') );
						}

					} else {
						console.log('using mobile1st');
						$el.attr( 'src', $el.data('m1src') );
					}
				})
				.trigger('swapres.breakpoint');
		});
	};

})(jQuery);


