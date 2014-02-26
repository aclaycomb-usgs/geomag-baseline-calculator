/* global define */
define([
	'mvc/View',
	'mvc/Collection',
	'util/Util',
	'util/Xhr',

	'geomag/ObservatoryFactory',
	'geomag/Observation',
	'geomag/ObservationMetaView',
	'geomag/ReadingGroupView',
	'geomag/ObservationBaselineCalculator',
	'geomag/RealtimeDataFactory',
	'geomag/Validate'
], function (
	View,
	Collection,
	Util,
	Xhr,

	ObservatoryFactory,
	Observation,
	ObservationMetaView,
	ReadingGroupView,
	ObservationBaselineCalculator,
	RealtimeDataFactory,
	Validate
) {
	'use strict';


	var DEFAULTS = {
		observationId: null,
		factory: new ObservatoryFactory(),
		baselineCalculator: new ObservationBaselineCalculator(),
		realtimeDataFactory: new RealtimeDataFactory()
	};


	var ObservationView = function (options) {
		this._options = Util.extend({}, DEFAULTS, options);
		View.call(this, this._options);
	};
	ObservationView.prototype = Object.create(View.prototype);


	ObservationView.prototype.render = function () {
		// nothing to render, sub views handle everything
	};

	/**
	 * Initialize the observation view.
	 */
	ObservationView.prototype._initialize = function () {
		var el = this._el,
		    factory = this._options.factory,
		    calculator = this._options.baselineCalculator,
		    realtimeDataFactory = this._options.realtimeDataFactory;

		el.innerHTML = [
			'<section class="observation-view">',
				'<section class="observation-meta-wrapper"></section>',
				'<section class="reading-group-view-wrapper"></section>',
				'<section class="observation-view-controls"></section>',
			'</section>'
		].join('');

		this._calculator = calculator;
		this._realtimeDataFactory = realtimeDataFactory;
		this._observation = null;
		this._observatories = null;
		this._observationMetaView = null;
		this._readingGroupView = null;

		// load observation
		factory.getObservation({
			id: this._options.observationId || null,
			success: this._setObservation.bind(this)
		});
	};

	/**
	 * Called when observation has been loaded.
	 *
	 * @param observation {Observation}
	 *        result of ObservatoryFactory.getObservatory().
	 */
	ObservationView.prototype._setObservation = function (observation) {
		var el = this._el,
		    calculator = this._calculator;

		this._observation = observation;
		// create reading group view
		this._readingGroupView = new ReadingGroupView({
			el: el.querySelector('.reading-group-view-wrapper'),
			observation: observation,
			baselineCalculator: calculator
		});

		// load observatories for meta view
		observation.getObservatories({
			success: this._setObservatories.bind(this)
		});

		// bind realtime data factory and measurements.
		var getRealtimeData = this._getRealtimeData.bind(this);
		this._realtimeDataFactory.on('change:observatory', getRealtimeData);
		observation.eachMeasurement(function (measurement) {
			measurement.on('change:time', getRealtimeData);
		});
	};


	/**
	 * Called when observatories have been loaded.
	 *
	 * @param observatories {Array<Object>}
	 *        result of ObservatoryFactory.getObservatories().
	 */
	ObservationView.prototype._setObservatories = function (observatories) {
		var el = this._el,
		    observation = this._observation,
		    calculator = this._calculator,
		    observatory_id,
		    observatory;

		// convert to collection
		this._observatories = observatories = new Collection(observatories);
		// bind before select code below, so this will run for first select
		observatories.on('select', this._onObservatorySelect, this);
		// select observation observatory if set
		observatory_id = observation.get('observatory_id');
		if (observatory_id !== null) {
			observatory = observatories.get(observatory_id);
			if (observatory !== null) {
				observatories.select(observatory);
			}
		}

		// create observation meta view
		this._observationMetaView = new ObservationMetaView({
			el: el.querySelector('.observation-meta-wrapper'),
			observation: observation,
			observatories: observatories,
			calculator: calculator
		});
	};

	/**
	 * Called when an observatory is selected.
	 */
	ObservationView.prototype._onObservatorySelect = function () {
		var code = null,
		    observatory;
		observatory = this._observatories.getSelected();
		if (observatory !== null) {
			code = observatory.get('code');
		}
		this._realtimeDataFactory.set({observatory: code});
	};

	/**
	 * Get realtime data for all measurements.
	 */
	ObservationView.prototype._getRealtimeData = function () {
		var realtimeDataFactory = this._realtimeDataFactory,
		    observatory = realtimeDataFactory.get('observatory'),
		    observation = this._observation,
		    starttime = null,
		    endtime = null;

		if (observatory === null) {
			// need more information
			return;
		}

		// find times to request
		observation.eachMeasurement(function (measurement) {
			var time = measurement.get('time');
			if (time === null) {
				return;
			}
			if (starttime === null || time < starttime) {
				starttime = time;
			}
			if (endtime === null || time > endtime) {
				endtime = time;
			}
		});
		if (starttime === null || endtime === null) {
			// need more information
			return;
		}

		// request realtime data
		starttime = Math.round(starttime / 1000);
		endtime = Math.round(endtime / 1000);
		realtimeDataFactory.getRealtimeData({
			starttime: starttime,
			endtime: endtime,
			success: function (realtimeData) {
				// update measurement data
				observation.eachMeasurement(function (measurement) {
					measurement.setRealtimeData(realtimeData);
				});
			}
		});

		this._createControls();
	};

	/**
	 * Create a panel at the bottom of the Observation view to create or delete
	 * the observation
	 * 
	 */
	ObservationView.prototype._createControls = function () {
		var controls = this._el.querySelector('.observation-view-controls'),
		    saveButton = document.createElement('button'),
		    _this = this;

		saveButton.id = 'saveButton';
		saveButton.innerHTML = 'Save Observation';

		Util.addEvent(saveButton, 'click', function () {
			_this._saveObservation();
		});

		controls.appendChild(saveButton);
	};


	ObservationView.prototype._saveObservation = function () {
		var factory = this._options.factory;

		factory.saveObservation(this._observation);
	};


	// return constructor
	return ObservationView;
});
