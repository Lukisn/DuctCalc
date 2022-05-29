/* global math, Option */

import { air } from './media.js'
import {
  lengthUnits, areaUnits, flowUnits, velocityUnits, frictionUnits, pressureUnits
} from './units.js'

// Constants
const MAXITERATIONS = 100
const MAXDIFFERENCE = 1e-6
const ROUGHNESS = math.unit(0.1, 'mm') // https://de.wikipedia.org/wiki/Rohrreibungszahl

// DOM handles
const widthField = document.querySelector('input#width')
const widthUnit = document.querySelector('select#widthUnit')
const heightField = document.querySelector('input#height')
const heightUnit = document.querySelector('select#heightUnit')
const lengthField = document.querySelector('input#length')
const lengthUnit = document.querySelector('select#lengthUnit')
const crossSectionField = document.querySelector('input#crossSection')
const crossSectionUnit = document.querySelector('select#crossSectionUnit')
const circumferenceField = document.querySelector('input#circumference')
const circumferenceUnit = document.querySelector('select#circumferenceUnit')
const hydraulicDiameterField = document.querySelector('input#hydraulicDiameter')
const hydraulicDiameterUnit = document.querySelector('select#hydraulicDiameterUnit')
const flowField = document.querySelector('input#flow')
const flowUnit = document.querySelector('select#flowUnit')
const velocityField = document.querySelector('input#velocity')
const velocityUnit = document.querySelector('select#velocityUnit')
const reynoldsField = document.querySelector('input#reynolds')
const frictionFactorField = document.querySelector('input#frictionFactor')
const frictionLossField = document.querySelector('input#frictionLoss')
const frictionLossUnit = document.querySelector('select#frictionLossUnit')
const pressureDropField = document.querySelector('input#pressureDrop')
const pressureDropUnit = document.querySelector('select#pressureDropUnit')

// Funtions
/**
 * Calculate the friction factor from values with untis using
 * {@link calculateFrictionFactor}.
 * @param {number} reynolds - reynolds number of the flow (unitless)
 * @param {Unit} hydraulicDiameter - hydraulic diameter of the conduit (length)
 * @param {Unit} roughness - relative roughness of the conduit (length)
 * @param {number} maxIterations - maximum number of iterations to perform
 * @param {number} maxDifference - maximum difference to allow for stopping the
 * iteration
 * @returns friction factor (unitless)
 */
function calculateFrictionFactorWithUnits (
  reynolds, hydraulicDiameter, roughness, maxIterations = MAXITERATIONS,
  maxDifference = MAXDIFFERENCE) {
  const re = reynolds
  const commonSIUnit = 'm' // must be equal for both length measurements
  const dh = hydraulicDiameter.toNumber(commonSIUnit)
  const k = roughness.toNumber(commonSIUnit)
  return calculateFrictionFactor(re, dh, k, maxIterations, maxDifference)
}

/**
 * Calculate the friction factor from unitless values by iteration.
 * https://de.wikipedia.org/wiki/Rohrreibungszahl
 * https://en.wikipedia.org/wiki/Darcy_friction_factor_formulae
 * Colebrook-White Equation:
 * 1 / √λ = -2 * log10([2.51 / (Re * √λ)] + [k / (3.71 * dh)])
 * rearranging for λ (iteration equation):
 * λ = (1 / -2 * log10([2.51 / (Re * √λ)] + [k / (3.71 * dh)]))²
 * The implicit units of the values for the hydraulic diameter and roughness
 * must be matching.
 * @param {number} reynolds - reynolds number of the flow (unitless)
 * @param {number} hydraulicDiameter - hydraulic diameter of the conduit (e.g. in m)
 * @param {number} roughness - relative roughnes of the conduit walls (e.g. in m)
 * @param {number} maxIterations - maximum number of iterations to perform
 * @param {number} maxDifference - maximum difference to allow for stopping the iteration
 * @returns friction factor (unitless)
 */
function calculateFrictionFactor (
  reynolds, hydraulicDiameter, roughness, maxIterations = MAXITERATIONS,
  maxDifference = MAXDIFFERENCE) {
  if (reynolds < 2300) { // laminar flow
    return 64 / reynolds
  } else { // turbulent flow
    let lambda = 0.02
    let previousLambda = 0.02
    let difference = Infinity
    let iteration = 0
    do {
      iteration++
      const leftTerm = 2.51 / (reynolds * Math.sqrt(previousLambda))
      const rightTerm = roughness / (3.71 * hydraulicDiameter)
      const logTerm = Math.log10(leftTerm + rightTerm)
      lambda = Math.pow(1 / (-2 * logTerm), 2)
      difference = Math.abs(lambda - previousLambda)
      // Console logging outputs for debugging:
      // console.log(`left = ${leftTerm}, right = ${rightTerm}, log = ${logTerm}`)
      // console.log(`iteration ${iteration}: λ(i-1) = ${previousLambda}, λ(i) = ${lambda}, ∆λ = ${difference}`)
      previousLambda = lambda // swap for next iteration
    } while (iteration < maxIterations && difference >= maxDifference)
    return lambda
  }
}
/**
 * Format a floating point number to the specified precision (number of significant digits).
 * @param {number} original - original number to be formatted
 * @param {number} precision - precision (number of significant digits)
 * @returns formatted number with specified precision
 */
function formatNumber (original, precision = 3) {
  let numberOfDecimalPlaces = Math.ceil(-Math.log10(original)) + precision
  if (numberOfDecimalPlaces === Infinity) { numberOfDecimalPlaces = 0 } // catch 0
  if (numberOfDecimalPlaces < 0) { numberOfDecimalPlaces = 0 } // lower threshold for very large numbers
  if (numberOfDecimalPlaces > 10) { numberOfDecimalPlaces = 10 } // upper threshold for very small numbers
  return original.toFixed(numberOfDecimalPlaces)
}

/**
 * Perform the calculation by reading the inputs, calculating and writing the outputs.
 */
function calculate () {
  // read inputs
  const width = math.unit(parseFloat(widthField.value), widthUnit.value)
  const height = math.unit(parseFloat(heightField.value), heightUnit.value)
  const length = math.unit(parseFloat(lengthField.value), lengthUnit.value)
  const flow = math.unit(parseFloat(flowField.value), flowUnit.value)
  // calculate
  const crossSection = math.multiply(width, height) // = wdith * height
  const circumference = math.multiply(2, math.add(width, height)) // = 2 * (width + height)
  const hydraulicDiameter = math.divide(math.multiply(4, crossSection), circumference) // 4 * crossSection / circumference
  const velocity = math.divide(flow, crossSection) // flow / crossSection
  const reynolds = math.divide(math.multiply(velocity, hydraulicDiameter), air.kinematicViscosity) // velocity * hydraulicDiameter / kinematicViscosity
  const frictionFactor = calculateFrictionFactorWithUnits(reynolds, hydraulicDiameter, ROUGHNESS)
  const frictionLoss = math.multiply(math.divide(frictionFactor, hydraulicDiameter), math.divide(air.density, 2), math.pow(velocity, 2)) // frictionFactor / hydraulicDiameter * density / 2 * velocity^2
  const pressureDrop = math.multiply(frictionLoss, length) // frictionLoss * length
  // write outputs
  crossSectionField.value = formatNumber(crossSection.toNumber(crossSectionUnit.value))
  circumferenceField.value = formatNumber(circumference.toNumber(circumferenceUnit.value))
  hydraulicDiameterField.value = formatNumber(hydraulicDiameter.toNumber(hydraulicDiameterUnit.value))
  velocityField.value = formatNumber(velocity.toNumber(velocityUnit.value))
  reynoldsField.value = formatNumber(reynolds)
  frictionFactorField.value = formatNumber(frictionFactor)
  frictionLossField.value = formatNumber(frictionLoss.toNumber(frictionLossUnit.value))
  pressureDropField.value = formatNumber(pressureDrop.toNumber(pressureDropUnit.value))
}

/**
 * Setup the user interface by setting default values, filling the select options and hooking up the event handlers.
 */
function setup () {
  // Set initial values
  // Width row
  widthField.value = 1.0
  widthField.min = 0.1
  widthField.step = 0.1
  lengthUnits.forEach(unit => widthUnit.options.add(new Option(unit)))
  // Height row
  heightField.value = 1.0
  heightField.min = 0.1
  heightField.step = 0.1
  lengthUnits.forEach(unit => heightUnit.options.add(new Option(unit)))
  // Length row
  lengthField.value = 1.0
  lengthField.min = 0.1
  lengthField.step = 0.1
  lengthUnits.forEach(unit => lengthUnit.options.add(new Option(unit)))
  // Circumference row
  lengthUnits.forEach(unit => circumferenceUnit.options.add(new Option(unit)))
  // Cross Section row
  areaUnits.forEach(unit => crossSectionUnit.options.add(new Option(unit)))
  // Hydraulic Diameter row
  lengthUnits.forEach(unit => hydraulicDiameterUnit.options.add(new Option(unit)))
  // Flow row
  flowField.value = 1.0
  flowField.min = 0.1
  flowField.step = 0.1
  flowUnits.forEach(unit => flowUnit.options.add(new Option(unit)))
  // Velocity row
  velocityUnits.forEach(unit => velocityUnit.options.add(new Option(unit)))
  // Friction Loss row
  frictionUnits.forEach(unit => frictionLossUnit.options.add(new Option(unit)))
  // Pressure Drop row
  pressureUnits.forEach(unit => pressureDropUnit.options.add(new Option(unit)))
  // Register event handlers
  widthField.onchange = calculate
  widthUnit.onchange = calculate
  heightField.onchange = calculate
  heightUnit.onchange = calculate
  lengthField.onchange = calculate
  lengthUnit.onchange = calculate
  crossSectionUnit.onchange = calculate
  circumferenceUnit.onchange = calculate
  hydraulicDiameterUnit.onchange = calculate
  flowField.onchange = calculate
  flowUnit.onchange = calculate
  velocityUnit.onchange = calculate
  frictionLossUnit.onchange = calculate
  pressureDropUnit.onchange = calculate
}

setup()
calculate()
