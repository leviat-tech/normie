export default class Relation {
  constructor(props) {
    Object.entries(props).forEach(([key, value]) => {
      this[key] = value;
    });
  }
}