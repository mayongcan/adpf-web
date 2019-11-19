/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	config.language = 'zh-cn';
	config.height = '300px';
	config.resize_enabled = false;
	
	//全部默认配置
//	config.toolbar = [
//			['Source','-','Save','NewPage','Preview','Print','-','Templates'],
//			['Cut','Copy','Paste','PasteText','PasteFromWord','-', 'SpellChecker', 'Scayt'],
//			['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
//			['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
//			'/',
//			['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
//			['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
//			['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
//			['Link','Unlink','Anchor'],
//			['Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak'],
//			'/',
//			['Styles','Format','Font','FontSize'],
//			['TextColor','BGColor'],
//			['Maximize', 'ShowBlocks','-','About']
//		];
	
	//自定义配置
	config.toolbar = [
  			['Source','-','Preview','Print','-','Templates'],
  			['Cut','Copy','Paste','PasteText','PasteFromWord','-', 'SpellChecker', 'Scayt'],
  			['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
  			['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField'],
  			'/',
  			['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
  			['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
  			['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
  			['Link','Unlink','Anchor'],
  			['Image','Table','HorizontalRule','SpecialChar','PageBreak'],
  			'/',
  			['Styles','Format','Font','FontSize'],
  			['TextColor','BGColor'],
  			['Maximize', 'ShowBlocks','-']
  		];
};
