<?php

if (!function_exists("safefloatval")) {
  function safefloatval($value=null) {
    if ($value === null) {
      return null;
    } else {
      return floatval($value);
    }
  }
}

if (!function_exists("safeintval")) {
  function safeintval($value=null) {
    if ($value === null) {
      return null;
    } else {
      return intval($value);
    }
  }
}

if (!function_exists("safeISO8601")) {
  /**
   * Convert a  non-null date to ISO8601.
   *
   * @param $time {Number}
   *     time to format.
   * @return {String}
   *     null if $date is null, otherwise ISO8601 formatted time.
   */
  function safeISO8601 ($time) {
    $time = safefloatval($time);
    if ($time === null) {
      return $time;
    }
    return gmdate('Y-m-d\TH:i:s\Z', $time);
  }
}

// PHP Classes
$classDir = $APP_DIR . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR .
    'classes' . DIRECTORY_SEPARATOR;

include_once $classDir . 'Instrument.class.php';
include_once $classDir . 'Mark.class.php';
include_once $classDir . 'Measurement.class.php';
include_once $classDir . 'MagProcPublisher.class.php';
include_once $classDir . 'Observation.class.php';
include_once $classDir . 'ObservationDetail.class.php';
include_once $classDir . 'ObservationFactory.class.php';
include_once $classDir . 'Observatory.class.php';
include_once $classDir . 'ObservatoryDetail.class.php';
include_once $classDir . 'ObservatoryFactory.class.php';
include_once $classDir . 'Pier.class.php';
include_once $classDir . 'Reading.class.php';
include_once $classDir . 'UserFactory.class.php';

if (PHP_VERSION_ID >= 50400) {
  // depends on session handler interface, which was added in php 5.4
  include_once $classDir . 'PdoSessionHandler.php';
}
