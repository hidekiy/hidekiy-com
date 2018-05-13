/*global window, jQuery*/
(function () {
	'use strict';

	var $ = jQuery,
		zeroWidthChar = ['\u200b', '\ufeff'];
//		zeroWidthChar = ['あ', 'い'];

	function inject(target, encNum) {
		return target.replace(/(.{20})/g, encNum + '$1');
	}

	function encode(num) {
		var encoded = num.toString(2);

		encoded = encoded.replace(/0/g, zeroWidthChar[0]);
		encoded = encoded.replace(/1/g, zeroWidthChar[1]);

		return encoded;
	}

	function decode(str) {
		var decoded = str;

		decoded = decoded.replace(new RegExp(zeroWidthChar[0], 'g'), 0);
		decoded = decoded.replace(new RegExp(zeroWidthChar[1], 'g'), 1);

		return window.parseInt(decoded, 2);
	}

	$('#num').val(Math.floor(Math.random() * 100000));

	$('#num, #input').change(function () {
		var num = +$('#num').val(),
			input = $('#input').val(),
			injected = inject(input, encode(num));

		$('#embedded').text(injected);
	});
	$('#num').change();

	$('#decoder').change(function () {
		var $this = $(this),
			input = $this.val();

		input = input.replace(new RegExp('(?:' + zeroWidthChar.join('|') + ')+', 'g'), function ($0) {
			var decoded = decode($0);
			return '【' + decoded + '】';
		});

		$this.val(input);
	}).change();
}());
