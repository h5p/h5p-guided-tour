var H5P = H5P || {};

/**
 * H5P Guided tour library.
 *
 * This is a utility library, which does not implement attach. I.e, it has to bee actively used by
 * other libraries
 *
 * @module
 */
H5P.GuidedTour = (function ($) {

  /**
   * @type {Object}
   * @enum
   */
  var STEP_TYPES = {
    FIRST: 0,
    IN_BETWEEN: 1,
    LAST: 2
  };

  /**
   * A class representing a step
   *
   * @class Step
   * @private
   * @param  {Object} options
   * @param  {number} stepType
   * @param  {H5P.Sheperd.Tour} tour
   * @param  {Object} highlight Object containing css-properties that will be
   * applied to current guided element (used if highlightElement === true)
   */
  function Step(options, stepType, tour, highlight) {
    var self = this;
    options.classes = options.classes || '';
    options.classes += ' h5p shepherd-theme-arrows';

    // ************
    // First button
    // ************
    options.buttons = [];
    if (stepType == STEP_TYPES.FIRST) {
      // First step - exit button
      options.buttons.push({
        text: 'Exit',
        classes: 'shepherd-button-secondary',
        action: tour.cancel
      });

      options.classes += ' first';
    }
    else {
      // All others - back button
      options.buttons.push({
        text: 'Back',
        classes: 'shepherd-button-secondary',
        action: tour.back
      });
    }

    // *************
    // Second button
    // *************
    if (stepType === STEP_TYPES.LAST) {
      // Last step - finish button
      options.buttons.push({
        text: 'Done',
        action: tour.complete,
        classes: 'shepherd-button-primary'
      });

      options.classes += ' last';
    }
    else {
      // All others - next button
      options.buttons.push({
        text: 'Next',
        action: tour.next,
        classes: 'shepherd-button-primary'
      });
    }

    var $element;
    options.when = {
      show: function () {
        if (options.highlightElement) {
          $element = $element || $(options.attachTo.element);
          $element.css(highlight);
        }
        // Stop propagating click events, so that body don't get them
        $(this.el).on('click.guided-tour', function () {
          return false;
        });
      },
      hide: function () {
        if (options.highlightElement) {
          $element = $element || $(options.attachTo.element);
          for(var property in highlight) {
            $element.css(property, '');
          }
        }
        var el = this.el;
        setTimeout(function () {
          $(el).off('click.guided-tour');
        }, 0)
      }
    }

    if (options.noArrow) {
      options.classes += ' h5p-guided-tour-step-no-arrow';
    }

    /**
     * Return options needed by Shepherd
     * @method getOptions
     * @return {Object}
     */
    self.getOptions = function () {
      return options;
    };
  }

  /**
   * Main class
   * @class H5P.GuidedTour
   * @param  {Array}   steps   Array of step objects
   * @param  {Object}  options Options
   */
  function GuidedTour(steps, options) {
    var self = this;

    options = $.extend({}, {
      highlight: {
        background: '#3288e6',
        color: '#fff'
      }
    }, options);

    var tour = new H5P.Shepherd.Tour({
      defaults: {
        showCancelLink: true
      }
    });

    for (var i = 0, numSteps = steps.length; i < steps.length; i++ ) {
      var type = i === 0 ? STEP_TYPES.FIRST : (i+1 === numSteps ? STEP_TYPES.LAST : STEP_TYPES.IN_BETWEEN);
      tour.addStep((new Step(steps[i], type, tour, options.highlight)).getOptions());
    }

    /**
     * Start the guided tour
     * @method start
     * @memberof H5P.GuidedTour
     * @return {boolean} Shown or not
     */
    self.start = function (force) {
      force = force || false;

      if (!force && self.hasTourBeenSeen ()) {
        return false;
      }

      // Remember the user has seen this guide
      self.setTourSeen();

      $('body').off('click.guided-tour');
      // Listen for click-events on body, so we can hide the guide:
      $('body').on('click.guided-tour', function (event) {
        tour.hide();
      });

      tour.on('complete', function () {
        $('body').off('.guided-tour');
      });

      tour.start();
      return true;
    };

    /**
     * Hides guide
     * @method hide
     * @memberof H5P.GuidedTour
     */
    self.hide = function () {
      tour.hide();
    };

    /**
     * Tells if tour is open or not
     * @method isOpen
     * @return {Boolean}
     * @memberof H5P.GuidedTour
     */
    self.isOpen = function () {
      var currentStep = tour.getCurrentStep();
      return currentStep !== undefined && currentStep.isOpen();
    };

    /**
     * Mark this tour as seen. This is persisted using localstorage. If not present, nothing is persisted.
     *
     * @method setTourSeen
     * @memberof H5P.GuidedTour
     */
    self.setTourSeen = function () {
      if (typeof(window.localStorage) !== "undefined" && options.id) {
        window.localStorage.setItem(options.id + '-seen', true);
      }
    };

    /**
     * Check if this tour has been seen by user. Reads value from localstorage
     * 
     * @method hasTourBeenSeen
     * @memberof H5P.GuidedTour
     * @return {Boolean}
     */
    self.hasTourBeenSeen = function () {
      var seen;
      if (typeof(window.localStorage) !== "undefined" && options.id) {
        seen = window.localStorage.getItem(options.id + '-seen');
      }
      return seen === undefined ? false : seen;
    };
  }

  return GuidedTour;
})(H5P.jQuery);
