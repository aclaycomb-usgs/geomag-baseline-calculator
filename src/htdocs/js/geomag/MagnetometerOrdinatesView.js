/* global define */
define([
	'mvc/View',
	'util/Util',

	'geomag/Measurement'
], function (
	View,
	Util,

	Measurement
) {
	'use strict';


	var DEFAULTS = {
		'observation': null,
		'baselineCalculator': null,
		'readings': null
	};


	var MagnetometerOrdinatesView = function (options) {
		this._options = Util.extend({}, DEFAULTS, options);
		View.call(this, this._options);
	};

	MagnetometerOrdinatesView.prototype = Object.create(View.prototype);


	MagnetometerOrdinatesView.prototype._initialize = function () {
		this._reading = this._options.reading;
		this._measurements = this._reading.getMeasurements();
		this._calculator = this._options.baselineCalculator;

		this._el.innerHTML = [
			'<div class="ordinatesHEZF">',
				'<table>',
					'<thead class="magnetometerOrdinatesHead">',
						'<tr>',
							'<th>&nbsp</th>',
							'<th scope="col" class="titleMean">Ordinate Mean</th>',
							'<th scope="col" class="titleScale">Absolute</th>',
							'<th scope="col" class="titleComputed">Baseline</th>',
						'</tr>',
					'</thead>',
					'<tbody class="magnetometerOrdinatesCells">',
						'<tr>',
							'<th class="h">H</th>',
							'<td class="hMean"></td>',
							'<td class="absoluteH"></td>',
							'<td class="hBaseline"></td>',
						'</tr>',
						'<tr>',
							'<th class="e">E</th>',
							'<td class="eMean"></td>',
							'<td class="absoluteH"></td>',
							'<td class="eBaseline"></td>',
						'</tr>',
						'<tr>',
							'<th class="d">D</th>',
							'<td class="dMean"></td>',
							'<td class="absoluteD"></td>',
							'<td class="dBaseline"></td>',
						'</tr>',
						'<tr>',
							'<th class="z">Z</th>',
							'<td class="zMean"></td>',
							'<td class="absoluteZ"></td>',
							'<td class="zBaseline"></td>',
						'</tr>',
						'<tr>',
							'<th class="f">F</th>',
							'<td class="fMean"></td>',
							'<td class="absoluteF"></td>',
							'<td class="fBaseline"></td>',
						'</tr>',
					'</tbody>',
				'</table>',
				'<p class="scaleValue">',
				'</p>',
			'</div>',
		].join('');

		this._hMean = this._el.querySelector('.hMean');
		this._eMean = this._el.querySelector('.eMean');
		this._dMean = this._el.querySelector('.dMean');
		this._zMean = this._el.querySelector('.zMean');
		this._fMean = this._el.querySelector('.fMean');

		this._absoluteD = this._el.querySelector('.absoluteD');
		this._absoluteH = this._el.querySelector('.absoluteH');
		this._absoluteZ = this._el.querySelector('.absoluteZ');
		this._absoluteF = this._el.querySelector('.absoluteF');

		this._hBaseline = this._el.querySelector('.hBaseline');
		this._eBaseline = this._el.querySelector('.eBaseline');
		this._dBaseline = this._el.querySelector('.dBaseline');
		this._zBaseline = this._el.querySelector('.zBaseline');

		this._scaleValue = this._el.querySelector('.scaleValue');

		// hook up to measurements on change.
		// Only need time/angles not markup/markdown
		this._measurements[Measurement.WEST_DOWN][0].
				on('change', this.render, this);
		this._measurements[Measurement.EAST_DOWN][0].
				on('change', this.render, this);
		this._measurements[Measurement.WEST_UP][0].
				on('change', this.render, this);
		this._measurements[Measurement.EAST_UP][0].
				on('change', this.render, this);
		this._measurements[Measurement.SOUTH_DOWN][0].
				on('change', this.render, this);
		this._measurements[Measurement.NORTH_UP][0].
				on('change', this.render, this);
		this._measurements[Measurement.SOUTH_UP][0].
				on('change', this.render, this);
		this._measurements[Measurement.NORTH_DOWN][0].
				on('change', this.render, this);
		// hook up to calculator on change.
		// for changes to pier and mark. 
		this._calculator.on('change', this.render, this);

		this.render();

	};

	MagnetometerOrdinatesView.prototype.render = function () {
		// TODO :: Render current model
		var calculator = this._calculator,
		    reading = this._reading;

		this._hMean.innerHTML = calculator.meanH(reading).toFixed(2);
		this._eMean.innerHTML = calculator.meanE(reading).toFixed(2);
		this._dMean.innerHTML = calculator.computedE(reading).toFixed(2);
		this._zMean.innerHTML = calculator.meanZ(reading).toFixed(2);
		this._fMean.innerHTML = calculator.meanF(reading).toFixed(2);

		this._absoluteH.innerHTML =
			calculator.horizontalComponent(reading).toFixed(2);
		this._absoluteD.innerHTML =
			(calculator.magneticDeclination(reading) * 60).toFixed(2);
		this._absoluteZ.innerHTML =
			calculator.verticalComponent(reading).toFixed(2);
		this._absoluteF.innerHTML = calculator.correctedF(reading).toFixed(2);

		this._hBaseline.innerHTML = calculator.baselineH(reading).toFixed(2);
		this._eBaseline.innerHTML = calculator.baselineE(reading).toFixed(2);
		this._dBaseline.innerHTML = calculator.d(reading).toFixed(2);
		this._zBaseline.innerHTML = calculator.baselineZ(reading).toFixed(2);


		this._scaleValue.innerHTML =
			'Ordinate Mean D is calculated using (Corrected F * scaleValue / 60)' +
			'<br> Where scale Value = ' +
			calculator.scaleValue(reading).toFixed(4);

	};


	return MagnetometerOrdinatesView;
});
