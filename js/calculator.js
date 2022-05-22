/* global Option */

import * as Units from './units.js'
import { air } from './media.js'

const ROUGHNESS = 0.1 / 1000 // 0.1 mm / 1000 mm/m = 0.0001 m
// https://de.wikipedia.org/wiki/Rohrreibungszahl

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
// reynoldsUnit = dimensionless
const frictionFactorField = document.querySelector('input#frictionFactor')
// frictionFactorUnit = dimensionless
const frictionLossField = document.querySelector('input#frictionLoss')
const frictionLossUnit = document.querySelector('select#frictionLossUnit')
const pressureDropField = document.querySelector('input#pressureDrop')
const pressureDropUnit = document.querySelector('select#pressureDropUnit')

// Funtions
function calcFrictionFactor (re, dh, k, maxIterations = 100, maxDifference = 1e-6) {
  // https://de.wikipedia.org/wiki/Rohrreibungszahl
  // 1 / √λ = -2 * log10([2.51 / (Re * √λ)] + [k / (3.71 * dh)])
  // √λ = 1 / -2 * log10(...)
  // λ = (1 / -2 * log10(...))²
  if (re < 2300) { // laminar
    return 64 / re
  } else { // turbulent
    var lambda = 0.02
    var previousLambda = 0.02
    var difference = Infinity
    var iteration = 0
    do {
      iteration++
      const leftTerm = 2.51 / (re * Math.sqrt(previousLambda))
      const rightTerm = k / (3.71 * dh)
      const logTerm = Math.log10(leftTerm + rightTerm)
      // console.log(`left = ${leftTerm}, right = ${rightTerm}, log = ${logTerm}`)
      lambda = Math.pow(1 / (-2 * logTerm), 2)
      difference = Math.abs(lambda - previousLambda)
      // console.log(`iteration ${iteration}: λ(i-1) = ${previousLambda}, λ(i) = ${lambda}, ∆λ = ${difference}`)
      previousLambda = lambda // swap for next iteration
    } while (iteration < maxIterations && difference >= maxDifference)
    return lambda
  }
}

function formatNumber (original, precision = 3) {
  var numberOfDecimalPlaces = 0
  if (original !== 0) {
    numberOfDecimalPlaces = -Math.log10(original) + precision
  }
  if (numberOfDecimalPlaces < 0) {
    numberOfDecimalPlaces = 0
  }
  if (numberOfDecimalPlaces > 100) {
    numberOfDecimalPlaces = 100
  }
  return parseFloat(original).toFixed(numberOfDecimalPlaces)
}

function calculate () {
  // read inputs
  const widthMeter = parseFloat(widthField.value) * widthUnit.value
  const heightMeter = parseFloat(heightField.value) * heightUnit.value
  const lengthMeter = parseFloat(lengthField.value) * lengthUnit.value
  const flowQubicMeterPerSecond = parseFloat(flowField.value) * flowUnit.value
  // calculate
  const crossSectionSquaremeter = widthMeter * heightMeter
  const crossSectionOutput = crossSectionSquaremeter / crossSectionUnit.value
  const circumferenceMeter = 2 * (widthMeter + heightMeter)
  const circumferenceOutput = circumferenceMeter / circumferenceUnit.value
  const hydraulicDiameterMeter = 4 * crossSectionSquaremeter / circumferenceMeter
  const hydraulicDiameterOutput = hydraulicDiameterMeter / hydraulicDiameterUnit.value
  const velocityMeterPerSecond = flowQubicMeterPerSecond / crossSectionSquaremeter
  const velocityOutput = velocityMeterPerSecond / velocityUnit.value
  // Re = (rho * v * dh) / eta = (v * dh) / nu
  // https://de.wikipedia.org/wiki/Reynolds-Zahl
  const reynolds = velocityMeterPerSecond * hydraulicDiameterMeter / air.kinematicViscosity.value
  const frictionFactor = calcFrictionFactor(reynolds, hydraulicDiameterMeter, ROUGHNESS)
  // R = dp/L = lambda/D * rho/2 * v²
  const frictionLossPascalPerMeter = frictionFactor / hydraulicDiameterMeter * air.density.value / 2 * Math.pow(velocityMeterPerSecond, 2)
  const frictionLossOutput = frictionLossPascalPerMeter / frictionLossUnit.value
  // dp = R * L
  const pressureDropPascal = frictionLossPascalPerMeter * lengthMeter
  const pressureDropOutput = pressureDropPascal / pressureDropUnit.value

  console.log(`length = ${lengthMeter}`)

  // write outputs
  crossSectionField.value = formatNumber(crossSectionOutput)
  circumferenceField.value = formatNumber(circumferenceOutput)
  hydraulicDiameterField.value = formatNumber(hydraulicDiameterOutput)
  velocityField.value = formatNumber(velocityOutput)
  reynoldsField.value = formatNumber(reynolds)
  frictionFactorField.value = formatNumber(frictionFactor)
  frictionLossField.value = formatNumber(frictionLossOutput)
  pressureDropField.value = formatNumber(pressureDropOutput)
}

function setup () {
  // set initial values
  // Width row
  widthField.value = 1.0
  widthField.min = 0.1
  widthField.step = 0.1
  Object.entries(Units.lengthUnits).forEach(([name, unit]) => {
    widthUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Height row
  heightField.value = 1.0
  heightField.min = 0.1
  heightField.step = 0.1
  Object.entries(Units.lengthUnits).forEach(([name, unit]) => {
    heightUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Length row
  lengthField.value = 1.0
  lengthField.min = 0.1
  lengthField.step = 0.1
  Object.entries(Units.lengthUnits).forEach(([name, unit]) => {
    lengthUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Circumference row
  Object.entries(Units.lengthUnits).forEach(([name, unit]) => {
    circumferenceUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Cross Section row
  Object.entries(Units.areaUnits).forEach(([name, unit]) => {
    crossSectionUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Hydraulic Diameter row
  Object.entries(Units.lengthUnits).forEach(([name, unit]) => {
    hydraulicDiameterUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Flow row
  flowField.value = 1.0
  flowField.min = 0.1
  flowField.step = 0.1
  Object.entries(Units.flowUnits).forEach(([name, unit]) => {
    flowUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Velocity row
  Object.entries(Units.velocityUnits).forEach(([name, unit]) => {
    velocityUnit.options.add(new Option(unit.symbol, unit.factor))
  })
  // Friction Loss row
  Object.entries(Units.frictionLossUnits).forEach(([name, unit]) => {
    frictionLossUnit.options.add(new Option(unit.symbol, unit.factor))
  })

  // Pressure Drop row
  Object.entries(Units.pressureDropUnits).forEach(([name, unit]) => {
    pressureDropUnit.options.add(new Option(unit.symbol, unit.factor))
  })

  // register event handlers
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
