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

    // ************
    // First button
    // ************
    if (stepType == STEP_TYPES.FIRST) {
      // First step - exit button
      options.buttons.push({
        text: 'Exit',
        classes: 'shepherd-button-secondary',
        action: tour.cancel
      });
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
        text: 'Finish',
        action: tour.complete
      });
    }
    else {
      // All others - next button
      options.buttons.push({
        text: 'Next',
        action: tour.next,
        classes: 'shepherd-button-example-primary'
      });
    }

    if (options.highlightElement) {
      var $element = $(options.attachTo.element);
      options.when = {
        show: function () {
          $element.css(highlight);
        },
        hide: function () {
          for(var property in highlight) {
            $element.css(property, '');
          }
        }
      }
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
        classes: 'h5p shepherd-theme-arrows',
        showCancelLink: true
      }
    });

    for (var i = 0, numSteps = steps.length; i < steps.length; i++ ) {
      var type = i === 0 ? STEP_TYPES.FIRST : (i+1 === numSteps ? STEP_TYPES.LAST : STEP_TYPES.IN_BETWEEN);
      var step = new Step(steps[i], type, tour, options.highlight);
      tour.addStep(step.getOptions());
    }

    /**
     * Start the guided tour
     * @method start
     * @memberof H5P.GuidedTour
     */
    self.start = function () {
      tour.start();
    };
  }

  return GuidedTour;
})(H5P.jQuery);
