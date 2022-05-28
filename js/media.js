/* global math */

export const air = {
  density: math.unit(1.205, 'kg/m^3'),
  dynamicViscosity: math.unit(1.82e-5, 'Pa*s'),
  get kinematicViscosity () { // = dynamicViscosity / density
    return math.divide(this.dynamicViscosity, this.density)
  }
}

export const water = {
  denstiy: math.unit(998.2, 'kg/m^3'),
  dynamicViscosity: math.unit(0.001, 'Pa*s'),
  get kinematicViscosity () { // dynamicViscosity / density
    return math.divide(this.dynamicViscosity, this.density)
  }
}
