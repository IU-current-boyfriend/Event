const isString = (value) => {
  return typeof value === 'string';
}

const isFunction = (value) => {
  return typeof value === 'function';
}

const isObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]';
}

const isAllFunction = (v) => {
  if (!isObject(v)) return false;
  const values = Object.values(v);
  return values.every(value => isFunction(value));
}

const stateIncludesStateName = (stateName, state) => {
  const keys = Object.keys(state);
  return keys.includes(stateName);
}

const actionsIncludesActionName = (actionName, actions) => {
  const keys = Object.keys(actions);
  return keys.includes(actionName);
}

const stateAllIncludesStateName = (stateNames, state) => {
  const keys = Object.keys(state);
  return stateNames.every(name => keys.includes(name));
};

module.exports = {
  isString,
  isFunction,
  isObject,
  isAllFunction,
  stateIncludesStateName,
  stateAllIncludesStateName,
  actionsIncludesActionName,
}