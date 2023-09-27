export const getNumbers = size => Array.from(Array(size)).map((_, i) => i + 1)
export const getTail = (arr, size) => arr.slice(-size)
export const getHead = (arr, size) => arr.slice(0, size)
export const getRolledIndex = (size, index) => (size + index) %  size

export function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

export function insertBefore(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode);
}

export function childIndex(element){
  return Array.from(element.parentNode.children).findIndex(el => el === element)
}