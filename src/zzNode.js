// client or server
var _ = require('lodash')

// ---------------------------------------------------
// zzNode
//
// Create in-memory trees with search/sort functionality
// ---------------------------------------------------

function zzNodeConstructor (parent, data, pkField, parentField) {
  return new zzNode(parent, data, pkField, parentField)
}

function zzNode (parent, data, pkField, parentField) {
  // the parent object
  this.parent = parent

  // the data object from the server
  this.data = data

  // references to the parent-children
  this.pkField = pkField
  this.parentField = parentField

  // the fn used to create a new node
  this.nodeConstructor = zzNodeConstructor
  this.nodeItemConstructor = zzNodeConstructor

  // if this object changed, set the dirty bit
  this.isDirty = false

  if (!this.data[pkField]) {
    this.data[pkField] = null
  }

  if (!this.data[parentField]) {
    this.data[parentField] = null
  }

  if (!this.parent) {
    this.parent = null
  } else {
    if (this.parent.getId() !== this.data[parentField]) {
      this.data[parentField] = this.parent.getId()
      this.isDirty = true
    }
  }

  // any children go here
  this.children = []

  this.getData = function () {
    return this.data
  }

  this.getId = function () {
    return this.data[pkField]
  }

  this.getParent = function () {
    return this.parent
  }

  this.getRoot = function () {
    if (this.parent === null) {
      return this
    } else {
      return this.parent.getRoot()
    }
  }

  this.removeChild = function (targetId) {
    if (this.children.length > 0) {
      var index = _.findIndex(this.children, function (obj) { return obj.getId() === targetId })
      if (index > -1) {
        this.children.splice(index, 1)
      }
    }
  }

  this.addChild = function (data, newPKField, newParentField) {
    // already been added?
    var $this = this
    var child = _.find(this.children, function (ch) {
      return ch.getId() === data[$this.pkField]
    })
    // nope
    if (!child) {
      // instead of "new zzNode", using a generic constructor
      child = new this.nodeConstructor(this, data,
        newPKField || this.pkField,
        newParentField || this.parentField
      )
      this.children.push(child)
    }
    return child
  }

  this.findChild = function (targetId, doSearchItems) {
    var hit = null
    if (this.getId() === targetId) {
      hit = this
    } else {
      if (doSearchItems && this.items.length > 0) {
        _.each(this.items, function (item) {
          if (item.getId() === targetId) {
            hit = item
            return false
          }
        })
      }
      if (!hit && this.children.length > 0) {
        _.each(this.children, function (ch) {
          hit = ch.findChild(targetId, doSearchItems)
          if (hit) {
            return false
          }
        })
      }
    }
    return hit
  }

  // After much debate, decided to include an items array. It is similar to the children array
  // except that it contains objects tied to a parent tree and is not a parent object itself
  // (well, it could be but it would be self-contained within its own branch --> which may happen with "control" or "govDoc" if we allow for multi-parts to a doc or control)
  this.items = []
  // not the parent but the designated owning object
  this.itemOwner = null

  this.getItemOwner = function () {
    return this.itemOwner
  }

  this.addItem = function (data, newPKField, newParentField) {
    // already been added?
    var $this = this
    var item = _.find(this.items, function (it) {
      return it.getId() === data[$this.pkField]
    })
    // nope
    if (!item) {
      // instead of "new zzNode", using a generic constructor
      item = this.nodeItemConstructor(null, data, newPKField, newParentField)
      item.itemOwner = this
      this.items.push(item)
    }
    return item
  }

  this.removeItem = function (targetId) {
    if (this.items.length > 0) {
      var index = _.findIndex(this.items, function (obj) { return obj.getId() === targetId })
      if (index > -1) {
        this.items.splice(index, 1)
      }
    }
  }

  this.findItem = function (targetId) {
    var hit = null
    if (this.items.length > 0) {
      _.each(this.items, function (item) {
        if (item.getId() === targetId) {
          hit = item
          return false
        }
      })
    }
    if (!hit && this.children.length > 0) {
      _.each(this.children, function (ch) {
        hit = ch.findItem(targetId)
        if (hit) {
          return false
        }
      })
    }
    return hit
  }

  this.sortChildren = function (fn, noDeepSort) {
    if (!fn) {
      return
    }
    if (this.children.length > 0) {
      this.children.sort(fn)
      if (!noDeepSort) {
        _.each(this.children, function (child) {
          child.sortChildren(fn)
        })
      }
    }
  }

  this.sortItems = function (fn, fnChildren, noDeepSort) {
    if (!fn) {
      return
    }
    if (this.items.length > 0) {
      this.items.sort(fn)
      if (fnChildren) {
        _.each(this.items, function (item) {
          if (!noDeepSort) {
            item.sortChildren(fnChildren, noDeepSort)
          }
        })
      }
    }
  }

  this.getLevelDeep = function () {
    var level = 0
    if (this.parent) {
      level = 1
      level += this.parent.getLevelDeep()
    }
    return level
  }

  this.branchCallFunction = function (fn, startRootFirst, tryItemOwner) {
    if (!startRootFirst) {
      fn && fn(this)
    }
    if (this.parent) {
      this.parent.branchCallfunction(fn, startRootFirst, tryItemOwner)
    }
    if (tryItemOwner && this.itemOwner) {
      this.itemOwner.branchCallfunction(fn, startRootFirst, tryItemOwner)
    }
    if (startRootFirst) {
      fn && fn(this)
    }
  }

  this.branchCallFunctionChildren = function (fn, tryItems) {
    fn && fn(this)
    if (this.children.length > 0) {
      _.each(this.children, function (ch) {
        ch.branchCallFunctionChildren(fn, tryItems)
      })
    }
    if (tryItems && this.items.length > 0) {
      _.each(this.items, function (item) {
        item.branchCallFunctionChildren(fn, tryItems)
      })
    }
  }
}

module.exports.zzNode = zzNode
