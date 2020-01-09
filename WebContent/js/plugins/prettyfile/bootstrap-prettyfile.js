/*
 * jQuery and Bootsrap3 Plugin prettyFile
 *
 * version 2.0, Jan 20th, 2014
 * by episage, sujin2f
 * Git repository : https://github.com/episage/bootstrap-3-pretty-file-upload
 */
( function( $ ) {
	$.fn.extend({
		prettyFile: function( options ) {
			var defaults = {
				text : "选择文件",
				align : 'right',
				placeholder: ''
			};

			var options =  $.extend(defaults, options);
			var plugin = this;

			function make_form( $el, text, align, placeholder ) {
				$el.wrap('<div></div>');

				$el.hide();
				var message = "";
				if(placeholder != null && placeholder != undefined) message = placeholder;
				
				if(align == 'left'){
					$el.after( '\
						<div class="input-append input-group input-file"">\
							<span class="input-group-btn">\
								<button class="btn btn-white" type="button">' + text + '</button>\
							</span>\
							<input class="input-large form-control" type="text" readonly placeholder=' + message + '>\
						</div>\
					' );
				}else{
					$el.after( '\
						<div class="input-append input-group input-file"">\
							<input class="input-large form-control" type="text" readonly placeholder=' + message + '>\
							<span class="input-group-btn">\
								<button class="btn btn-white" type="button">' + text + '</button>\
							</span>\
						</div>\
					' );
				}

				return $el.parent();
			};

			function bind_change( $wrap, multiple ) {
				$wrap.find( 'input[type="file"]' ).change(function () {
					// When original file input changes, get its value, show it in the fake input
					var files = $( this )[0].files,
					info = '';

					if ( files.length == 0 )
						return false;

					if ( !multiple || files.length == 1 ) {
						var path = $( this ).val().split('\\');
						info = path[path.length - 1];
					} else if ( files.length > 1 ) {
						// Display number of selected files instead of filenames
						info = "已选择了" + files.length + ' 个文件';
					}

					$wrap.find('.input-append input').val( info );
				});
			};

			function bind_button( $wrap, multiple ) {
				$wrap.find( '.input-append' ).click( function( e ) {
					e.preventDefault();
					$wrap.find( 'input[type="file"]' ).click();
				});
			};

			return plugin.each( function() {
				$this = $( this );

				if ( $this ) {
					var multiple = $this.attr( 'multiple' );

					$wrap = make_form( $this, options.text, options.align, options.placeholder );
					bind_change( $wrap, multiple );
					bind_button( $wrap );
				}
			});
		}
	});
}( jQuery ));
