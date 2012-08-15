Ten.DOM.firstElementChild = function (node) {
  var el = node.firstElementChild || node.firstChild;
  while (el && el.nodeType != 1) {
    el = el.nextSibling;
  }
  return el;
};

/*
  structure = [
    {key: 'root', className: 'container', descendants: [
      {key: 'title', id: 'title'},
      {class: 'section', descendants: [
        {arrayKey: 'items', className: 'item-type1'},
        {arrayKey: 'items', className: 'item-type2'}
      ]}
    ]}
  ];

  return = {
    root: containerElement || undefined,
    title: titleElement || undefined,
    items: [
      itemType1Element1,
      itemType1Element2,
      itemTypr2Element1
    ] || undefined,
  };
*/
Ten.DOM.getElementsByStructure = function (root, structure) {
  var result = {};

  var currentNode = root;
  var nextOfRoot = root.nextSibling;

  var cands = [structure];
  var depth = 0;
  while (currentNode != null && currentNode != nextOfRoot) {
    var currentCands = cands[depth];

    var match = null;
    for (var i = 0; i < currentCands.length; i++) {
      match = currentCands[i];
      /* 注意! className ちゃんとみてないよ */
      if ((match.className != null && currentNode.className &&
              (currentNode.className.indexOf(match.className) > -1)) ||
          (match.id != null && match.id == currentNode.id)) {
        if (match.key) {
          result[match.key] = currentNode;
        } else if (match.arrayKey) {
          if (!result[match.arrayKey]) result[match.arrayKey] = [];
          result[match.arrayKey].push(currentNode);
        }
        break;
      }
      match = null;
    }
    
    if (currentNode.firstChild) {
      currentNode = currentNode.firstChild;
      depth++;
      cands[depth] = (match ? match.descendants : null) || cands[depth - 1];
    } else if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
    } else {
      currentNode = currentNode.parentNode;
      depth--;
      while (currentNode != null && currentNode != root) {
        if (currentNode.nextSibling) {
          currentNode = currentNode.nextSibling;
          break;
        } else {
          currentNode = currentNode.parentNode;
          depth--;
        }
      }
      if (depth < 0) break; // In IE and the source document is not a tree
      if (currentNode == root) break;
    }
  }

  return result;
};

Ten.DOM.getElementSetByClassNames = function (map, container) {
  var elements = {root: []};

  if (map.root) {
    if (map.root instanceof Array) {
      elements.root = map.root;
    } else {
      if (Ten.DOM.hasClassName(container, map.root)) {
        elements.root = [container];
      } else {
        elements.root = Ten.DOM.getElementsByClassName(map.root, container);
      }
    }
    delete map.root;
  }

  var root = elements.root[0] || container || document.body || document.documentElement || document;
  for (var n in map) {
    if (map[n] instanceof Array) {
      elements[n] = map[n];
    } else if (map[n]) {
      elements[n] = Ten.DOM.getElementsByClassName(map[n], root);
    }
  }

  return elements;
};

Ten.DOM.getAncestorByClassName = function (className, node) {
  while (node != null) {
    node = node.parentNode;
    if (Ten.DOM.hasClassName(node, className)) {
      return node;
    }
  }
  return null;
};
