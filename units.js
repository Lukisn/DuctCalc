export const lengthUnits = {
  meter: { // base unit
    symbol: 'm',
    factor: 1
  },
  decimeter: { // 1 dm = 0.1 m
    symbol: 'dm',
    factor: 0.1
  },
  centimeter: { // 1 cm = 0.01 m
    symbol: 'cm',
    factor: 0.01
  },
  millimeter: { // 1 mm = 0.001 m
    symbol: 'mm',
    factor: 0.001
  }
}

export const areaUnits = {
  squaremeter: { // base unit
    symbol: 'm²',
    factor: 1
  },
  squaredecimeter: {
    symbol: 'dm²',
    factor: 0.01 // 1 dm² = 0.01 m²
  },
  squarecentimeter: {
    symbol: 'cm²',
    factor: 0.0001 // 1 cm² = 0.000_1 m²
  },
  squaremillimeter: {
    symbol: 'mm²',
    factor: 0.000001 // 1 mm² = 0.000_001 m²
  }
}

export const flowUnits = {
  qubicMeterPerSecond: { // base unit
    symbol: 'm³/s',
    factor: 1.0
  },
  qubicMeterPerHour: {
    symbol: 'm³/h',
    factor: 1 / 3600 // 1 m³/h = 1 m³ / 3600 s = 0.00027778 m³/s
  }
}

export const velocityUnits = {
  meterPerSecond: { // base unit
    symbol: 'm/s',
    factor: 1.0
  },
  meterPerHour: {
    symbol: 'm/h',
    factor: 1 / 3600 // 1 m/h = 1 m / 3600 s = 0.00027778 m/s
  },
  kilometerPerSecond: {
    symbol: 'km/s',
    factor: 1000 // 1 km/s = 1000 m / 1 s = 1000 m/s
  },
  kilometerPerHour: {
    symbol: 'km/h',
    factor: 1000 / 3600 // 1km/h = 1000 m / 3600 s = 0.27778 m/s
  }
}

export const frictionLossUnits = {
  pascalPerMeter: { // base unit
    symbol: 'Pa/m',
    factor: 1
  },
  kilopascalPerMeter: {
    symbol: 'kPa/m',
    factor: 1000 // 1 kPa/m = 1000 Pa / 1 m = 1000 Pa/m
  }
}

export const pressureDropUnits = {
  pascal: { // base unit
    symbol: 'Pa',
    factor: 1
  },
  kilopascal: {
    symbol: 'kPa',
    factor: 1000 // 1 kPa = 1000 Pa
  }
}
