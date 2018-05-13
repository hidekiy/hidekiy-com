/*global BigNumber, jQuery*/
(function () {
	'use strict';

	var $ = jQuery,
		twepoch = 1288834974657,
		workerIdBits = 5,
		datacenterIdBits = 5,
		sequenceBits = 12,
		workerIdShift = sequenceBits,
		datacenterIdShift = sequenceBits + workerIdBits,
		timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;

	function powOfTwo(n) {
		return new BigNumber(2).pow(n);
	}

	function decodeSnowflake(id_str) {
		var id = new BigNumber(id_str),
			timestamp = +id.divide(powOfTwo(timestampLeftShift)).intPart(),
			unixtime = timestamp + twepoch;

		return {
			id: id_str,
			timestamp: timestamp,
			unixtime: unixtime,
			date: String(new Date(unixtime)),
			workerId: +id.divide(powOfTwo(workerIdShift)).intPart().mod(powOfTwo(workerIdBits)),
			datacenterId: +id.divide(powOfTwo(datacenterIdShift)).intPart().mod(powOfTwo(datacenterIdBits)),
			sequence: +id.mod(powOfTwo(sequenceBits))
		};
	}

	$('textarea').change(function () {
		var m = $(this).val().match(/\d{7,}/g) || [];

		$('#result').empty().append($('<pre />').text(JSON.stringify($.map(m, function (id_str) {
			return decodeSnowflake(id_str);
		}), null, 4)));
	}).change();
}());
